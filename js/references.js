import {heading,esc,$,empty,link,useBlobs,notify} from './ui.js';
const cats=['Anatomy','Gesture','Face','Hair','Hands','Feet','Clothing','Expressions','Character','Environment','Architecture','Creature','Props','Lighting','Color','Pixel Art'];
export function references(root,ctx) {
  root.innerHTML=heading('Kho tham chiếu','Tổ chức ảnh luyện vẽ và mở chúng trực tiếp trên bàn vẽ.')+
    '<div class="split"><section class="panel"><h2>Thêm ảnh</h2><form id="upload">'+
    '<label class="field">Ảnh từ thiết bị<input name="file" type="file" accept="image/*" required></label><label class="field">Tên<input name="title"></label>'+
    '<label class="field">Phân loại<select name="category">'+cats.map(c=>'<option>'+c+'</option>').join('')+'</select></label>'+
    ['Tác giả|author','Nguồn|source','Giấy phép|license','Tags|tags','Bộ sưu tập|collection'].map(item=>{const [t,k]=item.split('|');return '<label class="field">'+t+'<input name="'+k+'"></label>'}).join('')+
    '<button class="primary">Lưu ảnh</button></form></section><section class="stack"><div class="toolbar"><input type="search" id="ref-search" placeholder="Tìm tiêu đề, tag, bộ sưu tập" aria-label="Tìm ảnh"><button id="random-ref">Ảnh ngẫu nhiên</button><label class="inline-check"><input type="checkbox" id="favorites"> Yêu thích</label><label class="inline-check"><input type="checkbox" id="moodboard"> Moodboard</label><select id="collections" aria-label="Bộ sưu tập"></select></div><div class="gallery" id="reference-list"></div></section></div>';
  const q=s=>$(s,root);
  let dispose=()=>{},matches=[];
  function render(){
    dispose();
    const term=q('#ref-search').value.trim().toLowerCase();
    const collections=q('#collections'),collection=collections.value,board=q('#moodboard').checked;
    collections.innerHTML='<option value="">Mọi bộ sưu tập</option>'+[...new Set(ctx.state.references.map(r=>r.collection).filter(Boolean))].map(c=>'<option value="'+esc(c)+'">'+esc(c)+'</option>').join('');
    collections.value=collection;
    matches=ctx.state.references.filter(r=>[r.title,r.category,r.tags,r.collection,r.author].join(' ').toLowerCase().includes(term)&&(!q('#favorites').checked||r.favorite)&&(!collection||r.collection===collection));
    const list=q('#reference-list');
    list.classList.toggle('moodboard',board);
    if(board){
      list.innerHTML=matches.map(r=>'<a href="#reference/'+r.id+'" title="'+esc(r.title)+'"><img loading="lazy" data-image="'+r.id+'" alt="'+esc(r.title)+'"></a>').join('')||empty('Chưa có ảnh trong bảng.');
      dispose=useBlobs(list,matches);
      return;
    }
    list.innerHTML=matches.map(r=>'<article class="panel"><a href="#reference/'+r.id+'"><img data-image="'+r.id+'" alt="'+esc(r.title)+'"><h3>'+esc(r.title)+'</h3></a><p><small>'+esc([r.category,r.collection,r.tags].filter(Boolean).join(' · '))+'</small></p><div class="row">'+link('practice/'+r.id,'Luyện vẽ')+'<button aria-label="Đổi yêu thích" aria-pressed="'+Boolean(r.favorite)+'" data-fav="'+r.id+'">'+(r.favorite?'★':'☆')+'</button></div></article>').join('')||empty('Chưa có ảnh phù hợp.');
    dispose=useBlobs(list,matches);
    for(const b of list.querySelectorAll('[data-fav]'))b.onclick=async()=>{await ctx.update(s=>{const r=s.references.find(x=>x.id===b.dataset.fav);r.favorite=!r.favorite;return s;});render();};
  }
  q('#ref-search').oninput=q('#favorites').oninput=q('#moodboard').oninput=q('#collections').oninput=render;
  q('#random-ref').onclick=()=>{if(matches.length)location.hash='reference/'+matches[Math.floor(Math.random()*matches.length)].id;else notify('Chưa có ảnh để chọn.');};
  q('#upload').onsubmit=async e=>{
    e.preventDefault();
    const form=e.currentTarget;
    const {file,...fields}=Object.fromEntries(new FormData(form));
    if(!file?.size||!file.type.startsWith('image/')){notify('Hãy chọn tệp ảnh hợp lệ.');return;}
    try{const img=await createImageBitmap(file);img.close();}catch{notify('Không đọc được tệp ảnh.');return;}
    await ctx.update(s=>{s.references.push({...fields,title:fields.title.trim()||file.name,id:crypto.randomUUID(),blob:file});return s;});
    form.reset();render();notify('Đã lưu ảnh tham chiếu.');
  };
  render();
  return ()=>dispose();
}
export function reference(root,ctx,id) {
  const r=ctx.state.references.find(r=>r.id===id);
  if(!r){root.innerHTML=empty('Không tìm thấy ảnh.');return;}
  root.innerHTML=heading(r.title,[r.category,r.author,r.source,r.license].filter(Boolean).join(' · '))+
    '<div class="toolbar">'+link('practice/'+id,'Mở bàn vẽ','primary button')+link('references','Kho ảnh')+
    '<label>Zoom <input type="range" id="ref-zoom" min="1" max="3" step=".1" value="1"></label><label>Độ đục <input id="ref-opacity" type="range" min=".1" max="1" step=".1" value="1"></label><label><input type="checkbox" id="flip"> Lật ngang</label><label><input type="checkbox" id="gray"> Grayscale</label><label><input type="checkbox" id="rgrid"> Lưới</label><label>Crop preview <select id="crop-preview"><option value="">Ảnh gốc</option><option value="1/1">Vuông</option><option value="4/3">Ngang 4:3</option><option value="3/4">Dọc 3:4</option></select></label></div>'+
    '<div class="panel" style="overflow:hidden;position:relative"><img class="media" data-image="'+id+'" alt="'+esc(r.title)+'"><div id="overlay" hidden style="position:absolute;inset:17px;pointer-events:none;background:repeating-linear-gradient(90deg,transparent 0 calc(10% - 1px),#53705db0 calc(10% - 1px) 10%),repeating-linear-gradient(0deg,transparent 0 calc(10% - 1px),#53705db0 calc(10% - 1px) 10%)"></div></div>';
  const q=s=>$(s,root);
  root.oninput=()=>{const img=q('img'),crop=q('#crop-preview').value;img.style.transform='scale('+q('#ref-zoom').value+') scaleX('+(q('#flip').checked?-1:1)+')';img.style.opacity=q('#ref-opacity').value;img.style.filter=q('#gray').checked?'grayscale(1)':'';img.style.aspectRatio=crop;img.style.objectFit=crop?'cover':'contain';img.style.width=crop?'min(100%, 460px)':'';q('#overlay').hidden=!q('#rgrid').checked;};
  const dispose=useBlobs(root,[r]);
  return ()=>{dispose();root.oninput=null;};
}
