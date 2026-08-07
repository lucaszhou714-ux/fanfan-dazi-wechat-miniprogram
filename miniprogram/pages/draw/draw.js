const {dishes,cuisines}=require('../../utils/dishes');
const dishArt=require('../../utils/dish-art');
const store=require('../../utils/store');
const sync=require('../../utils/sync');
const DAILY_LIMIT=3;

Page({
 data:{cuisines,ci:0,budget:35,result:null,resultStyle:'',rolling:false,target:'self',bound:false,used:0,remaining:DAILY_LIMIT,limitReached:false,drawButtonText:'帮我决定'},
 async onShow(){await sync.pull();const s=store.getState();this.setData({budget:Number(s.profile.budget)||35,bound:Boolean(s.couple)});this.refreshAttempts();},
 refreshAttempts(){
  const used=store.getState().draws.filter(x=>x.date===store.dateKey()&&x.target===this.data.target).length;
  const remaining=Math.max(0,DAILY_LIMIT-used),limitReached=used>=DAILY_LIMIT;
  const drawButtonText=limitReached?'今天就选它吧':(this.data.result?`换一个试试（剩余 ${remaining} 次）`:'帮我决定');
  this.setData({used,remaining,limitReached,drawButtonText});
 },
 target(e){this.setData({target:e.currentTarget.dataset.value,result:null,resultStyle:''});this.refreshAttempts();},
 cuisineChange(e){this.setData({ci:Number(e.detail.value)});},
 budgetChange(e){this.setData({budget:Number(e.detail.value)});},
 draw(){
  if(this.data.rolling||this.data.limitReached){wx.showToast({title:'今天就选它吧，明天再摇',icon:'none'});return;}
  let pool=[...dishes,...store.getState().customDishes];const c=this.data.cuisines[this.data.ci];
  pool=pool.filter(x=>(c==='全部'||x.cuisine===c)&&Number(x.price)<=this.data.budget);
  if(!pool.length){wx.showToast({title:'没有符合条件的菜品',icon:'none'});return;}
  this.setData({rolling:true,result:null,resultStyle:''});
  setTimeout(async()=>{
   const result=pool[Math.floor(Math.random()*pool.length)];
   store.update(s=>s.draws.unshift({id:Date.now(),date:store.dateKey(),dish:result.name,cuisine:result.cuisine,target:this.data.target,accepted:false}));
   this.setData({result,resultStyle:dishArt.styleFor(result),rolling:false});this.refreshAttempts();sync.push();
   if(this.data.bound&&sync.cloudReady())try{await sync.shareDraw({dish:result.name,cuisine:result.cuisine,price:result.price,target:this.data.target});}catch(e){console.warn('share draw deferred',e);}
  },650);
 },
 accept(){const r=this.data.result;if(!r)return;store.update(s=>{s.logs.unshift({id:Date.now(),date:store.dateKey(),dish:r.name,actualDish:r.name,cuisine:r.cuisine,mealType:'外卖',rating:0,note:'',createdAt:Date.now()});const d=s.draws.find(x=>x.dish===r.name&&!x.accepted);if(d)d.accepted=true;});sync.push();wx.showToast({title:'已写入饮食日记'});},
 goLogs(){wx.switchTab({url:'/pages/logs/logs'});}
});
