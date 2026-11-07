
(function(){
  var box=document.getElementById('buddy'), cv=document.getElementById('buddy-cv'), bubble=document.getElementById('bubble'),
      hit=document.getElementById('buddy-hit'), bx=document.getElementById('buddy-x'), showBtn=document.getElementById('buddy-show');
  if(!window.THREE){box.hidden=true;return;}
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  var small=innerWidth<640, W=small?120:170, H=small?145:205;
  box.style.setProperty('--bw',W+'px');box.style.setProperty('--bh',H+'px');
  var renderer;
  try{renderer=new THREE.WebGLRenderer({canvas:cv,alpha:true,antialias:true});}catch(e){box.hidden=true;return;}
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));renderer.setSize(W,H,false);
  var scene=new THREE.Scene(), cam=new THREE.PerspectiveCamera(30,W/H,.1,50);
  cam.position.set(0,1.85,7);cam.lookAt(0,1.6,0);
  scene.add(new THREE.HemisphereLight(0xffffff,0xffd3e6,.75));
  var dl=new THREE.DirectionalLight(0xffffff,.8);dl.position.set(2,4,5);scene.add(dl);
  var FEET=.93, SEAT=.79, HAND=.06;   // feet / seat / raised hands, as a fraction of the canvas from the top

  /* ================= MODEL (matched to Naksh's photos) ================= */
  var grad=new THREE.DataTexture(new Uint8Array([110,190,255]),3,1,THREE.LuminanceFormat);
  grad.minFilter=grad.magFilter=THREE.NearestFilter;grad.needsUpdate=true;
  var C={skin:0xb0714a,hair:0x17131d,tee:0x2a4aa0,pants:0x1d1c22,shoe:0xfaf8f4,sole:0x2b2a30,glass:0x2e3138,hp:0x2a2830,cup:0xff8ac4,watch:0x111014,mouth:0x5a1f2a,eye:0x17131f,white:0xffffff,cheek:0xff9fb8};
  var mats={};function M(c){return mats[c]||(mats[c]=new THREE.MeshToonMaterial({color:c,gradientMap:grad}));}
  var OUT=new THREE.MeshBasicMaterial({color:0x1e1530,side:THREE.BackSide});
  function add(geo,c,parent,x,y,z,ol){var m=new THREE.Mesh(geo,M(c));m.position.set(x||0,y||0,z||0);parent.add(m);
    if(ol!==false){var o=new THREE.Mesh(geo,OUT);o.scale.setScalar(ol||1.05);m.add(o);}return m;}
  function G(parent,x,y,z){var g=new THREE.Group();g.position.set(x||0,y||0,z||0);parent.add(g);return g;}
  function S(r){return new THREE.SphereGeometry(r,24,16);}
  function Cy(a,b,h){return new THREE.CylinderGeometry(a,b,h,18);}

  var root=G(scene), hips=G(root,0,1.0,0);
  var chest=G(hips,0,0,0);
  var torso=add(Cy(.36,.44,.74),C.tee,chest,0,.38,0);torso.scale.z=.66;
  add(Cy(.12,.4,.08),C.tee,chest,0,.76,0).scale.z=.66;
  add(Cy(.09,.1,.16),C.skin,chest,0,.82,0,false);
  var head=G(chest,0,.86,0);head.scale.setScalar(1.22);
  var skull=add(S(.38),C.skin,head,0,.36,0);skull.scale.set(.94,1.0,.9);
  [1,-1].forEach(function(s){add(S(.07),C.skin,head,s*.35,.33,0).scale.set(.5,1,.8);});
  var eyeG=G(head,0,0,0), eyes=[];
  [.13,-.13].forEach(function(x){
    add(S(.06),C.white,eyeG,x,.36,.29,false).scale.set(1,1.1,.5);
    var p=add(S(.042),C.eye,eyeG,x,.36,.315,false);p.scale.z=.5;eyes.push(p);
    add(S(.014),C.white,eyeG,x+.015,.38,.335,false);
  });
  [.13,-.13].forEach(function(x){add(new THREE.TorusGeometry(.11,.012,8,28),C.glass,head,x,.36,.345,false);});
  add(new THREE.BoxGeometry(.05,.012,.012),C.glass,head,0,.385,.35,false);
  [1,-1].forEach(function(s){add(new THREE.BoxGeometry(.012,.012,.34),C.glass,head,s*.24,.37,.18,false);});
  var brows=[.13,-.13].map(function(x){return add(new THREE.BoxGeometry(.11,.024,.02),C.hair,head,x,.48,.33,false);});
  add(S(.035),C.skin,head,0,.28,.34,false);
  [1,-1].forEach(function(s){var ck=add(S(.05),C.cheek,head,s*.2,.24,.29,false);ck.scale.set(1,.6,.3);});
  var mouth=G(head,0,.17,.31);
  var mSmile=add(new THREE.TorusGeometry(.05,.013,8,16,Math.PI),C.mouth,mouth,0,.025,0,false);mSmile.rotation.z=Math.PI;
  var mOpen=add(S(.055),C.mouth,mouth,0,0,0,false);mOpen.scale.set(1,.85,.4);
  var mFlat=add(new THREE.BoxGeometry(.09,.016,.012),C.mouth,mouth,0,0,0,false);
  var mGrr=add(new THREE.BoxGeometry(.1,.04,.012),C.white,mouth,0,0,0,false);

  // hair lives in its own group so it can bounce with momentum
  var hairG=G(head,0,.37,-.03);
  var cap=add(new THREE.SphereGeometry(.41,24,16,0,Math.PI*2,0,Math.PI*.62),C.hair,hairG,0,0,0);cap.rotation.x=-.7;
  var seed=11;function rnd(){seed=(seed*16807)%2147483647;return seed/2147483647;}
  for(var i=0;i<30;i++){
    var th=rnd()*Math.PI*2, ph=rnd()*1.35, d=new THREE.Vector3(Math.sin(ph)*Math.cos(th),Math.cos(ph),Math.sin(ph)*Math.sin(th));
    if(d.z>.3&&d.y<.8)continue;
    var tf=add(S(.09+rnd()*.06),C.hair,hairG,d.x*.39,d.y*.39,d.z*.39);tf.scale.set(1.3,.8,1);tf.rotation.set(rnd()*3,rnd()*3,rnd()*3);
  }
  [[.17,.55,.28,.1],[0,.58,.3,.1],[-.16,.56,.29,.1],[.29,.5,.2,.09],[-.3,.49,.19,.09],[.08,.6,.26,.08],[-.07,.6,.26,.08]].forEach(function(f){
    add(S(f[3]),C.hair,hairG,f[0],f[1]-.37,f[2]+.03).scale.set(1.25,.85,.9);});
  [[.34,.3,-.1],[-.34,.3,-.1],[.24,.12,-.27],[-.24,.12,-.27],[0,.1,-.32]].forEach(function(f){
    add(S(.13),C.hair,hairG,f[0],f[1]-.37,f[2]+.03).scale.set(1,1.2,1);});
  add(new THREE.TorusGeometry(.5,.035,10,32,Math.PI),C.hp,head,0,.38,-.02);
  [1,-1].forEach(function(s){add(Cy(.12,.12,.09),C.cup,head,s*.48,.32,-.02).rotation.z=Math.PI/2;});

  function arm(s){
    var sh=G(chest,s*.42,.68,0);
    add(Cy(.14,.17,.3),C.tee,sh,0,-.11,0);
    add(Cy(.058,.055,.26),C.skin,sh,0,-.34,0);
    var el=G(sh,0,-.45,0);
    add(Cy(.055,.05,.26),C.skin,el,0,-.12,0);
    add(S(.075),C.skin,el,0,-.3,0);
    if(s>0){add(Cy(.068,.068,.06),C.watch,el,0,-.21,0,false);add(new THREE.BoxGeometry(.05,.04,.02),C.cup,el,0,-.21,.065,false);}
    return {sh:sh,el:el};
  }
  function leg(s){
    var hp=G(hips,s*.18,0,0);
    add(Cy(.17,.16,.48),C.pants,hp,0,-.22,0);
    var kn=G(hp,0,-.46,0);
    add(Cy(.155,.18,.42),C.pants,kn,0,-.19,0);
    var ft=G(kn,0,-.43,0);
    var sh=add(S(.14),C.shoe,ft,0,-.01,.07);sh.scale.set(.85,.6,1.35);
    add(new THREE.BoxGeometry(.24,.04,.38),C.sole,ft,0,-.08,.07,false);
    return {hp:hp,kn:kn,ft:ft};
  }
  var aL=arm(1), aR=arm(-1), lL=leg(1), lR=leg(-1);

  /* ================= PHYSICS: every joint is a spring ================= */
  var KEYS=['shLx','shLz','shRx','shRz','elL','elR','elRz','hpL','hpR','knL','knR','ftL','ftR','hX','hY','hZ','cX','cZ','hipsY','hipsZ','hipsYaw','yaw','fall','lift','z','rz','px'];
  var SOFT={hX:1,hY:1,hZ:1,cX:1,cZ:1};
  function base(){var T={};KEYS.forEach(function(k){T[k]=0;});T.shLz=.12;T.shRz=-.12;T.elL=-.15;T.elR=-.15;return T;}
  var J=base(), JV={};KEYS.forEach(function(k){JV[k]=0;});
  var hair={x:0,z:0,vx:0,vz:0}, lean={v:0,x:0}, impact=0;
  function springAll(T,dt){KEYS.forEach(function(k){var kk=SOFT[k]?75:170, dd=SOFT[k]?11:19;
    JV[k]+=((T[k]-J[k])*kk-JV[k]*dd)*dt;J[k]+=JV[k]*dt;});}
  function apply(){
    aL.sh.rotation.set(J.shLx,0,J.shLz);aR.sh.rotation.set(J.shRx,0,J.shRz);
    aL.el.rotation.x=J.elL;aR.el.rotation.set(J.elR,0,J.elRz);
    lL.hp.rotation.x=J.hpL;lR.hp.rotation.x=J.hpR;lL.kn.rotation.x=J.knL;lR.kn.rotation.x=J.knR;
    lL.ft.rotation.x=J.ftL;lR.ft.rotation.x=J.ftR;
    head.rotation.set(J.hX,J.hY,J.hZ);chest.rotation.set(J.cX,-J.hipsYaw*.8,J.cZ);
    hips.position.y=1.0+J.hipsY;hips.rotation.set(0,J.hipsYaw,J.hipsZ);
    hips.scale.set(1+impact*.07,1-impact*.13,1+impact*.07);
    root.rotation.set(J.fall,J.yaw,lean.x+J.rz);root.position.set(J.px,J.lift,J.z);
    hairG.rotation.set(hair.x,0,hair.z);
  }
  function face(m,b){mSmile.visible=m==='smile';mOpen.visible=m==='open';mFlat.visible=m==='flat';mGrr.visible=m==='grr';
    var r=b==='angry'?.45:b==='sad'?-.35:0, y=b==='up'?.53:b==='angry'?.45:.48;
    brows[0].rotation.z=r;brows[1].rotation.z=-r;brows[0].position.y=brows[1].position.y=y;}

  var sayT;function say(txt,ms){if(!txt)return;bubble.textContent=txt;bubble.hidden=false;bubble.style.animation='none';void bubble.offsetWidth;bubble.style.animation='';
    clearTimeout(sayT);sayT=setTimeout(function(){bubble.hidden=true;},ms||Math.max(1800,txt.length*70));}
  function pick(a){return a[Math.floor(Math.random()*a.length)];}
  function rr(a,b){return a+Math.random()*(b-a);}
  function shake(){box.classList.remove('shake');void box.offsetWidth;box.classList.add('shake');}
  function fx(el,cls,ms){if(!el)return;el.classList.remove(cls);void el.offsetWidth;el.classList.add(cls);setTimeout(function(){el.classList.remove(cls);},ms||900);}

  var pos={x:16,y:0}, prev={x:16,y:0}, vel={x:0,y:0}, acc={x:0,y:0}, facing=1, t=0;
  // The visible band of this page. Inside an auto-height frame (desktop artifact viewer) innerHeight is the whole
  // page, so ask an IntersectionObserver which slice the visitor can actually see.
  var vb={top:0,bottom:innerHeight}, vbHook=null, vbT=performance.now();
  if('IntersectionObserver' in window){var ths=[];for(var q=0;q<=1000;q++)ths.push(q/1000);
    new IntersectionObserver(function(es){var ir=es[es.length-1].intersectionRect, nt, nb;
      if(ir&&ir.height>40){nt=ir.top;nb=ir.bottom;}else{nt=0;nb=innerHeight;}
      var now=performance.now(), dy=nt-vb.top;vb.top=nt;vb.bottom=nb;
      if(vbHook&&Math.abs(dy)>=1&&nb-nt<innerHeight-40)vbHook(dy,Math.max(1,now-vbT));vbT=now;
    },{threshold:ths}).observe(document.documentElement);}
  addEventListener('resize',function(){if(innerHeight<screen.height*1.5){vb.top=0;vb.bottom=innerHeight;}});
  function groundY(){return vb.bottom-H;}
  function clampX(x){return Math.max(8,Math.min(x,innerWidth-W-8));}
  function place(){box.style.transform='translate('+pos.x+'px,'+pos.y+'px)';}

  var carry=null;
  function releaseCarry(silent){if(!carry)return;var c=carry;carry=null;
    c.el.style.transition='transform .55s cubic-bezier(.3,1.5,.5,1)';c.el.style.transform='';
    setTimeout(function(){c.el.classList.remove('stolen');c.el.style.transition=c.tr;c.el.style.display=c.disp;},650);
    if(!silent)say(line('give',c.label));}
  bx.addEventListener('click',function(){releaseCarry(true);box.hidden=true;showBtn.hidden=false;});
  showBtn.addEventListener('click',function(){box.hidden=false;showBtn.hidden=true;say('You can\'t get rid of me 😏');});

  if(reduce){pos.y=groundY();face('smile','');apply();place();renderer.render(scene,cam);
    hit.addEventListener('click',function(){say('Hi! I\'m Naksh. Try the ₹19 lesson 👋',2400);});return;}

  /* ================= LANGUAGE: lines are assembled, never the same twice in a row ================= */
  var L={
    greet:['Hi! I\'m Naksh. I made all this 👋','Yo! Welcome to my page 😎','Oh, a visitor! Hi hi 👋'],
    back:['Welcome back! Still thinking about {t}? 👀','You came back! I knew it 😎','Again? You like me 😏'],
    sit:['{t}? Comfy. Mine now 😌','Best seat on the page 🍿','I\'m the boss of {t} now 😎','Just chilling on {t} 🛋️','Rent-free on {t} 😌'],
    stomp:['Stomp stomp! 👟','{t} is squeaky 😂','King of {t} 👑','Is {t} even stable? 🤨'],
    hang:['Hanging out 🙃','Don\'t scroll! I\'ll fall 😱','Look, no feet! 🙃','Pull-up time 💪'],
    shove:['Move, {t}! 😤','{t} was crooked. Fixed 🫡','Shove! 💪','Make some room, {t} 😤'],
    steal:['Yoink! "{t}" is mine 😈','Keeping "{t}" 😏','"{t}"? Borrowing it 😇','Finders keepers! 😈'],
    tease:['Come and get it 😝','Nope, not giving it back 😜','Want it? Buy a course 😏'],
    juggle:['Watch this! 🤹','Catch! …kidding 😝','Ten points for style 🤹'],
    give:['Fine, take "{t}" back 🙄','Here. Happy now? 😒','Okay okay, "{t}" is yours 🙄'],
    course:['{t}? Great pick 😎','I edit with {t} stuff daily','{t} = more clients 💸','Take {t}. Trust me, I\'m the editor'],
    btn:['Click right under me 👇','This button. Trust me 👇','₹19. Under my feet. Go 👇','Press it. Press it 👇'],
    knock:['Knock knock 👊 Buy something?','Hellooo? 🙃','I can see you scrolling 👀','Tap tap. It\'s me 👊'],
    lunge:['Don\'t make me come out there 😤','I\'m coming out of this screen… 😤','Last warning. ₹19. NOW. 😤'],
    panic:['WAIT! Just ₹19! 😭','Leaving?! Take the ₹19 lesson first 🥺','Noooo, come back 😭'],
    yay:['Yesss! Best decision ever 🥳','Let\'s gooo! 🎬','I KNEW you\'d do it 🥳'],
    poke:['Hehe 😆','Stop poking me 😂','Ow! 😤','That tickles!','Personal space, bro 😅','Again?! 😂'],
    watch:['Is it buy o\'clock yet? ⌚','Time check: still not bought 😤','Late for my edit ⌚'],
    explore:['What\'s over here? 👀','Ooh, what\'s this?','Exploring my kingdom 🗺️'],
    cursor:['Hi you 👋','I see your cursor 👀','Hey hey 👋'],
    yawn:['*yawn* 🥱','So sleepy 🥱'],
    wake:['I\'m up! I\'m up! 😅','Oh! You\'re back 😅'],
    over:['Too many transitions… 😩','Who edits like this?! 😩'],
    fall:['Aaaah! 😱','Whoa, slow down! 😵','My back 😵'],
    slide:['Wheee! 🛝','Card slide! 🛝','Sliding in 😎'],
    pound:['Hiyaa! 👊','Boom! 💥','Oops, broke the text 😅','Who needs words? 👊'],
    edit:['Bad cut. Fixed ✂️','Trust me, it\'s better now ✂️','My timeline now 🎬','Ctrl+Z won\'t save you 😈']
  };
  var recentL=[];
  function short(s){s=(s||'').replace(/\s+/g,' ').trim();return s.length>20?s.slice(0,18)+'…':s;}
  function line(kind,tx){var a=L[kind];if(!a)return '';var s,n=0;
    do{s=pick(a).replace(/\{t\}/g,short(tx));n++;}while(recentL.indexOf(s)>-1&&n<8);
    recentL.push(s);if(recentL.length>14)recentL.shift();return s;}
  var lastTalk=-1e9;
  function talk(kind,tx,prob,force){var n=performance.now();if(!force&&(n-lastTalk<15000||Math.random()>(prob==null?.4:prob)))return;lastTalk=n;say(line(kind,tx));}
  function label(el){if(el.classList.contains('tv'))return 'the TV';if(el.classList.contains('cert'))return 'the certificate';
    if(el.classList.contains('combo'))return 'the bundle';if(el.classList.contains('wipe'))return 'the slider';
    var h=el.querySelector('h3,strong');return h?h.childNodes[0].textContent:el.textContent;}

  /* ================= MEMORY + NEEDS ================= */
  var store={};try{store=JSON.parse(localStorage.getItem('lp_brain')||'{}');}catch(e){}
  function save(){try{localStorage.setItem('lp_brain',JSON.stringify(store));}catch(e){}}
  store.visits=(store.visits||0)+1;save();
  var need={bored:.3,mischief:.5,sell:.2,energy:1,curious:.6};
  var mem={verbs:[],targets:[],dwellEl:null,dwellT:0,bought:false,exit:false,lastCursor:0,cursorX:innerWidth/2,overSeen:0,lastScroll:0};
  function remember(v,el){mem.verbs.push(v);if(mem.verbs.length>8)mem.verbs.shift();if(el){mem.targets.push(el);if(mem.targets.length>5)mem.targets.shift();}}
  function count(a,x){var n=0;a.forEach(function(y){if(y===x)n++;});return n;}

  /* ================= PLANS: chains of steps the brain assembles ================= */
  var plan=[], surf=null, intro=true;
  function surfPos(s){var r=s.el.getBoundingClientRect(),x=r.left+s.fx*r.width-W/2;
    var y=s.kind==='sit'?r.top-H*SEAT:(s.kind==='stand'||s.kind==='lie')?r.top-H*FEET:r.bottom-H*HAND-4;return {x:x,y:y,r:r};}
  function surfOk(s){var p=surfPos(s),r=p.r;
    if(r.bottom<vb.top||r.top>vb.bottom)return false;
    if(s.kind==='hang')return p.y+H<vb.bottom+30&&p.y>vb.top-20;
    return p.y>vb.top-10&&r.top<vb.bottom-30;}
  function fallOff(){surf=null;releaseCarry(true);talk('fall',null,.5);
    plan=[{k:'hop',tx:clampX(pos.x),surf:null,fall:true},{k:'pose',p:'flat',d:1.3},{k:'pose',p:'getup',d:.5}];}
  function P(p,d,o){return {k:'pose',p:p,d:d,o:o||{}};}
  function SAY(kind,tx,prob){return {k:'call',fn:function(){talk(kind,tx,(prob==null?1:prob)*.4);}};}

  function visible(sel,test){return [].slice.call(document.querySelectorAll(sel)).filter(function(el){
    var r=el.getBoundingClientRect();return r.width>40&&r.right>0&&r.left<innerWidth&&r.bottom>vb.top&&r.top<vb.bottom&&test(r);});}
  function roomTop(r,frac){return r.top>vb.top+H*frac+12&&r.top<vb.bottom-70;}

  function decide(){
    var cands=[], onSurf=!!surf, s=need;
    function c(v,u,build,el){u-= .45*count(mem.verbs,v)+(el&&mem.targets.indexOf(el)>-1?.35:0);cands.push({v:v,u:u+rr(0,.35),b:build,el:el});}
    if(onSurf){
      c('stay',.35+(1-s.energy)*.4,function(){return [P(surf.kind==='hang'?'hangSwing':surf.kind==='sit'?'sitIdle':'idle',rr(2.5,5))];});
      c('jumpDown',.45+s.bored*.4,function(){return [{k:'hop',tx:clampX(pos.x+rr(-160,160)),surf:null}];});
      if(surf.kind==='sit'&&s.energy<.45)c('nap',.8,function(){return [P('sleep',rr(4,7)),P('yawn',1.2),SAY('wake',null,.6)];});
    }
    // fidgets
    ['lookAround','scratch','glasses','stretch'].forEach(function(f){c(f,.15+s.bored*.35,function(){return [P(f,rr(1.4,2.6))];});});
    c('watch',.1+s.sell*.5,function(){return [P('watch',2.2),SAY('watch',null,.7)];});
    c('tapFoot',.05+s.sell*.45,function(){return [P('tapFoot',rr(1.8,3))];});
    if(!onSurf){
      c('explore',.25+s.curious*.45,function(){var x=clampX(rr(8,innerWidth-W));return [{k:'walk',tx:x},P('lookAround',1.4),SAY('explore',null,.35)];});
      if(performance.now()-mem.lastCursor<4000)c('toCursor',.45,function(){return [{k:'walk',tx:clampX(mem.cursorX-W/2)},P('wave',1.4),SAY('cursor',null,.8)];});
      if(s.energy<.3)c('napFloor',.9,function(){return [P('floorSit',1),P('sleep',rr(4,7),{floor:1}),P('yawn',1.2),SAY('wake',null,.6)];});
    }
    // mischief on page graphics
    visible('.tv, .course, .cert, .combo, .box, .tool, .wipe, .faq details',function(r){return true;}).forEach(function(el){
      var r=el.getBoundingClientRect(), nm=label(el);
      if(roomTop(r,SEAT)){
        c('sit',.3+s.mischief*.6,function(){return [{k:'hop',surf:{el:el,fx:rr(.15,.85),kind:'sit'}},SAY('sit',nm,.8),P('sitIdle',rr(3,6))];},el);
        c('stomp',.2+s.mischief*.5,function(){return [{k:'hop',surf:{el:el,fx:rr(.2,.8),kind:'stand'}},P('stomp',1.8,{el:el}),SAY('stomp',nm,.8),P('idle',.6)];},el);
        c('shove',.2+s.mischief*.5,function(){var e=Math.random()<.5;return [{k:'hop',surf:{el:el,fx:e?.08:.92,kind:'stand'}},P('push',1.3,{el:el,dir:e?1:-1}),SAY('shove',nm,.8),P('idle',.5)];},el);
        if(r.width>W*1.4)c('slide',.25+s.mischief*.6,function(){var d=Math.random()<.5?1:-1;
          return [{k:'hop',surf:{el:el,fx:d>0?.12:.88,kind:'lie'}},P('slide',rr(1.6,2.6),{v:d*rr(.22,.4),dir:d}),SAY('slide',nm,.6),P('idle',.4)];},el);
      }
      if(r.bottom>vb.top+H*HAND+30&&r.bottom+H*(1-HAND)<vb.bottom+20)
        c('hang',.2+s.mischief*.55,function(){return [{k:'hop',surf:{el:el,fx:rr(.2,.8),kind:'hang'}},SAY('hang',nm,.8),P('hangSwing',rr(2.5,4.5)),{k:'hop',tx:clampX(pos.x),surf:null}];},el);
    });
    // stealing words off the page
    visible('.head h2 em, .pill, .price, .eyebrow, .chip, .tagnew, .demo span',function(r){return roomTop(r,FEET);}).forEach(function(el){
      var tx=el.textContent;
      c('steal',.3+s.mischief*.7+(el.classList.contains('price')?s.sell*.4:0),function(){
        var mid=Math.random()<.5?'tease':'juggle';
        return [{k:'hop',surf:{el:el,fx:.5,kind:'stand'}},{k:'grab',el:el},SAY('steal',tx),
          {k:'hop',tx:clampX(pos.x+rr(-220,220)),surf:null},P(mid,rr(2.2,3.4)),SAY(mid,tx,.7),
          {k:'walk',tx:clampX(rr(8,innerWidth-W))},P('idle',.6),{k:'release'}];},el);
    });
    // ground-pound any plain text on the page
    var texts=visible('.lede, .out, .cbody h3, .head p, .faq summary, .stp h3, .stp p, .cert-steps span, .perks div, .note, .disclaim, .task, .certline, .combo p',
      function(r){return roomTop(r,FEET)&&r.width<innerWidth*.95;}).filter(function(el){var n=el.textContent.trim().length;return el.children.length===0&&n>2&&n<140&&!el.__sc;});
    texts.sort(function(){return Math.random()-.5;}).slice(0,4).forEach(function(el){
      c('pound',.3+s.mischief*.7,function(){var r=el.getBoundingClientRect();
        return [{k:'hop',surf:{el:el,fx:rr(.2,.8),kind:'stand'}},P('pound',1.1,{el:el}),SAY('pound',null,.6),P('idle',.5)];},el);});
    var tlEl=document.getElementById('tl');
    if(tlEl){var tr=tlEl.getBoundingClientRect();if(tr.bottom>vb.top&&tr.top<vb.bottom&&roomTop(tr,FEET))
      c('edit',.35+s.mischief*.6+s.bored*.3,function(){var clips=[].slice.call(tlEl.querySelectorAll('.clip')),cl=pick(clips),
          r2=tlEl.getBoundingClientRect(),cr=cl.getBoundingClientRect(),f=Math.max(.06,Math.min(.94,(cr.left+cr.width/2-r2.left)/r2.width)),
          op=pick(['nudge','cut','trim','nudge','cut','play']);
        return [{k:'hop',surf:{el:tlEl,fx:f,kind:'stand'}},P('edit',.9),{k:'call',fn:function(){editClip(cl,op);}},P('edit',rr(.6,1.2)),SAY('edit',null,.6),P('idle',.5)];},tlEl);}
    // selling
    if(!mem.bought){
      if(mem.dwellEl&&performance.now()-mem.dwellT>1200){var de=mem.dwellEl,nm=label(de);
        c('pitch',1.2,function(){store.last=short(nm);save();var r=de.getBoundingClientRect();
          return [P('point',2.2,{dir:(r.left+r.width/2)>(pos.x+W/2)?1:-1}),SAY('course',nm)];},de);}
      visible('a.btn',function(r){return roomTop(r,FEET);}).filter(function(a){return /₹19|Start/.test(a.textContent);}).forEach(function(a){
        c('btn',.2+s.sell*.8,function(){return [{k:'hop',surf:{el:a,fx:.5,kind:'stand'}},P('pointDown',2.6),SAY('btn'),P('idle',.5),{k:'hop',tx:clampX(pos.x+rr(-120,120)),surf:null}];},a);});
      if(s.sell>.5)c('knock',s.sell*.9,function(){return [P('knock',1.8),SAY('knock')];});
      if(s.sell>.75)c('lunge',s.sell,function(){return [P('lunge',2.6),SAY('lunge')];});
    }
    var ov=document.getElementById('over');
    if(ov){var orr=ov.getBoundingClientRect();if(orr.top<vb.top+(vb.bottom-vb.top)*.6&&orr.bottom>vb.top+(vb.bottom-vb.top)*.3&&performance.now()-mem.overSeen>20000)
      c('facepalm',1.0,function(){mem.overSeen=performance.now();return [P('facepalm',2.2),SAY('over')];});}

    // choose with softmax so he's never fully predictable
    var sum=0;cands.forEach(function(k){k.w=Math.exp(k.u/.22);sum+=k.w;});
    var r=Math.random()*sum, ch=cands[0];for(var i=0;i<cands.length;i++){r-=cands[i].w;if(r<=0){ch=cands[i];break;}}
    remember(ch.v,ch.el);
    var steps=ch.b();
    if(/sit|stomp|shove|hang|steal/.test(ch.v)){need.mischief=Math.max(0,need.mischief-.45);}
    if(/pitch|btn|knock|lunge|watch|tapFoot/.test(ch.v)){need.sell=Math.max(0,need.sell-.35);}
    need.bored=Math.max(0,need.bored-.35);need.energy=Math.max(0,need.energy-.04);
    if(/nap/.test(ch.v))need.energy=1;
    plan=steps.concat([P(onSurf&&surf&&surf.kind==='sit'?'sitIdle':'idle',rr(.5,1.8))]);
  }
  setInterval(function(){if(box.hidden||document.hidden)return;
    need.bored=Math.min(1,need.bored+.04);need.mischief=Math.min(1,need.mischief+.035);need.curious=Math.min(1,need.curious+.02);
    if(!mem.bought)need.sell=Math.min(1,need.sell+.022);need.energy=Math.max(0,need.energy-.006);},1000);

  /* ================= PAGE MISCHIEF HELPERS ================= */
  function scatter(el,px,py){if(el.__sc)return;el.__sc=1;var orig=el.innerHTML,txt=el.textContent,parts=[];el.textContent='';
    Array.prototype.forEach.call(txt,function(ch){if(/\s/.test(ch)){el.appendChild(document.createTextNode(ch));return;}
      var s=document.createElement('span');s.className='lp-letter';s.textContent=ch;el.appendChild(s);parts.push({s:s});});
    parts.forEach(function(p){var r=p.s.getBoundingClientRect(),dx=r.left+r.width/2-px,dy=r.top+r.height/2-py,d=Math.max(25,Math.hypot(dx,dy)),f=Math.min(1,180/d);
      p.x=0;p.y=0;p.r=0;p.vx=dx/d*f*800*rr(.6,1.4);p.vy=-rr(250,650)*f;p.vr=rr(-900,900)*f;});
    var t0=performance.now(),lt=t0;
    (function step(now){var dt=Math.min(.04,(now-lt)/1000);lt=now;var age=(now-t0)/1000;
      parts.forEach(function(p){if(age<1.4){p.vy+=1700*dt;p.vx*=.985;p.x+=p.vx*dt;p.y+=p.vy*dt;p.r+=p.vr*dt;if(p.y>30&&p.vy>0){p.y=30;p.vy*=-.4;p.vx*=.7;p.vr*=.6;}}
        else{var k=1-Math.exp(-dt*7);p.x-=p.x*k;p.y-=p.y*k;p.r-=p.r*k;}
        p.s.style.transform='translate('+p.x.toFixed(1)+'px,'+p.y.toFixed(1)+'px) rotate('+p.r.toFixed(0)+'deg)';});
      if(age<2.8)requestAnimationFrame(step);else{el.innerHTML=orig;el.__sc=0;}})(t0);}
  function editClip(cl,op){if(!cl)return;var lane=cl.parentNode,L0=parseFloat(cl.style.left)||0,Wd=parseFloat(cl.style.width)||10;
    cl.style.transition='left .5s cubic-bezier(.3,1.5,.5,1), width .5s cubic-bezier(.3,1.5,.5,1)';
    if(op==='nudge'){cl.style.left=Math.max(0,Math.min(100-Wd,L0+(Math.random()<.5?-1:1)*rr(4,12)))+'%';fx(cl,'lp-cut',450);}
    else if(op==='trim'){cl.style.width=Math.max(4,Wd*rr(.5,.75))+'%';fx(cl,'lp-cut',450);}
    else if(op==='cut'&&lane.children.length<7&&Wd>8){var w1=Wd*rr(.35,.65),c2=cl.cloneNode(true);cl.style.width=w1+'%';
      c2.style.transition='none';c2.style.left=(L0+w1+.6)+'%';c2.style.width=(Wd-w1-.6)+'%';lane.appendChild(c2);fx(cl,'lp-cut',450);fx(c2,'lp-cut',450);}
    else{var pb=document.getElementById('play');if(pb)pb.click();}}

  /* ================= STEP RUNNER ================= */
  var curPose='idle', curOpt={}, poseT=0, hop=null;
  function begin(st){
    if(st.k==='call'){st.fn();return true;}
    if(st.k==='grab'){var el=st.el;carry={el:el,label:el.textContent,disp:el.style.display,tr:el.style.transition,tx:0,ty:0};
      if(getComputedStyle(el).display==='inline')el.style.display='inline-block';el.style.transition='none';el.classList.add('stolen');return true;}
    if(st.k==='release'){releaseCarry();return true;}
    if(st.k==='pose'){curPose=st.p;curOpt=st.o||{};poseT=0;
      if(st.p==='stomp'&&curOpt.el)fx(curOpt.el,'lp-squish',900);
      if(st.p==='push'&&curOpt.el){var pe=curOpt.el;pe.style.setProperty('--sx',(curOpt.dir*22)+'px');setTimeout(function(){fx(pe,'lp-shove',800);},350);}
      if(st.p==='knock'){setTimeout(shake,300);setTimeout(shake,750);}
      if(st.p==='lunge')setTimeout(shake,700);
      if(st.p==='slide'&&surf)surf.slide=curOpt.v;
      if(st.p==='pound'&&curOpt.el){var pel=curOpt.el;setTimeout(function(){var r=pel.getBoundingClientRect();
        scatter(pel,pos.x+W/2,r.top+4);impact=1;shake();},300);}
      return false;}
    if(st.k==='walk'){st.tx=clampX(st.tx);return false;}
    if(st.k==='hop'){hop={st:st,phase:'crouch',t:0};return false;}
    return true;
  }
  function update(st,dt){
    if(st.k==='pose'){poseT+=dt;if(poseT>=st.d){if(st.p==='slide'&&surf)surf.slide=0;return true;}return false;}
    if(st.k==='walk'){var dx=st.tx-pos.x, sp=small?115:150;if(Math.abs(dx)<3){curPose='idle';return true;}
      facing=dx>0?1:-1;pos.x+=Math.sign(dx)*Math.min(Math.abs(dx),sp*dt);curPose='walk';curOpt={sp:sp};return false;}
    if(st.k==='hop'){
      hop.t+=dt;
      if(hop.phase==='crouch'){curPose='crouch';if(hop.t>.17){
        var tgt=st.surf?surfPos(st.surf):{x:st.tx!=null?st.tx:pos.x,y:groundY()};
        var dx=tgt.x-pos.x, dy=tgt.y-pos.y, D=Math.max(.45,Math.min(1.0,Math.hypot(dx,dy)/700+.35)), g=2400;
        hop.phase='air';hop.t=0;hop.D=D;hop.x0=pos.x;hop.y0=pos.y;hop.vx=dx/D;hop.vy=(dy-.5*g*D*D)/D;hop.g=g;facing=dx>=0?1:-1;}
        return false;}
      if(hop.phase==='air'){curPose=st.fall?'flail':'air';
        var k=Math.min(1,hop.t/hop.D), live=st.surf?surfPos(st.surf):{x:st.tx!=null?st.tx:hop.x0+hop.vx*hop.D,y:groundY()};
        var bx2=hop.x0+hop.vx*hop.t, by=hop.y0+hop.vy*hop.t+.5*hop.g*hop.t*hop.t;
        var endX=hop.x0+hop.vx*hop.D, endY=hop.y0+hop.vy*hop.D+.5*hop.g*hop.D*hop.D;
        pos.x=bx2+(live.x-endX)*k*k;pos.y=by+(live.y-endY)*k*k;     // home in on a target that may have scrolled
        if(k>=1){impact=Math.min(1,.5+Math.abs(hop.vy+hop.g*hop.D)/2600);surf=st.surf||null;hop.phase='land';hop.t=0;}
        return false;}
      if(hop.phase==='land'){curPose=st.fall?'flat':'crouch';return hop.t>.16;}
    }
    return true;
  }

  /* ================= SENSES ================= */
  var lastY=scrollY,lastT=performance.now(),maxY=0,lastFall=0,look={x:0,y:0},lookT={x:0,y:0},nextGlance=0,blinkIn=2.5;
  addEventListener('mousemove',function(e){mem.lastCursor=performance.now();mem.cursorX=e.clientX;
    var cx=pos.x+W/2,cy=pos.y+H*.25;lookT.x=Math.max(-1,Math.min(1,(e.clientX-cx)/450));lookT.y=Math.max(-1,Math.min(1,(e.clientY-cy)/450));},{passive:true});
  addEventListener('scroll',function(){
    var now=performance.now(),dy=scrollY-lastY,dtm=Math.max(1,now-lastT);lastY=scrollY;lastT=now;maxY=Math.max(maxY,scrollY);mem.lastScroll=now;
    if(intro)return;
    if(Math.abs(dy)/dtm>5&&now-lastFall>3000){lastFall=now;
      if(surf&&!hop)fallOff();else if(!surf&&!hop){plan=[P('flat',1.2),P('getup',.5)];talk('fall',null,.5);}}
    lookT.y=Math.max(-1,Math.min(1,dy/40));
    if(maxY>1500&&scrollY<150&&!mem.bought)mem.exit=true;
  },{passive:true});
  vbHook=function(dy,dtm){var now=performance.now();mem.lastScroll=now;if(intro)return;
    if(Math.abs(dy)/dtm>5&&now-lastFall>3000){lastFall=now;
      if(surf&&!hop)fallOff();else if(!surf&&!hop){plan=[P('flat',1.2),P('getup',.5)];talk('fall',null,.5);}}
    lookT.y=Math.max(-1,Math.min(1,dy/40));};
  document.addEventListener('mouseout',function(e){if(!e.relatedTarget&&e.clientY<=0&&!mem.bought)mem.exit=true;});
  document.querySelectorAll('.course').forEach(function(c){
    c.addEventListener('mouseenter',function(){mem.dwellEl=c;mem.dwellT=performance.now();need.sell=Math.min(1,need.sell+.15);});
    c.addEventListener('mouseleave',function(){if(mem.dwellEl===c)mem.dwellEl=null;});});
  document.querySelectorAll('a.btn').forEach(function(a){a.addEventListener('click',function(){
    mem.bought=true;need.sell=0;store.clicked=1;save();releaseCarry(true);plan=[P('dance',3.2)];say(line('yay'));});});
  hit.addEventListener('click',function(){if(hop)return;plan.unshift(P(surf?(surf.kind==='hang'?'hangSwing':'laughSit'):'laugh',1.3));talk('poke',null,.5);});
  addEventListener('resize',function(){if(!surf&&!hop){pos.x=clampX(pos.x);pos.y=groundY();}});

  /* ================= POSES ================= */
  function holdUp(T){T.shLz=2.75;T.shRz=-2.75;T.elL=T.elR=-.25;}
  function sitPose(T,swing){T.hipsY=-.47;T.hpL=T.hpR=-1.45;T.knL=1.45+(swing?Math.sin(t*3)*.35:0);T.knR=1.45+(swing?Math.sin(t*3+1.6)*.35:0);T.shLx=T.shRx=-.3;T.elL=T.elR=-.8;}
  function pose(T,p,s,o){var m='smile',b='';
    var sh=Math.sin(t*.55);
    switch(p){
      case 'idle':T.hipsZ=sh*.05;T.hipsY=-.02*Math.abs(sh);T.knL=Math.max(0,sh)*.18;T.knR=Math.max(0,-sh)*.18;T.cZ=-sh*.04;
        T.hY=look.x*.5;T.hX=look.y*.25;break;
      case 'walk':var w=Math.sin(walkPh);T.hpL=w*.6;T.hpR=-w*.6;T.knL=Math.max(0,w)*1.0;T.knR=Math.max(0,-w)*1.0;
        T.ftL=-Math.max(0,-w)*.3;T.ftR=-Math.max(0,w)*.3;T.shLx=-w*.55;T.shRx=w*.55;T.elL=T.elR=-.35-Math.abs(w)*.15;
        T.lift=Math.abs(Math.cos(walkPh))*.06;T.hipsZ=w*.05;T.hipsYaw=w*.12;T.hX=.04*Math.cos(walkPh*2);T.yaw=facing*.85;break;
      case 'crouch':T.hipsY=-.18;T.hpL=T.hpR=-.55;T.knL=T.knR=1.0;T.ftL=T.ftR=-.4;T.shLx=T.shRx=.7;T.cX=.25;T.yaw=facing*.4;if(carry)holdUp(T);m='open';break;
      case 'air':T.hpL=-.9;T.hpR=-.3;T.knL=1.2;T.knR=.7;T.shLz=2.3;T.shRz=-2.3;T.yaw=facing*.5;if(carry)holdUp(T);m='open';b='up';break;
      case 'flail':T.shLz=1.6+Math.sin(t*22)*.6;T.shRz=-1.6-Math.cos(t*22)*.6;T.hpL=Math.sin(t*18)*.6;T.hpR=-Math.sin(t*18)*.6;m='open';b='up';break;
      case 'flat':T.fall=-1.45;T.shLz=1.4;T.shRz=-1.4;T.hX=-.2;m='open';b='sad';break;
      case 'getup':T.hipsY=-.25;T.knL=T.knR=.9;T.hpL=T.hpR=-.8;T.cX=.5;T.shLx=T.shRx=-.4;m='flat';break;
      case 'lookAround':T.hY=Math.sin(s*1.7)*.75;T.hX=-.12;T.hipsZ=sh*.04;break;
      case 'scratch':T.shRx=-2.4;T.shRz=-.9;T.elR=-2.1;T.elRz=Math.sin(t*16)*.12;T.hZ=.15;m='flat';b='sad';break;
      case 'glasses':T.shRx=-1.9;T.shRz=.2;T.elR=-2.35;T.hX=.06;T.lift=0;break;
      case 'watch':T.shLx=-1.25;T.shLz=-.25;T.elL=-1.5;T.hX=.4;T.hY=.3;m='flat';b=need.sell>.5?'angry':'';break;
      case 'stretch':T.shLz=2.9;T.shRz=-2.9;T.elL=T.elR=-.2;T.hipsZ=Math.sin(s*2)*.12;T.cZ=Math.sin(s*2)*.1;T.hX=-.2;m='open';break;
      case 'yawn':T.shLz=2.6;T.shRz=-2.6;T.elL=T.elR=-1.2;T.hX=-.35;m='open';break;
      case 'tapFoot':T.shLx=T.shRx=-.6;T.shLz=.45;T.shRz=-.45;T.elL=T.elR=-1.95;T.hpR=-.12;T.ftR=-Math.abs(Math.sin(s*9))*.45;m='flat';b='angry';break;
      case 'wave':T.shRz=-2.6;T.elR=-.2;T.elRz=Math.sin(t*14)*.5;T.hZ=-.08;break;
      case 'point':T.hY=.45*o.dir;T.yaw=.3*o.dir;if(o.dir>0){T.shLz=1.45;T.elL=0;}else{T.shRz=-1.45;T.elR=0;}break;
      case 'pointDown':T.shRx=-.7;T.shRz=-.3;T.elR=0;T.hX=.35+Math.sin(t*3)*.05;T.shLz=.6;T.elL=-2.0;m='open';b='up';break;
      case 'laugh':T.hX=-.35+Math.sin(t*30)*.05;T.shLx=T.shRx=-.6;T.elL=T.elR=-1.5;T.hipsZ=Math.sin(t*28)*.06;m='open';b='up';break;
      case 'laughSit':sitPose(T,false);T.hX=-.35+Math.sin(t*30)*.05;T.cX=-.15;m='open';b='up';break;
      case 'facepalm':T.shRx=-2.3;T.shRz=.25;T.elR=-2.0;T.hX=.35;T.cX=.12;m='flat';b='sad';break;
      case 'dance':T.lift=Math.abs(Math.sin(t*8))*.12;T.hipsZ=Math.sin(t*8)*.15;T.shLz=2.2+Math.sin(t*8)*.6;T.shRz=-(2.2+Math.cos(t*8)*.6);T.yaw=Math.sin(t*4)*.5;T.knL=Math.max(0,Math.sin(t*8))*.5;T.knR=Math.max(0,-Math.sin(t*8))*.5;m='open';b='up';break;
      case 'knock':T.z=1.2;T.shRx=-1.55;T.shRz=-.1;T.elR=-.4-Math.abs(Math.sin(t*16))*.6;T.cX=.1;m='flat';b='angry';break;
      case 'lunge':var q=s<.5?s/.5:s<2?1:Math.max(0,1-(s-2)/.6);T.z=3.0*q;T.lift=.2*q;T.shRx=-1.9;T.elR=-1.4;T.shRz=-.3+Math.sin(t*22)*.15;T.shLz=.9;T.elL=-1.6;T.cX=.2*q;m='grr';b='angry';break;
      case 'panic':T.z=s<1.6?1.8:0;T.shLx=T.shRx=-1.5;T.shLz=.3+Math.sin(t*18)*.3;T.shRz=-.3-Math.sin(t*18)*.3;T.elL=T.elR=-.3;m='open';b='sad';break;
      case 'tease':holdUp(T);T.hipsZ=Math.sin(t*7)*.12;T.lift=Math.abs(Math.sin(t*7))*.1;T.yaw=Math.sin(t*3.5)*.4;m='open';b='up';break;
      case 'juggle':holdUp(T);T.elL=T.elR=-.25-Math.abs(Math.sin(t*6))*.4;T.hX=-.3;m='open';b='up';break;
      case 'stomp':var st=Math.floor(s/.3)%2;T.hpL=st?-1.0:0;T.knL=st?1.3:0;T.hpR=st?0:-1.0;T.knR=st?0:1.3;T.shLz=.8;T.shRz=-.8;T.lift=.04;m='open';b='angry';break;
      case 'push':T.yaw=o.dir*1.25;T.cX=.35;T.shLx=T.shRx=-1.5;T.elL=T.elR=-.1;T.hpL=-.3;T.knL=.4;T.hpR=.35;T.knR=.1;m='grr';b='angry';break;
      case 'sitIdle':sitPose(T,true);T.shLx=T.shRx=.45;T.elL=T.elR=-.1;T.cX=-.08;T.hY=look.x*.5;T.hX=look.y*.25;break;
      case 'floorSit':case 'sleep':
        if(p==='floorSit'||o.floor){T.hipsY=-.82;T.hpL=T.hpR=-1.5;T.knL=T.knR=.15;T.shLx=T.shRx=.5;T.elL=T.elR=0;}else sitPose(T,false);
        if(p==='sleep'){T.hX=.5+Math.sin(t*1.4)*.04;T.cX=.15;m='flat';}break;
      case 'slide':T.rz=-o.dir*1.5;T.px=-o.dir*1.3;T.lift=.34;holdUp(T);T.knL=.35;T.knR=.1;T.hY=o.dir*.25;T.hX=-.1;m='open';b='up';break;
      case 'pound':if(s<.3){T.lift=.55*Math.sin(s/.3*Math.PI/2);holdUp(T);T.knL=T.knR=.7;T.hpL=T.hpR=-.5;m='open';b='angry';}
        else{T.hipsY=-.2;T.knL=T.knR=.9;T.hpL=T.hpR=-.6;T.shLx=T.shRx=-1.25;T.elL=T.elR=-.15;T.cX=.3;m='grr';b='angry';}break;
      case 'edit':T.hipsY=-.18;T.hpL=T.hpR=-.5;T.knL=T.knR=.85;T.cX=.55;T.hX=.35;T.shLx=-.9;T.shRx=-1.0;T.elL=-.4;T.elR=-.3-Math.abs(Math.sin(t*12))*.4;m='smile';b='';break;
      case 'hangSwing':holdUp(T);T.shLz=2.95;T.shRz=-2.95;T.elL=T.elR=0;var sw=Math.sin(t*2.6);T.hipsZ=sw*.12;T.cZ=sw*.08;
        T.hpL=sw*.35-.1;T.hpR=-sw*.35-.1;T.knL=.4+Math.max(0,sw)*.4;T.knR=.4+Math.max(0,-sw)*.4;T.hX=-.15;m='open';break;
    }
    if(carry&&!/tease|juggle|hangSwing/.test(p))holdUp(T);
    if(!/knock|lunge|stomp|push|tapFoot|watch|over/.test(p)&&need.sell>.75&&!mem.bought&&!/open/.test(m))b='angry';
    return {m:m,b:b};
  }

  /* ================= MAIN LOOP ================= */
  var last=performance.now(), walkPh=0;
  pos.x=-W;pos.y=groundY();
  plan=[{k:'walk',tx:30},{k:'call',fn:function(){intro=false;
    say(store.visits>1&&store.last?line('back',store.last):store.visits>1?'You came back! I knew it 😎':line('greet'),3000);}},P('wave',2.2)];
  // the walk-in may start off-screen, so clamp only after the intro
  function frame(now){
    requestAnimationFrame(frame);
    var dt=Math.min(.04,(now-last)/1000);last=now;
    if(box.hidden||document.hidden)return;
    t+=dt;

    if(mem.exit&&!intro&&!hop){mem.exit=false;need.sell=1;surf=null;releaseCarry(true);
      plan=[{k:'hop',tx:clampX(pos.x),surf:null},P('panic',2.2)];shake();say(line('panic'));}

    if(!plan.length&&!intro)decide();
    var st=plan[0];
    if(st){if(!st.started){st.started=1;if(begin(st)){plan.shift();st=null;}}
      if(st&&update(st,dt))plan.shift();}

    // where is he on screen?
    if(!hop||hop.phase!=='air'){
      if(surf){if(!surfOk(surf)&&!hop)fallOff();else{var sp=surfPos(surf);pos.x=sp.x;pos.y=sp.y;}}
      else if(!(st&&st.k==='walk'&&intro)){pos.y=groundY();if(!intro)pos.x=clampX(pos.x);}
    }
    if(hop&&hop.phase==='land'&&!(plan[0]&&plan[0].k==='hop'))hop=null;
    if(hop&&plan[0]&&plan[0].k!=='hop')hop=null;
    if(surf&&surf.slide)surf.fx=Math.max(.08,Math.min(.92,surf.fx+surf.slide*dt));

    // momentum: velocity, acceleration, lean and bouncy hair
    var nvx=(pos.x-prev.x)/dt, nvy=(pos.y-prev.y)/dt;prev.x=pos.x;prev.y=pos.y;
    acc.x+=(((nvx-vel.x)/dt)-acc.x)*.25;acc.y+=(((nvy-vel.y)/dt)-acc.y)*.25;vel.x+=(nvx-vel.x)*.3;vel.y+=(nvy-vel.y)*.3;
    var lt=Math.max(-.22,Math.min(.22,-vel.x*.0007));lean.v+=((lt-lean.x)*90-lean.v*12)*dt;lean.x+=lean.v*dt;
    var hz=Math.max(-.4,Math.min(.4,acc.x*.00009+vel.x*.0003)), hxx=Math.max(-.35,Math.min(.35,-acc.y*.00008));
    hair.vz+=((hz-hair.z)*55-hair.vz*5)*dt;hair.z+=hair.vz*dt;hair.vx+=((hxx-hair.x)*55-hair.vx*5)*dt;hair.x+=hair.vx*dt;
    hair.vz+=-JV.hY*.02;hair.vx+=JV.lift*.6*dt;
    impact*=Math.exp(-dt*9);

    if(curPose==='walk')walkPh+=dt*2*Math.PI*(curOpt.sp||150)/110;
    look.x+=(lookT.x-look.x)*Math.min(1,dt*5);look.y+=(lookT.y-look.y)*Math.min(1,dt*5);
    if(now-mem.lastCursor>2500&&now>nextGlance){lookT.x=rr(-.8,.8);lookT.y=rr(-.4,.4);nextGlance=now+rr(1200,3600);}

    var T=base();
    T.hipsY+=Math.sin(t*2.2)*.008;           // breathing
    var fe=pose(T,curPose,poseT,curOpt);
    springAll(T,dt);
    torso.scale.y=1+Math.sin(t*2.2)*.015;
    face(fe.m,fe.b);
    eyes.forEach(function(e,i){e.position.x=(i?-.13:.13)+look.x*.02;e.position.y=.36-look.y*.015;});
    blinkIn-=dt;var closed=curPose==='sleep'||blinkIn<0;if(blinkIn<-.12)blinkIn=rr(2,5);
    eyeG.scale.y=closed?.12:1;eyeG.position.y=closed?.32:0;

    if(carry){var cr=carry.el.getBoundingClientRect(),cx=cr.left+cr.width/2-carry.tx,cy=cr.top+cr.height/2-carry.ty;
      var bob=curPose==='juggle'?-Math.abs(Math.sin(t*6))*46:0;
      carry.tx=pos.x+W/2-cx;carry.ty=pos.y+H*HAND+bob-cy;
      carry.el.style.transform='translate('+carry.tx+'px,'+carry.ty+'px) rotate('+(Math.sin(t*6)*6+(curPose==='juggle'?t*240%360:0))+'deg)';}

    apply();place();
    renderer.render(scene,cam);
  }
  face('smile','');apply();place();requestAnimationFrame(frame);
})();
