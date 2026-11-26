export function mountTimer(root,onLog,onFinish) {
  root.innerHTML='<div class="toolbar"><label>Thời lượng <select aria-label="Thời lượng">'+[30,60,120,300,600,900,1800,3600].map(n=>'<option value="'+n+'" '+(n===300?'selected':'')+'>'+(n<60?n+' giây':n/60+' phút')+'</option>').join('')+'<option value="custom">Tùy chọn</option></select></label><input type="number" min="1" max="240" value="5" aria-label="Số phút tùy chọn" hidden><output class="timer"></output><button data-t="start">Bắt đầu</button><button data-t="reset">Làm lại</button><button data-t="stop">Bỏ qua & ghi giờ</button></div>';
  const select=root.querySelector('select'), custom=root.querySelector('input'), display=root.querySelector('output'),start=root.querySelector('[data-t=start]');
  let elapsed=0,since=0,finished=false,limit=300000;
  const total=()=>elapsed+(since?performance.now()-since:0);
  function show(){
    const s=Math.max(0,Math.ceil((limit-total())/1000));
    display.textContent=Math.floor(s/60)+':'+String(s%60).padStart(2,'0');
    start.textContent=since?'Tạm dừng':elapsed&&!finished?'Tiếp tục':'Bắt đầu';
  }
  function reset(){elapsed=since=0;finished=false;limit=(select.value==='custom'?Math.max(1,Math.min(240,Number(custom.value)||1))*60:Number(select.value))*1000;show();}
  function stop(natural){
    const seconds=Math.floor(Math.min(limit,total())/1000);
    elapsed=natural?limit:Math.min(limit,total());since=0;
    if(!finished&&seconds>0)onLog(seconds);
    finished=true;show();
    if(natural)onFinish?.();
  }
  start.onclick=()=>{
    if(since){elapsed=total();since=0;}
    else {if(finished)reset();since=performance.now();}
    show();
  };
  const restart=()=>{if(!finished&&total()>=1000)stop(false);reset();};
  select.onchange=()=>{custom.hidden=select.value!=='custom';restart();};
  custom.onchange=restart;
  root.querySelector('[data-t=reset]').onclick=restart;
  root.querySelector('[data-t=stop]').onclick=()=>stop(false);
  const interval=setInterval(()=>{if(since&&total()>=limit)stop(true);else if(since)show();},100);
  show();
  return ()=>{clearInterval(interval);if(!finished&&total()>=1000)stop(false);};
}
