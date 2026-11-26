import {heading,esc,$,empty,link,notify,localDay} from './ui.js';
import {chart,minutes,streak,avatar} from './dashboard.js';
import {getLevel,getRank,award} from './gamification.js';
import {backup,restore} from './importer.js';
import {write} from './database.js';
import {lessonCard,diagram} from './lessons.js';

export function profile(root,ctx){
  const s=ctx.state,{level,xp,max}=getLevel(s.events);
  const achievements=[['First Stroke',s.artworks.length>0],['Perspective Architect',['pers1','pers2','pers3'].every(k=>s.progress[k]?.completed)],['Eternal Artist',streak(s.sessions)>=365]];
  root.innerHTML=heading('Hồ sơ họa sĩ','Cài đặt studio và quản lý dữ liệu học tập trên thiết bị.')+
    '<div class="split"><div class="stack"><section class="panel"><div class="profile-line">'+avatar(true)+'<div><h2>'+esc(s.name)+'</h2><small>'+getRank(s)+' · Level '+level+' · '+xp+'/'+max+' EXP</small></div></div><form id="profile-edit"><label class="field">Tên hiển thị<input name="name" value="'+esc(s.name)+'" required maxlength="48"></label><button class="primary">Lưu hồ sơ</button></form></section>'+
    '<section class="panel"><h2>Thành tựu</h2><ul>'+achievements.map(([t,unlocked])=>'<li>'+esc(t)+' · '+(unlocked?'Đã mở':'Chưa mở')+'</li>').join('')+'</ul></section></div>'+
    '<section class="panel stack"><h2>Studio và dữ liệu</h2><div class="row">'+link('import','Nhập chương trình')+link('analytics','Thống kê')+link('projects','Dự án')+link('skills','Cây kỹ năng')+link('training','Lịch luyện tập')+'</div><button id="theme-profile">Đổi giao diện sáng / tối</button><button id="backup">Xuất bản sao lưu</button><label class="field">Khôi phục JSON / ZIP<input id="restore" type="file" accept=".json,.zip"></label><button id="persistent">Yêu cầu lưu trữ bền vững</button><p class="muted">Dữ liệu lưu trong trình duyệt và có thể mất khi bạn xóa dữ liệu website.</p><button id="reset-data">Đặt lại toàn bộ dữ liệu</button></section></div>';
  const q=x=>$(x,root);
  q('#profile-edit').onsubmit=async e=>{e.preventDefault();const name=new FormData(e.currentTarget).get('name').trim();if(name){await ctx.update(s=>({...s,name}));ctx.refresh();}};
  q('#theme-profile').onclick=ctx.toggleTheme;
  q('#backup').onclick=()=>backup().catch(e=>notify(e.message));
  q('#restore').onchange=e=>{if(e.target.files[0])restore(e.target.files[0],ctx.lessons).catch(e=>notify(e.message));};
  q('#reset-data').onclick=async()=>{if(confirm('Xóa vĩnh viễn bản vẽ, bài đã nhập và toàn bộ tiến độ trên thiết bị này?')){await write([],true);location.reload();}};
  q('#persistent').onclick=async()=>{try{notify(await navigator.storage?.persist?.()?'Đã cấp lưu trữ bền vững.':'Trình duyệt chưa cấp lưu trữ bền vững.');}catch{notify('Không yêu cầu được lưu trữ bền vững.');}};
}
export function skills(root,ctx){
  const categories=[...new Set(ctx.lessons.map(l=>l.categoryId))];
  root.innerHTML=heading('Cây kỹ năng','Mở bài từ bất kỳ nhánh nào. Trạng thái dựa trên bài thực hành và điểm tự đánh giá.')+
    '<div class="toolbar"><label>Thu phóng <input id="skill-zoom" type="range" min=".7" max="1.5" step=".1" value="1"></label></div><div style="overflow:auto"><div class="stack" id="skill-tree">'+categories.map(cat=>{
      const lessons=ctx.lessons.filter(l=>l.categoryId===cat),done=lessons.filter(l=>ctx.state.progress[l.id]?.completed).length;
      return '<section class="panel"><div class="section-head"><h2>'+esc(cat)+'</h2><small>'+Math.round(done/lessons.length*100)+'%</small></div><div class="skill-branch">'+lessons.map(l=>{
        const p=ctx.state.progress[l.id],working=ctx.state.artworks.some(a=>a.lesson===l.id);
        const status=p?.completed?(p.score>=9?'Thành thạo':'Hoàn thành'):working?'Đang thực hành':p?.theory?'Đang học':'Khả dụng';
        return '<a class="button" href="#lesson/'+l.id+'" title="'+status+'">'+esc(l.title)+' <small>· '+status+'</small></a>';
      }).join('<span aria-hidden="true">─</span>')+'</div></section>';
    }).join('')+'</div></div>';
  $('#skill-zoom',root).oninput=e=>{$('#skill-tree',root).style.zoom=e.target.value;};
}
export function analytics(root,ctx){
  root.innerHTML=heading('Thống kê luyện vẽ','Dữ liệu được tính từ bộ đếm giờ, bài học và tác phẩm bạn đã lưu.')+
    '<div class="toolbar"><select id="period" aria-label="Khoảng thời gian">'+[[7,'7 ngày'],[30,'30 ngày'],[90,'90 ngày'],[365,'1 năm'],[0,'Toàn thời gian']].map(([v,t])=>'<option value="'+v+'">'+t+'</option>').join('')+'</select></div><div id="analytics-results" class="stack"></div>';
  const q=s=>$(s,root);
  function render(){
    const n=Number(q('#period').value),start=new Date();
    start.setHours(0,0,0,0);start.setDate(start.getDate()-n+1);
    const s=ctx.state.sessions.filter(s=>!n||s.date>=start.getTime());
    const a=ctx.state.artworks.filter(a=>!n||a.date>=start.getTime());
    const completed=Object.entries(ctx.state.progress).filter(([,p])=>p.completed&&(!n||p.completedAt>=start.getTime()));
    const times=new Map();
    s.forEach(row=>times.set(row.lesson,(times.get(row.lesson)??0)+row.seconds));
    const scores=completed.filter(([,p])=>Number.isFinite(p.score)).sort((a,b)=>b[1].score-a[1].score);
    const title=id=>ctx.lessons.find(l=>l.id===id)?.title??'Vẽ tự do';
    q('#analytics-results').innerHTML='<div class="stats">'+[[minutes(s.reduce((n,s)=>n+s.seconds,0))+' phút','Thời gian'],[s.length,'Buổi luyện'],[completed.length,'Bài học'],[a.length,'Tác phẩm']].map(([v,t])=>'<div class="panel stat"><b>'+v+'</b><small>'+t+'</small></div>').join('')+'</div><section class="panel"><h2>Hoạt động gần đây</h2>'+chart(s,Math.min(n||30,30))+'</section><div class="split"><section class="panel"><h2>Thời gian theo kỹ năng</h2>'+(times.size?'<ul>'+[...times].map(([id,sec])=>'<li>'+esc(title(id))+' · '+minutes(sec)+' phút</li>').join('')+'</ul>':empty('Chưa có buổi luyện trong kỳ.'))+'</section><section class="panel"><h2>Kết quả tự đánh giá</h2>'+(scores.length?'<ul>'+scores.map(([id,p])=>'<li>'+esc(title(id))+' · '+p.score+'/10</li>').join('')+'</ul>':empty('Chưa có điểm trong kỳ.'))+'</section></div>';
    const dates=new Map();
    for(const session of s){
      const day=localDay(new Date(session.date));
      dates.set(day,(dates.get(day)??0)+session.seconds);
    }
    const days=Array.from({length:n||365},(_,i)=>{
      const d=new Date();d.setDate(d.getDate()-(n||365)+1+i);
      return localDay(d);
    });
    const evaluated=new Map(scores);
    const branches=[...new Set(ctx.lessons.map(l=>l.categoryId))].map(name=>{
      const group=ctx.lessons.filter(l=>l.categoryId===name);
      const points=group.map(l=>evaluated.get(l.id)?.score).filter(Number.isFinite);
      return {name,score:points.length?points.reduce((a,b)=>a+b,0)/points.length:null,mastery:group.filter(l=>(evaluated.get(l.id)?.score??0)>=9).length/group.length};
    });
    const coordinate=(i,factor)=>{
      const angle=2*Math.PI*i/branches.length-Math.PI/2;
      return [135+Math.cos(angle)*89*factor,109+Math.sin(angle)*89*factor].map(x=>x.toFixed(1)).join(',');
    };
    const polygons=[.25,.5,.75,1].map(f=>'<polygon points="'+branches.map((_,i)=>coordinate(i,f)).join(' ')+'" fill="none" stroke="var(--border)"/>').join('');
    const radar='<svg class="radar" viewBox="0 0 270 215" width="270" role="img" aria-label="Điểm tự đánh giá theo nhánh">'+polygons+branches.map((_,i)=>'<line x1="135" y1="109" x2="'+coordinate(i,1).split(',')[0]+'" y2="'+coordinate(i,1).split(',')[1]+'" stroke="var(--border)"/>').join('')+
      branches.map(({name,score},i)=>{if(score===null)return '';const [x,y]=coordinate(i,score/10).split(',');return '<circle cx="'+x+'" cy="'+y+'" r="5" fill="currentColor"><title>'+esc(name)+' '+score.toFixed(1)+'</title></circle>';}).join('')+'</svg>';
    q('#analytics-results').insertAdjacentHTML('beforeend','<section class="panel stack"><h2>Lịch luyện tập</h2><div class="heatmap" role="img" aria-label="Ngày có luyện tập">'+days.map(d=>'<span title="'+d+' · '+minutes(dates.get(d)??0)+' phút" '+(dates.has(d)?'data-active':'')+'></span>').join('')+'</div></section>'+
      '<div class="split"><section class="panel"><h2>Radar kỹ năng</h2>'+(scores.length?radar+'<ul>'+branches.filter(b=>b.score!==null).map(b=>'<li>'+esc(b.name)+' · '+b.score.toFixed(1)+'/10</li>').join('')+'</ul>':empty('Cần điểm tự đánh giá trong kỳ.'))+'</section><section class="panel stack"><h2>Tiến độ thành thạo</h2>'+branches.map(b=>'<label>'+esc(b.name)+'<progress value="'+b.mastery+'" max="1"></progress></label>').join('')+'</section></div>');
  }
  q('#period').onchange=render;render();
}
export function review(root,ctx){
  const cards=ctx.lessons.flatMap(l=>l.flashcards.map((c,i)=>({...c,id:l.id+':'+i})));
  const due=cards.filter(c=>(ctx.state.reviews[c.id]?.due??0)<=Date.now());
  const now=Date.now();
  const practiceDue=ctx.lessons.map(l=>{
    const p=ctx.state.progress[l.id];if(!p?.completedAt)return null;
    const logs=p.reviews??0,day=[1,3,7,14,30,60][logs];
    return day&&p.completedAt+day*86400000<=now?l:null;
  }).filter(Boolean);
  const c=due[0];
  root.innerHTML=heading('Sổ ôn tập','Ôn lý thuyết bằng flashcard và luyện lại kỹ năng theo lịch riêng.')+
    '<div class="split"><section class="panel stack"><h2>Flashcard · '+due.length+' đến hạn</h2>'+(c?'<p>'+esc(c.question)+'</p><details id="answer"><summary>Hiện đáp án</summary><p>'+esc(c.answer)+'</p><div class="toolbar">'+['Again','Hard','Good','Easy'].map((r,i)=>'<button data-rate="'+i+'">'+r+'</button>').join('')+'</div></details>':empty('Bạn đã ôn hết flashcard đến hạn.'))+'</section>'+
    '<section class="panel stack"><h2>Kỹ năng đến hạn</h2>'+(practiceDue.map(l=>'<div class="row">'+link('practice/'+l.id,l.title)+'<button data-reviewed="'+l.id+'">Đã luyện lại</button></div>').join('')||empty('Chưa có bài thực hành đến hạn.'))+'</section></div>';
  for(const b of root.querySelectorAll('[data-rate]'))b.onclick=async()=>{
    const i=Number(b.dataset.rate);
    await ctx.update(s=>{const old=s.reviews[c.id]?.interval??0;const interval=[0,Math.max(1,Math.ceil(old*1.2)),Math.max(3,old*2),Math.max(7,old*3)][i];s.reviews[c.id]={interval,due:Date.now()+(interval?interval*86400000:600000),rating:i};return s;});
    ctx.refresh();
  };
  for(const b of root.querySelectorAll('[data-reviewed]'))b.onclick=async()=>{await ctx.update(s=>{const p=s.progress[b.dataset.reviewed];p.reviews=(p.reviews??0)+1;return s;});ctx.refresh();};
}
export function training(root,ctx){
  const names=['Lý thuyết cốt lõi','Khởi động nét','Kỹ năng trọng tâm','Vẽ theo mẫu','Vẽ bằng trí tưởng tượng'];
  const plan=ctx.state.training??{total:60,ratios:[12,5,20,11,12]};
  root.innerHTML=heading('Lịch luyện tập','Chia thời gian mỗi ngày theo ưu tiên của bạn.')+
    '<div class="split"><form id="plan" class="panel stack"><h2>Thời lượng và tỷ lệ</h2><div class="toolbar">'+[15,30,60,90,120].map(n=>'<button type="button" data-time="'+n+'">'+n+' phút</button>').join('')+'</div><label class="field">Tổng phút<input name="total" type="number" min="5" max="480" required value="'+plan.total+'"></label>'+names.map((t,i)=>'<label class="field">'+t+'<input name="ratio" type="number" min="0" max="100" required value="'+plan.ratios[i]+'"></label>').join('')+'<button class="primary">Lưu lịch</button></form>'+
    '<section class="panel stack"><h2>Kế hoạch hôm nay</h2><div id="plan-result"></div>'+link('practice','Bắt đầu buổi luyện','primary button')+link('review','Ôn bài đến hạn')+'</section></div>';
  const form=$('#plan',root);
  function render(){
    const data=new FormData(form),values=data.getAll('ratio').map(Number),sum=values.reduce((a,b)=>a+b),total=Number(data.get('total'));
    let previous=0;
    $('#plan-result',root).innerHTML=sum?'<ul>'+names.map((t,i)=>{const end=Math.round(total*values.slice(0,i+1).reduce((a,b)=>a+b,0)/sum),n=end-previous;previous=end;return '<li>'+t+' · '+n+' phút</li>';}).join('')+'</ul>':empty('Cần ít nhất một hoạt động có thời lượng.');
  }
  for(const b of root.querySelectorAll('[data-time]'))b.onclick=()=>{form.elements.total.value=b.dataset.time;render();};
  form.oninput=render;
  form.onsubmit=async e=>{e.preventDefault();const data=new FormData(form),ratios=data.getAll('ratio').map(Number);if(!ratios.some(Boolean)){notify('Cần ít nhất một hoạt động.');return;}await ctx.update(s=>({...s,training:{total:Number(data.get('total')),ratios}}));notify('Đã lưu lịch luyện tập.');};
  render();
}
export function mistakes(root,ctx){
  root.innerHTML=heading('Sổ lỗi','Ghi lại điều cần sửa và quay về bài học liên quan.')+
    '<div class="split"><form id="mistake-form" class="panel stack"><label class="field">Lỗi quan sát được<textarea name="text" required></textarea></label><label class="field">Bài liên quan<select name="lesson"><option value="">Chọn bài</option>'+ctx.lessons.map(l=>'<option value="'+l.id+'">'+esc(l.title)+'</option>').join('')+'</select></label><button class="primary">Thêm ghi chú</button></form>'+
    '<div class="stack">'+([...ctx.state.mistakes].reverse().map(m=>'<article class="panel"><p>'+esc(m.text)+'</p><small>'+new Date(m.date).toLocaleDateString('vi')+'</small>'+(m.lesson?'<div class="row">'+link('lesson/'+m.lesson,'Xem bài')+link('practice/'+m.lesson,'Luyện lại')+'</div>':'')+'</article>').join('')||empty('Chưa có ghi chú.'))+'</div></div>';
  $('#mistake-form',root).onsubmit=async e=>{e.preventDefault();const m=Object.fromEntries(new FormData(e.currentTarget));if(!m.text.trim())return;await ctx.update(s=>{s.mistakes.push({...m,date:Date.now()});return s;});ctx.refresh();};
}
const weights=[['Chất lượng nét',15],['Tỷ lệ',20],['Dựng hình',20],['Phối cảnh',15],['Ánh sáng & sắc độ',15],['Bố cục',10],['Sáng tạo',5]];
export function assessment(root,ctx,id){
  const art=ctx.state.artworks.find(a=>a.id===id);
  if(!art){root.innerHTML=empty('Không tìm thấy tác phẩm.');return;}
  root.innerHTML=heading('Đánh giá tác phẩm',art.title)+'<section class="panel"><form id="rubric"><label class="field">Người chấm<select name="kind"><option value="self">Tự đánh giá</option><option value="teacher">Giảng viên</option></select></label><table class="table"><thead><tr><th>Tiêu chí</th><th>Điểm /10</th><th>Trọng số %</th></tr></thead><tbody>'+weights.map(([t,w],i)=>'<tr><td>'+t+'</td><td><input aria-label="Điểm '+t+'" name="score" type="number" min="0" max="10" step=".1" value="'+(art.rubric?.rows[i]?.score??'')+'" style="width:65px"></td><td><input aria-label="Trọng số '+t+'" name="weight" type="number" min="0" max="100" value="'+(art.rubric?.rows[i]?.weight??w)+'" style="width:65px"></td></tr>').join('')+'</tbody></table><p class="muted">Để điểm trống nếu tiêu chí không áp dụng.</p><div class="row"><button class="primary">Lưu điểm</button>'+link('art/'+id,'Quay lại tác phẩm')+'</div></form></section>';
  $('#rubric',root).onsubmit=async e=>{
    e.preventDefault();
    const data=new FormData(e.currentTarget),rows=data.getAll('score').map((v,i)=>({score:v===''?null:Number(v),weight:Number(data.getAll('weight')[i])}));
    const used=rows.filter(r=>r.score!==null&&r.weight>0);
    if(!used.length){notify('Hãy chấm ít nhất một tiêu chí có trọng số.');return;}
    const score=Math.round(10*used.reduce((n,r)=>n+r.score*r.weight,0)/used.reduce((n,r)=>n+r.weight,0))/10;
    await ctx.update(s=>{const a=s.artworks.find(a=>a.id===id);a.rubric={rows,kind:data.get('kind'),date:Date.now()};a.score=score;return s;});
    notify('Điểm theo rubric '+score+'/10');location.hash='art/'+id;
  };
}
export function category(root,ctx,name,title,links=''){
  root.innerHTML=heading(title,'Chọn bài học và áp dụng ngay kỹ thuật vào bài vẽ.')+'<div class="toolbar">'+links+'</div><div class="route-grid">'+ctx.lessons.filter(l=>l.categoryId===name).map(l=>lessonCard(l,ctx.state)).join('')+'</div>';
}
export function anatomy(root,ctx){
  category(root,ctx,'Giải phẫu','Phòng giải phẫu',link('practice/gesture','Luyện gesture có hẹn giờ','primary button'));
}
export function concept(root,ctx){
  category(root,ctx,'Concept & Game Art','Xưởng Concept & Game Art',link('sprite','Xem animation sprite','primary button')+link('projects','Tạo dự án'));
}
export function characters(root,ctx){
  category(root,ctx,'Nhân vật','Thiết kế nhân vật',link('practice/sheet','Vẽ Character Sheet','primary button'));
  root.insertAdjacentHTML('beforeend','<section class="panel stack" style="margin-top:16px"><h2>Thử thách thiết kế</h2><p id="brief"></p><div class="toolbar"><button id="reroll">Tạo đề bài</button><button id="save-brief" disabled>Lưu đề</button></div><div id="saved-briefs"></div></section>');
  const sets=[['Thợ làm đồng hồ','Thủ thư','Kỹ sư tàu bay'],['Cầu toàn','Hiếu kỳ','Trầm lặng'],['Thành phố nổi','Rừng biết hát','Thuộc địa ngoài hành tinh'],['Trung cổ','Tương lai xa','Thế kỷ 19'],['Anime','Semi-realistic','Cartoon'],['Áo choàng vá','Đồng phục thêu tay','Áo khoác bảo hộ'],['Đèn dầu','La bàn vỡ','Hộp nhạc'],['Xanh rêu','Đỏ gạch','Tím khói']];
  const q=s=>$(s,root);
  const draw=s=>{q('#saved-briefs').innerHTML=s.challenges.map(c=>'<div class="quest"><div><p>'+esc(c.text)+'</p>'+link('practice/sheet','Mở bàn vẽ')+'</div></div>').join('');};
  q('#reroll').onclick=()=>{q('#brief').textContent=sets.map(a=>a[Math.floor(Math.random()*a.length)]).join(' · ');q('#save-brief').disabled=false;};
  q('#save-brief').onclick=async()=>{const text=q('#brief').textContent;await ctx.update(s=>{if(!s.challenges.some(c=>c.text===text))s.challenges.push({text,date:Date.now()});return s;});q('#save-brief').disabled=true;draw(ctx.state);};
  draw(ctx.state);
}
