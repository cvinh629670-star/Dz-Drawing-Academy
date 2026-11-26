import {esc,icon,link,localDay} from './ui.js';
import {getLevel,getRank} from './gamification.js';
import {lessonCard} from './lessons.js';
export const avatar=(big=false)=>'<img class="avatar '+(big?'big':'')+'" src="./assets/characters/artist.svg" alt="Avatar họa sĩ">';
export const minutes=n=>Math.round(n/60);
export function dailyQuest(state, lessons, day=localDay()) {
  const first=lessons.find(l=>!state.progress[l.id]?.completed)??lessons[0];
  const weak=lessons.filter(l=>state.progress[l.id]?.completed && state.progress[l.id].score<8)
    .sort((a,b)=>state.progress[a.id].score-state.progress[b.id].score)[0];
  return state.quests?.[day]??{lesson:(weak??first).id,completed:false};
}
export function streak(sessions) {
  const days=new Set(sessions.map(s=>localDay(new Date(s.date))));
  const date=new Date();
  if(!days.has(localDay(date)))date.setDate(date.getDate()-1);
  let n=0;
  while(days.has(localDay(date))){n++;date.setDate(date.getDate()-1);}
  return n;
}
export function chart(sessions,length=7) {
  const totals={};
  for(const s of sessions){const key=localDay(new Date(s.date));totals[key]=(totals[key]??0)+s.seconds;}
  const list=Array.from({length},(_,i)=>{
    const d=new Date();d.setDate(d.getDate()-length+1+i);
    return {d,n:totals[localDay(d)]??0};
  });
  const max=Math.max(60,...list.map(x=>x.n));
  return '<div class="chart" role="img" aria-label="Thời gian luyện tập theo ngày">'+list.map(({d,n},i)=>'<div class="bar-col" title="'+localDay(d)+' · '+minutes(n)+' phút"><span class="bar" style="height:'+Math.max(2,n/max*85)+'%"></span><small>'+(length<=7?new Intl.DateTimeFormat('vi',{weekday:'short'}).format(d):i%7===0?d.getDate():'')+'</small></div>').join('')+'</div>';
}
export function dashboard(root,{state,lessons}) {
  const current=lessons.find(l=>!state.progress[l.id]?.completed)??lessons[0];
  const done=Object.values(state.progress).filter(x=>x.completed).length;
  const daily=dailyQuest(state,lessons);
  const target=lessons.find(l=>l.id===daily.lesson)??current;
  const {level,xp,max}=getLevel(state.events);
  const total=minutes(state.sessions.reduce((sum,s)=>sum+s.seconds,0));
  const artwork=state.artworks.at(-1);
  const progress=Math.round(done/lessons.length*100);
  const quest=(sym,title,detail,route)=>'<div class="quest"><span class="tile-icon">'+icon(sym)+'</span><div><a href="#'+route+'">'+esc(title)+'</a><small>'+esc(detail)+'</small></div></div>';
  root.innerHTML='<div class="welcome"><p class="eyebrow">✦ &nbsp; Studio của tôi</p><h1>Chào '+esc(state.name)+'!</h1><p class="muted">Hôm nay bạn muốn vẽ gì?</p></div>'+
    '<div class="dashboard"><div class="stack">'+
    '<section class="hero"><div><p class="eyebrow">From Beginner to Concept Artist</p><h2>Mỗi nét vẽ,<br>một bước tiến.</h2><p>Tiếp tục với '+esc(current.title)+' hoặc mở bàn vẽ để bắt đầu buổi luyện tập.</p><div class="row">'+link('lesson/'+current.id,'Tiếp tục học','button','arrow')+link('practice','Bắt đầu vẽ','primary button','pen')+'</div></div></section>'+
    '<section><div class="section-head"><h2>Tiến độ học tập</h2><a href="#analytics">Xem thống kê →</a></div><div class="stats">'+
    [['flame',streak(state.sessions)+' ngày','Chuỗi luyện tập'],['clock',total+' phút','Thời gian luyện'],['book',done+'/'+lessons.length,'Bài học hoàn thành'],['image',state.artworks.length,'Tác phẩm']].map(([i,v,t])=>'<div class="panel stat"><span class="tile-icon">'+icon(i)+'</span><b>'+v+'</b><small>'+t+'</small></div>').join('')+'</div></section>'+
    '<section><div class="section-head"><h2>Bài học gợi ý</h2><a href="#learn">Xem lộ trình →</a></div><div class="route-grid">'+lessons.filter(l=>!state.progress[l.id]?.completed).slice(0,3).map(l=>lessonCard(l,state)).join('')+'</div></section></div>'+
    '<div class="stack"><section class="panel"><p class="eyebrow">Hồ sơ họa sĩ</p><div class="profile-line">'+avatar(true)+'<div><p>'+esc(state.name)+'</p><small>'+getRank(state)+'</small></div></div><div class="level-label"><strong>Level '+level+'</strong><span>'+xp+' / '+max+' EXP</span></div><progress aria-label="EXP" value="'+xp+'" max="'+max+'"></progress><hr><div class="level-label"><strong>Mục tiêu học tập</strong><span>'+progress+'%</span></div><progress aria-label="Tiến độ chương trình" value="'+progress+'" max="100"></progress></section>'+
    '<section class="panel"><div class="section-head"><h2>Nhiệm vụ hôm nay</h2>'+icon('target')+'</div>'+quest('pen',target.title,daily.completed?'✓ Hoàn thành · +50 EXP':target.exercises.reference,'practice/'+target.id)+'<small class="muted">Lưu bài vẽ và xác nhận checklist trong bài học.</small></section>'+
    '<section class="panel"><div class="section-head"><h2>7 ngày luyện tập</h2>'+icon('calendar')+'</div>'+chart(state.sessions)+'</section>'+
    '<section class="panel"><div class="section-head"><h2>Tác phẩm gần nhất</h2><a href="#portfolio">Portfolio →</a></div>'+(artwork?link('art/'+artwork.id,artwork.title):'<p class="muted">Tác phẩm bạn lưu từ bàn vẽ sẽ xuất hiện ở đây.</p>')+'</section></div></div>';
}
