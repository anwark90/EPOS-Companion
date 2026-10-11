(function(){
"use strict";
var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
var NAVY='#16202A', CREAM='#F4F1EA', ORANGE='#E8542F';
var T={side:'#0F172A',sideFg:'#CBD5E1',bg:'#F4F6FB',card:'#FFFFFF',fg:'#0F172A',mute:'#64748B',line:'#E9EDF3',alt:'#F8FAFC',indigo:'#4F46E5',indigo2:'#6366F1',tint:'#EEF2FF',keyLine:'#A5B4FC',green:'#16A34A'};
var A={bg:'#F3F2F8',card:'#FFFFFF',fg:'#111114',mute:'#6E6E76'};
var gbp=function(p){ return (p/100).toLocaleString('en-GB',{style:'currency',currency:'GBP'}); };
var pad=function(n){ return String(n).padStart(2,'0'); };
var pad4=function(n){ return String(n).padStart(4,'0'); };
var pad6=function(n){ return String(n).padStart(6,'0'); };
var $=function(id){ return document.getElementById(id); };
$('yr').textContent=new Date().getFullYear();

function rng(seed){ return function(){ seed=(seed*16807)%2147483647; return (seed-1)/2147483646; }; }
function barcode(seed){ var r=rng(seed),x=0,out=''; while (x<200){ var w=1+Math.floor(r()*4); if (r()>.35) out+='<rect x="'+x+'" y="0" width="'+w+'" height="38" fill="currentColor"/>'; x+=w+1+Math.floor(r()*2); } return out; }
document.querySelectorAll('svg.code').forEach(function(svg){ svg.innerHTML=barcode(+svg.dataset.seed||5); });

/* Loads an image and only hands it back if the page may read its pixels.
   Opened straight from disk (file://) browsers refuse, so callers keep their drawn fallback. */
function safeImage(src,cb){
  var im=new Image(); im.decoding='async';
  im.onload=function(){
    try { var t=document.createElement('canvas'); t.width=t.height=1; var x=t.getContext('2d'); x.drawImage(im,0,0,1,1); x.getImageData(0,0,1,1); }
    catch(e){ return; }
    cb(im);
  };
  im.src=src;
}

var LOGO={
  bars:[[269,244,486,102],[269,461,345,102]],
  tear:[[269,679],[755,679],[755,780],[704,742],[652,780],[601,742],[550,780],[499,742],[448,780],[397,742],[345,780],[269,729]]
};
function rr(ctx,x,y,w,h,r){ r=Math.min(r,w/2,h/2); ctx.beginPath(); ctx.moveTo(x+r,y); ctx.arcTo(x+w,y,x+w,y+h,r); ctx.arcTo(x+w,y+h,x,y+h,r); ctx.arcTo(x,y+h,x,y,r); ctx.arcTo(x,y,x+w,y,r); ctx.closePath(); }
function drawMark(ctx,cx,cy,h,a,b){
  var s=h/536;
  ctx.save(); ctx.translate(cx,cy); ctx.scale(s,s); ctx.translate(-512,-512);
  ctx.fillStyle=a; LOGO.bars.forEach(function(q){ rr(ctx,q[0],q[1],q[2],q[3],51); ctx.fill(); });
  ctx.fillStyle=b; ctx.beginPath(); LOGO.tear.forEach(function(p,i){ i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]); }); ctx.closePath(); ctx.fill();
  ctx.restore();
}

/* =====================================================
   THE PC TILL: real screenshots
   ===================================================== */
var PC=[
  {id:'point-of-sale',icon:'till',title:'Point of Sale',text:"Scan a barcode, or type it and press Enter. Till keys cover loose items, and a category key opens what's inside it. The basket keeps a running total, with the VAT inside it, and quantity buttons on every line.",chips:['Barcode scanning','Till keys','Quantity buttons']},
  {id:'dashboard',icon:'dash',title:'Dashboard',text:"Today's takings, sales, average basket and items sold, compared with the same day last week. See your busiest hour, how people paid and your top sellers, next to what needs restocking.",chips:['Takings vs last week','Sales by hour','Needs restocking']},
  {id:'inventory',icon:'list',title:'Inventory',text:"Every product with its picture, barcode, price, stock count and reorder level, flagged when it runs low or out. Edit a product alongside the list, generate barcodes, or export the whole lot.",chips:['Low stock flags','Generate barcodes','Export list']},
  {id:'stock-orders',icon:'orders',title:'Stock Orders',text:"Raise orders to your suppliers, then book in what arrives. A part delivery shows what's in, what's left and what's arriving now, so the counts stay right.",chips:['Part deliveries','Order notes','Status filters']},
  {id:'refunds',icon:'refund',title:'Refunds',text:"Type the receipt number or pick it from the list, choose how many of each item are coming back and why, and put the goods back into stock. The VAT comes back out too.",chips:['Find by receipt','Reason for refund','Back into stock']},
  {id:'end-of-day',icon:'eod',title:'End of Day',text:"Any day's trading at a glance: net takings, the counted cash drawer, card and cash, VAT by rate, best sellers and every receipt. Print an X read, save a summary or close the day.",chips:['Cash drawer count','VAT by rate','Close the day']},
  {id:'staff-access',icon:'user',title:'Staff Access',text:"Give each member of staff their own login. Cashiers see the till only; administrators also see the Dashboard, Inventory and End of Day. Switch a login off when someone leaves.",chips:['Cashier or administrator','Last signed in','Switch off a login']},
  {id:'settings',icon:'settings',title:'Settings',text:"Your shop's name, address and receipt footer, with a live preview of the printed receipt. Choose light or dark, and turn on VAT so receipts and reports show how much of each price was VAT.",chips:['Receipt preview','Light or dark','VAT settings']},
  {id:'phone-pairing',icon:'qr',title:'Phone pairing',text:"Import products from a wholesaler's .csv file, and pair the iPhone app by scanning the code with its camera. The till lists every paired phone and when it was last seen.",chips:['CSV import','Pair by QR code','Shop Wi-Fi']}
];
(function(){
  var tabs=$('pc-tabs'), glass=$('pc-glass'), mon=$('pc-monitor'), stageEl=$('pc-stage'), idx=0, imgs=[], btns=[], auto=null, touched=false;
  PC.forEach(function(s,i){
    var im=document.createElement('img'); im.src='screens/pc-'+s.id+'.webp'; im.width=1920; im.height=1032; im.alt='EPOS Companion till, '+s.title+' screen'; im.decoding='async';
    if (i>1) im.loading='lazy';
    glass.appendChild(im); imgs.push(im);
    var b=document.createElement('button'); b.type='button'; b.setAttribute('role','tab'); b.id='pt-'+s.id; b.setAttribute('aria-controls','pc-panel');
    b.innerHTML='<svg aria-hidden="true"><use href="#i-'+s.icon+'"/></svg>'+s.title;
    b.addEventListener('click',function(){ stop(); set(i); });
    b.addEventListener('keydown',function(e){ var d=e.key==='ArrowRight'?1:e.key==='ArrowLeft'?-1:0; if(!d) return; e.preventDefault(); stop(); set((idx+d+PC.length)%PC.length); btns[idx].focus(); });
    tabs.appendChild(b); btns.push(b);
  });
  function set(i){
    idx=i; var s=PC[i];
    imgs.forEach(function(im,j){ im.classList.toggle('on',j===i); });
    btns.forEach(function(b,j){ b.setAttribute('aria-selected',String(j===i)); b.tabIndex=j===i?0:-1; });
    var t=btns[i]; if (t.scrollIntoView && tabs.scrollWidth>tabs.clientWidth) tabs.scrollTo({left:t.offsetLeft-tabs.clientWidth/2+t.offsetWidth/2,behavior:reduce?'auto':'smooth'});
    $('pc-panel').setAttribute('aria-labelledby',t.id);
    $('pc-count').textContent=pad(i+1)+' / '+pad(PC.length)+' · '+s.title.toUpperCase();
    $('pc-title').textContent=s.title; $('pc-text').textContent=s.text;
    $('pc-chips').innerHTML=s.chips.map(function(c){ return '<li>'+c+'</li>'; }).join('');
    glass.setAttribute('aria-label','Open the '+s.title+' screen full size');
  }
  function stop(){ touched=true; if (auto){ clearInterval(auto); auto=null; } }
  set(0);
  $('pc-prev').addEventListener('click',function(){ stop(); set((idx+PC.length-1)%PC.length); });
  $('pc-next').addEventListener('click',function(){ stop(); set((idx+1)%PC.length); });
  /* swipe */
  var sx=null, sy=0;
  glass.addEventListener('pointerdown',function(e){ sx=e.clientX; sy=e.clientY; });
  glass.addEventListener('pointerup',function(e){
    if (sx===null) return; var dx=e.clientX-sx, dy=e.clientY-sy; sx=null;
    if (Math.abs(dx)>45 && Math.abs(dx)>Math.abs(dy)*1.3){ stop(); set((idx+(dx<0?1:-1)+PC.length)%PC.length); glass.dataset.swiped='1'; }
  });
  /* lightbox */
  var lb=$('lightbox'), lbImg=$('lb-img'), lbPane=$('lb-pane'), lastFocus=null;
  function openLB(){
    if (glass.dataset.swiped){ delete glass.dataset.swiped; return; }
    stop(); lastFocus=document.activeElement;
    lbImg.src=imgs[idx].src; lbImg.alt=imgs[idx].alt; $('lb-title').textContent=PC[idx].title;
    lbPane.classList.toggle('full', window.innerWidth<1000);
    lb.hidden=false; document.body.style.overflow='hidden'; $('lb-close').focus();
  }
  function closeLB(){ lb.hidden=true; document.body.style.overflow=''; if (lastFocus) lastFocus.focus(); }
  glass.addEventListener('click',openLB);
  glass.addEventListener('keydown',function(e){ if (e.key==='Enter'||e.key===' '){ e.preventDefault(); openLB(); } });
  $('lb-close').addEventListener('click',closeLB);
  lb.addEventListener('click',function(e){ if (e.target===lb||e.target===lbPane) closeLB(); });
  document.addEventListener('keydown',function(e){ if (!lb.hidden && e.key==='Escape') closeLB(); if (!lb.hidden && e.key==='Tab'){ e.preventDefault(); $('lb-close').focus(); } });
  /* tilt + auto-advance */
  if (!reduce && matchMedia('(hover:hover)').matches){
    stageEl.addEventListener('pointermove',function(e){ var r=mon.getBoundingClientRect(), x=(e.clientX-r.left)/r.width-.5, y=(e.clientY-r.top)/r.height-.5; mon.style.setProperty('--ry',(x*6).toFixed(2)+'deg'); mon.style.setProperty('--rx',(3-y*4).toFixed(2)+'deg'); });
    stageEl.addEventListener('pointerleave',function(){ mon.style.removeProperty('--ry'); mon.style.removeProperty('--rx'); });
  }
  if (!reduce){
    new IntersectionObserver(function(es){
      if (es[0].isIntersecting && !touched && !auto) auto=setInterval(function(){ set((idx+1)%PC.length); },5200);
      else if (!es[0].isIntersecting && auto){ clearInterval(auto); auto=null; }
    },{threshold:.35}).observe(stageEl);
  }
})();

