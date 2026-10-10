import urllib.request,urllib.error,urllib.robotparser,xml.etree.ElementTree as ET,json,concurrent.futures,sys,datetime
from html.parser import HTMLParser
O='https://vcode.zeleznalady.cz'
def get(url,ua='VCode-Discovery-Audit/1.0'):
 q=urllib.request.Request(url,headers={'User-Agent':ua,'DNT':'1','Sec-GPC':'1'})
 with urllib.request.urlopen(q,timeout=25) as r:return r.status,r.headers,r.read().decode('utf-8', errors='replace')
urls=set();pending=[O+'/sitemap-index.xml',O+'/blog-sitemap.xml'];seen=set()
while pending:
 u=pending.pop()
 if u in seen:continue
 seen.add(u);_,_,b=get(u);root=ET.fromstring(b)
 for loc in root.findall('.//{*}loc'):
  if root.tag.endswith('sitemapindex'):pending.append(loc.text)
  else:urls.add(loc.text)
class Page(HTMLParser):
 def __init__(self):super().__init__();self.canonical=[];self.alts={};self.h1=0;self.description=[];self.title='';self.in_title=False;self.lang=None;self.noindex=False;self.schemas=[];self.in_schema=False;self.buf=''
 def handle_starttag(self,t,a):
  d=dict(a)
  if t=='html':self.lang=d.get('lang')
  if t=='h1':self.h1+=1
  if t=='title':self.in_title=True
  if t=='meta' and d.get('name')=='description':self.description.append(d.get('content',''))
  if t=='meta' and d.get('name')=='robots':self.noindex='noindex' in d.get('content','')
  if t=='link' and d.get('rel')=='canonical':self.canonical.append(d.get('href'))
  if t=='link' and d.get('hreflang'):self.alts[d['hreflang']]=d.get('href')
  if t=='script' and d.get('type')=='application/ld+json':self.in_schema=True;self.buf=''
 def handle_data(self,d):
  if self.in_title:self.title+=d
  if self.in_schema:self.buf+=d
 def handle_endtag(self,t):
  if t=='title':self.in_title=False
  if t=='script' and self.in_schema:self.schemas.append(json.loads(self.buf));self.in_schema=False
def audit(u):
 try:
  s,h,b=get(u);p=Page();p.feed(b);issues=[]
  if p.canonical!=[u]:issues.append('canonical')
  if p.h1!=1:issues.append('h1')
  if len(p.description)!=1 or not p.description[0]:issues.append('description')
  if not p.title:issues.append('title')
  if p.noindex or 'noindex' in h.get('X-Robots-Tag',''):issues.append('noindex')
  if not all(k in p.alts for k in ['cs','en','x-default']):issues.append('hreflang')
  if any(x in u for x in ['/prehled/', '/internal/', '/preview-local/', '/review/']):issues.append('private route in sitemap')
  if 'max-image-preview:large' not in b:issues.append('image preview')
  if not p.schemas:issues.append('schema')
  return {'url':u,'issues':issues,'title':p.title,'description':p.description,'alternates':p.alts}
 except Exception as e:return {'url':u,'issues':[str(e)]}
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as e:rows=list(e.map(audit,sorted(urls)))
report={'verifiedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'urls':len(rows),'findings':[r for r in rows if r['issues']],'rows':rows,'crawlerProbes':[]}
robots=urllib.robotparser.RobotFileParser();robots.parse(get(O+'/robots.txt')[2].splitlines())
for ua in ['Googlebot','bingbot','SeznamBot','OAI-SearchBot','Claude-SearchBot','PerplexityBot']:
 try:s,h,b=get(O+'/aplikace/studio-balance/',ua);report['crawlerProbes'].append({'agent':ua,'status':s,'containsPublicText':'Studio Balance' in b,'robotsAllowsPublic':robots.can_fetch(ua,O+'/aplikace/studio-balance/'),'robotsExcludesPrivate':not robots.can_fetch(ua,O+'/prehled/')})
 except Exception as e:report['crawlerProbes'].append({'agent':ua,'error':str(e)})
by_url={row['url']:row for row in rows}
for row in rows:
 for lang in ['cs','en','x-default']:
  alternate=row.get('alternates',{}).get(lang)
  if alternate not in by_url:row['issues'].append('missing public alternate destination: '+str(alternate))
  elif lang!='x-default' and row['url'] not in by_url[alternate].get('alternates',{}).values():row['issues'].append('nonreciprocal language alternate')
report['findings']=[row for row in rows if row['issues']]
for path in ['/health','/health/blog','/llms.txt','/vcode-social.png','/blog/feed.xml','/en/blog/feed.xml']:
 status,headers,body=get(O+path)
 assert status==200,path
for path in ['/this-page-does-not-exist-discovery-audit/','/preview-local/recall/cs/','/internal/','/prehled/api/summary']:
 try:
  status,_,_=get(O+path)
  raise AssertionError('Unexpected public response '+str(status)+' '+path)
 except urllib.error.HTTPError as error:assert error.code in [401,404],(path,error.code)
report['publicFeedsAndPrivateBoundaries']=True
if len(sys.argv)>1:
 with open(sys.argv[1],'w') as output:json.dump(report,output,ensure_ascii=False,indent=2)
print(json.dumps({key:value for key,value in report.items() if key not in ['rows','findings']},ensure_ascii=False))
if report['findings']:print(json.dumps([{'url':row['url'],'issues':row['issues']} for row in report['findings']],ensure_ascii=False))
assert not report['findings'],'Public metadata verification failed'
assert all(row.get('status')==200 and row.get('containsPublicText') and row.get('robotsAllowsPublic') and row.get('robotsExcludesPrivate') for row in report['crawlerProbes']),'Crawler probe failed'
