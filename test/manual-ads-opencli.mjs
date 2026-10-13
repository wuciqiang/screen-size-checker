/** Isolated OpenCLI acceptance: node test/manual-ads-opencli.mjs [artifact-dir] [--baseline]. */
import fs from 'node:fs/promises';
import path from 'node:path';
import http from 'node:http';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';

const run = promisify(execFile);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.resolve(process.argv[2] || path.join(root, '.tmp/opt-03-ad-measurement-2026-10-13'));
const baseline = process.argv.includes('--baseline');
const cli = process.env.OPENCLI_ENTRY || path.join(process.env.APPDATA, 'npm/node_modules/@jackwener/opencli/dist/src/main.js');
const session = 'opt03-ads-local';
const commands = [], checks = [];
await fs.mkdir(out, { recursive: true });
const consent = `if(new URLSearchParams(location.search).has('noio'))window.IntersectionObserver=undefined;
window.__fixture={advertising:false,analytics:false,pushes:0,successes:0,fail:false,events:[]};
window.ScreenSizeConsent={canUseAdvertising:()=>__fixture.advertising,canUseAnalytics:()=>__fixture.analytics};
window.gtag=(...args)=>__fixture.events.push(args);
window.adsbygoogle={push:()=>{__fixture.pushes++;if(__fixture.fail)throw Error('controlled push failure');return ++__fixture.successes}};`;
const fixture = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>body{margin:0}#space{height:2000px}.manual-ad-content{height:250px;width:100%}aside{margin:32px 8px}</style>
<script src="/js/consent-runtime.js"></script><script src="/js/manual-ads.js" defer></script></head><body>
<div id="space"></div><aside data-manual-ad-slot="4384333605" data-ad-client="ca-pub-9212629010224868" data-manual-ad-position="compare_results_after" aria-label="Advertisement">
<div>Advertisement</div><div class="manual-ad-content" data-manual-ad-content></div></aside><div style="height:2000px"></div>
<script src="/js/analytics.js" defer></script></body></html>`;
const server = http.createServer(async (req, res) => {
    try {
        const url = new URL(req.url, 'http://localhost');
        res.setHeader('Content-Security-Policy', "default-src 'self' data:; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; connect-src 'self'; frame-src 'self'; img-src 'self' data:; font-src 'self' data:");
        res.setHeader('Cache-Control', 'no-store');
        let body, type = 'text/html; charset=utf-8';
        if (url.pathname === '/') body = '<!doctype html><html><body style="margin:0"><h1>Local manual ad acceptance</h1></body></html>';
        else if (url.pathname === '/fixture') body = fixture;
        else if (url.pathname === '/js/consent-runtime.js') { body = consent; type = 'text/javascript'; }
        else if (url.pathname === '/js/manual-ads.js' || url.pathname === '/js/analytics.js') {
            body = await fs.readFile(url.pathname.endsWith('manual-ads.js') && baseline ? path.join(out, 'manual-ads-baseline.js') : path.join(root, url.pathname)); type = 'text/javascript';
        } else {
            let relative = decodeURIComponent(url.pathname).replace(/^\/+/, '');
            if (!path.extname(relative)) relative += '.html';
            const file = path.resolve(root, 'multilang-build', relative);
            if (!file.startsWith(path.join(root, 'multilang-build') + path.sep)) throw Error('invalid path');
            body = await fs.readFile(file);
            type = ({'.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.svg':'image/svg+xml','.ico':'image/x-icon'}[path.extname(file)] || type);
        }
        res.writeHead(200, {'Content-Type': type}); res.end(body);
    } catch { res.writeHead(404); res.end('Not found'); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const base = `http://127.0.0.1:${server.address().port}`;
