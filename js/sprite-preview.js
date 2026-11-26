import {heading,$,notify,download} from './ui.js';
export function sprite(root){
  root.innerHTML=heading('Sprite Animation Previewer','Xem từng frame ở kích thước gốc và xuất thông số vùng cắt.')+
    '<section class="panel stack"><label class="field">Sprite sheet<input id="sprite-file" type="file" accept="image/*"></label><div class="toolbar">'+
    [['rows','Hàng',1,128,1],['cols','Cột',1,128,1],['fps','FPS',1,60,8],['offset-x','X',0,16384,0],['offset-y','Y',0,16384,0],['region-w','Chiều rộng vùng',0,16384,0],['region-h','Chiều cao vùng',0,16384,0]].map(([id,title,min,max,v])=>'<label>'+title+' <input id="'+id+'" type="number" min="'+min+'" max="'+max+'" value="'+v+'" style="width:76px"></label>').join('')+
    '</div><div class="toolbar"><button id="play">Phát</button><button id="prev">Frame trước</button><button id="next">Frame sau</button><label><input id="loop" type="checkbox" checked> Lặp</label><label><input id="sprite-flip" type="checkbox"> Lật ngang</label><button id="metadata">Xuất JSON</button><output id="frame-caption"></output></div><div style="overflow:auto"><canvas width="1" height="1" aria-label="Khung sprite"></canvas></div></section>';
  const q=s=>$(s,root),c=q('canvas'),g=c.getContext('2d');
  let bitmap,frame=0,play=false,clock=0,last=0,disposed=false;
  const val=id=>{const e=q('#'+id);return Math.min(Number(e.max),Math.max(Number(e.min),Math.trunc(Number(e.value))||0));};
  function geometry(){
    if(!bitmap)return null;
    const rows=val('rows'),cols=val('cols'),x=val('offset-x'),y=val('offset-y');
    const rw=Math.min(val('region-w')||bitmap.width,bitmap.width-x),rh=Math.min(val('region-h')||bitmap.height,bitmap.height-y);
    const w=Math.floor(rw/cols),h=Math.floor(rh/rows);
    return w>0&&h>0?{rows,cols,x,y,w,h,count:rows*cols}:null;
  }
  function render(){
    const m=geometry();if(!m){q('#frame-caption').textContent=bitmap?'Vùng không hợp lệ':'Chọn một ảnh sprite';return;}
    frame=((frame%m.count)+m.count)%m.count;
    c.width=m.w;c.height=m.h;g.imageSmoothingEnabled=false;
    if(q('#sprite-flip').checked){g.translate(m.w,0);g.scale(-1,1);}
    g.drawImage(bitmap,m.x+frame%m.cols*m.w,m.y+Math.floor(frame/m.cols)*m.h,m.w,m.h,0,0,m.w,m.h);
    q('#frame-caption').textContent=(frame+1)+' / '+m.count+' · '+m.w+' × '+m.h+' px';
  }
  function animate(t){
    const m=geometry();
    if(play&&m&&t-last>=1000/val('fps')){
      if(frame===m.count-1&&!q('#loop').checked){play=false;q('#play').textContent='Phát';}
      else{frame=(frame+1)%m.count;render();}
      last=t;
    }
    clock=requestAnimationFrame(animate);
  }
  q('#sprite-file').onchange=async e=>{
    if(!e.target.files[0])return;
    try{const next=await createImageBitmap(e.target.files[0]);if(disposed){next.close();return;}bitmap?.close();bitmap=next;frame=0;render();}catch{notify('Không đọc được sprite sheet.');}
  };
  q('#play').onclick=()=>{if(!geometry()){notify('Hãy chọn sprite sheet và vùng hợp lệ.');return;}if(!play&&frame===geometry().count-1&&!q('#loop').checked){frame=0;render();}play=!play;last=performance.now();q('#play').textContent=play?'Tạm dừng':'Phát';};
  q('#prev').onclick=()=>{frame--;render();};
  q('#next').onclick=()=>{frame++;render();};
  for(const e of root.querySelectorAll('input:not([type=file])'))e.oninput=render;
  q('#metadata').onclick=()=>{
    const m=geometry();if(!m){notify('Chưa có vùng sprite hợp lệ.');return;}
    const frames=Array.from({length:m.count},(_,i)=>({x:m.x+i%m.cols*m.w,y:m.y+Math.floor(i/m.cols)*m.h,width:m.w,height:m.h}));
    download(JSON.stringify({fps:val('fps'),loop:q('#loop').checked,flipHorizontal:q('#sprite-flip').checked,frames},null,2),'animation.json');
  };
  render();clock=requestAnimationFrame(animate);
  return ()=>{disposed=true;cancelAnimationFrame(clock);bitmap?.close();};
}
