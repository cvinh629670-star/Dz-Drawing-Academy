import {heading,esc,$,empty,link,useBlobs,download,notify} from './ui.js';
export function portfolio(root,ctx) {
  const arts=[...ctx.state.artworks].reverse();
  root.innerHTML=heading('Portfolio','Lưu tác phẩm và xem lại quá trình phát triển của bạn.')+
    '<div class="toolbar">'+link('practice','Mở bàn vẽ','primary button','pen')+link('mistakes','Sổ lỗi')+link('compare','So sánh tác phẩm')+'</div><div class="gallery">'+
    (arts.map(a=>'<a class="panel" href="#art/'+a.id+'"><img data-image="'+a.id+'" alt="'+esc(a.title)+'"><h3>'+esc(a.title)+'</h3><small>'+new Date(a.date).toLocaleDateString('vi')+' · '+Math.round(a.seconds/60)+' phút</small><p>'+esc(a.status)+'</p></a>').join('')||empty('Chưa có tác phẩm. Hãy lưu một bài vẽ từ bàn vẽ.'))+'</div>';
  return useBlobs(root,arts);
}
export function art(root,ctx,id) {
  const a=ctx.state.artworks.find(a=>a.id===id);
  if(!a){root.innerHTML=empty('Không tìm thấy tác phẩm.');return;}
  const reference=ctx.state.references.find(x=>x.id===a.referenceId);
  root.innerHTML=heading(a.title,new Date(a.date).toLocaleDateString('vi'))+
    '<div class="split"><article class="panel"><img class="media" data-image="'+a.id+'" alt="'+esc(a.title)+'"><div class="toolbar">'+link('portfolio','Portfolio')+'<button id="art-png">Tải PNG</button>'+link('assessment/'+id,'Tự đánh giá')+(reference?link('reference/'+reference.id,'Ảnh tham chiếu'):'')+'</div></article>'+
    '<form class="panel" id="edit-art">'+[['title','Tên'],['style','Phong cách'],['tags','Tags'],['status','Trạng thái'],['description','Mô tả'],['notes','Ghi chú quá trình'],['strengths','Điểm mạnh'],['improvements','Điều cần cải thiện']].map(([k,t])=>'<label class="field">'+t+(k==='title'?'<input name="'+k+'" value="'+esc(a[k])+'" required>':'<textarea name="'+k+'">'+esc(a[k])+'</textarea>')+'</label>').join('')+'<button class="primary">Lưu chi tiết</button></form></div>';
  $('#art-png',root).onclick=()=>download(a.blob,a.title+'.png','image/png');
  $('#edit-art',root).onsubmit=async e=>{
    e.preventDefault();
    const fields=Object.fromEntries(new FormData(e.currentTarget));
    await ctx.update(s=>{Object.assign(s.artworks.find(x=>x.id===id),fields);return s;});
    ctx.refresh();notify('Đã cập nhật tác phẩm.');
  };
  return useBlobs(root,[a]);
}
export function compare(root,ctx) {
  const arts=ctx.state.artworks;
  root.innerHTML=heading('So sánh tác phẩm','Chọn hai bản vẽ để xem cạnh nhau hoặc dùng thanh trượt.')+(arts.length<2?empty('Cần ít nhất hai tác phẩm đã lưu.'):'<div class="toolbar"><select id="before" aria-label="Tác phẩm trước"></select><select id="after" aria-label="Tác phẩm sau"></select><label class="inline-check"><input id="slide" type="checkbox"> Thanh trượt</label><input type="range" id="clip" aria-label="Vị trí so sánh" value="50" hidden></div><div id="comparison"></div>');
  if(arts.length<2)return;
  const q=s=>$(s,root);
  let dispose=()=>{};
  for(const select of [q('#before'),q('#after')])select.innerHTML=arts.map(a=>'<option value="'+a.id+'">'+esc(a.title)+' · '+new Date(a.date).toLocaleDateString('vi')+'</option>').join('');
  q('#after').selectedIndex=arts.length-1;
  function render(){
    dispose();
    const before=q('#before').value,after=q('#after').value,slide=q('#slide').checked;
    q('#clip').hidden=!slide;
    const img=(id,style='')=>'<img class="media" data-image="'+id+'" alt="'+esc(arts.find(a=>a.id===id).title)+'" style="'+style+'">';
    q('#comparison').innerHTML=slide?'<div class="panel" style="position:relative">'+img(before)+img(after,'position:absolute;inset:17px;width:calc(100% - 34px);height:calc(100% - 34px);clip-path:inset(0 0 0 '+Number(q('#clip').value)+'%)')+'</div>':'<div class="split"><div class="panel">'+img(before)+'</div><div class="panel">'+img(after)+'</div></div>';
    dispose=useBlobs(q('#comparison'),arts);
  }
  for(const input of root.querySelectorAll('select,input'))input.oninput=render;
  render();return ()=>dispose();
}
