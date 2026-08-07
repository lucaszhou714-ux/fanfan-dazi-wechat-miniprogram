const positions = [0, 33.333, 66.667, 100];

function tile(index) {
  const col=index%4,row=Math.floor(index/4);
  return `background-image:url('/assets/dish-sprite-v1.jpg');background-size:400% 400%;background-position:${positions[col]}% ${positions[row]}%;`;
}

function imageIndex(dish={}) {
  const name=dish.name||'', cuisine=dish.cuisine||'';
  if(/番茄.*牛腩/.test(name))return 0;
  if(/黄焖鸡/.test(name))return 1;
  if(/海南鸡/.test(name))return 2;
  if(/螺蛳粉/.test(name))return 3;
  if(/麻辣香锅|麻辣烫|水煮|辣椒|小面/.test(name))return 4;
  if(/兰州|牛肉面|河粉|米线|云吞面|馄饨/.test(name))return 5;
  if(/拌饭|泡菜|韩式/.test(name)||cuisine==='韩式')return 6;
  if(/咖喱/.test(name)||cuisine==='日式')return 7;
  if(/沙拉|能量碗|全麦|鸡肉卷/.test(name))return 8;
  if(/烧鹅|叉烧|猪脚|肠粉/.test(name))return 9;
  if(/汉堡|快餐/.test(name))return 10;
  if(/披萨/.test(name))return 11;
  if(/酸菜鱼/.test(name))return 12;
  if(/煲仔|腊味|卤肉|三杯鸡/.test(name))return 13;
  if(/面|粉|饺|米线/.test(name)||cuisine==='粉面')return 14;
  if(/豆腐|菌菇|蔬菜|南瓜/.test(name)||cuisine==='轻食')return 15;
  return 0;
}

function styleFor(dish){return tile(imageIndex(dish));}
module.exports={styleFor,imageIndex};
