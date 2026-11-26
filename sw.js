const CACHE='dz-academy-shell-v2';
const FILES=['./','./index.html','./manifest.json','./css/style.css','./css/responsive.css','./assets/studio.png','./assets/icons/academy.svg','./assets/icons/academy-192.png','./assets/icons/academy-512.png','./assets/characters/artist.svg','./data/lessons.json','./data/lesson-template.json',...['app','ui','database','gamification','dashboard','lessons','canvas','timer','practice','references','portfolio','growth','projects','perspective','color','sprite-preview','importer','zip'].map(name=>'./js/'+name+'.js')];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES))));
self.addEventListener('activate',event=>event.waitUntil(Promise.all([
  caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('dz-academy-shell-')&&k!==CACHE).map(k=>caches.delete(k)))),
  self.clients.claim()
])));
self.addEventListener('fetch',event=>{
  const req=event.request,url=new URL(req.url);
  if(req.method!=='GET'||url.origin!==self.location.origin||!url.href.startsWith(self.registration.scope))return;
  event.respondWith((async()=>{
    const cache=await caches.open(CACHE);
    if(req.mode==='navigate')return (await cache.match('./index.html'))??fetch(req);
    return (await cache.match(req))??fetch(req);
  })());
});
