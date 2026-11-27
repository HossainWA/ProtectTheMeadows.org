/* Landing page only: the meadow you can step on, the photo drawings, and the buttons at the bottom. */
/* Builds the little 10x10 grid and the dots on the landing page. */
(function(){ try {
  var h=document.getElementById('hund');
  if(h){for(var i=0;i<100;i++){var c=document.createElement('i');if(i<3)c.className='on';h.appendChild(c)}}
  var d=document.getElementById('dots');
  if(d){var kinds=[['bf',10],['bd',3],['ma',1],['re',1]];
    kinds.forEach(function(k){for(var i=0;i<k[1];i++){var c=document.createElement('i');c.className=k[0];d.appendChild(c)}})}
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
