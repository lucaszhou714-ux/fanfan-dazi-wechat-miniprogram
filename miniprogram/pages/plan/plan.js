const store=require('../../utils/store'); const sync=require('../../utils/sync');
const labels=['周日','周一','周二','周三','周四','周五','周六'];
Page({
 data:{days:[],options:['带饭','点外卖','不确定','休息'], reminder:'11:00'},
 async onLoad(){await sync.pull();this.load();},
 load(){const s=store.getState(), days=[]; for(let i=0;i<7;i++){const d=new Date();d.setDate(d.getDate()+i);const key=store.dateKey(d);days.push({key,label:labels[d.getDay()],date:key.slice(5),value:s.plans[key]||'不确定'});}this.setData({days,reminder:s.profile.reminder||'11:00'});},
 choose(e){const {key,value}=e.currentTarget.dataset;store.update(s=>s.plans[key]=value);this.load();sync.push();},
 timeChange(e){const v=e.detail.value;store.update(s=>s.profile.reminder=v);this.setData({reminder:v});sync.push();}
});
