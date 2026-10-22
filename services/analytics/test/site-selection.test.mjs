import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const script=readFileSync(new URL('../dashboard.js',import.meta.url),'utf8');
const sites=[
 {siteId:'fixture-practice',name:'AI v práci',domain:'stratos.example',available:false},
 {siteId:'fixture-kosik',name:'Živý košík',domain:'stratos.example',available:false},
 {siteId:'fixture-other',name:'Other site',domain:'other.example',available:false}
];
function fixture(){
 const elements=new Map();
 const element=()=>({value:'',textContent:'',children:[],options:[],hidden:false,append(...items){this.children.push(...items);this.options=this.children;},replaceChildren(...items){this.children=[];this.append(...items);},scrollIntoView(){this.scrolled=true;},focus(){this.focused=true;}});
 const get=id=>{if(!elements.has(id))elements.set(id,element());return elements.get(id);};
 const context={data:{sites},detail:null,$:get,node:(tag,cls,text)=>({...element(),textContent:text??''}),t:key=>key,state:()=>['unavailable'],matchMedia:()=>({matches:true}),Date};
 vm.runInNewContext(script.slice(script.indexOf('const siteKey='),script.indexOf('function render(){')),context);
 vm.runInNewContext(script.slice(script.indexOf('function renderDetail(){'),script.indexOf("$('login-form').addEventListener")),context);
 return {context,get};
}

test('cards on the same hostname select different application details in either direction',()=>{
 const {context,get}=fixture();
 for(const index of [1,0,2,1]){
  context.choose(sites[index].siteId);
  assert.equal(get('detail-name').textContent,sites[index].name);
  assert.equal(get('detail-filter').value,sites[index].siteId);
  assert.equal(get('details').hidden,false);
  assert.equal(get('detail-name').focused,true);
 }
});

test('both selectors keep independent identities and preserve the selected application on refresh',()=>{
 const {context,get}=fixture();
 for(const all of [true,false]){
  const select=get('select-'+all);select.value=sites[1].siteId;
  context.options(select,sites,all);
  assert.deepEqual(Array.from(select.options,o=>o.value),[...(all?['all']:[]),...sites.map(site=>site.siteId)]);
  assert.equal(select.value,sites[1].siteId);
  context.options(select,[...sites].reverse(),all);
  assert.equal(select.value,sites[1].siteId);
 }
});

test('an unknown application cannot silently open another application on its hostname',()=>{
 const {context,get}=fixture();
 context.detail='nonexistent';context.renderDetail();assert.equal(get('details').hidden,true);
});
