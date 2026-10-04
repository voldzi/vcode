const DAY=86400000;
const calendar=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Prague',year:'numeric',month:'2-digit',day:'2-digit'});
export const dateKey=value=>calendar.format(new Date(value));
export function periodWindow(days,now=Date.now()) {
 if(![7,30,90].includes(days))throw Object.assign(new Error('Invalid period'),{status:400});
 return {days,startAt:now-days*DAY,endAt:now,timezone:'Europe/Prague',comparison:'previous-equal-duration'};
}
export function dailySeries(raw,window,since=null) {
 const rows=new Map();
 for(const row of raw?.pageviews??[]) {
  const key=String(row.x??'').slice(0,10),count=Number(row.y);
  if(/^\d{4}-\d{2}-\d{2}$/.test(key)&&Number.isFinite(count)&&count>=0)rows.set(key,(rows.get(key)??0)+count);
 }
 const first=dateKey(window.startAt),last=dateKey(window.endAt);
 const cutoff=since&&Number.isFinite(Date.parse(since))?dateKey(since):null;
 const result=[];
 for(let day=Date.parse(first+'T12:00:00Z');day<=Date.parse(last+'T12:00:00Z');day+=DAY) {
  const date=new Date(day).toISOString().slice(0,10);
  result.push({date,pageviews:cutoff&&date<cutoff?null:(rows.get(date)??0)});
 }
 return result;
}
