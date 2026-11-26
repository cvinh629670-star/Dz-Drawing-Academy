import {heading,esc,$,download,notify,link} from './ui.js';
import {entries,write} from './database.js';
import {pack,unpack} from './zip.js';
const idOk=s=>typeof s==='string'&&/^[a-zA-Z0-9][a-zA-Z0-9_-]{0,90}$/.test(s)&&!['constructor','prototype'].includes(s);
const str=s=>typeof s==='string'&&s.trim().length>0;
const strings=a=>Array.isArray(a)&&a.every(str);
export function validateCurriculum(input,existing=[]){
  if(input?.schemaVersion!==1||!Array.isArray(input.lessons)||!input.lessons.length)throw Error('Cần schemaVersion 1 và danh sách lessons.');
  const declared=input.skills??[];
  if(!Array.isArray(declared)||declared.some(s=>!idOk(s?.id))||new Set(declared.map(s=>s.id)).size!==declared.length)throw Error('Danh sách kỹ năng không hợp lệ hoặc trùng ID.');
  const ids=new Set(),skills=new Set([...existing.flatMap(l=>l.skillIds),...declared.map(s=>s.id),...input.lessons.map(l=>l?.id).filter(idOk)]);
  for(const l of input.lessons){
    if(!l||!idOk(l.id)||ids.has(l.id))throw Error('ID thiếu, không hợp lệ hoặc trùng lặp.');
    ids.add(l.id);
    if(!['title','categoryId','chapterId','difficulty','coreTheory'].every(k=>str(l[k]))||
    !['objectives','prerequisites','illustrations','steps','commonMistakes','assessmentRubric','skillIds','references','nextLessonIds'].every(k=>strings(l[k]))||
    !l.objectives.length||!l.steps.length||!l.assessmentRubric.length||!l.skillIds.length||
    !['correct','incorrect'].every(k=>str(l.examples?.[k]))||!['warmup','reference','independent'].every(k=>str(l.exercises?.[k]))||
    !Array.isArray(l.flashcards)||!l.flashcards.every(f=>str(f?.question)&&str(f?.answer))||!Number.isFinite(l.estimatedMinutes)||l.estimatedMinutes<1)throw Error('Thiếu hoặc sai trường trong bài '+l.id+'.');
    if(l.skillIds.some(k=>!idOk(k)||(!skills.has(k)&&k!==l.id)))throw Error('Kỹ năng không tồn tại trong bài '+l.id+'.');
  }
  const all=new Set([...ids,...existing.map(l=>l.id)]);
  for(const l of input.lessons)if([...l.nextLessonIds,...l.prerequisites].some(k=>!all.has(k)))throw Error('Liên kết bài học không tồn tại trong '+l.id+'.');
  return input.lessons;
}
async function loadCurriculum(file,existing){
  const zipped=file.name.toLowerCase().endsWith('.zip');
  const files=zipped?await unpack(file):new Map();
  const json=zipped?(files.get('curriculum.json')??files.get('lessons.json')):file;
  if(!json)throw Error('ZIP cần có curriculum.json ở thư mục gốc.');
  const data=JSON.parse(await json.text());
  if(!Array.isArray(data?.lessons))throw Error('Thiếu danh sách lessons.');
  for(const l of data.lessons){
    if(!l||typeof l!=='object')throw Error('Bài học không hợp lệ.');
    delete l.media;
    if(l.coreTheoryMarkdown!==undefined){
      const markdown=files.get(l.coreTheoryMarkdown);
      if(typeof l.coreTheoryMarkdown!=='string'||!l.coreTheoryMarkdown.endsWith('.md')||!markdown)throw Error('Thiếu tệp Markdown của bài '+l.id+'.');
      l.coreTheory=await markdown.text();
    }
    if(!zipped||!strings(l.illustrations))continue;
    const types={png:'image/png',jpg:'image/jpeg',jpeg:'image/jpeg',webp:'image/webp',gif:'image/gif'};
    l.media=[];
    for(const [i,path] of l.illustrations.entries()){
      const image=files.get(path),type=types[path.split('.').at(-1).toLowerCase()];
      if(!image||!type)throw Error('Thiếu hình minh họa hoặc định dạng ảnh chưa hỗ trợ: '+path);
      const blob=new Blob([image],{type});
      try{const bitmap=await createImageBitmap(blob);bitmap.close();}
      catch{throw Error('Hình minh họa bị lỗi: '+path);}
      l.media.push({id:l.id+'-'+i,name:path,blob});
    }
  }
  return validateCurriculum(data,existing);
}
async function encode(value,files){
  if(value instanceof Blob){const path='blobs/'+files.length;files.push([path,value]);return {blobPath:path,mime:value.type};}
  if(Array.isArray(value))return Promise.all(value.map(v=>encode(v,files)));
  if(value&&typeof value==='object')return Object.fromEntries(await Promise.all(Object.entries(value).map(async ([k,v])=>[k,await encode(v,files)])));
  return value;
}
function decode(value,files){
  if(Array.isArray(value))return value.map(v=>decode(v,files));
  if(value&&typeof value==='object'){
    if(Object.hasOwn(value,'blobPath')){
      const blob=files.get(value.blobPath);if(!blob)throw Error('Thiếu dữ liệu ảnh '+value.blobPath);
      return new Blob([blob],{type:value.mime});
    }
    return Object.fromEntries(Object.entries(value).map(([k,v])=>[k,decode(v,files)]));
  }
  return value;
}
export async function backup(){
  const files=[];
  const records=await encode(await entries(),files);
  const data=JSON.stringify({schemaVersion:1,kind:'dz-backup',records});
  if(files.length)download(await pack([['backup.json',data],...files]),'dz-backup.zip');
  else download(data,'dz-backup.json');
}
export async function restore(file,existing){
  const files=file.name.toLowerCase().endsWith('.zip')?await unpack(file):new Map([['backup.json',file]]);
  if(!files.has('backup.json'))throw Error('Không tìm thấy backup.json.');
  const b=JSON.parse(await files.get('backup.json').text());
  if(b?.kind!=='dz-backup'||b.schemaVersion!==1||!Array.isArray(b.records))throw Error('Bản sao lưu sai định dạng.');
  const records=decode(b.records,files),ids=new Set();
  for(const row of records){
    if(!Array.isArray(row)||row.length!==2)throw Error('Bản ghi sai định dạng.');
    const [k,v]=row;
    if(typeof k!=='string'||ids.has(k)||!v||typeof v!=='object'||!(/^(state|curriculum|draft:[a-zA-Z0-9_-]+)$/.test(k)))throw Error('Bản ghi không hợp lệ.');
    ids.add(k);
    if(k==='state'){
      if(!str(v.name)||!['references','artworks','sessions','projects','palettes','challenges','mistakes'].every(p=>Array.isArray(v[p]))||!['progress','events','reviews'].every(p=>v[p]&&typeof v[p]==='object'&&!Array.isArray(v[p])))throw Error('Hồ sơ trong bản sao lưu không hợp lệ.');
      for(const a of [...v.references,...v.artworks])if(!idOk(a?.id)||!(a.blob instanceof Blob)||!str(a.title))throw Error('Ảnh trong bản sao lưu không hợp lệ.');
      if(v.palettes.some(p=>!Array.isArray(p)||p.some(c=>typeof c!=='string'|| !/^(#[a-f\d]{6}|hsl\(\d{1,3} \d{1,3}% \d{1,3}%\))$/i.test(c))))throw Error('Bảng màu sao lưu không hợp lệ.');
      if(Object.values(v.events).some(n=>!Number.isFinite(n)||n<0||n>10000))throw Error('Sự kiện EXP không hợp lệ.');
      if(v.sessions.some(s=>!Number.isFinite(s?.date)||!Number.isFinite(s.seconds)||s.seconds<0)||
         v.projects.some(p=>!idOk(p?.id)||!str(p.title)||!Array.isArray(p.tasks)||p.tasks.some(t=>!str(t?.title))||!Array.isArray(p.versions)||!p.versions.every(idOk))||
         v.mistakes.some(m=>!str(m?.text))||v.challenges.some(c=>!str(c?.text))||
         Object.values(v.progress).some(p=>!p||typeof p!=='object'||(p.score!==undefined&&(!Number.isFinite(p.score)||p.score<0||p.score>10)))||
         v.artworks.some(a=>a.rubric&&(!Array.isArray(a.rubric.rows)||a.rubric.rows.some(r=>!r||(r.score!==null&&!Number.isFinite(r.score))||!Number.isFinite(r.weight))))||
         (v.training&&(!Number.isFinite(v.training.total)||!Array.isArray(v.training.ratios)||v.training.ratios.length!==5||!v.training.ratios.every(Number.isFinite))))throw Error('Dữ liệu tiến độ hoặc dự án không hợp lệ.');
    }
    if(k==='curriculum'){
      if(!Array.isArray(v))throw Error('Chương trình học không hợp lệ.');
      if(v.length)validateCurriculum({schemaVersion:1,lessons:v,skills:[...new Set(v.flatMap(l=>l?.skillIds??[]))].map(id=>({id}))},existing);
      if(v.some(l=>l.media&&(!Array.isArray(l.media)||l.media.some(m=>!(m?.blob instanceof Blob)))))throw Error('Hình minh họa không hợp lệ.');
    }
    if(k.startsWith('draft:')&&(!Array.isArray(v.strokes)||!v.layers||!/^#[a-f\d]{6}$/i.test(v.background)||
      ['background','reference','sketch','drawing'].some(k=>!Number.isFinite(v.layers[k]?.opacity))||
      v.strokes.some(s=>!['drawing','sketch'].includes(s?.layer)||!Array.isArray(s.points)||s.points.some(p=>![p?.x,p?.y,p?.p].every(Number.isFinite)))))throw Error('Bản nháp trong bản sao lưu không hợp lệ.');
  }
  if(confirm('Khôi phục sẽ ghi đè toàn bộ dữ liệu hiện tại. Tiếp tục?')){await write(records,true);location.reload();}
}
export function importer(root,ctx){
  root.innerHTML=heading('Nhập chương trình học','Kiểm tra tệp, xem trước các bài và cập nhật theo ID.')+
    '<section class="panel stack"><div class="row"><a class="button" href="./data/lesson-template.json" download>Tải JSON mẫu</a>'+link('profile','Quay lại hồ sơ')+'</div>'+
    '<label class="field">Tệp chương trình JSON hoặc ZIP<input id="import-file" type="file" accept=".json,.zip"></label><div id="import-preview"></div><label class="inline-check"><input type="checkbox" id="update-existing"> Cập nhật bài có cùng ID</label><button id="do-import" class="primary" disabled>Nhập chương trình</button></section>';
  const q=s=>$(s,root);
  let pending=[];
  q('#import-file').onchange=async e=>{
    pending=[];q('#do-import').disabled=true;
    const file=e.target.files[0];if(!file)return;
    try{
      pending=await loadCurriculum(file,ctx.lessons);
      q('#import-preview').innerHTML='<ul>'+pending.map(l=>'<li>'+esc(l.title)+' · '+(ctx.lessons.some(x=>x.id===l.id)?'Cập nhật':'Thêm mới')+'</li>').join('')+'</ul>';
      q('#do-import').disabled=false;
    }catch(error){q('#import-preview').innerHTML='<p class="error">'+esc(error.message)+'</p>';}
  };
  q('#do-import').onclick=async()=>{
    const chosen=pending.filter(l=>q('#update-existing').checked||!ctx.lessons.some(x=>x.id===l.id));
    if(!chosen.length){notify('Không có bài mới để nhập.');return;}
    try{await ctx.importLessons(chosen);notify('Đã nhập '+chosen.length+' bài học.');location.hash='learn';}
    catch(error){notify(error.message);}
  };
}
