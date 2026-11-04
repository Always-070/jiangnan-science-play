import { COPY, ENGLISH_ITEMS, initialLocale, applyStaticCopy } from './i18n.js';

  (()=>{
    const SIZE=4,GOAL=2048,KEY='7dhc-2048-offline-v1';
    let locale; try { locale=initialLocale(localStorage); } catch { locale='en'; }
    const copy=()=>COPY[locale];
    function localizedItem(x){if(locale==='zh-CN')return x;const entry=ENGLISH_ITEMS[Math.log2(x.value)-1];return {...x,name:entry[0],step:entry[1]}}
    const ITEMS=[
      [2,'Acetyl-CoA','乙酰辅酶A','起始碳源'],[4,'Acetoacetyl-CoA','乙酰乙酰辅酶A','C₂ 单元缩合'],[8,'HMG-CoA','3-羟基-3-甲基戊二酰辅酶A','甲羟戊酸前体'],[16,'Mevalonate','甲羟戊酸','进入 MVA 途径'],[32,'IPP','异戊烯焦磷酸','活化 C₅ 单元'],[64,'DMAPP','二甲基烯丙基焦磷酸','C₅ 同分异构体'],[128,'GPP','香叶基焦磷酸','形成 C₁₀ 骨架'],[256,'FPP','法呢基焦磷酸','形成 C₁₅ 骨架'],[512,'Squalene','角鲨烯','构建 C₃₀ 长链'],[1024,'Lanosterol','羊毛甾醇','甾体环系成形'],[2048,'7-DHC','7-脱氢胆固醇','目标产物']
    ].map(([value,short,name,step])=>({value,short,name,step}));
    const byValue=new Map(ITEMS.map(x=>[x.value,x]));
    let board=[],score=0,best=0,moves=0,status='playing',hasWon=false,spawned=5,merged=[];
    const $=id=>document.getElementById(id),fmt=n=>new Intl.NumberFormat(locale).format(n);
    function itemFor(value){if(value<=GOAL)return localizedItem(byValue.get(value)||ITEMS[0]);const n=value/GOAL;return{value,short:`7-DHC ×${n}`,name:copy().higher,step:copy().higherStep(n)}}
    function starter(){const b=Array(16).fill(0);b[5]=2;b[10]=2;return b}
    function canMove(b){if(b.includes(0))return true;for(let r=0;r<4;r++)for(let c=0;c<4;c++){const i=r*4+c;if(c<3&&b[i]===b[i+1])return true;if(r<3&&b[i]===b[i+4])return true}return false}
    function indices(dir,line){const f=Array.from({length:4},(_,p)=>(dir==='left'||dir==='right')?line*4+p:p*4+line);return(dir==='right'||dir==='down')?f.reverse():f}
    function processLine(vals){const c=vals.filter(Boolean),out=[],at=[];let gained=0;for(let i=0;i<c.length;i++){if(c[i]===c[i+1]){const v=c[i]*2;out.push(v);at.push(out.length-1);gained+=v;i++}else out.push(c[i])}while(out.length<4)out.push(0);return{out,at,gained}}
    function save(){try{localStorage.setItem(KEY,JSON.stringify({board,score,best,moves,hasWon}))}catch(e){}}
    function load(){try{const s=JSON.parse(localStorage.getItem(KEY)||'null');if(s&&Array.isArray(s.board)&&s.board.length===16){board=s.board;score=s.score||0;best=Math.max(s.best||0,score);moves=s.moves||0;hasWon=!!s.hasWon;status=canMove(board)?'playing':'over';return}}catch(e){}board=starter()}
    function render(){
      $('score').textContent=fmt(score);$('best').textContent=fmt(best);$('moves').textContent=moves;
      const high=Math.max(...board,2),hi=itemFor(high),stage=Math.min(10,Math.max(0,Math.log2(high)-1)),progress=Math.round(stage/10*100),yieldCount=board.reduce((a,v)=>a+(v>=GOAL?v/GOAL:0),0);
      $('highest').textContent=hi.short;$('progressBar').style.width=progress+'%';$('progressText').textContent=copy().progress(progress);$('pathCount').textContent=(stage+1)+' / 11';$('goalText').textContent=hasWon?copy().yield(Math.max(1,yieldCount)):copy().goal;
      $('board').innerHTML=board.map((v,i)=>{if(!v)return`<div class="cell" role="gridcell" aria-label="${copy().empty}"></div>`;const x=itemFor(v),level=Math.min(11,Math.log2(v));return`<div class="cell" role="gridcell" aria-label="${x.name}, ${copy().value} ${v}"><div class="tile l${level}${spawned===i?' new':''}${merged.includes(i)?' merged':''}"><span class="value">${v}</span><strong>${x.short}</strong><small>${x.name}</small></div></div>`}).join('');
      $('pathList').innerHTML=ITEMS.map(localizedItem).map((x,i)=>`<div class="step${i<=stage?' unlocked':''}${i===stage?' current':''}"><span class="dot">${String(i+1).padStart(2,'0')}</span><div class="step-copy"><strong>${x.name}</strong><span>${x.short} · ${x.step}</span></div><b>${x.value}</b></div>`).join('');
      const modal=$('modal');modal.classList.toggle('show',status!=='playing');$('continueBtn').style.display=status==='won'?'inline-block':'none';
      if(status==='won'){$('modalEyebrow').textContent=copy().wonEyebrow;$('modalTitle').textContent=copy().wonTitle;$('modalBody').textContent=copy().wonBody}
      if(status==='over'){$('modalEyebrow').textContent=copy().overEyebrow;$('modalTitle').textContent=copy().overTitle;$('modalBody').textContent=copy().overBody(hi.name)}
    }
    function move(dir){if(status!=='playing')return;const next=[...board],mergeCells=[];let gained=0;for(let line=0;line<4;line++){const ix=indices(dir,line),p=processLine(ix.map(i=>board[i]));p.out.forEach((v,j)=>next[ix[j]]=v);p.at.forEach(j=>mergeCells.push(ix[j]));gained+=p.gained}if(next.every((v,i)=>v===board[i]))return;const empty=next.map((v,i)=>v? -1:i).filter(i=>i>=0);let ni=null;if(empty.length){ni=empty[Math.floor(Math.random()*empty.length)];next[ni]=2}board=next;score+=gained;best=Math.max(best,score);moves++;spawned=ni;merged=mergeCells;const goal=board.some(v=>v>=GOAL);if(goal&&!hasWon){hasWon=true;status='won'}else if(!canMove(board))status='over';save();render()}
    function reset(){board=starter();score=0;moves=0;status='playing';hasWon=false;spawned=10;merged=[];save();render()}
    document.querySelectorAll('[data-dir]').forEach(b=>b.addEventListener('click',()=>move(b.dataset.dir)));$('resetBtn').addEventListener('click',reset);$('newModalBtn').addEventListener('click',reset);$('continueBtn').addEventListener('click',()=>{status=canMove(board)?'playing':'over';render()});
    addEventListener('keydown',e=>{const map={ArrowLeft:'left',a:'left',A:'left',ArrowRight:'right',d:'right',D:'right',ArrowUp:'up',w:'up',W:'up',ArrowDown:'down',s:'down',S:'down'},d=map[e.key];if(d){e.preventDefault();move(d)}} ,{passive:false});
    let start=null;const area=$('swipeArea');area.addEventListener('pointerdown',e=>{if(status!=='playing'||e.target.closest('button'))return;start={x:e.clientX,y:e.clientY};area.setPointerCapture(e.pointerId)});area.addEventListener('pointerup',e=>{if(!start)return;const dx=e.clientX-start.x,dy=e.clientY-start.y;start=null;if(Math.max(Math.abs(dx),Math.abs(dy))<28)return;move(Math.abs(dx)>Math.abs(dy)?(dx>0?'right':'left'):(dy>0?'down':'up'))});area.addEventListener('pointercancel',()=>start=null);
    document.querySelectorAll('[data-language]').forEach(button=>button.addEventListener('click',()=>{
      locale=button.dataset.language;
      try{localStorage.setItem('7dhc-2048-language',locale)}catch{}
      applyStaticCopy(locale);render();
    }));
    load();applyStaticCopy(locale);render();
  })();
