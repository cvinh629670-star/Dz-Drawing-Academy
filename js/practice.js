import {mountCanvas,blank} from './canvas.js';
import {mountTimer} from './timer.js';
import {heading,esc,$,notify,download,link} from './ui.js';
import {read,put} from './database.js';
import {diagram} from './lessons.js';
import {award} from './gamification.js';

const modes=['Vẽ tự do','Vẽ theo mẫu','Luyện đồ nét','Gesture Drawing','Vẽ từ trí nhớ','Dựng khối','Vẽ tốc độ','Thử thách','Dự án'];
const label={background:'Nền',reference:'Ảnh mẫu',sketch:'Phác thảo',drawing:'Nét chính'};
const modeInstructions=['Vẽ trên giấy trống.','Quan sát tỷ lệ và dựng các mảng lớn từ ảnh đang mở.','Phác trực tiếp trên ảnh mẫu ở độ đục thấp.','Đặt đường hành động và trọng tâm trước chi tiết.','Ghi nhớ hướng và tỷ lệ. Ẩn mẫu rồi vẽ lại.','Đơn giản hóa mẫu thành các khối và kiểm tra trục.','Đặt thời lượng ngắn rồi ưu tiên hình lớn.','Vẽ một chiếc đèn bàn bằng ba khối cơ bản.','Thực hiện một bước của dự án và lưu bài vào Portfolio.'];
const svgReference=markup=>new Blob([markup.replace('<svg ','<svg xmlns="http://www.w3.org/2000/svg" width="320" height="190" ').replace('currentColor','#526f5b')],{type:'image/svg+xml'});
const gesturePaths=[
  'M143 41a14 14 0 1 1 28 0 14 14 0 1 1-28 0M156 54l17 54-20 31-4 32m24-63 29 24 11 35m-47-94-40 15-26-16m66 1 38-12 18-28',
  'M144 28a14 14 0 1 1 28 0 14 14 0 1 1-28 0M156 43q25 25 19 56l-39 24-33 35m72-59 31 20-18 29m-19-89-31 7-22-24m53 17 35 13 25-8'
];
const sheetTemplates={
  'Turnaround':['Chính diện','Bên','Sau','Góc 3/4'],
  'Biểu cảm':['Trung tính','Vui','Buồn','Giận','Ngạc nhiên','Lo lắng'],
  'Dáng':['Dáng nghỉ','Dáng đi','Dáng chạy','Dáng hành động'],
  'Trang phục':['Cơ bản','Biến thể A','Biến thể B','Chi tiết chất liệu'],
  'Trang bị':['Mặt trước','Mặt bên','Mặt sau','Cách sử dụng'],
  'Màu':['Màu chủ đạo','Màu phụ','Màu nhấn','Sắc độ']
};
function sheetReference(template){
  const cells=sheetTemplates[template];
  const grid=cells.map((name,i)=>{
    const w=300/cells.length,x=10+i*w;
    const lines=template==='Turnaround'?[43,69,98,128,158]:[];
    return '<rect x="'+x+'" y="31" width="'+w+'" height="137" fill="none" stroke="#789b87"/>'+
      lines.map(y=>'<path d="M'+x+' '+y+'h'+w+'" stroke="#b4cbb6"/>').join('')+
      '<text x="'+(x+w/2)+'" y="181" text-anchor="middle" font-size="7">'+esc(name)+'</text>';
  }).join('');
  return svgReference('<svg viewBox="0 0 320 190"><g fill="#526f5b" font-family="sans-serif"><text x="10" y="22" font-size="12">'+esc(template)+'</text>'+grid+'</g></svg>');
}
export async function practice(root,ctx,id) {
  const lesson=ctx.lessons.find(l=>l.id===id);
  const source=ctx.state.references.find(r=>r.id===id);
  const key='draft:'+(lesson?.id??source?.id??'free');
  const stored=await read(key);
  const doc=stored??blank();
  root.innerHTML=heading('Bàn vẽ',lesson?.exercises.reference??'Phác thảo, luyện theo mẫu hoặc làm bài có giới hạn thời gian.')+
    '<div class="toolbar">'+link('references','Kho tham chiếu')+link('portfolio','Portfolio')+'<select id="mode" aria-label="Chế độ vẽ">'+modes.map(x=>'<option>'+x+'</option>').join('')+'</select><button id="next-ref">Đổi ảnh mẫu</button><label class="inline-check"><input id="auto-ref" type="checkbox"> Tự đổi ảnh khi hết giờ</label><small id="mode-tip"></small></div>'+
    (lesson?.id==='sheet'?'<div class="toolbar"><label>Mẫu Character Sheet <select id="sheet-template">'+Object.keys(sheetTemplates).map(name=>'<option>'+name+'</option>').join('')+'</select></label><button id="sheet-export">Tải mẫu SVG</button></div>':'')+
    '<section class="panel"><div class="toolbar canvas-tools">'+
    '<select id="tool" aria-label="Công cụ">'+[['pencil','Bút chì'],['pen','Bút mực'],['brush','Cọ'],['eraser','Tẩy'],['pan','Di chuyển']].map(([v,t])=>'<option value="'+v+'">'+t+'</option>').join('')+'</select>'+
    '<label>Màu <input id="ink" type="color" value="#303d33"></label><label>Cỡ <input id="size" type="range" min="1" max="80" value="5"></label><label>Độ đục <input id="opacity" type="range" min=".1" max="1" step=".05" value="1"></label>'+
    '<button id="undo" title="Ctrl+Z">Hoàn tác</button><button id="redo" title="Ctrl+Shift+Z">Làm lại</button><button id="clear">Xóa nét</button></div>'+
    '<div class="toolbar canvas-tools"><label>Zoom <input id="zoom" type="range" min=".5" max="4" step=".1" value="1"></label><button id="reset">Đặt lại góc nhìn</button>'+
    '<label>Nền <input id="paper" type="color" value="'+esc(doc.background)+'"></label><label class="inline-check"><input id="grid" type="checkbox"> Lưới</label>'+
    '<label class="inline-check"><input id="symmetry" type="checkbox"> Đối xứng</label><button id="fullscreen">Toàn màn hình</button></div>'+
    '<div class="canvas-wrap"><canvas aria-label="Bàn vẽ" tabindex="0"></canvas></div><div id="draw-timer"></div>'+
    '<div class="toolbar"><button id="png">Xuất PNG</button><button class="primary" id="save-art">Lưu tác phẩm</button><small id="draft-status"></small></div>'+
    '<details><summary>Layers và ảnh tham chiếu</summary><div class="toolbar"><label>Layer đang vẽ <select id="layer"><option value="drawing">Nét chính</option><option value="sketch">Phác thảo</option></select></label><label>Ảnh mẫu <input type="file" id="ref" accept="image/*"></label><button id="hide-ref">Ẩn / hiện mẫu</button></div>'+
    Object.entries(label).map(([l,t])=>'<div class="toolbar"><label class="inline-check"><input type="checkbox" data-visible="'+l+'" '+(doc.layers[l].visible?'checked':'')+'> '+t+'</label><label>Độ đục <input data-opacity="'+l+'" type="range" min="0" max="1" step=".05" value="'+doc.layers[l].opacity+'"></label></div>').join('')+'</details></section>';
  const q=s=>$(s,root);
  if(stored)q('#draft-status').textContent='Bản nháp đã lưu';
  let seconds=0,refIndex=source?ctx.state.references.indexOf(source):-1,pose=0;
  const saveDraft=()=>put(key,doc).then(()=>{q('#draft-status')?.replaceChildren('Bản nháp đã lưu');}).catch(()=>notify('Không lưu được bản nháp.'));
  const board=mountCanvas(q('canvas'),doc,saveDraft);
  const setRef=async blob=>{
    try{await board.ref(blob);doc.reference=blob;await saveDraft();}
    catch{notify('Không mở được ảnh mẫu.');}
  };
  if(source?.blob||doc.reference)void setRef(source?.blob??doc.reference);
  else if(lesson)void setRef(lesson.media?.[0]?.blob??(lesson.id==='sheet'?sheetReference('Turnaround'):svgReference(diagram(lesson.id))));
  if(lesson?.id==='sheet'){
    q('#sheet-template').oninput=e=>void setRef(sheetReference(e.target.value));
    q('#sheet-export').onclick=()=>download(sheetReference(q('#sheet-template').value),'character-sheet.svg','image/svg+xml');
  }
  function nextRef(){
    const gesture=q('#mode').selectedIndex===3;
    const refs=gesture?ctx.state.references.filter(r=>r.category==='Gesture'):ctx.state.references;
    if(gesture&&!refs.length){
      const path=gesturePaths[pose++%gesturePaths.length];
      void setRef(svgReference('<svg viewBox="0 0 320 190"><path d="'+path+'" fill="none" stroke="#526f5b" stroke-width="3" stroke-linecap="round"/></svg>'));
      return;
    }
    if(!refs.length){notify('Hãy thêm ảnh vào kho tham chiếu.');return;}
    refIndex=(refIndex+1)%refs.length;
    void setRef(refs[refIndex].blob);
  }
  q('#next-ref').onclick=nextRef;
  const timerDispose=mountTimer(q('#draw-timer'),n=>{
    seconds+=n;
    const session=crypto.randomUUID();
    void ctx.update(s=>{
      s.sessions.push({id:session,date:Date.now(),seconds:n,lesson:lesson?.id??'',mode:q('#mode')?.value??modes[0]});
      if(n>=900&&doc.strokes.length)award(s,'session:'+session,15);
      return s;
    });
  },()=>{notify('Hết giờ luyện tập.');if(q('#auto-ref').checked)nextRef();});
  for(const [el,k] of [['tool','tool'],['ink','color'],['size','size'],['opacity','opacity'],['layer','layer'],['grid','grid'],['symmetry','symmetry'],['zoom','zoom']]){
    q('#'+el).oninput=e=>{
      const t=e.target;
      board.options[k]=t.type==='checkbox'?t.checked:t.type==='range'?Number(t.value):t.value;
      board.render();
    };
  }
  q('#mode').onchange=e=>{
    const mode=e.target.selectedIndex;
    q('#mode-tip').textContent=modeInstructions[mode];
    if([0,1,2,3,4].includes(mode)){
      const visible=q('[data-visible=reference]');
      if(visible.checked!==(mode!==0))visible.click();
    }
    if(mode===2){const opacity=q('[data-opacity=reference]');opacity.value=.3;opacity.dispatchEvent(new Event('input'));}
    if(mode===3||mode===6){const duration=q('#draw-timer select');duration.value=mode===3?'30':'120';duration.dispatchEvent(new Event('change'));}
    if(mode===3&&!doc.reference)nextRef();
    if(mode===5&&!q('#grid').checked)q('#grid').click();
  };
  q('#mode').selectedIndex=lesson?.id==='gesture'?3:source||lesson?1:0;
  q('#mode-tip').textContent=modeInstructions[q('#mode').selectedIndex];
  if(lesson?.id==='gesture'){const duration=q('#draw-timer select');duration.value='30';duration.dispatchEvent(new Event('change'));}
  q('#paper').oninput=e=>{doc.background=e.target.value;board.render();void saveDraft();};
  for(const input of root.querySelectorAll('[data-visible],[data-opacity]'))input.oninput=()=>{
    if(input.dataset.visible)doc.layers[input.dataset.visible].visible=input.checked;
    else doc.layers[input.dataset.opacity].opacity=Number(input.value);
    board.render();void saveDraft();
  };
  q('#hide-ref').onclick=()=>q('[data-visible=reference]').click();
  q('#ref').onchange=e=>{const file=e.target.files[0];if(file)void setRef(file);};
  q('#undo').onclick=board.undo;
  q('#redo').onclick=board.redo;
  q('#clear').onclick=()=>{if(doc.strokes.length && confirm('Xóa tất cả nét trên bản nháp này?'))board.clear();};
  q('#reset').onclick=()=>{Object.assign(board.options,{zoom:1,x:0,y:0});q('#zoom').value=1;board.render();};
  q('#fullscreen').onclick=()=>q('.canvas-wrap').requestFullscreen().catch(()=>notify('Trình duyệt không mở được toàn màn hình.'));
  q('#png').onclick=async()=>download(await board.png(),'dz-drawing.png','image/png');
  q('#save-art').onclick=async()=>{
    if(!doc.strokes.length){notify('Hãy vẽ trước khi lưu tác phẩm.');return;}
    const title=prompt('Tên tác phẩm',lesson?.title??'Phác thảo của tôi')?.trim();
    if(!title)return;
    const artwork={id:crypto.randomUUID(),title,blob:await board.png(),date:Date.now(),seconds,lesson:lesson?.id??'',referenceId:source?.id??'',status:'Đã hoàn thành'};
    await ctx.update(s=>{s.artworks.push(artwork);return s;});
    notify('Đã lưu vào Portfolio.');
  };
  const keyboard=e=>{
    if(e.target.matches('input,textarea,select'))return;
    if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'){
      e.preventDefault();
      if(e.shiftKey)board.redo();else board.undo();
    }else if(e.key.toLowerCase()==='p')q('#tool').value='pen',q('#tool').dispatchEvent(new Event('input'));
    else if(e.key.toLowerCase()==='e')q('#tool').value='eraser',q('#tool').dispatchEvent(new Event('input'));
  };
  document.addEventListener('keydown',keyboard);
  return ()=>{timerDispose();board.dispose();document.removeEventListener('keydown',keyboard);};
}
