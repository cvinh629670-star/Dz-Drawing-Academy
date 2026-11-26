import {heading,esc,$,link,empty,notify} from './ui.js';
import {award} from './gamification.js';
const templates=['Character Design','Environment Design','Creature Design','Game Asset Pack','Sprite Animation','Illustration','Concept Art','Custom'];
const steps=['Brief','Reference','Moodboard','Thumbnail Sketch','Silhouette Exploration','Construction','Refined Sketch','Line Art','Value Study','Color Study','Rendering','Final Artwork','Self Assessment'];
export function projects(root,ctx){
  root.innerHTML=heading('Dự án nghệ thuật','Quản lý checklist, thời hạn, ghi chú và tác phẩm cuối.')+
    '<div class="split"><form id="create" class="panel"><label class="field">Tên dự án<input name="title" required maxlength="120"></label><label class="field">Mẫu<select name="type">'+templates.map(t=>'<option>'+t+'</option>').join('')+'</select></label><label class="field">Hạn hoàn thành<input name="deadline" type="date"></label><button class="primary">Tạo dự án</button></form>'+
    '<div class="stack">'+(ctx.state.projects.map(p=>'<a class="panel" href="#project/'+p.id+'"><h3>'+esc(p.title)+'</h3><small>'+esc(p.type)+' · '+p.tasks.filter(t=>t.done).length+'/'+p.tasks.length+' bước</small></a>').join('')||empty('Chưa có dự án.'))+'</div></div>';
  $('#create',root).onsubmit=async e=>{
    e.preventDefault();const fields=Object.fromEntries(new FormData(e.currentTarget)),id=crypto.randomUUID();
    await ctx.update(s=>{s.projects.push({...fields,id,tasks:fields.type==='Custom'?[{title:'Brief',done:false}]:steps.map(title=>({title,done:false})),versions:[]});return s;});location.hash='project/'+id;
  };
}
export function project(root,ctx,id){
  const p=ctx.state.projects.find(p=>p.id===id);
  if(!p){root.innerHTML=empty('Không tìm thấy dự án.');return;}
  root.innerHTML=heading(p.title,p.type)+'<div class="split"><section class="panel stack"><h2>Checklist</h2><progress value="'+p.tasks.filter(t=>t.done).length+'" max="'+p.tasks.length+'"></progress>'+p.tasks.map((t,i)=>'<label class="inline-check"><input type="checkbox" data-task="'+i+'" '+(t.done?'checked':'')+'> '+esc(t.title)+'</label>').join('')+'<form class="toolbar" id="add-task"><input name="task" required placeholder="Thêm bước"><button>Thêm</button></form>'+link('practice','Mở bàn vẽ')+link('projects','Danh sách dự án')+'</section>'+
    '<section class="panel stack"><form id="project-details"><label class="field">Deadline<input type="date" name="deadline" value="'+esc(p.deadline)+'"></label><label class="field">Ghi chú<textarea name="notes">'+esc(p.notes)+'</textarea></label><label class="field">Tác phẩm Portfolio<select name="art"><option value="">Chọn tác phẩm</option>'+ctx.state.artworks.map(a=>'<option value="'+a.id+'" '+(p.art===a.id?'selected':'')+'>'+esc(a.title)+'</option>').join('')+'</select></label><button class="primary">Lưu</button></form><h2>Phiên bản</h2>'+p.versions.map(id=>link('art/'+id,ctx.state.artworks.find(a=>a.id===id)?.title??'Tác phẩm')).join('')+'</section></div>';
  const update=fn=>ctx.update(s=>{fn(s.projects.find(p=>p.id===id),s);return s;});
  const check=(p,s)=>{if(p.art&&p.tasks.length&&p.tasks.every(t=>t.done)&&['Concept Art','Character Design'].includes(p.type)){const art=s.artworks.find(a=>a.id===p.art);if(art?.score>=7)award(s,'project:'+id,p.type==='Concept Art'?500:200);}};
  for(const input of root.querySelectorAll('[data-task]'))input.onchange=async()=>{await update((p,s)=>{p.tasks[Number(input.dataset.task)].done=input.checked;check(p,s);});$('progress',root).value=ctx.state.projects.find(p=>p.id===id).tasks.filter(t=>t.done).length;};
  $('#add-task',root).onsubmit=async e=>{e.preventDefault();const title=new FormData(e.currentTarget).get('task').trim();if(!title)return;await update(p=>p.tasks.push({title,done:false}));ctx.refresh();};
  $('#project-details',root).onsubmit=async e=>{e.preventDefault();const fields=Object.fromEntries(new FormData(e.currentTarget));await update((p,s)=>{Object.assign(p,fields);if(p.art&&!p.versions.includes(p.art))p.versions.push(p.art);check(p,s);});notify('Đã lưu dự án.');ctx.refresh();};
}
