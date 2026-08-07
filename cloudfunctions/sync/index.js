const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const command = db.command;
const users = db.collection('users');
const spaces = db.collection('couple_spaces');
const invites = db.collection('couple_invites');

async function getUser(openid) {
  try { return (await users.doc(openid).get()).data; } catch (e) { return null; }
}

async function saveOwnState(openid, rawState) {
  const state = rawState || {};
  delete state._openid;
  const user = await getUser(openid);
  const spaceId = user && user.spaceId || null;
  await users.doc(openid).set({ data: { state, spaceId, updatedAt: db.serverDate() } });
  if (spaceId) await spaces.doc(spaceId).update({ data: { [`memberStates.${openid}`]: command.set(state), updatedAt: db.serverDate() } });
  return state;
}

async function pull(openid) {
  const user = await getUser(openid);
  if (!user) return { state: null, partnerState: null, spaceId: null };
  if (!user.spaceId) return { state: user.state || null, partnerState: null, spaceId: null };
  try {
    const space = (await spaces.doc(user.spaceId).get()).data;
    const partnerId = (space.memberIds || []).find(id => id !== openid);
    return { state: space.memberStates && space.memberStates[openid] || user.state || null,
      partnerState: partnerId && space.memberStates && space.memberStates[partnerId] || null,
      sharedDraw: space.sharedDraw || null, spaceId: user.spaceId };
  } catch (e) { return { state: user.state || null, partnerState: null, spaceId: null }; }
}

function randomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; let code = '';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

async function createInvite(openid, state) {
  await saveOwnState(openid, state);
  let user = await getUser(openid), spaceId = user && user.spaceId;
  if (!spaceId) {
    const added = await spaces.add({ data: { memberIds: [openid], memberStates: { [openid]: state }, createdAt: db.serverDate(), updatedAt: db.serverDate() } });
    spaceId = added._id;
    await users.doc(openid).update({ data: { spaceId } });
  }
  let code = randomCode();
  for (let i = 0; i < 3; i++) { try { await invites.doc(code).get(); code = randomCode(); } catch (e) { break; } }
  await invites.doc(code).set({ data: { ownerId: openid, spaceId, used: false, expiresAt: Date.now() + 86400000, createdAt: db.serverDate() } });
  return { code, spaceId };
}

async function joinInvite(openid, code, state) {
  const normalized = String(code || '').toUpperCase(); let invite;
  try { invite = (await invites.doc(normalized).get()).data; } catch (e) { throw new Error('INVITE_NOT_FOUND'); }
  if (invite.used || invite.expiresAt < Date.now()) throw new Error('INVITE_EXPIRED');
  if (invite.ownerId === openid) throw new Error('CANNOT_JOIN_SELF');
  const space = (await spaces.doc(invite.spaceId).get()).data;
  if ((space.memberIds || []).length >= 2) throw new Error('SPACE_FULL');
  await spaces.doc(invite.spaceId).update({ data: { memberIds: command.addToSet(openid), [`memberStates.${openid}`]: command.set(state), updatedAt: db.serverDate() } });
  await users.doc(openid).set({ data: { state, spaceId: invite.spaceId, updatedAt: db.serverDate() } });
  await invites.doc(normalized).update({ data: { used: true, usedBy: openid, usedAt: db.serverDate() } });
  return { spaceId: invite.spaceId };
}

async function unbind(openid) {
  const user = await getUser(openid);
  if (!user || !user.spaceId) return { ok: true };
  try {
    const space = (await spaces.doc(user.spaceId).get()).data;
    await Promise.all((space.memberIds || []).map(id => users.doc(id).update({ data: { spaceId: null } })));
    await spaces.doc(user.spaceId).remove();
  } catch (e) { await users.doc(openid).update({ data: { spaceId: null } }); }
  return { ok: true };
}

async function shareDraw(openid, draw) {
  const user = await getUser(openid);
  if (!user || !user.spaceId) throw new Error('NOT_BOUND');
  const safeDraw = { dish: String(draw.dish || '').slice(0, 30), cuisine: String(draw.cuisine || '').slice(0, 20),
    price: Number(draw.price) || 0, target: draw.target === 'partner' ? 'partner' : 'self', createdBy: openid, createdAt: Date.now() };
  await spaces.doc(user.spaceId).update({ data: { sharedDraw: command.set(safeDraw), updatedAt: db.serverDate() } });
  return { ok: true };
}

exports.main = async event => {
  const openid = cloud.getWXContext().OPENID;
  if (!openid) throw new Error('UNAUTHORIZED');
  switch (event.action) {
    case 'push': await saveOwnState(openid, event.state); return { ok: true };
    case 'pull': return pull(openid);
    case 'createInvite': return createInvite(openid, event.state || {});
    case 'joinInvite': return joinInvite(openid, event.code, event.state || {});
    case 'shareDraw': return shareDraw(openid, event.draw || {});
    case 'unbind': return unbind(openid);
    default: throw new Error('UNKNOWN_ACTION');
  }
};
