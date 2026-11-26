export const esc = (value = '') => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const icons = {
 home:'M3 10l9-7 9 7v10H3z M9 20v-6h6v6', book:'M3 5h6l3 3 3-3h6v14h-6l-3 2-3-2H3z M12 8v13', pen:'m4 20 1-5L17 3l4 4L9 19z M14 6l4 4', image:'M3 4h18v16H3z M3 17l6-6 4 4 3-3 5 5 M15 8h1', person:'M16 7a4 4 0 1 1-8 0 4 4 0 1 1 8 0 M4 21v-3c0-6 16-6 16 0v3', clock:'M22 12a10 10 0 1 1-20 0 10 10 0 1 1 20 0 M12 6v6l4 2', flame:'M13 2c1 6 7 6 7 13a8 8 0 0 1-16 0c0-4 3-6 5-8 0 4 3 5 4-5z', star:'m12 2 3 7 7 1-5 5 1 7-6-4-6 4 1-7-5-5 7-1z', tree:'M5 16h14 M12 7v9 M5 16v4 M19 16v4 M9 3h6v4H9z', folder:'M3 6h7l2 2h9v12H3z', chart:'M3 3v18h18 M7 17v-4 M12 17V9 M17 17V5', palette:'M12 3a9 9 0 1 0 0 18c3 0 0-4 3-4h2c7 0 5-14-5-14z M7 11h.1 M10 7h.1 M15 8h.1 M17 12h.1', cube:'m12 2 9 5v10l-9 5-9-5V7z M3 7l9 5 9-5 M12 12v10', target:'M22 12a10 10 0 1 1-20 0 10 10 0 1 1 20 0 M17 12a5 5 0 1 1-10 0 5 5 0 1 1 10 0 M12 12h.1', moon:'M20 15A8 8 0 0 1 9 4a9 9 0 1 0 11 11z', arrow:'M4 12h15m-6-6 6 6-6 6', calendar:'M3 5h18v16H3z M3 10h18 M7 3v4 M17 3v4', settings:'M4 7h16 M4 12h16 M4 17h16 M8 5v4 M15 10v4 M10 15v4'
};
export const icon = (id) => '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="'+(icons[id] ?? icons.star)+'"/></svg>';
export const heading = (title, text) => '<div class="heading"><h1>'+esc(title)+'</h1><p class="muted">'+esc(text)+'</p></div>';
export const empty = (copy) => '<p class="empty">'+esc(copy)+'</p>';
export const link = (route, label, cls='button', symbol='') => '<a class="'+cls+'" href="#'+esc(route)+'">'+(symbol?icon(symbol):'')+esc(label)+'</a>';
export const $ = (selector, root = document) => root.querySelector(selector);
let timeout;
export function notify(message) {
  $('#notice').textContent = message;
  clearTimeout(timeout);
  timeout = setTimeout(() => $('#notice').textContent='', 3300);
}
export function download(data,name,type='application/json') {
  const url = URL.createObjectURL(data instanceof Blob ? data : new Blob([data],{type}));
  const a = Object.assign(document.createElement('a'),{href:url,download:name});
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 30000);
}
export function useBlobs(root, records) {
  const urls = [];
  for (const img of root.querySelectorAll('[data-image]')) {
    const blob = records.find(r=>r.id===img.dataset.image)?.blob;
    if (blob instanceof Blob) {
      img.src = URL.createObjectURL(blob);
      urls.push(img.src);
    }
  }
  return () => urls.forEach(url => URL.revokeObjectURL(url));
}
export const localDay = (date = new Date()) => {
  const values = [date.getFullYear(), date.getMonth()+1, date.getDate()];
  return values.map(x=>String(x).padStart(2,'0')).join('-');
};
