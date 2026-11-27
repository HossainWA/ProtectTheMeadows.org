/* Landing page only: the meadow you can step on, the photo drawings, and the buttons at the bottom. */
/* Builds the little 10x10 grid and the dots on the landing page. */
(function(){ try {
  var h=document.getElementById('hund');
  if(h){for(var i=0;i<100;i++){var c=document.createElement('i');if(i<3)c.className='on';h.appendChild(c)}}
  var d=document.getElementById('dots');
  if(d){var kinds=[['bf',10],['bd',3],['ma',1],['re',1]];
    kinds.forEach(function(k){for(var i=0;i<k[1];i++){var c=document.createElement('i');c.className=k[0];d.appendChild(c)}})}
} catch(e){} })();

/* The two sample photos */
(function(){ try {
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
  } catch(e){} })();

/* The share button. The meadow lives in photo-meadow.js; the pledge button in keepers.js. */
(function(){
  function $(id){return document.getElementById(id)}
  // share (the pledge button lives in keepers.js)
  var sh=$('share'),url='https://www.protectthemeadows.org';
  if(sh)sh.addEventListener('click',function(){
    function done(){sh.textContent='Copied. Pass it on.';setTimeout(function(){sh.textContent='Copy the link'},2500)}
    function fallback(){var ta=document.createElement('textarea');ta.value=url;document.body.appendChild(ta);ta.select();try{document.execCommand('copy');done()}catch(e){sh.textContent=url}document.body.removeChild(ta)}
    if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(url).then(done,fallback);else fallback();
  });
})();
