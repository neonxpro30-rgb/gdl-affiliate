
(function(){
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  function split(el,word){
    el.textContent='';
    Array.prototype.forEach.call(word,function(ch,i){var s=document.createElement('span');s.className='l';s.style.setProperty('--i',i);s.textContent=ch===' '?' ':ch;el.appendChild(s);});
  }
  var rot=document.getElementById('rot'), kin=document.getElementById('kin');
  var words=[['trailers','var(--pink)'],['reels','var(--mint)'],['stories','var(--butter)'],['ads','var(--sky)']], wi=0;
  split(rot,words[0][0]); rot.style.setProperty('--pc',words[0][1]);
  if(!reduce)setInterval(function(){wi=(wi+1)%words.length;split(rot,words[wi][0]);rot.style.setProperty('--pc',words[wi][1]);
    kin.setAttribute('aria-label','From raw footage to '+words[wi][0]+' that hit.');},2400);
  split(document.getElementById('w1'),'Your'); split(document.getElementById('w2'),'turn.');

  var run=document.getElementById('run'); run.innerHTML+=run.innerHTML;

  var FPS=25, tc=document.getElementById('tc');
  function tcode(sec){var f=Math.floor((sec%1)*FPS),s=Math.floor(sec)%60,m=Math.floor(sec/60)%60,h=Math.floor(sec/3600);
    return [h,m,s,f].map(function(n){return String(n).padStart(2,'0')}).join(':');}
  function onScroll(){var max=document.documentElement.scrollHeight-innerHeight;var p=max>0?Math.min(1,scrollY/max):0;tc.textContent=tcode(p*180);}
  addEventListener('scroll',onScroll,{passive:true});onScroll();

  var subs=["The first time I saw her… I couldn't look away.",'Haldi laughter. Wedding vows.','And at the vidaai, not a dry eye.'], si=0, subt=document.getElementById('subt');
  function typeLine(){var line=subs[si],k=0;subt.textContent='';
    var t=setInterval(function(){k++;subt.textContent=line.slice(0,k);if(k>=line.length){clearInterval(t);setTimeout(function(){si=(si+1)%subs.length;typeLine();},2200);}},45);}
  if(!reduce)setTimeout(typeLine,2400);

  var tl=document.getElementById('tl'), ph=document.getElementById('ph'), play=document.getElementById('play'),
      rew=document.getElementById('rew'), seqtc=document.getElementById('seqtc'), montc=document.getElementById('montc');
  var pos=0.42, playing=false, last=0, LEN=26;
  function draw(){var lane=tl.querySelector('.lane');var x0=lane.offsetLeft,w=lane.offsetWidth;
    ph.style.left=(x0+pos*w-1)+'px';var s=pos*LEN;seqtc.textContent=tcode(s);
    montc.textContent=String(Math.floor(s/60)).padStart(2,'0')+':'+String(Math.floor(s)%60).padStart(2,'0');}
  function tick(t){if(!playing)return;if(last)pos+=(t-last)/1000/LEN;last=t;if(pos>=1)pos=0;draw();requestAnimationFrame(tick);}
  play.addEventListener('click',function(){playing=!playing;play.textContent=playing?'❚❚':'▶';
    play.setAttribute('aria-label',playing?'Pause':'Play timeline');last=0;if(playing)requestAnimationFrame(tick);});
  rew.addEventListener('click',function(){pos=0;draw();});
  addEventListener('resize',draw);draw();

  var wipe=document.getElementById('wipe'), r=document.getElementById('wipe-range');
  function setCut(){wipe.style.setProperty('--cut',r.value+'%');}
  r.addEventListener('input',setCut);setCut();

  document.querySelectorAll('.tog').forEach(function(b){b.addEventListener('click',function(){
    b.setAttribute('aria-pressed',b.getAttribute('aria-pressed')==='true'?'false':'true');});});
})();
