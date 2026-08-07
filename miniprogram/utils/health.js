const positiveTags=['有蔬菜','有蛋白质','有粗粮','清淡','少油','水果','汤类'];
const watchTags=['油炸','高糖饮品','重辣','重口味','甜品','加工食品','蔬菜较少'];
const allTags=[...positiveTags,...watchTags,'主食','粉面','快餐','轻食'];
function inferTags(name='') {
  const tags=[];
  if(/菜|番茄|菌菇|沙拉|南瓜|豆腐/.test(name)) tags.push('有蔬菜');
  if(/鸡|牛|猪|鱼|虾|蛋|豆腐|肉/.test(name)) tags.push('有蛋白质');
  if(/饭|面|粉|米线|馄饨|汉堡|披萨/.test(name)) tags.push('主食');
  if(/汤|馄饨/.test(name)) tags.push('汤类');
  if(/炸|鸡排/.test(name)) tags.push('油炸');
  if(/沙拉|轻食|能量碗/.test(name)) tags.push('轻食');
  if(/汉堡|披萨|炸鸡/.test(name)) tags.push('快餐');
  return [...new Set(tags)];
}
function startOfWeek(offset=0){const d=new Date(),day=(d.getDay()+6)%7;d.setHours(0,0,0,0);d.setDate(d.getDate()-day+offset*7);return d;}
function summarize(logs,offset=0){const start=startOfWeek(offset),end=new Date(start);end.setDate(end.getDate()+7);const rows=logs.filter(x=>{const d=new Date(`${x.date}T00:00:00`);return d>=start&&d<end;});const count=t=>rows.filter(x=>(x.tags||[]).includes(t)).length;const cuisines=[...new Set(rows.map(x=>x.cuisine).filter(Boolean))];const amounts=rows.map(x=>Number(x.amount)).filter(x=>x>0);const ratings=rows.map(x=>Number(x.rating)).filter(x=>x>0);return {rows,days:new Set(rows.map(x=>x.date)).size,takeout:rows.filter(x=>x.mealType==='外卖').length,home:rows.filter(x=>x.mealType==='带饭').length,dine:rows.filter(x=>x.mealType==='堂食').length,skipped:rows.filter(x=>x.mealType==='没吃').length,vegetable:count('有蔬菜'),protein:count('有蛋白质'),fried:count('油炸'),sugary:count('高糖饮品'),heavy:count('重口味'),cuisines:cuisines.length,spend:amounts.reduce((a,b)=>a+b,0),rating:ratings.length?(ratings.reduce((a,b)=>a+b,0)/ratings.length).toFixed(1):'--'};}
module.exports={positiveTags,watchTags,allTags,inferTags,summarize};