/* =====================================================
   APP TOUR (real iPhone screenshots)
   ===================================================== */
var SCREENS=[
  {id:'till',tab:'Till',title:'Point of Sale',h:2120,text:"Scan a barcode with the camera, or search when a label won't read. Till keys cover anything that never passes a scanner, like bananas, carrier bags and newspapers. Then take payment.",chips:['Barcode scanning','Till keys','Take payment']},
  {id:'dash',tab:'Dash',title:'Dashboard',h:2360,text:"Today's takings against the same day last week, with sales, average basket and items sold. See your busiest hour, how people paid, your top sellers and what's running low.",chips:['Sales by hour','Card and cash split','Top sellers']},
  {id:'stock',tab:'Stock',title:'Inventory',h:2160,text:"Every product with its count, flagged low or out when it drops. Search by name, category or barcode, scan a delivery straight in, and see your total stock value.",chips:['Low stock filter','Scan items in','Stock value']},
  {id:'orders',tab:'Orders',title:'Stock Orders',h:2000,text:"Start an order to a wholesaler, then follow it from draft to on its way to received, with delivery dates and totals on every order.",chips:['Draft orders','Due dates','Order history']},
  {id:'eod',tab:'EOD',title:'End of Day',h:2600,text:"Net takings, refunds, card and cash. Count the drawer against what's expected, check VAT by rate, then print the Z report and close the day.",chips:['Cash drawer count','VAT by rate','Z report']},
  {id:'settings',tab:'Settings',title:'Settings',h:2480,text:"Light, dark or automatic. Check the till connection, response time and receipt printer at a glance. The app never contacts the internet; it only talks to your till over the shop network.",chips:['Connection check','Printer status','Shop network only']}
];
var TB=175; /* height of the tab bar strip at the bottom of each 780px-wide screenshot */
(function(){
  var tourStage=$('tour-stage'), tabsBox=$('apptabs'), tourIdx=0, phones=[], tabBtns=[];
  SCREENS.forEach(function(s,i){
    var ph=document.createElement('div'); ph.className='iphone'; ph.dataset.i=i;
    ph.innerHTML='<div class="scr"><div class="island"></div>'+
      '<div class="sb"><span>9:41</span><svg viewBox="0 0 68 12" aria-hidden="true"><use href="#i-status"/></svg></div>'+
      '<div class="scroll" tabindex="-1"><div class="sbpad"></div><div class="crop" style="--ch:'+(s.h-TB)+'"><img src="screens/'+s.id+'.jpg" width="780" height="'+s.h+'" alt="EPOS Companion '+s.title+' screen" loading="lazy" decoding="async"></div><div class="tbpad"></div></div>'+
      '<div class="tbimg" style="background-image:url(screens/'+s.id+'.jpg)"></div><div class="home"></div></div>';
    ph.addEventListener('click',function(){ if (+ph.dataset.pos!==0) setTour(i); });
    tourStage.appendChild(ph); phones.push(ph);
    var b=document.createElement('button'); b.type='button'; b.setAttribute('role','tab'); b.id='tt-'+s.id; b.setAttribute('aria-controls','tour-panel');
    b.innerHTML='<svg aria-hidden="true"><use href="#i-'+s.id+'"/></svg>'+s.tab;
    b.addEventListener('click',function(){ setTour(i); });
    b.addEventListener('keydown',function(e){
      var d=e.key==='ArrowRight'?1:e.key==='ArrowLeft'?-1:0; if (!d) return;
      e.preventDefault(); setTour((tourIdx+d+SCREENS.length)%SCREENS.length); tabBtns[tourIdx].focus();
    });
    tabsBox.appendChild(b); tabBtns.push(b);
  });
  function setTour(i){
    tourIdx=i; var n=SCREENS.length, s=SCREENS[i];
    phones.forEach(function(ph,j){
      var d=((j-i)%n+n)%n; if (d>n/2) d-=n;
      ph.dataset.pos=String(d);
      var sc=ph.querySelector('.scroll'); sc.tabIndex = d===0?0:-1;
      if (d===0) sc.setAttribute('aria-label',s.title+' screen, scrollable'); else sc.removeAttribute('aria-label');
      if (d!==0) sc.scrollTop=0;
    });
    tabBtns.forEach(function(b,j){ b.setAttribute('aria-selected',String(j===i)); b.tabIndex=j===i?0:-1; });
    $('tour-panel').setAttribute('aria-labelledby',tabBtns[i].id);
    $('tour-count').textContent=pad(i+1)+' / '+pad(n)+' · '+s.tab.toUpperCase();
    $('tour-title').textContent=s.title;
    $('tour-text').textContent=s.text;
    $('tour-chips').innerHTML=s.chips.map(function(c){ return '<li>'+c+'</li>'; }).join('');
  }
  setTour(0);
  $('tour-prev').addEventListener('click',function(){ setTour((tourIdx+SCREENS.length-1)%SCREENS.length); });
  $('tour-next').addEventListener('click',function(){ setTour((tourIdx+1)%SCREENS.length); });
  var sx=null, sy=0;
  tourStage.addEventListener('pointerdown',function(e){ sx=e.clientX; sy=e.clientY; });
  tourStage.addEventListener('pointerup',function(e){
    if (sx===null) return; var dx=e.clientX-sx, dy=e.clientY-sy; sx=null;
    if (Math.abs(dx)>45 && Math.abs(dx)>Math.abs(dy)*1.3) setTour((tourIdx+(dx<0?1:-1)+SCREENS.length)%SCREENS.length);
  });
  tourStage.addEventListener('pointercancel',function(){ sx=null; });
  if (!reduce && matchMedia('(hover:hover)').matches){
    tourStage.addEventListener('pointermove',function(e){
      var r=tourStage.getBoundingClientRect(), x=(e.clientX-r.left)/r.width-.5, y=(e.clientY-r.top)/r.height-.5;
      tourStage.style.setProperty('--ty',(x*12).toFixed(2)+'deg'); tourStage.style.setProperty('--tx',(-y*6).toFixed(2)+'deg');
    });
    tourStage.addEventListener('pointerleave',function(){ tourStage.style.removeProperty('--ty'); tourStage.style.removeProperty('--tx'); });
  }
  if (!reduce){
    var peeked=false;
    new IntersectionObserver(function(es,obs){
      if (!es[0].isIntersecting || peeked) return; peeked=true; obs.disconnect();
      var sc=phones[tourIdx].querySelector('.scroll');
      setTimeout(function(){ sc.scrollTo({top:sc.clientHeight*.45,behavior:'smooth'}); },700);
      setTimeout(function(){ sc.scrollTo({top:0,behavior:'smooth'}); },2100);
    },{threshold:.5}).observe(tourStage);
  }
})();

