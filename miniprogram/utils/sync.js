const store = require('./store');
let partnerState = null;
let sharedDraw = null;
function cloudReady() { return Boolean(getApp().globalData.cloudReady); }
async function call(action, data = {}) {
  if (!cloudReady()) throw new Error('CLOUD_NOT_READY');
  const res = await wx.cloud.callFunction({ name: 'sync', data: { action, ...data } });
  return res.result || {};
}
async function push() {
  if (!cloudReady()) return { localOnly: true };
  try { return await call('push', { state: store.getState() }); }
  catch (e) { console.warn('Cloud sync deferred', e); return { localOnly: true, error: e }; }
}
async function pull() {
  if (!cloudReady()) return store.getState();
  try { const result = await call('pull'); if (result.state) store.setState(result.state); partnerState = result.partnerState || null; sharedDraw = result.sharedDraw || null; }
  catch (e) { console.warn('Cloud pull deferred', e); }
  return store.getState();
}
const createInvite = () => call('createInvite', { state: store.getState() });
const joinInvite = code => call('joinInvite', { code, state: store.getState() });
const unbind = () => call('unbind');
const shareDraw = draw => call('shareDraw', { draw });
const getPartnerState = () => partnerState;
const getSharedDraw = () => sharedDraw;
module.exports = { push, pull, createInvite, joinInvite, unbind, shareDraw, getPartnerState, getSharedDraw, cloudReady };
