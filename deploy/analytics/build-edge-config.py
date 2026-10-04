"""Generate private exact-location Nginx includes from the server-side registry."""
import json, pathlib, re, sys
from urllib.parse import urlsplit
registry = pathlib.Path(sys.argv[1])
output = pathlib.Path(sys.argv[2])
upstream = sys.argv[3]
parsed = urlsplit(upstream)
assert parsed.scheme in ('http', 'https') and not parsed.username and not parsed.password
assert parsed.path == '' and not parsed.query and not parsed.fragment
assert parsed.hostname and re.fullmatch(r'[a-zA-Z0-9.-]+', parsed.hostname)
assert parsed.port and 1 <= parsed.port <= 65535
output.mkdir(mode=0o700, parents=True, exist_ok=True)
for site in json.loads(registry.read_text()):
    if site.get('integrationVersion') != 'vcode-public-v1':
        continue
    domain, key = site['domain'], site['collectorKey']
    script, events = site['trackerPath'], site['collectorPath']
    assert re.fullmatch(r'[a-z0-9]+(?:[.-][a-z0-9]+)*', domain)
    assert re.fullmatch(r'[a-f0-9]{64}', key)
    assert all(re.fullmatch(r'/[a-zA-Z0-9_./-]+', p) and '..' not in p for p in (script, events))
    content = f'''# Managed exact public analytics routes; private edge key, mode 0600.
location = {script} {{
    if ($request_method != GET) {{ return 405; }}
    access_log off;
    set $args "";
    proxy_pass_request_headers off;
    proxy_pass {upstream}/v1/tracker.js;
    add_header Referrer-Policy no-referrer always;
}}
location = {events} {{
    if ($request_method != POST) {{ return 405; }}
    client_max_body_size 2k;
    access_log off;
    set $args "";
    proxy_pass_request_headers off;
    proxy_set_header Content-Type $http_content_type;
    proxy_set_header Origin $http_origin;
    proxy_set_header Sec-Fetch-Site $http_sec_fetch_site;
    proxy_set_header DNT $http_dnt;
    proxy_set_header Sec-GPC $http_sec_gpc;
    proxy_set_header User-Agent $http_user_agent;
    proxy_set_header X-VCode-Client-IP $remote_addr;
    proxy_set_header X-VCode-Collector-Key "{key}";
    proxy_connect_timeout 5s;
    proxy_read_timeout 15s;
    proxy_pass {upstream}/v1/events;
}}
'''
    destination = output / (domain + '.conf')
    destination.write_text(content)
    destination.chmod(0o600)
print('Private edge includes generated.')