/* =====================================================
   DEMO TILL
   ===================================================== */
var P={
  milk:{name:'Semi-Skimmed Milk 2L',r:'Semi-Skim Milk 2L',top:'Semi-Skimmed Milk 2L',price:165,vat:0},
  bread:{name:'White Sliced Bread 800g',r:'White Bread 800g',top:'White Sliced Bread',price:145,vat:0},
  cola:{name:'Cola 500ml',r:'Cola 500ml',top:'Cola 500ml',price:155,vat:20},
  crisps:{name:'Ready Salted Crisps 32.5g',r:'Ready Salted Crisps',top:'Ready Salted Crisps',price:95,vat:20},
  cheddar:{name:'Mature Cheddar 400g',r:'Mature Cheddar 400g',top:'Mature Cheddar 400g',price:375,vat:0},
  energy:{name:'Energy Drink 250ml',r:'Energy Drink 250ml',top:'Energy Drink 250ml',price:135,vat:20},
  bananas:{name:'Bananas',r:'Bananas',top:'Bananas',price:20,vat:0,key:1},
  bag:{name:'Carrier bag',r:'Carrier bag',top:'Carrier bag',price:10,vat:20,key:1},
  paper:{name:'Newspaper',r:'Newspaper',top:'Newspaper',price:150,vat:0,key:1},
  coffee:{name:'Coffee',r:'Coffee',top:'Coffee',price:180,vat:20,key:1},
  tea:{name:'Tea',r:'Tea',top:'Tea',price:120,vat:20,key:1},
  pastry:{name:'Pastry',r:'Pastry',top:'Pastry',price:150,vat:0,key:1}
};
var SCAN_ORDER=['cola','milk','crisps','energy','bread','cheddar','cola','crisps','milk','energy'];
var weights=[.24,.55,.66,.58,.52,.62,.7,.6,.55,.62,.78,.9,.6,.47,.33];
var hourly=(function(){ var sum=weights.reduce(function(a,b){return a+b;},0), out=weights.map(function(w){ return Math.round(w/sum*128460); }); out[14]+=128460-out.reduce(function(a,b){return a+b;},0); return out; })();
var S={
  basket:[['milk',1],['bread',1],['cola',2],['crisps',3]],
  sale:428, clock:21*60+42, scanAt:0, lastAdded:null,
  takings:128460, sales:142, items:418, lastWeek:118506,
  card:{n:98,v:93620}, cash:{n:44,v:34840},
  tops:{'Cola 500ml':[46,155],'Semi-Skimmed Milk 2L':[31,165],'Ready Salted Crisps':[38,95],'White Sliced Bread':[22,145],'Energy Drink 250ml':[19,135]}
};
var clockStr=function(m){ return pad(Math.floor(m/60)%24)+':'+pad(m%60); };
function add(id,d){
  var f=S.basket.find(function(b){return b[0]===id;});
  if (f){ f[1]+=d; if (f[1]<=0) S.basket.splice(S.basket.indexOf(f),1); }
  else if (d>0) S.basket.push([id,d]);
  if (d>0) S.lastAdded=id;
}
function totals(){
  var t=0,v=0,n=0;
  S.basket.forEach(function(b){ var p=P[b[0]], g=p.price*b[1]; t+=g; n+=b[1]; if (p.vat===20) v+=g; });
  return {total:t,vat:Math.round(v/6),vatBase:v,items:n};
}
var keysEl=$('keys'), linesEl=$('lines');
Object.keys(P).filter(function(k){return P[k].key;}).forEach(function(k){
  var p=P[k], b=document.createElement('button'); b.type='button'; b.className='key';
  b.innerHTML=p.name+'<small>'+gbp(p.price)+'</small>';
  b.setAttribute('aria-label','Add '+p.name+', '+gbp(p.price));
  b.addEventListener('click',function(){ add(k,1); renderSale(); });
  keysEl.appendChild(b);
});
function renderSale(){
  var t=totals();
  linesEl.innerHTML='';
  if (!S.basket.length) linesEl.innerHTML='<li><p class="empty">Basket is empty.<br>Scan a barcode, or press a till key on the left.</p></li>';
  S.basket.forEach(function(b){
    var p=P[b[0]], li=document.createElement('li'); li.className='line'+(S.lastAdded===b[0]?' flash':'');
    li.innerHTML='<span class="nm"><b>'+p.name+'</b><span>'+b[1]+' × '+gbp(p.price)+'</span></span>'+
      '<span class="step"><button type="button" aria-label="Remove one '+p.name+'">−</button><output>'+b[1]+'</output><button type="button" aria-label="Add one '+p.name+'">+</button></span>'+
      '<span class="amt">'+gbp(p.price*b[1])+'</span>';
    var bs=li.querySelectorAll('button');
    bs[0].addEventListener('click',function(){ add(b[0],-1); S.lastAdded=null; renderSale(); });
    bs[1].addEventListener('click',function(){ add(b[0],1); renderSale(); });
    linesEl.appendChild(li);
    if (S.lastAdded===b[0]) linesEl.scrollTop=li.offsetTop-linesEl.offsetTop-40;
  });
  S.lastAdded=null;
  var lines=S.basket.length;
  $('item-count').textContent=lines+(lines===1?' line':' lines');
  $('n-items').textContent=t.items;
  $('subtotal').textContent=gbp(t.total);
  $('vat').textContent=gbp(t.vat);
  $('total').textContent=gbp(t.total);
  $('charge').textContent= t.total ? 'Complete sale · '+gbp(t.total) : 'Complete sale';
  $('charge').disabled=!t.total;
  $('pos-sub').textContent='Till 1 · Sale #'+pad4(S.sale)+' · '+clockStr(S.clock);
}
$('scan').addEventListener('click',function(){
  var btn=this, id=SCAN_ORDER[S.scanAt++%SCAN_ORDER.length];
  btn.classList.remove('scanning'); void btn.offsetWidth; btn.classList.add('scanning');
  setTimeout(function(){ add(id,1); renderSale(); $('live').textContent='Scanned '+P[id].name+', '+gbp(P[id].price)+'.'; }, reduce?0:260);
});
var q=$('q'), res=$('results');
function closeRes(){ res.hidden=true; res.innerHTML=''; }
q.addEventListener('input',function(){
  var v=q.value.trim().toLowerCase(); if (!v){ closeRes(); return; }
  var hits=Object.keys(P).filter(function(k){ return P[k].name.toLowerCase().indexOf(v)>-1; }).slice(0,5);
  res.innerHTML = hits.length ? hits.map(function(k){ return '<li><button type="button" data-k="'+k+'"><span>'+P[k].name+'</span><span>'+gbp(P[k].price)+'</span></button></li>'; }).join('') : '<li class="none">No products match that. Try "cola" or "milk".</li>';
  res.hidden=false;
});
res.addEventListener('click',function(e){ var b=e.target.closest('button'); if (!b) return; add(b.dataset.k,1); renderSale(); q.value=''; closeRes(); q.focus(); });
q.addEventListener('keydown',function(e){
  if (e.key==='Escape'){ q.value=''; closeRes(); }
  if (e.key==='Enter'){ var f=res.querySelector('button'); if (f) f.click(); }
  if (e.key==='ArrowDown'){ var g=res.querySelector('button'); if (g){ e.preventDefault(); g.focus(); } }
});
document.addEventListener('click',function(e){ if (!e.target.closest('.search')) closeRes(); });

