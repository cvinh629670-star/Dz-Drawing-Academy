const W=1200,H=800;
export const layers=['reference','sketch','drawing'];
export const blank = () => ({strokes:[], background:'#fff9eb',layers:Object.fromEntries(['background',...layers].map(l=>[l,{visible:true,opacity:1}]))});
export function mountCanvas(canvas, doc, changed) {
  const ctx=canvas.getContext('2d');
  const buffers=Object.fromEntries(layers.slice(1).map(l=>{
    const el=Object.assign(document.createElement('canvas'),{width:W,height:H});
    return [l,el];
  }));
  const redoStack=[];
  let active,panning, pointer, reference, disposed=false;
  const options={tool:'pen',color:'#303d33',size:5,opacity:1,layer:'drawing',grid:false,symmetry:false,zoom:1,x:0,y:0};
  const drawStroke=(g,s,from=0)=>{
    g.save();
    g.globalCompositeOperation=s.tool==='eraser'?'destination-out':'source-over';
    g.globalAlpha=s.opacity;
    g.strokeStyle=g.fillStyle=s.color;
    g.lineCap=g.lineJoin='round';
    const point=(p)=>s.symmetry?[[p.x,p.y],[W-p.x,p.y]]:[[p.x,p.y]];
    for(let i=from;i<s.points.length;i++){
      const b=s.points[i], a=s.points[Math.max(0,i-1)];
      g.lineWidth=s.size*(a.p+b.p)/2;
      point(b).forEach(([x,y],j)=>{
        const [x0,y0]=point(a)[j];
        g.beginPath();
        if(!i){g.arc(x,y,g.lineWidth/2,0,Math.PI*2);g.fill();}
        else {g.moveTo(x0,y0);g.lineTo(x,y);g.stroke();}
      });
    }
    g.restore();
  };
  function replay() {
    for(const b of Object.values(buffers)) b.getContext('2d').clearRect(0,0,W,H);
    for(const s of doc.strokes) drawStroke(buffers[s.layer].getContext('2d'),s);
    render();
  }
  function compose(g, includeReference) {
    for(const l of ['background',...layers]) {
      if(!doc.layers[l]?.visible) continue;
      g.globalAlpha=doc.layers[l].opacity;
      if(l==='background'){g.fillStyle=doc.background;g.fillRect(0,0,W,H);}
      else if(l==='reference'){
        if(reference && includeReference){
          const ratio=Math.min(W/reference.width,H/reference.height);
          const w=reference.width*ratio,h=reference.height*ratio;
          g.drawImage(reference,(W-w)/2,(H-h)/2,w,h);
        }
      } else g.drawImage(buffers[l],0,0);
    }
    g.globalAlpha=1;
  }
  const fit = ()=>Math.min(canvas.width/W,canvas.height/H)*options.zoom;
  const origin = (f)=>[(canvas.width-W*f)/2+options.x,(canvas.height-H*f)/2+options.y];
  function render() {
    if(disposed)return;
    ctx.setTransform(1,0,0,1,0,0);
    ctx.clearRect(0,0,canvas.width,canvas.height);
    const f=fit(),[x,y]=origin(f);
    ctx.setTransform(f,0,0,f,x,y);
    compose(ctx,true);
    if(options.grid||options.symmetry){
      ctx.beginPath();
      if(options.grid){
        for(let i=0;i<=W;i+=50){ctx.moveTo(i,0);ctx.lineTo(i,H);}
        for(let i=0;i<=H;i+=50){ctx.moveTo(0,i);ctx.lineTo(W,i);}
      }
      if(options.symmetry){ctx.moveTo(W/2,0);ctx.lineTo(W/2,H);}
      ctx.strokeStyle='#57796580';
      ctx.lineWidth=1.5;
      ctx.stroke();
    }
  }
  const resize=new ResizeObserver(()=>{
    const {width,height}=canvas.getBoundingClientRect(),dpr=Math.min(devicePixelRatio,3);
    canvas.width=Math.max(1,Math.round(width*dpr));
    canvas.height=Math.max(1,Math.round(height*dpr));
    render();
  });
  resize.observe(canvas);
  function coords(e){
    const r=canvas.getBoundingClientRect();
    return [(e.clientX-r.left)*canvas.width/r.width,(e.clientY-r.top)*canvas.height/r.height];
  }
  function point(e) {
    const [x,y]=coords(e),f=fit(),[z,w]=origin(f);
    return {x:(x-z)/f,y:(y-w)/f,p:e.pointerType==='pen'?Math.max(.12,e.pressure):1};
  }
  function end(e){
    if(e && e.pointerId!==pointer)return;
    if(active){doc.strokes.push(active);redoStack.length=0;changed();}
    active=panning=pointer=null;
  }
  canvas.onpointerdown=e=>{
    if(pointer!=null||e.button!==0)return;
    if(options.tool!=='pan'&&!doc.layers[options.layer]?.visible)return;
    canvas.setPointerCapture(e.pointerId);
    pointer=e.pointerId;
    if(options.tool==='pan'){panning=coords(e);return;}
    if(doc.strokes.length>=3000){end();return;}
    active={...options,size:options.size*(options.tool==='brush'?2:1),opacity:options.opacity*(options.tool==='pencil'?.55:1),points:[point(e)]};
    drawStroke(buffers[active.layer].getContext('2d'),active);
    render();
  };
  canvas.onpointermove=e=>{
    if(e.pointerId!==pointer)return;
    if(panning){
      const p=coords(e);
      options.x+=p[0]-panning[0];options.y+=p[1]-panning[1];panning=p;
    }else if(active && active.points.length<10000){
      const events=e.getCoalescedEvents?.();
      const from=active.points.length;
      active.points.push(...(events?.length?events:[e]).map(point));
      drawStroke(buffers[active.layer].getContext('2d'),active,from);
    }
    render();
  };
  canvas.onpointerup=canvas.onpointercancel=canvas.onlostpointercapture=end;
  replay();
  return {
    options,render,end,
    undo(){end();if(doc.strokes.length){redoStack.push(doc.strokes.pop());if(redoStack.length>60)redoStack.shift();replay();changed();}},
    redo(){if(redoStack.length){doc.strokes.push(redoStack.pop());replay();changed();}},
    clear(){end();doc.strokes=[];redoStack.length=0;replay();changed();},
    async ref(blob){
      let next=null;
      if(blob?.type==='image/svg+xml'){
        const url=URL.createObjectURL(blob);
        try{
          next=new Image();
          next.src=url;
          await next.decode();
        }finally{URL.revokeObjectURL(url);}
      }else if(blob)next=await createImageBitmap(blob);
      if(disposed){next?.close?.();return;}
      reference?.close?.();reference=next;render();
    },
    png(){end();const out=Object.assign(document.createElement('canvas'),{width:W,height:H});compose(out.getContext('2d'),false);return new Promise(resolve=>out.toBlob(resolve));},
    dispose(){end();disposed=true;resize.disconnect();reference?.close?.();}
  };
}
