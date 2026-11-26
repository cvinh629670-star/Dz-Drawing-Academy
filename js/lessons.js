import {esc, heading, link, empty, $,localDay,useBlobs} from './ui.js';
import {award} from './gamification.js';
import {dailyQuest} from './dashboard.js';
const art = {"line":"M85 35L250 50M85 78L250 88M85 121L250 117M85 157L250 146","curve":"M110 39Q38 98 110 153M230 30C334 80 140 113 230 156","ellipse":"M70 35h185v120H70zM70 95h185M162 35v120 M70 95a92 60 0 1 0 185 0 92 60 0 1 0-185 0","weight":"M70 38h110v115H70zM140 64h110v95H140z M140 64v89m0 0h40","shape":"M76 144h163M105 143v-52l45-32 53 32v52M125 89V53h52v34M150 32l23 21h-47z","cube":"M80 70l67-37 96 32-62 42zM80 70v68l101 22 62-41V65M181 107v53","sphere":"M86 95a74 74 0 1 0 148 0 74 74 0 1 0-148 0 M89 93Q161 162 232 93M98 64Q161 118 223 64M128 27Q196 92 170 168","cylinder":"M92 57a63 21 0 1 0 126 0 63 21 0 1 0-126 0 M92 57v82a63 21 0 1 0 126 0V57M155 27v141","observe":"M65 37h190M65 153h190M92 42l10 104h96l10-104z M208 57c65-10 53 72-7 65M144 45v100","negative":"M97 39h118v66H97zM97 105l-11 52m119-52 17 52M105 113h92l10 36H95z","compose":"M55 26h210v140H55z M125 26v140m70-140v140M55 73h210m-210 46h210M55 149l70-30 61 24 79-55","pers1":"M42 25h236v140H42zM42 25l118 70 118-70M42 165l118-70 118 70M107 63h106v64H107z","pers2":"M28 73h264M157 48v111M28 73l129-25 135 25-135 86z M92 60v55m132-54v55","pers3":"M160 11l-49 137 49 19 49-19zM32 77l128 90 128-90M32 77l128 1 128-1M160 78v89","foreshorten":"M74 111l78-48 57-16M83 145l87-32 58-38M74 111a23 18 0 1 0 9 34 23 18 0 1 0-9-34M152 63q30 13 18 50M209 47q24 3 19 28","gesture":"M170 27a14 14 0 1 0 28 0 14 14 0 1 0-28 0M181 43q-69 50-41 61l61 20 25 45M140 104l-35 51-39 8M158 56l-54 12-26-28m80 16 41 22 62-18","torso":"M105 40q47-27 94 7l-8 42-47 12-32-21zM127 124l57-21 31 19-23 41-57-4zM156 40q-27 60 17 106","head":"M104 84a57 57 0 1 1 112 15l-25 63-49-10-32-40zM168 32q44 41 22 130M106 91q54 21 109-1M129 51q-25 61 5 77","hand":"M107 146l-16-44-18-27 10-14 29 26 4-52 15-7 11 58 7-68 17 2 3 63 15-56 15 4-5 56 18-33 15 5-22 70-18 28h-62zM114 106q40-22 81-12","feet":"M116 37h41l-7 55 32 28 52 14 8 22H83l-6-19 26-42zM82 142l57-29 40 26 56 6","face":"M83 91a77 65 0 1 0 154 0 77 65 0 1 0-154 0M106 65l32-9m43 0 32 9M109 87q16-12 32 0m38 0q16-12 32 0M133 113q27 35 54 0z","value":"M54 60h212v80H54zM97 60v80m42-80v80m42-80v80m42-80v80","light":"M91 97a62 62 0 1 0 124 0 62 62 0 1 0-124 0M106 59q-7 103 103 60M191 151q64-18 86 0-60 27-104 8M63 34l25 20","color":"M161 23L88 153h146zM161 23a75 75 0 1 0 0 150 75 75 0 1 0 0-150M161 23v150M88 153l146-74M234 153 88 79","material":"M63 55q36-21 72 0v88q-36 21-72 0zM72 69q36 18 61 3M79 83q-7 25 1 56m14-56q15 17 2 39M181 55q36-21 72 0v88q-36 21-72 0zM194 56v87m8-87v87m30-87v87","silhouette":"M137 26h36v37l26 13 33 55-15 12-29-30-3 48h-22l-8-37-7 37h-24l-2-49-23 25-13-10 26-51 25-12z","costume":"M126 30l34 17 34-17 35 50-21 18-20-23 12 74h-80l12-74-20 23-21-18zM160 48v101M131 97h58","sheet":"M36 45h248M36 84h248m-248 30h248M36 153h248M75 31v124m85-124v124m85-124v124M62 55h26v30H62zm90 0h16v30h-16zm80 0h26v30h-26z","environment":"M42 30h236v126H42zM42 126l55-53 46 37 42-53 93 67M42 150l76-28 42 16 118-12m-98-20v38","prop":"M64 121l105-42 20-27 52-22 16 25-45 31-38 5-108 57zM159 84l13 24M193 56l28 23M87 115l8 22m13-29 8 22","creature":"M55 115q44-63 107-41l54 7 23-33 26 8-7 29-37 20-20 48h-20l9-48-53 4-16 45h-20l5-53zM230 63l-12-23m29 11 9-20","pixel":"M90 30h140v140H90zM110 30v140m20-140v140m20-140v140m20-140v140m20-140v140m20-140v140M90 50h140m-140 20h140m-140 20h140m-140 20h140m-140 20h140m-140 20h140M130 130V70h60v60z","sprite":"M30 157h260M60 40v46l22 27-23 44m1-71-20 34-10 30m30-75 31 26m69-61v46l-22 27 23 44m-1-71 20 34 10 30m-30-75-31 26m111-61v46l-11 28v43m11-71 16 35 24 15"};
export function diagram(id) {
  return '<svg class="lesson-art" viewBox="0 0 320 190" role="img" aria-label="Sơ đồ minh họa bài học"><path d="'+(art[id]??art.shape)+'" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/></svg>';
}
export function lessonCard(l, state) {
  return '<a class="panel route-card" href="#lesson/'+encodeURIComponent(l.id)+'">'+diagram(l.id)+'<div class="copy"><h3>'+esc(l.title)+'</h3><small>'+ (state.progress[l.id]?.completed?'✓ Đã hoàn thành': l.estimatedMinutes+' phút · '+esc(l.difficulty))+'</small></div></a>';
}
export function learn(root,ctx) {
  root.innerHTML=heading('Lộ trình học','Học nguyên tắc cốt lõi, thực hành trên bàn vẽ và tự đánh giá.')+
    '<div class="toolbar">'+[['anatomy','Giải phẫu'],['perspective','Phối cảnh'],['color','Màu & ánh sáng'],['characters','Thiết kế nhân vật'],['concept','Concept & Game Art'],['review','Ôn tập']].map(([r,t])=>link(r,t)).join('')+'</div>'+
    '<div class="stack">'+[...new Set(ctx.lessons.map(l=>l.categoryId))].map(cat=>'<section><div class="section-head"><h2>'+esc(cat)+'</h2></div><div class="route-grid">'+ctx.lessons.filter(l=>l.categoryId===cat).map(l=>lessonCard(l,ctx.state)).join('')+'</div></section>').join('')+
    '<section class="panel"><h2>Chưa khả dụng</h2><p class="muted">Giải phẫu cơ và xương nâng cao, worldbuilding chuyên sâu và giáo trình animation nâng cao.</p></section></div>';
}
export function lesson(root,ctx,id) {
  const l=ctx.lessons.find(x=>x.id===id);
  if(!l){ root.innerHTML=empty('Không tìm thấy bài học.'); return; }
  const p=ctx.state.progress[id]??{};
  const list=(items)=>'<ul>'+items.map(t=>'<li>'+esc(t)+'</li>').join('')+'</ul>';
  root.innerHTML=heading(l.title,l.categoryId+' · '+l.estimatedMinutes+' phút')+
    '<div class="split"><article class="panel lesson">'+diagram(id)+(l.media??[]).map(m=>'<img class="media" data-image="'+esc(m.id)+'" alt="'+esc(m.name)+'">').join('')+
    '<section><h2>Mục tiêu đầu ra</h2>'+list(l.objectives)+'</section><section><h2>Kiến thức tiên quyết</h2>'+
    (l.prerequisites.length?list(l.prerequisites.map(x=>ctx.lessons.find(z=>z.id===x)?.title??x)):'<p>Có thể bắt đầu trực tiếp.</p>')+
    '</section><section><h2>Kiến thức cốt lõi</h2><p style="white-space:pre-wrap">'+esc(l.coreTheory)+'</p></section><section><h2>Các bước thực hiện</h2><ol>'+l.steps.map(t=>'<li>'+esc(t)+'</li>').join('')+'</ol></section>'+
    '<section><h2>Ví dụ</h2><p>✓ '+esc(l.examples.correct)+'</p><p>✗ '+esc(l.examples.incorrect)+'</p></section>'+
    '<section><h2>Thực hành</h2>'+list(['Khởi động · '+l.exercises.warmup,'Theo mẫu · '+l.exercises.reference,'Tự vẽ · '+l.exercises.independent])+link('practice/'+encodeURIComponent(id),'Mở bàn vẽ','primary button','pen')+'</section>'+
    '<section><h2>Lỗi thường gặp</h2>'+list(l.commonMistakes)+'</section><section><h2>Lịch ôn tập</h2><p>Ôn lại vào ngày 1, 3, 7, 14, 30 và 60 sau khi hoàn thành.</p>'+link('review','Mở sổ ôn tập')+'</section>'+
    '<section><h2>Bài tiếp theo</h2>'+l.nextLessonIds.map(next=>link('lesson/'+encodeURIComponent(next),ctx.lessons.find(x=>x.id===next)?.title??next)).join(' ')+'</section></article>'+
    '<aside class="panel stack"><h2>Checklist và tự đánh giá</h2>'+
    '<button id="theory" '+(p.theory?'disabled':'')+'>'+(p.theory?'✓ Đã học lý thuyết':'Đã học lý thuyết · +10 EXP')+'</button>'+
    '<button id="warm" '+(p.warm?'disabled':'')+'>'+(p.warm?'✓ Đã khởi động':'Đã khởi động · +10 EXP')+'</button>'+
    '<form id="complete" class="list">'+l.assessmentRubric.map(t=>'<label class="inline-check"><input type="checkbox" required '+(p.completed?'checked':'')+'> '+esc(t)+'</label>').join('')+
    '<label class="field">Bài thực hành<select name="art" required><option value="">Chọn tác phẩm đã lưu</option>'+ctx.state.artworks.filter(a=>a.lesson===id).map(a=>'<option value="'+esc(a.id)+'" '+(p.art===a.id?'selected':'')+'>'+esc(a.title)+'</option>').join('')+'</select></label>'+
    '<label class="field">Điểm tự đánh giá (0–10)<input name="score" type="number" min="0" max="10" step=".1" required value="'+esc(p.score??'')+'"></label>'+
    '<button class="primary">'+(p.completed?'Cập nhật đánh giá':'Hoàn thành bài thực hành')+'</button></form></aside></div>';
  for (const [key,points] of [['theory',10],['warm',10]]) {
    $('#'+key,root).onclick=async()=>{await ctx.update(s=>{(s.progress[id]??={})[key]=true;return award(s,key+':'+id,points)});ctx.refresh()};
  }
  $('#complete',root).onsubmit=async e=>{
    e.preventDefault();
    const {score,art}=Object.fromEntries(new FormData(e.currentTarget));
    await ctx.update(s=>{
      const progress=s.progress[id]??={};
      const day=localDay(),quest=dailyQuest(s,ctx.lessons,day);
      if(!progress.completed) progress.completedAt=Date.now();
      Object.assign(progress,{completed:true,score:Number(score),art});
      const artwork=s.artworks.find(a=>a.id===art);
      if(artwork) artwork.score=Number(score);
      if(artwork && quest.lesson===id && !quest.completed && localDay(new Date(artwork.date))===day && !artwork.questDay){
        artwork.questDay=day;
        (s.quests??={})[day]={lesson:id,completed:true};
        award(s,'quest:'+day,50);
      }
      return award(s,'lesson:'+id,30);
    });
    ctx.refresh();
  };
  return useBlobs(root,l.media??[]);
}
