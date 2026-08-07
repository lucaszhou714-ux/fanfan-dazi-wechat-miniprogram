const store=require('../../utils/store');
const sync=require('../../utils/sync');

const THEMES=['清淡一点周','尝试新菜周','粤菜探索周','少油少炸周','带饭鼓励周','面食快乐周'];

Page({
 data:{profile:{},reward:'',customDish:'',weekly:'尚未生成',weeklyDone:false,rewardResult:'',rewardDone:false,customDishes:[],rewards:[]},
 async onShow(){await sync.pull();this.load();},
 load(){
  const s=store.getState(),week=store.weekKey();
  const theme=s.weeklyTheme&&s.weeklyTheme.week===week?s.weeklyTheme:null;
  const reward=s.weeklyReward&&s.weeklyReward.week===week?s.weeklyReward:null;
  this.setData({profile:s.profile,weekly:theme?theme.result:'尚未生成',weeklyDone:Boolean(theme),rewardResult:reward?reward.result:'',rewardDone:Boolean(reward),customDishes:s.customDishes||[],rewards:s.rewards||[]});
 },
 field(e){this.setData({[`profile.${e.currentTarget.dataset.key}`]:e.detail.value});},
 inputDish(e){this.setData({customDish:e.detail.value});},
 inputReward(e){this.setData({reward:e.detail.value});},
 save(){const p=this.data.profile;p.budget=Number(p.budget)||35;store.update(s=>{s.profile=p;});sync.push();wx.showToast({title:'已保存'});},
 addDish(){const name=this.data.customDish.trim();if(!name)return;store.update(s=>s.customDishes.push({id:`custom-${Date.now()}`,name,cuisine:'自定义',spicy:'按实际',price:Number(s.profile.budget)||35}));this.setData({customDish:''});this.load();sync.push();},
 addReward(){const text=this.data.reward.trim();if(!text)return;store.update(s=>s.rewards.push(text));this.setData({reward:''});this.load();sync.push();},
 weekly(){
  if(this.data.weeklyDone)return;
  const result=THEMES[Math.floor(Math.random()*THEMES.length)],week=store.weekKey();
  store.update(s=>{s.weeklyTheme={week,result,createdAt:Date.now()};});this.load();sync.push();
 },
 drawReward(){
  if(this.data.rewardDone)return;
  const rewards=store.getState().rewards||[];
  if(!rewards.length){wx.showToast({title:'请先添加奖励',icon:'none'});return;}
  const result=rewards[Math.floor(Math.random()*rewards.length)],week=store.weekKey();
  store.update(s=>{s.weeklyReward={week,result,createdAt:Date.now()};});this.load();sync.push();
  wx.showModal({title:'本周情侣奖励',content:result,showCancel:false});
 }
});
