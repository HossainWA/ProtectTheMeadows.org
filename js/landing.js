/* Landing page only: the meadow you can step on, the photo drawings, and the buttons at the bottom. */
/* Builds the little 10x10 grid and the dots on the landing page. */
(function(){
  var h=document.getElementById('hund');
  if(h){for(var i=0;i<100;i++){var c=document.createElement('i');if(i<3)c.className='on';h.appendChild(c)}}
  var d=document.getElementById('dots');
  if(d){var kinds=[['bf',10],['bd',3],['ma',1],['re',1]];
    kinds.forEach(function(k){for(var i=0;i<k[1];i++){var c=document.createElement('i');c.className=k[0];d.appendChild(c)}})}
})();

/* The two sample photos */
(function(){
    function rng(a){return function(){a|=0;a=a+0x6D2B79F5|0;var t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
    var NS='http://www.w3.org/2000/svg',cls=['fl-p','fl-r','fl-w','fl-y'];
    function el(g,n,a){var e=document.createElementNS(NS,n);for(var k in a)e.setAttribute(k,a[k]);g.appendChild(e);return e}
    function field(id,avoidPatch,count,seed){
      var g=document.getElementById(id).querySelector('.flowers'),r=rng(seed),i,x,y,s;
      for(i=0;i<count;i++){y=144+Math.pow(r(),.85)*(avoidPatch?150:118);x=r()*240;
        if(avoidPatch&&Math.pow((x-112)/86,2)+Math.pow((y-232)/50,2)<1)continue;
        s=.55+(y-144)/110;el(g,'circle',{cx:x.toFixed(1),cy:y.toFixed(1),r:(2.4*s).toFixed(1),class:cls[Math.floor(r()*4)]})}
      if(!avoidPatch){for(i=0;i<11;i++){x=10+i*21+r()*8;y=238+r()*20;s=5+r()*4;
        el(g,'path',{d:'M'+x.toFixed(1)+' '+(y+26).toFixed(1)+' L'+x.toFixed(1)+' '+y.toFixed(1),class:'s-stem'});
        el(g,'circle',{cx:x.toFixed(1),cy:y.toFixed(1),r:s.toFixed(1),class:cls[Math.floor(r()*4)]});
        el(g,'circle',{cx:x.toFixed(1),cy:y.toFixed(1),r:(s*.38).toFixed(1),class:'fl-y'})}}
    }
    field('shot-bad',true,150,5);field('shot-good',false,190,9);
  })();

/* The meadow, the trail and the buttons */
(function(){
  var cv=document.getElementById('meadow'), ctx=cv.getContext('2d'), wrap=cv.parentElement;
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  var N=380, flowers=[], steps=[], W=0, H=0, gt=0, C={}, lastOk=false;
  function rng(a){return function(){a|=0;a=a+0x6D2B79F5|0;var t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
  // trail centre line and half width, both as fractions of canvas width, by depth t (0 horizon, 1 near)
  function tc(t){return .5+.1*Math.sin(2.6*t+.4)}
  function tw(t){return .016+.055*t}
  var r=rng(11);
  for(var i=0;i<N;i++){var f={nx:r(),t:Math.pow(r(),.8),type:Math.floor(r()*4),h:.7+r()*.6,ph:r()*6.28,c:0,tg:0,dir:r()<.5?-1:1};
    f.skip=Math.abs(f.nx-tc(f.t))<tw(f.t)+.012; flowers.push(f)}
  flowers.sort(function(a,b){return a.t-b.t});
  function readColors(){var cs=getComputedStyle(document.documentElement);['sky1','sky2','mount','snowcap','hill','meadow','meadow2','trail','trail-edge','dead','foot','fl-purple','fl-red','fl-yellow','fl-white'].forEach(function(n){C[n]=cs.getPropertyValue('--'+n).trim()})}
  function layout(){
    W=wrap.clientWidth; H=Math.round(Math.min(Math.max(W*.5,300),480)); gt=H*.36+8;
    var d=Math.min(window.devicePixelRatio||1,2); cv.width=W*d; cv.height=H*d; cv.style.height=H+'px'; ctx.setTransform(d,0,0,d,0,0); draw(performance.now());
  }
  function sc(t){return .45+.95*t}
  function py(t){return gt+t*(H-gt)}
  function head(x,y,s,f,col){
    ctx.fillStyle=col;
    if(f.type===0){for(var k=0;k<5;k++){ctx.beginPath();ctx.arc(x+(k%2?1:-1)*.6*s,y+k*3.1*s,2.6*s,0,6.283);ctx.fill()}}
    else if(f.type===1){ctx.beginPath();ctx.ellipse(x,y,3.2*s,4.4*s,0,0,6.283);ctx.fill()}
    else{for(var j=0;j<6;j++){var a=j*1.047;ctx.beginPath();ctx.arc(x+Math.cos(a)*3*s,y+Math.sin(a)*3*s,2.3*s,0,6.283);ctx.fill()}
      ctx.fillStyle=f.type===2?C['fl-yellow']:C['fl-red'];ctx.beginPath();ctx.arc(x,y,2*s,0,6.283);ctx.fill()}
  }
  function draw(time){
    if(!W)return;
    var hy=gt-8;
    var g=ctx.createLinearGradient(0,0,0,hy+10);g.addColorStop(0,C.sky1);g.addColorStop(1,C.sky2);ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
    ctx.fillStyle=C.mount;ctx.beginPath();ctx.moveTo(W*.18,hy+2);ctx.lineTo(W*.46,hy-H*.2);ctx.lineTo(W*.56,hy-H*.3);ctx.lineTo(W*.64,hy-H*.25);ctx.lineTo(W*.74,hy-H*.14);ctx.lineTo(W*.95,hy+2);ctx.closePath();ctx.fill();
    ctx.fillStyle=C.snowcap;ctx.beginPath();ctx.moveTo(W*.56,hy-H*.3);ctx.lineTo(W*.5,hy-H*.23);ctx.lineTo(W*.535,hy-H*.215);ctx.lineTo(W*.56,hy-H*.235);ctx.lineTo(W*.595,hy-H*.21);ctx.lineTo(W*.62,hy-H*.235);ctx.closePath();ctx.fill();
    ctx.fillStyle=C.hill;ctx.beginPath();ctx.moveTo(0,hy+4);ctx.quadraticCurveTo(W*.3,hy-H*.07,W*.6,hy+2);ctx.quadraticCurveTo(W*.85,hy-H*.04,W,hy+4);ctx.lineTo(W,H);ctx.lineTo(0,H);ctx.fill();
    var gg=ctx.createLinearGradient(0,hy,0,H);gg.addColorStop(0,C.meadow);gg.addColorStop(1,C.meadow2);ctx.fillStyle=gg;ctx.fillRect(0,hy+2,W,H-hy);
    // trail
    var K=28,i,t;
    ctx.beginPath();
    for(i=0;i<=K;i++){t=i/K;ctx.lineTo((tc(t)-tw(t))*W,py(t))}
    for(i=K;i>=0;i--){t=i/K;ctx.lineTo((tc(t)+tw(t))*W,py(t))}
    ctx.closePath();ctx.fillStyle=C.trail;ctx.fill();ctx.strokeStyle=C['trail-edge'];ctx.lineWidth=2;ctx.stroke();
    // footprints
    ctx.fillStyle=C.foot;
    steps.forEach(function(p){var x=p.nx*W,y=py(p.t),s=sc(p.t);ctx.globalAlpha=p.ok?.4:.55;
      ctx.beginPath();ctx.ellipse(x-9*s,y,4.2*s,8.5*s,.15,0,6.283);ctx.fill();
      ctx.beginPath();ctx.ellipse(x+9*s,y+5*s,4.2*s,8.5*s,-.15,0,6.283);ctx.fill()});
    ctx.globalAlpha=1;
    var cols=[C['fl-purple'],C['fl-red'],C['fl-white'],C['fl-yellow']];
    for(i=0;i<flowers.length;i++){
      var f=flowers[i]; if(f.skip)continue;
      var s=sc(f.t),x=f.nx*W,y=py(f.t),h=(24+f.h*20)*s;
      if(f.c!==f.tg){f.c+=(f.tg-f.c)*(reduce?1:.2);if(Math.abs(f.tg-f.c)<.01)f.c=f.tg}
      var sw=reduce?0:Math.sin(time/900+f.ph)*3*s*(1-f.c);
      var tx=x+sw+f.dir*h*.85*f.c, ty=y-h*(1-f.c)-2*f.c;
      ctx.strokeStyle=f.c>.5?C.dead:C.meadow2;ctx.lineWidth=Math.max(1,1.6*s);ctx.lineCap='round';
      ctx.beginPath();ctx.moveTo(x,y);ctx.quadraticCurveTo(x+sw*.4,y-h*.5*(1-f.c),tx,ty);ctx.stroke();
      head(tx,ty,s,f,f.c>.5?C.dead:cols[f.type]);
    }
  }
  function crushed(){var n=0;flowers.forEach(function(f){if(f.tg)n++});return n}
  function ui(){
    var n=crushed(),st=document.getElementById('status'),m=document.getElementById('msg');
    document.getElementById('n').textContent=n;
    st.className='status'+(lastOk?' good':'');
    if(!steps.length)m.textContent='';
    else if(lastOk)m.textContent='On the trail. No new plants harmed. Thank you.';
    else m.textContent='Off the trail. These can take decades to heal, if they ever do.';
    document.getElementById('hint').style.display=steps.length>5?'none':'';
  }
  function step(nx,t,quiet){
    var ok=Math.abs(nx-tc(t))<tw(t);
    steps.push({nx:nx,t:t,ok:ok});lastOk=ok;
    if(!ok){var px=nx*W,y0=py(t),s=sc(t),rx=46*s;
      flowers.forEach(function(f){if(f.skip)return;var dx=(f.nx*W-px)/rx,dy=(py(f.t)-y0)/(rx*.55);if(dx*dx+dy*dy<1)f.tg=1})}
    if(!quiet){ui();if(reduce)draw(performance.now())}
  }
  function seed(){steps=[];lastOk=false;flowers.forEach(function(f){f.c=0;f.tg=0});
    [[.17,.28],[.25,.46],[.31,.62],[.33,.79]].forEach(function(p){step(p[0],p[1],true)});
    flowers.forEach(function(f){f.c=f.tg});ui()}
  cv.addEventListener('pointerdown',function(e){var b=cv.getBoundingClientRect(),x=e.clientX-b.left,y=Math.max(e.clientY-b.top,gt+4);step(x/W,(y-gt)/(H-gt))});
  document.getElementById('ontrail').addEventListener('click',function(){var t=.1+Math.random()*.88;step(tc(t)+(Math.random()-.5)*tw(t)*1.2,t)});
  document.getElementById('cut').addEventListener('click',function(){var t=.12+Math.random()*.85,x;do{x=.06+Math.random()*.88}while(Math.abs(x-tc(t))<tw(t)+.06);step(x,t)});
  document.getElementById('reset').addEventListener('click',function(){seed();if(reduce)draw(performance.now())});
  function loop(t){draw(t);requestAnimationFrame(loop)}
  readColors();layout();seed();
  if(window.ResizeObserver)new ResizeObserver(layout).observe(wrap);else addEventListener('resize',layout);
  function recolor(){readColors();draw(performance.now())}
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change',recolor);
  new MutationObserver(recolor).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
  if(reduce)draw(performance.now());else requestAnimationFrame(loop);

  // pledge and share
  var pl=document.getElementById('pledge');
  pl.addEventListener('click',function(){
    var on=pl.getAttribute('aria-pressed')!=='true';
    pl.setAttribute('aria-pressed',on);pl.classList.toggle('done',on);
    pl.textContent=on?'You are a meadow keeper':"I'll stay on the trail";
    document.getElementById('thx-h').textContent=on?'Thank you, meadow keeper':'Be a meadow keeper';
  });
  var sh=document.getElementById('share'),url='https://www.protectthemeadows.org';
  sh.addEventListener('click',function(){
    function done(){sh.textContent='Copied. Pass it on.';setTimeout(function(){sh.textContent='Copy the link'},2500)}
    function fallback(){var ta=document.createElement('textarea');ta.value=url;document.body.appendChild(ta);ta.select();try{document.execCommand('copy');done()}catch(e){sh.textContent=url}document.body.removeChild(ta)}
    if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(url).then(done,fallback);else fallback();
  });
})();
