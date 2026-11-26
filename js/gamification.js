export const newState = () => ({name:'Họa sĩ', progress:{}, events:{}, sessions:[], mistakes:[], reviews:{}, challenges:[], palettes:[], projects:[], references:[], artworks:[]});
export function award(state, event, points) {
  if (!Object.hasOwn(state.events,event)) state.events[event] = points;
  return state;
}
export function getLevel(events) {
  let xp = Object.values(events).reduce((sum,n)=>sum+n,0);
  let level = 1;
  while (xp >= Math.ceil(100 * level ** 1.5)) {
    xp -= Math.ceil(100 * level ** 1.5);
    level++;
  }
  return {level,xp,max:Math.ceil(100 * level ** 1.5)};
}
export function getRank(state) {
  const passed = Object.values(state.progress).filter(p=>p.completed && p.score>=7).length;
  const reviewed = state.artworks.filter(a=>a.score>=7).length;
  const thresholds = [[30,20,'S · Master Artist'],[24,12,'A · Concept Artist'],[16,8,'B · Designer'],[9,4,'C · Illustrator'],[5,2,'D · Apprentice'],[2,1,'E · Sketcher']];
  return thresholds.find(([p,r])=>passed>=p && reviewed>=r)?.[2] ?? 'F · Novice';
}
