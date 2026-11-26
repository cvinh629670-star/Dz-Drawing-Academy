import {heading,$,notify,esc} from './ui.js';
export function color(root,ctx){
  root.innerHTML=heading('Xưởng màu & ánh sáng','Tạo bảng màu, nghiên cứu sắc độ và thử hướng chiếu sáng.')+
    '<div class="split"><section class="panel stack"><h2>Bảng màu</h2><div class="toolbar"><input type="color" id="base" value="#789b87" aria-label="Màu cơ sở"><select id="harmony" aria-label="Quy tắc phối màu"><option value="complement">Bổ túc</option><option value="similar">Tương đồng</option><option value="triad">Bộ ba</option></select><button id="palette-save">Lưu bảng màu</button></div><canvas id="wheel" width="220" height="220" aria-label="Vòng màu"></canvas><div class="gallery" id="swatches"></div><div class="list" id="saved-palettes"></div></section>'+
    '<div class="stack"><section class="panel"><h2>Mô phỏng ánh sáng</h2><p class="muted">Minh họa giản lược bằng độ sáng theo pháp tuyến bề mặt.</p><label class="field">Hướng nguồn sáng<input type="range" id="light-angle" min="0" max="359" value="225"></label><canvas class="media" id="lighting" width="400" height="190" aria-label="Ánh sáng trên cầu và khối lập phương"></canvas></section><section class="panel"><h2>Phân tích sắc độ</h2><label class="field">Chọn ảnh<input id="gray-image" type="file" accept="image/*"></label><canvas id="gray" class="media" width="1" height="1" hidden></canvas><p id="values"></p></section></div></div>';
  const q=s=>$(s,root),wheel=q('#wheel'),g=wheel.getContext('2d');
  for(let i=0;i<360;i++){
    g.beginPath();g.moveTo(110,110);g.arc(110,110,106,i*Math.PI/180,(i+1.4)*Math.PI/180);
    g.fillStyle='hsl('+i+' 63% 59%)';g.fill();
  }
  g.fillStyle='#fffcf5';g.beginPath();g.arc(110,110,54,0,Math.PI*2);g.fill();
  function rgbHue(hex){
    const [r,b,c]=hex.slice(1).match(/../g).map(x=>parseInt(x,16)/255);
    const max=Math.max(r,b,c),min=Math.min(r,b,c),d=max-min;
    return d?((max===r?(b-c)/d:max===b?(c-r)/d+2:(r-b)/d+4)*60+360)%360:0;
  }
  let shades=[];
  const swatches=colors=>colors.map(c=>'<div class="swatch" style="background:'+esc(c)+'">'+esc(c)+'</div>').join('');
  function palette(){
    const base=q('#base').value,h=rgbHue(base);
    const offsets={complement:[0,180],similar:[-30,0,30],triad:[0,120,240]}[q('#harmony').value];
    shades=[base,...offsets.map(d=>'hsl('+Math.round((h+d+360)%360)+' 48% 55%)')];
    q('#swatches').innerHTML=swatches(shades);
    q('#saved-palettes').innerHTML=ctx.state.palettes.map(p=>'<div class="gallery">'+swatches(p)+'</div>').join('');
  }
  wheel.onclick=e=>{
    const r=wheel.getBoundingClientRect(),x=e.clientX-r.left-r.width/2,y=e.clientY-r.top-r.height/2;
    const hue=(Math.atan2(y,x)*180/Math.PI+360)%360;
    const converter=document.createElement('canvas').getContext('2d');
    converter.fillStyle='hsl('+hue+' 63% 59%)';
    q('#base').value=converter.fillStyle;palette();
  };
  q('#base').oninput=q('#harmony').oninput=palette;
  q('#palette-save').onclick=async()=>{await ctx.update(s=>{s.palettes.push(shades);return s;});palette();notify('Đã lưu bảng màu.');};
  function lighting(){
    const c=q('#lighting'),g=c.getContext('2d'),angle=Number(q('#light-angle').value)*Math.PI/180,dx=Math.cos(angle),dy=Math.sin(angle);
    g.fillStyle='#eae1ce';g.fillRect(0,0,400,190);
    const gradient=g.createRadialGradient(105+dx*31,91+dy*31,3,105,91,68);
    gradient.addColorStop(0,'#f9f0c9');gradient.addColorStop(.65,'#92a282');gradient.addColorStop(1,'#455b4c');
    g.fillStyle=gradient;g.beginPath();g.arc(105,91,65,0,Math.PI*2);g.fill();
    const face=(pts,t)=>{g.fillStyle='hsl(139 16% '+Math.round(49+t*27)+'%)';g.beginPath();pts.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.closePath();g.fill();};
    face([[230,54],[289,28],[354,58],[297,88]],-dy);
    face([[230,54],[297,88],[297,155],[230,120]],-dx*.7+dy*.25);
    face([[297,88],[354,58],[354,124],[297,155]],dx*.7+dy*.25);
  }
  q('#light-angle').oninput=lighting;
  q('#gray-image').onchange=async e=>{
    const f=e.target.files[0];if(!f)return;
    try{
      const image=await createImageBitmap(f),c=q('#gray'),ratio=Math.min(1,640/Math.max(image.width,image.height));
      c.width=Math.max(1,Math.round(image.width*ratio));c.height=Math.max(1,Math.round(image.height*ratio));c.hidden=false;
      const g=c.getContext('2d');g.drawImage(image,0,0,c.width,c.height);image.close();
      const pixels=g.getImageData(0,0,c.width,c.height),a=pixels.data,bins=[0,0,0];
      for(let i=0;i<a.length;i+=4){const v=Math.round(.2126*a[i]+.7152*a[i+1]+.0722*a[i+2]);a[i]=a[i+1]=a[i+2]=v;bins[Math.min(2,Math.floor(v/86))]++;}
      g.putImageData(pixels,0,0);
      q('#values').textContent=bins.map((n,i)=>['Tối','Trung gian','Sáng'][i]+' '+Math.round(n/(a.length/4)*100)+'%').join(' · ');
    }catch{notify('Không đọc được ảnh.');}
  };
  palette();lighting();
}
