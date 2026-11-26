import {$,esc,icon,empty,notify} from './ui.js';
import {openDatabase,read,change} from './database.js';
import {newState} from './gamification.js';
import {dashboard,avatar,streak} from './dashboard.js';
import {learn,lesson} from './lessons.js';
import {practice} from './practice.js';
import {references,reference} from './references.js';
import {portfolio,art,compare} from './portfolio.js';
import {profile,skills,analytics,review,training,mistakes,assessment,anatomy,characters,concept} from './growth.js';
import {projects,project} from './projects.js';
import {perspective} from './perspective.js';
import {color} from './color.js';
import {sprite} from './sprite-preview.js';
import {importer} from './importer.js';

const routes={home:dashboard,learn,lesson,practice,references,reference,portfolio,art,compare,profile,skills,analytics,review,training,mistakes,assessment,anatomy,characters,concept,projects,project,perspective,color,sprite,import:importer};
const primary=[['home','Studio của tôi','home'],['learn','Lộ trình học','book'],['practice','Bàn vẽ','pen'],['portfolio','Portfolio','image'],['profile','Hồ sơ','person']];
const groups=[
 ['Học viện',primary.slice(0,3).concat([['skills','Cây kỹ năng','tree'],['review','Sổ ôn tập','clock']])],
 ['Xưởng thực hành',[['anatomy','Giải phẫu','person'],['perspective','Phối cảnh','cube'],['color','Màu & ánh sáng','palette'],['characters','Thiết kế nhân vật','star'],['concept','Concept & Game Art','cube'],['references','Kho tham chiếu','folder']]],
 ['Hành trình của tôi',[primary[3],['projects','Dự án','folder'],['analytics','Thống kê','chart'],['training','Lịch luyện tập','calendar']]]
];
const labels=Object.fromEntries([...groups.flatMap(([,g])=>g),primary[4]].map(([k,t])=>[k,t]));
const aliases={art:'portfolio',compare:'portfolio',mistakes:'portfolio',assessment:'portfolio',lesson:'learn',reference:'references',project:'projects',sprite:'concept',import:'profile'};
const root=$('#main');
let dispose,builtins,imported=[],queued=Promise.resolve(),serial=0;
const ctx={
  state:newState(),lessons:[],
  refresh:()=>navigate(false),
  toggleTheme(){
    const next=document.documentElement.dataset.theme==='dark'?'light':'dark';
    document.documentElement.dataset.theme=next;
    try{localStorage.setItem('theme',next);}catch{}
  },
  async update(fn){
    ctx.state=await change('state',previous=>fn(previous??newState()));
    return ctx.state;
  },
  async importLessons(lessons){
    imported=await change('curriculum',prev=>[...new Map([...(prev??[]),...lessons].map(l=>[l.id,l])).values()]);
    mergeLessons();
  }
};
function mergeLessons(){ctx.lessons=[...new Map([...builtins,...imported].map(l=>[l.id,l])).values()];}
function nav(route){
  const active=aliases[route]??route;
  const item=([r,t,i],mobile=false)=>{
    const activeItem=active===r||(mobile&&r==='learn'&&['skills','review','anatomy','perspective','color','characters','concept'].includes(active))||(mobile&&r==='practice'&&active==='references');
    return '<a href="#'+r+'" class="nav-link '+(activeItem?'active':'')+'" '+(activeItem?'aria-current="page"':'')+'>'+icon(i)+t+'</a>';
  };
  $('#sidebar').innerHTML='<a class="brand" href="#home"><img src="./assets/icons/academy.svg" alt=""><span><strong>Dz-Drawing</strong><small>ACADEMY</small></span></a><nav aria-label="Học viện">'+groups.map(([t,g])=>'<p class="nav-title">'+t+'</p>'+g.map(x=>item(x)).join('')).join('')+'</nav><div class="sidebar-foot">'+item(primary[4])+'</div>';
  $('#mobile').innerHTML=primary.map(x=>item(x,true)).join('');
  $('#topbar').innerHTML='<div class="crumb"><span class="muted">Học viện</span><span aria-hidden="true">/</span><strong>'+esc(labels[active]??'Studio')+'</strong></div><div class="top-actions"><span class="muted" title="Chuỗi luyện tập">'+icon('flame')+' '+streak(ctx.state.sessions)+'</span><button id="theme" aria-label="Đổi giao diện sáng tối">'+icon('moon')+'</button><a href="#profile" aria-label="Hồ sơ">'+avatar()+'</a></div>';
  $('#theme').onclick=ctx.toggleTheme;
}
function navigate(scroll=true){
  const ticket=++serial;
  queued=queued.catch(()=>{}).then(async()=>{
    if(ticket!==serial)return;
    dispose?.();dispose=null;
    let [route,id='']=location.hash.slice(1).split('/');
    route=Object.hasOwn(routes,route)?route:'home';
    try{
      nav(route);
      dispose=await routes[route](root,ctx,decodeURIComponent(id));
      if(scroll){window.scrollTo(0,0);root.focus({preventScroll:true});}
    }catch(error){
      console.error(error);root.innerHTML=empty('Không mở được nội dung này. Hãy thử tải lại trang.');
    }finally{root.setAttribute('aria-busy','false');}
  });
}
window.addEventListener('unhandledrejection',e=>{notify('Không thể hoàn tất thao tác. Vui lòng thử lại.');console.error(e.reason);});
try {
  try{document.documentElement.dataset.theme=localStorage.getItem('theme')??'light';}catch{}
  const [response]=await Promise.all([fetch('./data/lessons.json'),openDatabase()]);
  if(!response.ok)throw Error('Không tải được chương trình học.');
  [builtins,imported,ctx.state]=await Promise.all([response.json(),read('curriculum').then(x=>x??[]),read('state').then(x=>x??newState())]);
  mergeLessons();
  window.addEventListener('hashchange',()=>navigate());
  navigate();
  if('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(error=>console.warn('Service Worker',error));
} catch(error){
  console.error(error);root.setAttribute('aria-busy','false');root.innerHTML=empty('Không khởi động được học viện. Hãy mở trang qua HTTP và cho phép lưu dữ liệu.');
}
