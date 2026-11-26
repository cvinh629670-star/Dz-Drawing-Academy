import {heading,$,download} from './ui.js';
const intersect=(a,b,c,d)=>{
  const ux=b.x-a.x,uy=b.y-a.y,vx=d.x-c.x,vy=d.y-c.y;
  const det=ux*vy-uy*vx;
  if(Math.abs(det)<.0001)return null;
  const t=((c.x-a.x)*vy-(c.y-a.y)*vx)/det;
  return {x:a.x+t*ux,y:a.y+t*uy};
};
const mix=(a,b,t)=>({x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t});
export function perspective(root){
  root.innerHTML=heading('Phòng phối cảnh','Kéo điểm tụ hoặc vẽ trực tiếp trên lưới hình học.')+
    '<section class="panel"><div class="toolbar"><select id="points" aria-label="Số điểm tụ"><option>1</option><option selected>2</option><option>3</option></select><label>Chân trời <input type="range" id="horizon" min="40" max="435" value="185"></label><label>Mật độ <input type="range" id="density" min="3" max="24" value="10"></label><label><input type="checkbox" id="show-grid" checked> Lưới</label><label><input type="checkbox" id="box" checked> Khối mẫu</label><button id="clear-ink">Xóa nét</button><button id="save-grid">Xuất PNG</button></div><div class="canvas-wrap"><canvas aria-label="Lưới phối cảnh" width="900" height="500" style="height:auto;aspect-ratio:9/5"></canvas></div></section>';
  const q=s=>$(s,root),canvas=q('canvas'),g=canvas.getContext('2d');
  const vp=[{x:143,y:185},{x:760,y:185},{x:480,y:34}],single={x:454,y:185};
  let active=null,stroke=null;
  const strokes=[];
  const line=(a,b)=>{if(a&&b){g.moveTo(a.x,a.y);g.lineTo(b.x,b.y);}};
  function draw(){
    const n=Number(q('#points').value),y=Number(q('#horizon').value),density=Number(q('#density').value);
    vp[0].y=vp[1].y=single.y=y;
    const centers=n===1?[single]:vp.slice(0,n);
    g.fillStyle='#fff8e9';g.fillRect(0,0,900,500);
    if(q('#show-grid').checked){
      g.strokeStyle='#748e7770';g.lineWidth=1;g.beginPath();
      line({x:0,y},{x:900,y});
      for(const p of centers)for(let i=0;i<=density;i++){
        line(p,{x:i*900/density,y:0});line(p,{x:i*900/density,y:500});
      }
      g.stroke();
    }
    if(q('#box').checked){
      g.strokeStyle='#354d3b';g.lineWidth=3;g.beginPath();
      if(n===1){
        const f=[{x:307,y:205},{x:465,y:205},{x:465,y:361},{x:307,y:361}],b=f.map(p=>mix(p,single,.47));
        f.forEach((p,i)=>{line(p,f[(i+1)%4]);line(b[i],b[(i+1)%4]);line(p,b[i]);});
      }else{
        const t={x:450,y:218},b=n===3?mix(t,vp[2],-.75):{x:450,y:355};
        const l=mix(t,vp[0],.36),r=mix(t,vp[1],.37);
        const vertical=p=>n===3?vp[2]:{x:p.x,y:p.y+1};
        const lb=intersect(l,vertical(l),b,vp[0]),rb=intersect(r,vertical(r),b,vp[1]);
        const top=intersect(l,vp[1],r,vp[0]);
        line(t,b);line(t,l);line(t,r);line(l,lb);line(r,rb);line(b,lb);line(b,rb);line(l,top);line(r,top);
      }
      g.stroke();
    }
    g.strokeStyle='#8e4936';g.fillStyle='#8e4936';g.lineWidth=3;g.lineCap='round';g.beginPath();
    for(const s of strokes){line(s[0],{x:s[0].x+.05,y:s[0].y});for(let i=1;i<s.length;i++)line(s[i-1],s[i]);}g.stroke();
    centers.forEach((p,i)=>{g.beginPath();g.arc(p.x,p.y,8,0,Math.PI*2);g.fill();g.font='16px sans-serif';g.fillText('VP '+(i+1),p.x+11,p.y-9);});
  }
  const point=e=>{const box=canvas.getBoundingClientRect();return {x:(e.clientX-box.left)*900/box.width,y:(e.clientY-box.top)*500/box.height};};
  canvas.onpointerdown=e=>{
    if(active||stroke)return;
    const p=point(e),n=Number(q('#points').value);
    active=(n===1?[single]:vp.slice(0,n)).find(v=>Math.hypot(p.x-v.x,p.y-v.y)<21);
    if(!active){stroke=[p];strokes.push(stroke);}
    canvas.setPointerCapture(e.pointerId);draw();
  };
  canvas.onpointermove=e=>{
    const p=point(e);
    if(active){active.x=Math.max(12,Math.min(888,p.x));if(active===vp[2])active.y=Math.max(12,Math.min(488,p.y));}
    else if(stroke)stroke.push(p);
    else return;
    draw();
  };
  canvas.onpointerup=canvas.onpointercancel=()=>{active=stroke=null;};
  for(const input of root.querySelectorAll('input,select'))input.oninput=draw;
  q('#clear-ink').onclick=()=>{strokes.length=0;draw();};
  q('#save-grid').onclick=()=>canvas.toBlob(blob=>download(blob,'phoi-canh.png','image/png'));
  draw();
}