async function opencli(...args) {
    const full = ['--profile','gsc-ga4','browser',session,...args];
    try {
        const {stdout, stderr} = await run(process.execPath, [cli,...full], {timeout:60000,maxBuffer:5*1024*1024,windowsHide:true});
        commands.push({args:full,exitCode:0,stderr});
        return stdout.trim();
    } catch (error) { commands.push({args:full,exitCode:error.code,stderr:error.stderr}); throw error; }
}
async function evaluate(code) { return JSON.parse(await opencli('eval',code)); }
const delay = 'await new Promise(r=>setTimeout(r,120));';
let instance = 0;
async function frame(url='/fixture',width=390,height=700) {
    if(url.startsWith('/fixture')) {
        await opencli('open',base+url+(url.includes('?')?'&':'?')+'instance='+ ++instance,'--window','foreground');
        return evaluate(`(async()=>{${delay}return {width:innerWidth,height:innerHeight,hidden:document.hidden}})()`);
    }
    return evaluate(`(async()=>{document.querySelector('iframe')?.remove();const f=document.createElement('iframe');f.style='display:block;border:0;width:${width}px;height:${height}px';f.id='acceptance';f.src=${JSON.stringify(base)}+${JSON.stringify(url)};await new Promise((r,j)=>{f.onload=r;f.onerror=j;document.body.append(f)});${delay}return {width:f.contentWindow.innerWidth,height:f.contentWindow.innerHeight,hidden:f.contentDocument.hidden}})()`);
}
async function inFrame(code) {
    return evaluate(`(async()=>{const f=document.querySelector('#acceptance'),w=f?f.contentWindow:window,d=w.document,s=w.__fixture;const slot=d.querySelector('[data-manual-ad-slot]'),content=slot?.querySelector('[data-manual-ad-content]');const notify=()=>w.dispatchEvent(new w.Event('screenSizeConsentChanged'));const place=top=>w.scrollTo({top:w.scrollY+content.getBoundingClientRect().top-top,behavior:'instant'});const state=()=>({pushes:s.pushes,successes:s.successes,events:s.events.filter(e=>e[1]==='manual_ad_slot_reached'),ins:slot?.querySelectorAll('ins').length,initialized:slot?.getAttribute('data-manual-ad-initialized'),rect:content?.getBoundingClientRect().toJSON(),hidden:d.hidden});${code}})()`);
}
function check(name, pass, detail) { checks.push({name,pass:Boolean(pass),detail}); console.log(`${pass?'PASS':'FAIL'} ${name}`); }
try {
    await opencli('open',base,'--window','foreground');
    const environment = await evaluate('({browser:navigator.userAgent,viewport:[innerWidth,innerHeight],hidden:document.hidden})');
    await fs.writeFile(path.join(out,baseline?'baseline-environment.json':'environment.json'),JSON.stringify({base,environment,network:'CSP self only; consent/gtag/adsbygoogle local stubs; source scripts from working tree',startedAt:new Date().toISOString()},null,2));
    check('visible host for lifecycle acceptance',!environment.hidden,environment);
    await frame();
    let s = await inFrame(`s.advertising=true;s.analytics=true;notify();${delay}return state();`);
    check('far slot: no push and no reach',s.pushes===0&&s.events.length===0,s);
    s = await inFrame(`place(w.innerHeight+150);${delay}return state();`);
    check('300px preload: one push, no natural reach',s.pushes===1&&s.events.length===0,s);
    s = await inFrame(`place(w.innerHeight-1);${delay}return state();`);
    check(baseline?'baseline confirms missing natural reach':'positive area: reach exactly once without extra push',s.pushes===1&&s.events.length===(baseline?0:1),s);
    if (!baseline) {
        s=await inFrame(`place(-300);${delay}place(100);w.dispatchEvent(new w.Event('resize'));notify();const script=d.createElement('script');script.src='/js/manual-ads.js';d.body.append(script);${delay}return state();`);
        check('scroll/resize/consent/reinitialization stay unique',s.pushes===1&&s.ins===1&&s.events.length===1,s);
        check('payload uses helper context and fixed action only',Object.keys(s.events[0][2]).sort().join(',')==='language,page_id,tool_action,tool_name'&&s.events[0][2].tool_name==='manual_ads'&&s.events[0][2].tool_action==='slot_reached',s.events);
        s=await inFrame(`w.dispatchEvent(new w.PageTransitionEvent('pagehide',{persisted:true}));w.dispatchEvent(new w.Event('resize'));notify();w.dispatchEvent(new w.PageTransitionEvent('pageshow',{persisted:true}));${delay}return state();`);
        check('BFCache lifecycle does not repeat recorded reach',s.pushes===1&&s.events.length===1,s);
        await frame();
        s=await inFrame(`place(100);${delay}return state();`);
        check('both denied: no push/reach',s.pushes===0&&s.events.length===0,s);
        s=await inFrame(`s.analytics=true;notify();${delay}return state();`);
        check('analytics grant in viewport: reach without ad authorization',s.pushes===0&&s.events.length===1,s);
        s=await inFrame(`s.advertising=true;notify();${delay}return state();`);
        check('later ad grant initializes once',s.pushes===1&&s.events.length===1&&s.ins===1,s);
        await frame();
        s=await inFrame(`place(100);s.advertising=true;notify();${delay}return state();`);
        check('ad grant alone does not authorize analytics',s.pushes===1&&s.events.length===0,s);
        s=await inFrame(`s.analytics=true;notify();${delay}return state();`);
        check('analytics rejection does not consume later reach',s.events.length===1&&s.pushes===1,s);
        await frame();
        s=await inFrame(`Object.defineProperty(d,'hidden',{configurable:true,get:()=>true});Object.defineProperty(d,'visibilityState',{configurable:true,get:()=> 'hidden'});place(100);s.analytics=true;s.advertising=true;notify();${delay}return state();`);
        check('hidden document never initializes or records',s.pushes===0&&s.events.length===0,s);
        s=await inFrame(`delete d.hidden;delete d.visibilityState;d.dispatchEvent(new w.Event('visibilitychange'));${delay}return state();`);
        check('visibility recovery evaluates current position',s.pushes===1&&s.events.length===1,s);
        await frame();
        s=await inFrame(`place(100);s.fail=true;s.advertising=true;notify();${delay}return state();`);
        check('push failure clears partial node and marker',s.pushes>=1&&s.ins===0&&s.initialized===null,s);
        s=await inFrame(`s.fail=false;w.dispatchEvent(new w.Event('resize'));${delay}notify();return state();`);
        check('push failure recovers with one node and one successful retry',s.successes===1&&s.ins===1&&s.initialized==='true',s);
        await frame();
        s=await inFrame(`place(100);s.analytics=true;s.advertising=true;w.dispatchEvent(new w.PageTransitionEvent('pagehide',{persisted:true}));notify();w.dispatchEvent(new w.Event('resize'));${delay}return state();`);
        check('pagehide releases active observers/listeners',s.pushes===0&&s.events.length===0,s);
        s=await inFrame(`w.dispatchEvent(new w.PageTransitionEvent('pageshow',{persisted:true}));${delay}return state();`);
        check('pending position recovers after pageshow',s.pushes===1&&s.events.length===1,s);
        await frame();
        s=await inFrame(`place(100);content.style.width='200px';s.analytics=true;s.advertising=true;notify();${delay}return state();`);
        check('narrow slot may be reached but cannot request ad',s.pushes===0&&s.events.length===1,s);
        s=await inFrame(`content.style.width='100%';w.dispatchEvent(new w.Event('resize'));${delay}return state();`);
        check('width recovery preserves reach and allows one request',s.pushes===1&&s.events.length===1,s);
        // Fresh documents reset per-page reach, unlike BFCache lifecycle events.
        await frame();
        s=await inFrame(`place(100);s.analytics=true;s.advertising=true;notify();${delay}return state();`);
        check('new page instance may record a fresh reach',s.events.length===1&&s.pushes===1,s);
        await frame();
        s=await inFrame(`s.analytics=true;notify();place(w.innerHeight);${delay}return state();`);
        check('touching viewport edge has zero area and is not reached',s.events.length===0,s);
        s=await inFrame(`place(w.innerHeight-1);${delay}return state();`);
        check('edge to positive area records reach',s.events.length===1,s);
        await frame('/fixture?noio');
        s=await inFrame(`s.analytics=true;s.advertising=true;notify();place(w.innerHeight+150);${delay}const preload=state();place(100);${delay}return {preload,reached:state()};`);
        check('no IntersectionObserver: scroll fallback preserves both boundaries',s.preload.pushes===1&&s.preload.events.length===0&&s.reached.pushes===1&&s.reached.events.length===1,s);
        // Render the actual generated pages, replacing only network/consent bindings.
        await opencli('open',base,'--window','foreground');
        for (const page of ['devices/compare','hub/best-monitor-size-fps']) {
            for (const width of [320,390,1280]) {
                await frame('/'+page,width,800);
                const detail=await inFrame(`s.analytics=true;s.advertising=true;place(100);notify();${delay}const ad=slot.querySelector('ins');if(ad)ad.setAttribute('data-ad-status','unfilled');const r=slot.getBoundingClientRect(),c=content.getBoundingClientRect(),style=w.getComputedStyle(slot);return {state:state(),label:slot.querySelector('.manual-ad-label').innerText,width:w.innerWidth,scrollWidth:d.documentElement.scrollWidth,contentHeight:c.height,minHeight:style.minHeight,marginTop:parseFloat(style.marginTop),marginBottom:parseFloat(style.marginBottom),adWidth:ad?.getBoundingClientRect().width,slotWidth:r.width,actionOverlap:Array.from(d.querySelectorAll('button,input,select,a')).filter(el=>!slot.contains(el)&&el.checkVisibility({checkOpacity:true,checkVisibilityCSS:true})).filter(el=>{const x=el.getBoundingClientRect();return x.width>0&&x.height>0&&x.top<c.bottom&&x.bottom>c.top&&x.left<c.right&&x.right>c.left}).map(el=>el.tagName)};`);
                check(`${page} ${width}px: unfilled reserved space and reach`,detail.label==='Advertisement'&&detail.contentHeight===250&&detail.marginTop>=32&&detail.marginBottom>=32&&detail.scrollWidth<=width+1&&detail.state.pushes===(detail.state.rect.width>=250?1:0)&&detail.state.events.length===1&&detail.actionOverlap.length===0,detail);
                if(width===390) await opencli('screenshot',path.join(out,page.replaceAll('/','-')+'-390.png'));
            }
        }
        for(const lang of ['zh','de','es','pt','fr']) {
            for (const page of ['devices/compare','hub/best-monitor-size-fps']) {
                await frame('/'+lang+'/'+page,390,800);
                const detail=await evaluate(`(()=>{const d=document.querySelector('iframe').contentDocument;return {lang:d.documentElement.lang,slots:d.querySelectorAll('[data-manual-ad-slot]').length,width:d.documentElement.clientWidth,scroll:d.documentElement.scrollWidth,links:d.querySelectorAll('a[href]').length}})()`);
                check(`${lang} ${page}: language/layout smoke`,detail.lang===lang&&detail.slots===0&&detail.width>0&&detail.width<=390&&detail.scroll<=detail.width+1&&detail.links>0,detail);
            }
        }
    }
} catch(error) {
    checks.push({name:'runner completes',pass:false,detail:error.stack});console.error(error);
} finally {
    await fs.writeFile(path.join(out,baseline?'baseline-results.json':'opencli-results.json'),JSON.stringify({baseline,checks},null,2));
    await fs.writeFile(path.join(out,baseline?'baseline-commands.json':'opencli-commands.json'),JSON.stringify(commands,null,2));
    await opencli('close').catch(()=>{});
    await new Promise(resolve=>server.close(resolve));
}
if(checks.some(c=>!c.pass))process.exitCode=1;
