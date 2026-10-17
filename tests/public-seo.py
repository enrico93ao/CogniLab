"""Static SEO and crawl graph checks; does not claim Google indexing or visual QA."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlparse, unquote
import json, re, xml.etree.ElementTree as ET
root=Path(__file__).resolve().parents[1]
base='https://enrico93ao.github.io/CogniLab/'
class Page(HTMLParser):
 def __init__(self,path):
  super().__init__(convert_charrefs=True);self.path=path;self.ids=[];self.links=[];self.meta={};self.canonical=[];self.h1=0;self.catalog=[];self.scripts=[];self.script=None;self.script_text='';self.text=[];self.skip=0;self.feed(path.read_text())
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if 'id' in a:self.ids.append(a['id'])
  if tag=='a' and 'href' in a:self.links.append(a['href'])
  if tag=='h1':self.h1+=1
  if tag=='meta':self.meta[a.get('name',a.get('property'))]=a.get('content')
  if tag=='link' and a.get('rel')=='canonical':self.canonical.append(a['href'])
  if tag=='article' and 'data-exercise' in a:self.catalog.append((a.get('id'),a.get('data-area')))
  if tag=='script':self.script=a;self.script_text=''
  if tag in ('script','style'):self.skip+=1
 def handle_data(self,data):
  if self.script is not None:self.script_text+=data
  if not self.skip:self.text.append(data)
 def handle_endtag(self,tag):
  if tag=='script' and self.script is not None:self.scripts.append((self.script,self.script_text));self.script=None
  if tag in ('script','style'):self.skip-=1
sitemap=ET.parse(root/'sitemap.xml').getroot()
assert sitemap.tag=='{http://www.sitemaps.org/schemas/sitemap/0.9}urlset'
urls=[node.text for node in sitemap.findall('{*}url/{*}loc')]
assert len(urls)==len(set(urls))==19,urls
assert urls[0]==base
assert not any(unquote(url.removeprefix(base)) in ['accesso.html','esercizi.html','esercizio.html','Lista della spesa.html','gestisci-tester.html','riepilogo.html'] for url in urls)
public_files={url.removeprefix(base) or 'index.html' for url in urls}
pages={name:Page(root/name) for name in public_files}
descriptions=set();titles=set()
for name,p in pages.items():
 title=re.search(r'<title>(.*?)</title>',p.path.read_text(),re.S).group(1)
 assert title not in titles,('duplicate title',name)
 titles.add(title)
 assert len(p.ids)==len(set(p.ids)),('duplicate ids',name)
 assert p.h1==1,(name,p.h1)
 assert p.meta.get('robots')=='index,follow',name
 assert 80<=len(p.meta.get('description',''))<=230,(name,p.meta.get('description'))
 assert p.meta['description'] not in descriptions,('duplicate description',name)
 descriptions.add(p.meta['description'])
 expected=base if name=='index.html' else base+name
 assert p.canonical==[expected],(name,p.canonical)
 assert p.meta.get('og:url')==expected,name
 structured=[json.loads(text) for attrs,text in p.scripts if attrs.get('type')=='application/ld+json']
 assert structured,(name,'missing JSON-LD')
 for href in p.links:
  u=urlparse(href)
  if u.scheme or u.netloc:continue
  target=unquote(u.path) or name
  assert (root/target).is_file(),(name,'broken link',href)
  if u.fragment and target in pages:assert u.fragment in pages[target].ids,(name,'broken fragment',href)
 if name!='index.html':
  source=(root/name).read_text()
  assert 'firebasejs' not in source and 'gym-gate' not in source and 'exercise-runtime' not in source,name
  assert len(' '.join(p.text).split())>200,(name,'thin text')
  assert any(attrs.get('type')=='application/ld+json' and 'BreadcrumbList' in text for attrs,text in p.scripts),name
# Every indexable page is reachable through ordinary href links from home without JavaScript.
seen=set();queue=['index.html']
while queue:
 name=queue.pop()
 if name in seen:continue
 seen.add(name)
 for href in pages[name].links:
  path=unquote(urlparse(href).path)
  if path in public_files and path not in seen:queue.append(path)
assert seen==public_files,('orphan public pages',public_files-seen)
model=(root/'shared/exercise-catalog.mjs').read_text();exercises=json.loads(model.split('export const exercises=')[1].split(';\n')[0]);ids={e['id'] for e in exercises}
catalog=pages['index.html'];assert len(catalog.catalog)==38
assert {item[0] for item in catalog.catalog}==ids
areas=[p for name,p in pages.items() if name.startswith('esercizi-')]
category_ids=[id for p in areas for id in p.ids if id in ids]
assert len(category_ids)==38 and set(category_ids)==ids
for name in ['esercizi.html','esercizio.html','Lista della spesa.html']:
 assert Page(root/name).meta['robots']=='noindex,follow',name
assert pages['index.html'].meta['google-site-verification']=='bEkxlHc3_DURFJVy0Xt7UZ7wFnCF1w1vWFB7Qd3uOTo'
assert 'http-equiv="refresh"' in (root/'catalogo-esercizi.html').read_text()
print('PASS: 19 canonical public URLs, unique metadata, valid JSON-LD, 38 exercise cards, native links and fragments, no orphan pages, no Firebase dependency on new pages, private entry points noindex; verification token retained.')
