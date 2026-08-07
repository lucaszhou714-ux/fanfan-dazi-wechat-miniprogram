const KEY = 'fanfan_state_v1';
const defaultState = {
  version: 2,
  profile: { nickname: '饭搭子', budget: 35, spicy: '都可以', dislikes: '', shareReport: true, shareLogs: true, shareSpend: false },
  couple: null, installedAt: Date.now(), plans: {}, logs: [], draws: [], moments: [], recipeFavorites: [],
  weeklyTheme: null, weeklyReward: null,
  rewards: ['奶茶由我请', '周末吃大餐', '获得一次拒绝重抽券', '对方帮忙点餐', '今天可以任性加菜'],
  customDishes: []
};
function migrate(raw = {}) {
  const state = { ...defaultState, ...raw, profile: { ...defaultState.profile, ...(raw.profile || {}) } };
  state.logs = (state.logs || []).map(log => ({ privacy: 'couple', tags: [], amount: '', mealTime: '12:00', note: '', ...log }));
  state.moments = state.moments || [];
  state.recipeFavorites = state.recipeFavorites || [];
  state.version = 2;
  return state;
}
function getState() { return migrate(wx.getStorageSync(KEY) || {}); }
function setState(state) { const next=migrate(state);wx.setStorageSync(KEY,next);return next; }
function update(mutator) { const state=getState();mutator(state);return setState(state); }
function dateKey(date = new Date()) { const y=date.getFullYear(),m=String(date.getMonth()+1).padStart(2,'0'),d=String(date.getDate()).padStart(2,'0');return `${y}-${m}-${d}`; }
function weekKey(date = new Date()) {
  const d=new Date(date.getFullYear(),date.getMonth(),date.getDate());
  const day=d.getDay()||7;d.setDate(d.getDate()-day+1);
  return dateKey(d);
}
module.exports = { getState, setState, update, dateKey, weekKey, migrate };
