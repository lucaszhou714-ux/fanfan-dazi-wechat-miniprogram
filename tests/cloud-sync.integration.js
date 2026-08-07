const Module = require('module');
const assert = require('assert');

let currentOpenId = 'user-a';
let idCounter = 0;
const collections = new Map();
const clone = value => value == null ? value : JSON.parse(JSON.stringify(value));
const bag = name => { if (!collections.has(name)) collections.set(name, new Map()); return collections.get(name); };
const applyUpdate = (target, data) => {
  for (const [key, value] of Object.entries(data)) {
    const parts = key.split('.'); let node = target;
    for (let i = 0; i < parts.length - 1; i++) node = node[parts[i]] || (node[parts[i]] = {});
    const leaf = parts[parts.length - 1];
    if (value && value.__set !== undefined) node[leaf] = clone(value.__set);
    else if (value && value.__addToSet !== undefined) {
      const list = Array.isArray(node[leaf]) ? node[leaf] : [];
      if (!list.includes(value.__addToSet)) list.push(value.__addToSet);
      node[leaf] = list;
    } else node[leaf] = clone(value);
  }
};

const db = {
  command: { addToSet: value => ({ __addToSet: value }), set: value => ({ __set: value }) },
  serverDate: () => new Date().toISOString(),
  collection(name) {
    const data = bag(name);
    return {
      doc(id) {
        return {
          async get() { if (!data.has(id)) throw new Error('NOT_FOUND'); return { data: clone(data.get(id)) }; },
          async set({ data: value }) { data.set(id, { _id: id, ...clone(value) }); return { _id: id }; },
          async update({ data: value }) { if (!data.has(id)) throw new Error('NOT_FOUND'); const item = data.get(id); applyUpdate(item, value); return { updated: 1 }; },
          async remove() { data.delete(id); return { removed: 1 }; }
        };
      },
      async add({ data: value }) { const id = `${name}-${++idCounter}`; data.set(id, { _id: id, ...clone(value) }); return { _id: id }; }
    };
  }
};

const fakeCloud = {
  DYNAMIC_CURRENT_ENV: 'test', init() {}, database: () => db,
  getWXContext: () => ({ OPENID: currentOpenId })
};
const originalLoad = Module._load;
Module._load = function(request, parent, isMain) {
  if (request === 'wx-server-sdk') return fakeCloud;
  return originalLoad.call(this, request, parent, isMain);
};
const handler = require('../cloudfunctions/sync/index.js').main;

const callAs = async (openid, action, extra = {}) => { currentOpenId = openid; return handler({ action, ...extra }); };

(async () => {
  const stateA = { profile: { nickname: '小饭' }, plans: {}, logs: [], draws: [], couple: null };
  const stateB = { profile: { nickname: '饭搭子' }, plans: {}, logs: [], draws: [], couple: null };

  const invitation = await callAs('user-a', 'createInvite', { state: stateA });
  assert.match(invitation.code, /^[A-Z2-9]{6}$/);
  assert.ok(invitation.spaceId);

  const joined = await callAs('user-b', 'joinInvite', { code: invitation.code, state: stateB });
  assert.equal(joined.spaceId, invitation.spaceId);
  await assert.rejects(() => callAs('user-c', 'joinInvite', { code: invitation.code, state: {} }), /INVITE_EXPIRED/);

  await callAs('user-a', 'shareDraw', { draw: { dish: '番茄牛腩饭', cuisine: '家常菜', price: 28, target: 'partner' } });
  const pulledB = await callAs('user-b', 'pull');
  assert.equal(pulledB.partnerState.profile.nickname, '小饭');
  assert.equal(pulledB.sharedDraw.dish, '番茄牛腩饭');
  assert.equal(pulledB.sharedDraw.target, 'partner');

  stateB.logs.push({ date: '2026-08-07', dish: '番茄牛腩饭' });
  await callAs('user-b', 'push', { state: stateB });
  const pulledA = await callAs('user-a', 'pull');
  assert.equal(pulledA.partnerState.logs[0].dish, '番茄牛腩饭');

  await callAs('user-a', 'unbind');
  const afterA = await callAs('user-a', 'pull');
  const afterB = await callAs('user-b', 'pull');
  assert.equal(afterA.spaceId, null);
  assert.equal(afterB.spaceId, null);

  console.log('PASS: two-user invite, join, shared draw, state sync, and unbind simulated successfully.');
})().catch(error => { console.error(error); process.exitCode = 1; });