var barsEl=$('bars');
function renderBars(){
  var max=Math.max.apply(null,hourly)*1.08; barsEl.innerHTML='';
  hourly.forEach(function(v,i){ var b=document.createElement('i'); if (i===11) b.className='peak'; b.style.height=Math.max(4,v/max*100)+'%'; barsEl.appendChild(b); });
}
function renderTops(){
  var rows=Object.keys(S.tops).map(function(k){ return [k,S.tops[k][0],S.tops[k][0]*S.tops[k][1]]; }).sort(function(a,b){ return b[2]-a[2]; }).slice(0,5);
  $('tops').innerHTML=rows.map(function(r){ return '<li><span>'+r[0]+' <em>× '+r[1]+'</em></span><b>'+gbp(r[2])+'</b></li>'; }).join('');
}
function renderDash(){
  $('k-sales').textContent=S.sales;
  $('k-avg').textContent=gbp(Math.round(S.takings/S.sales));
  $('k-items').textContent=S.items;
  var pct=(S.takings/S.lastWeek-1)*100;
  $('vs').textContent=(pct>=0?'▲ ':'▼ ')+Math.abs(pct).toFixed(1)+'% vs last Wednesday';
  $('n-card').textContent=S.card.n; $('v-card').textContent=gbp(S.card.v);
  $('n-cash').textContent=S.cash.n; $('v-cash').textContent=gbp(S.cash.v);
  $('split-card').style.flexGrow=S.card.v; $('split-cash').style.flexGrow=S.cash.v;
  renderBars(); renderTops();
}
var shown=S.takings;
function countTo(target){
  var from=shown, t0=performance.now(), dur=reduce?0:900;
  (function step(now){
    var k=dur?Math.min(1,(now-t0)/dur):1; k=1-Math.pow(1-k,3);
    shown=Math.round(from+(target-from)*k); $('takings').textContent=gbp(shown);
    if (k<1) requestAnimationFrame(step);
  })(t0);
}
/* receipt in the till's own 32-column layout */
var W32=32, EQ='='.repeat(W32), DASH='-'.repeat(W32);
function lr(l,r){ l=String(l); r=String(r); var sp=W32-l.length-r.length; if (sp<1){ l=l.slice(0,W32-r.length-1); sp=1; } return l+' '.repeat(sp)+r; }
function ctr(s){ var p=Math.max(0,Math.floor((W32-s.length)/2)); return ' '.repeat(p)+s; }
function esc(s){ return String(s).replace(/[&<>"]/g,function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }
function receiptText(lines,t,pay,sale,clock){
  var d=new Date(), ds=pad(d.getDate())+'/'+pad(d.getMonth()+1)+'/'+d.getFullYear();
  var o=[EQ,ctr('EPOS STORE'),ctr('12 High Street, Your Town'),ctr('Tel: 01234 567890'),EQ,
    'Receipt No : '+pad6(sale),'Date       : '+ds+'  '+clock,'Served by  : admin',DASH,lr('QTY  ITEM','TOTAL'),DASH];
  lines.forEach(function(b){
    var p=P[b[0]], amt=(p.price*b[1]/100).toFixed(2), qty=String(b[1]).padStart(3,' ');
    o.push(lr(qty+'  '+p.r.slice(0,20),amt));
    if (b[1]>1) o.push('     @ '+(p.price/100).toFixed(2)+' each');
  });
  o.push(DASH, lr('Items',t.items), lr('Subtotal',(t.total/100).toFixed(2)), DASH,
    lr('TOTAL',(t.total/100).toFixed(2)), lr(pay.toUpperCase(),(t.total/100).toFixed(2)), lr('VAT included',(t.vat/100).toFixed(2)), EQ,
    ctr('Thank you for shopping with us!'), ctr('Please keep this receipt'), EQ);
  return o;
}
var notifTimer;
$('charge').addEventListener('click',function(){
  var t=totals(); if (!t.total) return;
  var pay=document.querySelector('input[name="pay"]:checked').value;
  var lines=S.basket.map(function(b){ return b.slice(); }), clock=clockStr(S.clock);
  var feed=$('feed'); feed.innerHTML='';
  var paper=document.createElement('div'); paper.className='r-paper'+(reduce?'':' printing');
  paper.innerHTML='<span class="w">'+esc(receiptText(lines,t,pay,S.sale,clock).join('\n'))+'</span>';
  paper.setAttribute('aria-label','Printed receipt'); feed.appendChild(paper);
  S.takings+=t.total; S.sales+=1; S.items+=t.items; hourly[14]+=t.total;
  var m=pay==='Card'?S.card:S.cash; m.n+=1; m.v+=t.total;
  lines.forEach(function(b){ var p=P[b[0]], k=p.top; if (!S.tops[k]) S.tops[k]=[0,p.price]; S.tops[k][0]+=b[1]; });
  setTimeout(function(){
    countTo(S.takings); renderDash();
    $('notif-s').textContent=gbp(t.total)+' · '+pay+' · '+t.items+(t.items===1?' item':' items');
    var n=$('notif'); n.classList.add('show'); clearTimeout(notifTimer);
    notifTimer=setTimeout(function(){ n.classList.remove('show'); },3400);
  }, reduce?0:650);
  $('live').textContent='Sale of '+gbp(t.total)+' completed by '+pay.toLowerCase()+'. Receipt printed. The app now shows takings of '+gbp(S.takings)+'.';
  S.sale+=1; S.clock+=1; S.basket=[];
  $('phone-clock').textContent=clockStr(S.clock);
  renderSale();
});
$('clear').addEventListener('click',function(){ S.basket=[]; renderSale(); });
renderSale(); renderDash();

var tilt=$('tilt'), demo=$('demo');
if (!reduce && matchMedia('(hover:hover)').matches){
  demo.addEventListener('pointermove',function(e){
    var r=tilt.getBoundingClientRect(), dx=Math.max(-1,Math.min(1,(e.clientX-(r.left+r.width/2))/600)), dy=Math.max(-1,Math.min(1,(e.clientY-(r.top+r.height/2))/600));
    tilt.style.setProperty('--ry',(dx*14-5)+'deg'); tilt.style.setProperty('--rx',(-dy*8+3)+'deg');
  });
  demo.addEventListener('pointerleave',function(){ tilt.style.removeProperty('--ry'); tilt.style.removeProperty('--rx'); });
}

/* =====================================================
   CSS 3D LOGO (closing band)
   ===================================================== */
(function(){
  var l3=$('l3'), host=$('logo3d');
  var o='<svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">';
  var bar=function(q,c){ return o+'<rect x="'+q[0]+'" y="'+q[1]+'" width="'+q[2]+'" height="'+q[3]+'" rx="51" fill="'+c+'"/></svg>'; };
  var tear=function(c){ return o+'<polygon points="'+LOGO.tear.map(function(p){return p.join(',');}).join(' ')+'" fill="'+c+'"/></svg>'; };
  var html='';
  for (var i=6;i>=1;i--) html+='<div class="side" style="transform:translateZ('+(-i*2)+'px)"></div>';
  html+='<div class="base"></div>';
  [{z:34,f:bar(LOGO.bars[0],CREAM),s:bar(LOGO.bars[0],'#B9B4AA')},{z:58,f:bar(LOGO.bars[1],CREAM),s:bar(LOGO.bars[1],'#B9B4AA')},{z:86,f:tear(ORANGE),s:tear('#A83A1D')}].forEach(function(p){
    for (var k=8;k>=1;k--) html+='<div style="transform:translateZ(calc(('+p.z+'px - '+(k*2)+'px) * var(--pop)))">'+p.s+'</div>';
    html+='<div style="transform:translateZ(calc('+p.z+'px * var(--pop)))">'+p.f+'</div>';
  });
  l3.innerHTML=html;
  if (reduce) return;
  var band=host.closest('section'), tx=-22, ty=12, cx=-22, cy=12, pop=.35, vis=false, t0=performance.now(), raf=0;
  band.addEventListener('pointermove',function(e){ var r=host.getBoundingClientRect(); tx=((e.clientX-(r.left+r.width/2))/r.width)*40-8; ty=-((e.clientY-(r.top+r.height/2))/r.height)*26+8; });
  band.addEventListener('pointerleave',function(){ tx=-22; ty=12; });
  function loop(now){
    var t=(now-t0)/1000;
    cx+=(tx+Math.sin(t*.6)*6-cx)*.06; cy+=(ty+Math.cos(t*.5)*3-cy)*.06; pop+=(1-pop)*.04;
    l3.style.setProperty('--ry',cx.toFixed(2)+'deg'); l3.style.setProperty('--rx',cy.toFixed(2)+'deg'); l3.style.setProperty('--pop',(pop+Math.sin(t*1.1)*.06).toFixed(3));
    raf=vis?requestAnimationFrame(loop):0;
  }
  new IntersectionObserver(function(es){ vis=es[0].isIntersecting; if (vis && !raf) raf=requestAnimationFrame(loop); }).observe(host);
})();

/* =====================================================
   THREE.JS HERO
   ===================================================== */
var stage=$('stage'), canvas=$('scene');
if (!window.THREE){ stage.classList.add('no-3d'); return; }
var renderer;
try { renderer=new THREE.WebGLRenderer({canvas:canvas,antialias:true,alpha:true,powerPreference:'high-performance'}); }
catch(e){ stage.classList.add('no-3d'); return; }
if (!renderer.getContext()){ stage.classList.add('no-3d'); return; }
renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
renderer.outputEncoding=THREE.sRGBEncoding;
renderer.toneMapping=THREE.ACESFilmicToneMapping; renderer.toneMappingExposure=1.0;
renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.setClearColor(0x000000,0);

var scene=new THREE.Scene();
var camera=new THREE.PerspectiveCamera(28,1,0.1,60);
(function(){
  var pm=new THREE.PMREMGenerator(renderer), env=new THREE.Scene();
  env.add(new THREE.Mesh(new THREE.BoxGeometry(24,24,24),new THREE.MeshBasicMaterial({color:0x1b2430,side:THREE.BackSide})));
  function panel(w,h,hex,k,pos){ var m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({color:new THREE.Color(hex).multiplyScalar(k),side:THREE.DoubleSide})); m.position.set(pos[0],pos[1],pos[2]); m.lookAt(0,0,0); env.add(m); }
  panel(10,5,0xffffff,4,[-6,7,5]); panel(7,7,0xfff1e2,2.2,[7,3,6]); panel(5,9,0xE8542F,2.0,[7,1,-7]); panel(14,3,0xffffff,1.2,[0,-7,2]);
  scene.environment=pm.fromScene(env,0.035).texture; pm.dispose();
})();
scene.add(new THREE.HemisphereLight(0xfff6ea,0x16202a,0.45));
var key=new THREE.DirectionalLight(0xffffff,1.5); key.position.set(-2.6,5.2,3.4); key.castShadow=true;
key.shadow.mapSize.set(2048,2048); var sc=key.shadow.camera; sc.left=-3; sc.right=3; sc.top=3; sc.bottom=-3; sc.near=1; sc.far=14; key.shadow.bias=-0.0004; key.shadow.normalBias=0.02;
scene.add(key);
var rim=new THREE.DirectionalLight(0xE8542F,1.3); rim.position.set(3.2,2.2,-3.2); scene.add(rim);
var floor=new THREE.Mesh(new THREE.PlaneGeometry(12,12),new THREE.ShadowMaterial({opacity:0.2}));
floor.rotation.x=-Math.PI/2; floor.receiveShadow=true; scene.add(floor);

function rrShape(w,h,r){ var s=new THREE.Shape(),x=-w/2,y=-h/2; r=Math.min(r,w/2,h/2);
  s.moveTo(x+r,y); s.lineTo(x+w-r,y); s.quadraticCurveTo(x+w,y,x+w,y+r); s.lineTo(x+w,y+h-r); s.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
  s.lineTo(x+r,y+h); s.quadraticCurveTo(x,y+h,x,y+h-r); s.lineTo(x,y+r); s.quadraticCurveTo(x,y,x+r,y); return s; }
function rbox(w,h,d,r,b){ b=b===undefined?Math.min(r*.5,d*.3):b;
  var g=new THREE.ExtrudeGeometry(rrShape(w-2*b,h-2*b,Math.max(r-b,0.002)),{depth:Math.max(d-2*b,0.001),bevelEnabled:true,bevelThickness:b,bevelSize:b,bevelSegments:5,curveSegments:12});
  g.translate(0,0,-(d-2*b)/2); g.computeVertexNormals(); return g; }
function screenGeo(w,h,r){ var g=new THREE.ShapeGeometry(rrShape(w,h,r),12), p=g.attributes.position, uv=g.attributes.uv;
  for (var i=0;i<p.count;i++) uv.setXY(i,(p.getX(i)+w/2)/w,(p.getY(i)+h/2)/h); uv.needsUpdate=true; return g; }
function canvasTex(w,h){ var c=document.createElement('canvas'); c.width=w; c.height=h; var t=new THREE.CanvasTexture(c); t.encoding=THREE.sRGBEncoding; t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy()); return {c:c,ctx:c.getContext('2d'),tex:t}; }
function screenMat(tex){ return new THREE.MeshStandardMaterial({color:0x000000,emissive:0xffffff,emissiveMap:tex,roughness:0.16,metalness:0.0,envMapIntensity:0.3,toneMapped:false}); }
function mesh(g,m,cast){ var x=new THREE.Mesh(g,m); x.castShadow=cast!==false; x.receiveShadow=true; return x; }

var root=new THREE.Group(); scene.add(root);
var body=new THREE.MeshStandardMaterial({color:0x1c2632,metalness:0.55,roughness:0.36,envMapIntensity:1.0});
var bodyDark=new THREE.MeshStandardMaterial({color:0x10171f,metalness:0.4,roughness:0.5});
var orangeMetal=new THREE.MeshStandardMaterial({color:0xE8542F,metalness:0.55,roughness:0.3,envMapIntensity:1.1});
var creamMat=new THREE.MeshStandardMaterial({color:0xF4F1EA,metalness:0.1,roughness:0.45});

/* till: a widescreen monitor showing the real PC screens */
var SW=1.78, SH=SW*1032/1920;
var till=new THREE.Group(); root.add(till);
var base=mesh(rbox(0.96,0.6,0.07,0.14),body); base.rotation.x=-Math.PI/2; base.position.y=0.035; till.add(base);
var neck=mesh(rbox(0.15,0.62,0.07,0.035),body); neck.position.set(0,0.37,-0.13); neck.rotation.x=-0.2; till.add(neck);
var head=new THREE.Group(); head.position.set(0,0.8,-0.02); head.rotation.x=-0.26; till.add(head);
head.add(mesh(rbox(SW+0.07,SH+0.08,0.06,0.05),body));
var tillT=canvasTex(1600,860);
var tillScreen=new THREE.Mesh(new THREE.PlaneGeometry(SW,SH),screenMat(tillT.tex)); tillScreen.position.z=0.0305; head.add(tillScreen);
var chin=mesh(new THREE.BoxGeometry(0.03,0.012,0.004),orangeMetal,false); chin.position.set(0,-SH/2-0.022,0.031); head.add(chin);
till.position.set(-0.06,0,-0.3);

/* printer */
var printer=new THREE.Group(); root.add(printer);
var pb=mesh(rbox(0.54,0.36,0.5,0.09),body); pb.position.y=0.18; printer.add(pb);
var lid=mesh(rbox(0.5,0.05,0.3,0.06),bodyDark,false); lid.position.set(0,0.345,-0.08); printer.add(lid);
var slot=mesh(new THREE.BoxGeometry(0.4,0.012,0.03),new THREE.MeshBasicMaterial({color:0x05080b}),false); slot.position.set(0,0.362,0.1); printer.add(slot);
(function(){
  var s=0.13/536, grp=new THREE.Group(), opt={depth:0.012,bevelEnabled:true,bevelThickness:0.003,bevelSize:0.002,bevelSegments:2,curveSegments:10};
  function bar(q){ var w=q[2]*s,h=q[3]*s,cx=(q[0]+q[2]/2-512)*s,cy=-(q[1]+q[3]/2-512)*s; var g=new THREE.ExtrudeGeometry(rrShape(w,h,h/2),opt); g.translate(cx,cy,0); return g; }
  var sh=new THREE.Shape(); LOGO.tear.forEach(function(p,i){ var x=(p[0]-512)*s,y=-(p[1]-512)*s; i?sh.lineTo(x,y):sh.moveTo(x,y); });
  grp.add(mesh(bar(LOGO.bars[0]),creamMat,false)); grp.add(mesh(bar(LOGO.bars[1]),creamMat,false));
  grp.add(mesh(new THREE.ExtrudeGeometry(sh,opt),orangeMetal,false));
  grp.position.set(0,0.175,0.247); printer.add(grp);
})();
var PL=1.08, PW=0.3, SEG=64;
var rT=canvasTex(420,1512);
var paperGeo=new THREE.PlaneGeometry(PW,1,1,SEG);
var paperMat=new THREE.MeshStandardMaterial({map:rT.tex,roughness:0.85,metalness:0,side:THREE.DoubleSide,alphaTest:0.5,emissive:0xffffff,emissiveIntensity:0.08,emissiveMap:rT.tex});
var paper=new THREE.Mesh(paperGeo,paperMat); paper.receiveShadow=true; printer.add(paper);
var slotY=0.362, slotZ=0.1;
function setPaper(len){
  var pos=paperGeo.attributes.position, uv=paperGeo.attributes.uv, A0=0.2, R=0.16, TH2=2.25, arcL=R*TH2;
  for (var j=0;j<=SEG;j++){
    var s=len*(j/SEG), y, z;
    if (s<=A0){ y=s; z=0; }
    else if (s<=A0+arcL){ var th=(s-A0)/R; y=A0+R*Math.sin(th); z=R-R*Math.cos(th); }
    else { var e=s-A0-arcL; y=A0+R*Math.sin(TH2)+Math.cos(TH2)*e; z=R-R*Math.cos(TH2)+Math.sin(TH2)*e; }
    var v=1-(len/PL)*(1-j/SEG);
    for (var k=0;k<2;k++){ var idx=j*2+k; pos.setXYZ(idx,(k?PW/2:-PW/2),slotY+y,slotZ+z); uv.setXY(idx,k,v); }
  }
  pos.needsUpdate=true; uv.needsUpdate=true; paperGeo.computeVertexNormals(); paperGeo.computeBoundingSphere();
  paper.visible=len>0.002;
}
printer.position.set(-1.2,0,0.5); printer.rotation.y=0.42;

/* phone */
var phone3=new THREE.Group(); root.add(phone3);
phone3.add(mesh(rbox(0.44,0.9,0.042,0.075,0.012),body));
var glass3=mesh(screenGeo(0.424,0.884,0.066),new THREE.MeshStandardMaterial({color:0x05080b,roughness:0.2,metalness:0}),false); glass3.position.z=0.0212; phone3.add(glass3);
var phT=canvasTex(600,1290);
var phScreen=new THREE.Mesh(screenGeo(0.398,0.856,0.056),screenMat(phT.tex)); phScreen.position.z=0.0222; phone3.add(phScreen);
var action=mesh(new THREE.BoxGeometry(0.008,0.045,0.016),orangeMetal,false); action.position.set(-0.222,0.25,0); phone3.add(action);
var bump=mesh(rbox(0.16,0.16,0.02,0.04),body); bump.position.set(-0.11,0.32,-0.03); phone3.add(bump);
var PH={x:0.98,y:0.6,z:0.62};
phone3.position.set(PH.x,PH.y,PH.z); phone3.rotation.set(-0.12,-0.5,0.09);

/* ---------- screen artwork ---------- */
var F={app:'-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, "Geist", sans-serif', pc:'"Segoe UI", system-ui, -apple-system, Roboto, "Geist", sans-serif', till:'ui-monospace, "Cascadia Mono", Consolas, "Courier New", monospace'};
function txt(c,s,x,y,font,col,align){ c.font=font; c.fillStyle=col; c.textAlign=align||'left'; c.fillText(s,x,y); c.textAlign='left'; }

/* fallback till screen, drawn in the PC till's style (used until the real screenshots load) */
function drawTillFallback(){
  var c=tillT.ctx, W=1600, H=860, sw=200;
  c.fillStyle=T.bg; c.fillRect(0,0,W,H);
  c.fillStyle=T.side; c.fillRect(0,0,sw,H);
  rr(c,18,22,40,40,10); c.fillStyle=T.indigo2; c.fill();
  txt(c,'EPOS',70,42,'700 22px '+F.pc,'#fff'); txt(c,'Stock & Sales',70,62,'400 14px '+F.pc,T.sideFg);
  rr(c,16,88,sw-32,44,8); c.fillStyle=T.green; c.fill(); txt(c,'+  Start a new sale',34,117,'600 16px '+F.pc,'#fff');
  ['Point of Sale','Refunds','Dashboard','Inventory','Stock Orders','End of Day','Staff Access','Settings'].forEach(function(m,i){
    var y=176+i*44; if (!i){ rr(c,16,y-26,sw-32,38,8); c.fillStyle=T.indigo; c.fill(); }
    txt(c,m,40,y,'500 16px '+F.pc,i?T.sideFg:'#fff');
  });
  txt(c,'Point of Sale',sw+30,58,'700 32px '+F.pc,T.fg);
  txt(c,'Scan a barcode or press a till key, then take payment',sw+31,84,'400 15px '+F.pc,T.mute);
  var lx=sw+28, ly=110, lw=760, lh=H-ly-24; rr(c,lx,ly,lw,lh,14); c.fillStyle=T.card; c.fill();
  rr(c,lx+20,ly+20,lw-40,46,10); c.lineWidth=2.5; c.strokeStyle=T.indigo2; c.stroke();
  txt(c,'Scan a barcode, or type it and press Enter...',lx+40,ly+50,'400 16px '+F.pc,T.mute);
  txt(c,'Till keys',lx+20,ly+100,'700 19px '+F.pc,T.fg);
  ['Meat Products','Bakery Products','Drinks'].forEach(function(k,i){ var x=lx+20+i*190; rr(c,x,ly+120,176,74,10); c.fillStyle=T.alt; c.fill(); c.setLineDash([6,5]); c.strokeStyle=T.keyLine; c.lineWidth=2; c.stroke(); c.setLineDash([]); txt(c,k,x+88,ly+165,'700 16px '+F.pc,T.fg,'center'); });
  var rx=lx+lw+20, rw=W-rx-24; rr(c,rx,ly,rw,lh,14); c.fillStyle=T.card; c.fill();
  txt(c,'Current sale',rx+22,ly+40,'700 20px '+F.pc,T.fg);
  [['can of coke','2','2.40'],['King Pot Noodle','1','1.00'],['Mountain Dew','1','1.49'],['Rice','1','13.00']].forEach(function(l,i){
    var y=ly+100+i*48; txt(c,l[0],rx+22,y,'400 16px '+F.pc,T.fg); txt(c,l[1],rx+rw-150,y,'600 16px '+F.pc,T.fg,'center'); txt(c,l[2],rx+rw-24,y,'600 16px '+F.pc,T.fg,'right');
    c.fillStyle=T.line; c.fillRect(rx+22,y+18,rw-44,2);
  });
  txt(c,'Total',rx+22,ly+lh-100,'700 20px '+F.pc,T.fg); txt(c,'17.89',rx+rw-24,ly+lh-96,'800 44px '+F.pc,T.fg,'right');
  rr(c,rx+22,ly+lh-72,rw-44,52,10); c.fillStyle=T.green; c.fill(); txt(c,'Complete sale · 17.89',rx+rw/2,ly+lh-39,'700 18px '+F.pc,'#fff','center');
  tillT.tex.needsUpdate=true;
}
var TILL_SHOTS=['point-of-sale','dashboard','inventory','stock-orders','end-of-day','refunds'], tillImgs=[], tillIdx=0, tillPrev=null, tillFade=1, tillNext=0;
function paintTill(){
  var cur=tillImgs[tillIdx]; if (!cur){ drawTillFallback(); return; }
  var c=tillT.ctx, W=tillT.c.width, H=tillT.c.height;
  c.imageSmoothingQuality='high'; c.globalAlpha=1;
  if (tillPrev && tillFade<1){ c.drawImage(tillPrev,0,0,W,H); c.globalAlpha=tillFade; }
  c.drawImage(cur,0,0,W,H); c.globalAlpha=1;
  tillT.tex.needsUpdate=true;
}
TILL_SHOTS.forEach(function(id,i){ safeImage('screens/pc-'+id+'.webp',function(im){ tillImgs[i]=im; if (i===tillIdx) paintTill(); }); });

var dashImg=null;
function drawPhone(n){
  var c=phT.ctx, W=600, H=1290, sbH=Math.round(W*54/390);
  c.fillStyle=A.bg; c.fillRect(0,0,W,H);
  if (dashImg){
    var s=W/780, tbH=TB*s, avail=H-sbH-tbH, srcH=avail/s;
    c.drawImage(dashImg,0,0,780,srcH,0,sbH,W,avail);
    c.drawImage(dashImg,0,dashImg.naturalHeight-TB,780,TB,0,H-tbH,W,tbH);
  } else {
    txt(c,'Dashboard',38,sbH+70,'800 54px '+F.app,A.fg);
    rr(c,30,sbH+110,W-60,200,34); c.fillStyle=A.card; c.fill();
    txt(c,"Today's takings",62,sbH+160,'400 26px '+F.app,A.mute);
    txt(c,'£1,284.60',58,sbH+240,'800 76px '+F.app,A.fg);
  }
  c.fillStyle=A.bg; c.fillRect(0,0,W,sbH);
  txt(c,'21:42',70,60,'600 31px '+F.app,A.fg);
  rr(c,W/2-92,22,184,54,27); c.fillStyle='#000'; c.fill();
  c.fillStyle=A.fg; [0,1,2,3].forEach(function(i){ rr(c,W-196+i*11,58-(8+i*5),7,8+i*5,2); c.fill(); });
  rr(c,W-128,37,42,22,6); c.strokeStyle='rgba(17,17,20,.45)'; c.lineWidth=2.5; c.stroke(); rr(c,W-124,41,32,14,3); c.fill();
  rr(c,W/2-104,H-20,208,9,4.5); c.fillStyle='#111'; c.fill();
  if (n>0){
    c.save(); c.globalAlpha=Math.min(1,n); var ny=sbH-150+n*150;
    c.shadowColor='rgba(0,0,0,.25)'; c.shadowBlur=30; c.shadowOffsetY=10;
    rr(c,22,ny,W-44,132,40); c.fillStyle='rgba(246,246,248,.98)'; c.fill(); c.shadowColor='transparent';
    rr(c,46,ny+30,72,72,17); c.fillStyle=NAVY; c.fill(); drawMark(c,82,ny+66,38,CREAM,ORANGE);
    txt(c,'Sale on Till 1',140,ny+58,'600 27px '+F.app,A.fg);
    txt(c,'£17.89 · Card · 5 items',140,ny+94,'400 24px '+F.app,'#3C3C43');
    txt(c,'now',W-52,ny+52,'400 20px '+F.app,A.mute,'right');
    c.restore();
  }
  phT.tex.needsUpdate=true;
}
/* the printed receipt matches the till's real 58mm layout */
function drawReceipt(){
  var c=rT.ctx, W=420, H=1512, ink='#1A222C', z=16, p=17, lh=29;
  c.clearRect(0,0,W,H);
  c.beginPath(); c.moveTo(0,z); for (var x=0;x<=W;x+=p){ c.lineTo(x+p/2,0); c.lineTo(Math.min(x+p,W),z); } c.lineTo(W,H); c.lineTo(0,H); c.closePath();
  c.fillStyle='#FDFCF8'; c.fill();
  var d=new Date(), ds=pad(d.getDate())+'/'+pad(d.getMonth()+1)+'/'+d.getFullYear();
  var rows=[EQ,ctr('EPOS STORE'),ctr('12 High Street, Your Town'),ctr('Tel: 01234 567890'),EQ,'Receipt No : 000427','Date       : '+ds+'  21:41','Served by  : admin',DASH,lr('QTY  ITEM','TOTAL'),DASH,
    lr('  2  can of coke','2.40'),'     @ 1.20 each',lr('  1  King Pot Noodle','1.00'),lr('  1  Mountain Dew','1.49'),lr('  1  Rice','13.00'),DASH,lr('Items','5'),lr('Subtotal','17.89'),DASH,lr('TOTAL','17.89'),lr('CARD','17.89'),EQ,ctr('Thank you for shopping with us!'),ctr('Please keep this receipt'),EQ];
  c.fillStyle=ink; c.font='600 20.5px '+F.till; c.textBaseline='alphabetic';
  var cw=c.measureText('0').width, x0=Math.max(8,(W-cw*32)/2);
  rows.forEach(function(r,i){ c.fillText(r,x0,58+i*lh); });
  c.fillStyle='rgba(26,34,44,.05)'; for (var y=58+rows.length*lh+20;y<H;y+=44) c.fillRect(40,y,W-80,2);
  rT.tex.needsUpdate=true;
}
var notifyLevel=0;
drawTillFallback(); drawPhone(0); drawReceipt();
safeImage('screens/dash.jpg',function(im){ dashImg=im; drawPhone(notifyLevel); });
if (document.fonts && document.fonts.ready) document.fonts.ready.then(function(){ if (!tillImgs[tillIdx]) drawTillFallback(); drawPhone(notifyLevel); drawReceipt(); });

var LOOK=new THREE.Vector3(-0.12,0.5,0.05);
function resize(){
  var w=stage.clientWidth, h=stage.clientHeight; if (!w||!h) return;
  renderer.setSize(w,h,false); camera.aspect=w/h;
  var halfV=Math.tan(THREE.MathUtils.degToRad(camera.fov/2));
  var d=Math.min(Math.max(3.1/(2*halfV*camera.aspect),1.75/(2*halfV),4.0),10.5);
  camera.position.set(LOOK.x+0.35,LOOK.y+d*0.22,d); camera.lookAt(LOOK); camera.updateProjectionMatrix();
}
new ResizeObserver(resize).observe(stage); resize();

var px=0, py=0, drag=0, dragV=0, dragging=false, lastX=0, scrollP=0;
canvas.addEventListener('pointermove',function(e){
  var r=stage.getBoundingClientRect();
  if (e.pointerType==='mouse'){ px=(e.clientX-r.left)/r.width-0.5; py=(e.clientY-r.top)/r.height-0.5; }
  if (dragging){ var dx=e.clientX-lastX; lastX=e.clientX; dragV=dx*0.006; drag+=dragV; }
});
canvas.addEventListener('pointerdown',function(e){ dragging=true; lastX=e.clientX; try{ canvas.setPointerCapture(e.pointerId); }catch(_){} });
['pointerup','pointercancel'].forEach(function(t){ canvas.addEventListener(t,function(){ dragging=false; }); });
canvas.addEventListener('pointerleave',function(){ px=0; py=0; });
function onScroll(){ var r=stage.getBoundingClientRect(), vh=window.innerHeight||1; scrollP=Math.max(-1,Math.min(1,(vh/2-(r.top+r.height/2))/vh)); }
window.addEventListener('scroll',onScroll,{passive:true}); onScroll();

var visible=true, raf=0, t0=performance.now(), lastT=t0, cur={ry:0,rx:0}, lastPrint=-1;
var parts=[{o:printer,y:0,d:0},{o:till,y:0,d:0.12},{o:phone3,y:PH.y,d:0.26}];
function ease(k){ return 1-Math.pow(1-k,3); }
function frame(now){
  var dt=Math.min(.1,(now-lastT)/1000); lastT=now;
  var t=reduce?99:(now-t0)/1000;
  parts.forEach(function(p){ var k=ease(Math.min(1,Math.max(0,(t-p.d)/1.0))); p.o.position.y=p.y-(1-k)*0.6; });
  if (!reduce){ phone3.position.y+=Math.sin(t*1.3)*0.025; phone3.rotation.z=0.09+Math.sin(t*0.9)*0.02; }
  var pk=Math.min(1,Math.max(0,(t-1.1)/2.6)), len=PL*Math.round(pk*46)/46;
  if (len!==lastPrint){ setPaper(len); lastPrint=len; }
  var nl=reduce?0:(t<3.9?0:(t<8.4?Math.min(1,(t-3.9)/0.45):Math.max(0,1-(t-8.4)/0.45)));
  if (Math.abs(nl-notifyLevel)>0.001){ notifyLevel=nl; drawPhone(nl); }
  /* cycle the till through its real screens */
  if (!reduce && t>5){
    if (!tillNext) tillNext=t+4.5;
    if (t>=tillNext){
      tillNext=t+4.5;
      var n=TILL_SHOTS.length, j=(tillIdx+1)%n, guard=0;
      while (!tillImgs[j] && guard++<n) j=(j+1)%n;
      if (tillImgs[j] && j!==tillIdx){ tillPrev=tillImgs[tillIdx]; tillIdx=j; tillFade=0; }
    }
    if (tillFade<1){ tillFade=Math.min(1,tillFade+dt/0.6); paintTill(); }
  }
  if (!dragging){ dragV*=0.92; drag+=dragV; drag*=0.985; }
  var idle=reduce?0:Math.sin(t*0.35)*0.06;
  cur.ry+=((-0.12+px*0.45+drag+scrollP*0.35+idle)-cur.ry)*0.07; cur.rx+=(py*0.1-cur.rx)*0.07;
  root.rotation.y=cur.ry; root.rotation.x=cur.rx;
  renderer.render(scene,camera);
  raf=visible && !document.hidden ? requestAnimationFrame(frame) : 0;
}
new IntersectionObserver(function(es){ visible=es[0].isIntersecting; if (visible && !raf){ lastT=performance.now(); raf=requestAnimationFrame(frame); } },{rootMargin:'100px'}).observe(stage);
document.addEventListener('visibilitychange',function(){ if (!document.hidden && visible && !raf){ lastT=performance.now(); raf=requestAnimationFrame(frame); } });
raf=requestAnimationFrame(frame);
})();
