import fs from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const repo = process.cwd();
const output = path.join(repo, '.tmp', 'opt-01-lcd-2026-10-13');
const session = process.env.OPT01_OPENCLI_SESSION || 'opt01-lcd-live';
let tab = process.env.OPT01_OPENCLI_TAB || null;
const runId = Date.now().toString();
const opencli = 'C:\\Users\\Administrator\\AppData\\Roaming\\npm\\node_modules\\@jackwener\\opencli\\dist\\src\\main.js';
const checks = [];
const commands = [];

function run(args) {
    const command = ['node', opencli, '--profile', 'gsc-ga4', ...args];
    const result = spawnSync(process.execPath, [opencli, '--profile', 'gsc-ga4', ...args], { cwd: repo, encoding: 'utf8', timeout: 60000 });
    commands.push({ command, exitCode: result.status, stdout: result.stdout, stderr: result.stderr });
    if (result.error) throw result.error;
    if (result.status !== 0) throw new Error(`OpenCLI exited ${result.status}: ${result.stderr}`);
    return result.stdout.trim();
}

function navigate(url) {
    const target = new URL(url);
    target.searchParams.set('opt01run', runId);
    const args = ['browser', session, 'open', target.toString(), '--window', 'foreground'];
    if (tab) args.push('--tab', tab);
    const result = JSON.parse(run(args));
    if (!tab) tab = result.page;
}

function evaluate(js) {
    const value = run(['browser', session, 'eval', '--tab', tab, js]);
    try { return JSON.parse(value); } catch { return value; }
}

function check(name, passed, detail) {
    checks.push({ name, status: passed ? 'passed' : 'failed', passed: Boolean(passed), detail });
}

function unverified(name, detail) {
    checks.push({ name, status: 'unverified', passed: null, detail });
}

async function screenshot(name) {
    run(['browser', session, 'screenshot', '--tab', tab, path.join(output, name)]);
}

navigate('http://localhost:1868/devices/lcd-screen-tester?opt01=desktop-en');
await new Promise(resolve => setTimeout(resolve, 1200));
const browser = evaluate(`(async()=>{const s=document.querySelector('script[src*=lcd-screen-tester]')?.src||'';const u=s+'&opt01hash=${runId}';const source=await(await fetch(u,{cache:'no-store'})).text();const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(source));return {userAgent:navigator.userAgent,language:document.documentElement.lang,viewport:[innerWidth,innerHeight],hidden:document.hidden,visibilityState:document.visibilityState,hasFocus:document.hasFocus(),script:s,scriptSha256:[...new Uint8Array(digest)].map(x=>x.toString(16).padStart(2,'0')).join('')}})()`);
await fs.mkdir(output, { recursive: true });
const animationClock=evaluate(`(async()=>{let callbacks=0;const started=performance.now();const probe=new Promise(resolve=>{const tick=()=>{callbacks++;if(performance.now()-started>=500)resolve(true);else requestAnimationFrame(tick)};requestAnimationFrame(tick)});const completed=await Promise.race([probe,new Promise(resolve=>setTimeout(()=>resolve(false),1500))]);return {hidden:document.hidden,visibilityState:document.visibilityState,hasFocus:document.hasFocus(),rafCompleted500ms:completed,rafCallbacks:callbacks,elapsedMs:performance.now()-started}})()`);
await fs.writeFile(path.join(output,'browser-environment.json'),JSON.stringify({browser,animationClock},null,2));
if(animationClock.hasFocus&&animationClock.rafCompleted500ms&&animationClock.rafCallbacks>=20)check('browser animation clock has foreground cadence',true,animationClock);
else unverified('browser animation clock has foreground cadence',animationClock);
const desktop = evaluate(`(async () => {
 const t=window.__lcdScreenTester, checks=[], events=[];
 const assert=(name,ok,detail={})=>checks.push({name,status:ok?'passed':'failed',passed:Boolean(ok),detail});
 const unverified=(name,detail={})=>checks.push({name,status:'unverified',passed:null,detail});
 const click=s=>{const el=document.querySelector(s);if(!el)throw Error('missing '+s);el.click();};
 const wait=ms=>new Promise(r=>setTimeout(r,ms));
 const waitForMotion=async()=>{const start=performance.now();while(t.motionPosition===0&&performance.now()-start<2000)await wait(100);return {frame:t.motionFrame,position:t.motionPosition,elapsedMs:performance.now()-start};};
 window.__opt01Events=events;
 window.__opt01DesktopChecks=checks;
 window.__opt01DesktopEvents=events;
 const originalTrack=window.ScreenSizeAnalytics?.track;
 window.__opt01DesktopOriginalTrack=originalTrack;
 if(window.ScreenSizeAnalytics)window.ScreenSizeAnalytics.track=(name,params,options)=>{events.push({name,params,options});return true};
 const clean=()=>!t.overlayOpen&&!t.guidedActive&&t.overlay.classList.contains('is-hidden')&&t.overlay.getAttribute('aria-hidden')==='true'&&!document.body.classList.contains('lcd-test-active')&&!t.root.inert&&t.stepTimer===null&&t.controlHideTimer===null&&t.motionFrame===null&&!t.visibilitySuspended;
 click('#lcd-tab-motion');click('[data-mode="motion-text"]');const motionStarted=await waitForMotion();
 if(motionStarted.position>0)assert('motion preview animates after explicit selection',true,{...motionStarted,documentHidden:document.hidden,hasFocus:document.hasFocus(),mode:t.currentModeId});
 else if(document.hidden||!document.hasFocus())unverified('motion preview animates after explicit selection',{...motionStarted,documentHidden:document.hidden,hasFocus:document.hasFocus(),mode:t.currentModeId});
 else assert('motion preview animates after explicit selection',false,{...motionStarted,documentHidden:false,hasFocus:true,mode:t.currentModeId});
 click('.lcd-hero-actions [data-action="start-guided"]');await wait(100);
 assert('guided start distinguishes guided_start and opens overlay',t.overlayOpen&&t.guidedActive&&t.sequence.length===12&&events.some(e=>e.name==='screen_test_started'&&e.params.tool_action==='guided_start'),{open:t.overlayOpen,guided:t.guidedActive,events});
 const beforeResize=t.sequenceIndex;
 window.dispatchEvent(new Event('resize'));window.dispatchEvent(new Event('orientationchange'));await wait(120);
 assert('active guided resize preserves visible pattern, controls and single step timer',t.overlayOpen&&t.sequenceIndex===beforeResize&&t.stepTimer!==null&&t.testCanvas.width>0&&document.documentElement.scrollWidth<=document.documentElement.clientWidth+1,{index:t.sequenceIndex,timer:t.stepTimer,canvas:[t.testCanvas.width,t.testCanvas.height],scroll:[document.documentElement.clientWidth,document.documentElement.scrollWidth]});
 Object.defineProperty(document,'hidden',{configurable:true,get:()=>false});
 Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'));
 const hiddenEventsBefore=events.length;await wait(8500);const hiddenIndex=t.sequenceIndex;const hiddenTimer=t.stepTimer;
 const hiddenState={before:beforeResize,index:hiddenIndex,remainingStepMs:t.remainingStepMs,timerActive:hiddenTimer!==null,eventsAdded:events.length-hiddenEventsBefore,paused:t.paused,overlayOpen:t.overlayOpen};
 assert('background guided timer freezes on the current step',hiddenIndex===beforeResize&&hiddenTimer===null&&t.paused&&t.remainingStepMs>0&&t.overlayOpen,hiddenState);
 Object.defineProperty(document,'hidden',{configurable:true,get:()=>false});document.dispatchEvent(new Event('visibilitychange'));await wait(120);
 assert('foreground recovery resumes the saved remaining time',t.sequenceIndex===hiddenIndex&&t.overlayOpen&&t.stepTimer!==null&&!t.paused&&t.remainingStepMs>0&&t.remainingStepMs<=hiddenState.remainingStepMs,{...hiddenState,recoveredIndex:t.sequenceIndex,recoveredRemainingStepMs:t.remainingStepMs,recoveredTimer:t.stepTimer,recoveredPaused:t.paused,eventsAdded:events.length-hiddenEventsBefore});
 delete document.hidden;
 click('[data-overlay-action="toggle-pause"]');const index=t.sequenceIndex;await wait(4200);
 assert('pause holds sequence for longer than one step',t.paused&&t.sequenceIndex===index&&t.stepTimer===null,{paused:t.paused,index:t.sequenceIndex,timer:t.stepTimer});
 Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'));await wait(120);Object.defineProperty(document,'hidden',{configurable:true,get:()=>false});document.dispatchEvent(new Event('visibilitychange'));await wait(120);delete document.hidden;
 assert('manual pause remains paused across background recovery',t.paused&&t.sequenceIndex===index&&t.stepTimer===null,{paused:t.paused,index:t.sequenceIndex,timer:t.stepTimer});
 click('[data-overlay-action="toggle-pause"]');
 assert('resume restores one step timer',!t.paused&&t.stepTimer!==null,{paused:t.paused,timer:t.stepTimer});
 Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'));
 click('#lcd-overlay-exit');await wait(120);
 assert('early guided exit restores workbench and focus state',clean()&&document.activeElement?.dataset.action==='start-guided',{clean:clean(),focus:document.activeElement?.dataset.action});
 Object.defineProperty(document,'hidden',{configurable:true,get:()=>false});document.dispatchEvent(new Event('visibilitychange'));delete document.hidden;
 const completedBefore=events.filter(e=>e.name==='screen_test_completed').length;
 click('.lcd-hero-actions [data-action="start-guided"]');
  assert('guided restart after a hidden exit starts without stale suspension',t.overlayOpen&&t.guidedActive&&!t.visibilitySuspended&&events.filter(e=>e.name==='screen_test_started').length===2,{open:t.overlayOpen,guided:t.guidedActive,visibilitySuspended:t.visibilitySuspended,starts:events.filter(e=>e.name==='screen_test_started').length});
 for(let i=0;i<11;i++)click('[data-overlay-action="next"]');
 click('[data-overlay-action="next"]');click('[data-overlay-action="next"]');await wait(120);
 assert('rapid repeat on the final step completes once and restores selection',clean()&&t.statusText.textContent.toLowerCase().includes('complete')&&t.currentModeId==='motion-text'&&events.filter(e=>e.name==='screen_test_completed').length===completedBefore+1,{clean:clean(),status:t.statusText.textContent,mode:t.currentModeId,completed:events.filter(e=>e.name==='screen_test_completed').length});
 window.dispatchEvent(new Event('resize'));window.dispatchEvent(new Event('themeChanged'));document.dispatchEvent(new Event('visibilitychange'));await wait(100);
 assert('passive redraw after exit does not restart preview animation',t.motionFrame===null&&!t.motionEnabled,{frame:t.motionFrame,motionEnabled:t.motionEnabled});
 click('[data-motion-speed="fast"]');const motionResumed=await waitForMotion();
 if(motionResumed.position>0)assert('explicit motion control resumes preview',true,{...motionResumed,documentHidden:document.hidden,hasFocus:document.hasFocus()});
 else if(document.hidden||!document.hasFocus())unverified('explicit motion control resumes preview',{...motionResumed,documentHidden:document.hidden,hasFocus:document.hasFocus()});
 else assert('explicit motion control resumes preview',false,{...motionResumed,documentHidden:false,hasFocus:true});
 click('.lcd-hero-actions [data-action="start-manual"]');await wait(100);
 assert('manual start has separate event action',t.overlayOpen&&!t.guidedActive&&events.filter(e=>e.name==='screen_test_started').at(-1)?.params.tool_action==='manual_start',{open:t.overlayOpen,guided:t.guidedActive,lastStart:events.filter(e=>e.name==='screen_test_started').at(-1)});
 click('[data-overlay-action="next"]');click('#lcd-overlay-exit');click('#lcd-overlay-exit');await wait(100);
 assert('manual exit and duplicate exit do not create guided completion',clean()&&events.filter(e=>e.name==='screen_test_completed').length===completedBefore+1,{clean:clean(),completed:events.filter(e=>e.name==='screen_test_completed').length});
 t.overlay.requestFullscreen=()=>Promise.reject(new DOMException('Test denial','NotAllowedError'));
 click('.lcd-hero-actions [data-action="start-manual"]');await wait(100);
 assert('fullscreen denial retains functional overlay and exit control',t.overlayOpen&&document.querySelector('#lcd-overlay-exit')?.getClientRects().length>0,{open:t.overlayOpen,exitVisible:!!document.querySelector('#lcd-overlay-exit')?.getClientRects().length});
 click('#lcd-overlay-exit');await wait(100);
 assert('fullscreen denial exit restores page state',clean(),{clean:clean()});
 const deniedCompletionBefore=events.filter(e=>e.name==='screen_test_completed').length;
  click('.lcd-hero-actions [data-action="start-guided"]');await wait(100);
  assert('guided run remains active after fullscreen denial',t.overlayOpen&&t.guidedActive&&document.querySelector('#lcd-overlay-exit')?.getClientRects().length>0,{open:t.overlayOpen,guided:t.guidedActive,exitVisible:!!document.querySelector('#lcd-overlay-exit')?.getClientRects().length});
  window.__opt01DeniedCompletionBefore=deniedCompletionBefore;
  return {checks,events,pendingGuidedCompletion:true};
})()`);
 for(let chunk=0;chunk<3;chunk++){
   const progress=evaluate(`(async()=>{await new Promise(r=>setTimeout(r,16000));const t=window.__lcdScreenTester,ev=window.__opt01DesktopEvents,completed=ev.filter(e=>e.name==='screen_test_completed').length,before=window.__opt01DeniedCompletionBefore;const clean=!t.overlayOpen&&!t.guidedActive&&t.stepTimer===null&&t.controlHideTimer===null&&!document.body.classList.contains('lcd-test-active')&&!t.root.inert;const ok=${chunk}<2?t.overlayOpen&&t.guidedActive&&t.sequenceIndex>=${(chunk+1)*3}&&t.sequenceIndex<12&&t.stepTimer!==null:clean&&completed===before+1&&ev.filter(e=>e.name==='screen_test_exited').at(-1)?.params.tool_action==='completed_exit';const detail={chunk:${chunk+1},index:t.sequenceIndex,guided:t.guidedActive,overlay:t.overlayOpen,timer:t.stepTimer,completed,before,clean,exit:ev.filter(e=>e.name==='screen_test_exited').at(-1)};window.__opt01DesktopChecks.push({name:${chunk}<2?'fullscreen denial natural timer flow advances without manual input':'fullscreen denial natural 12-step flow completes once',status:ok?'passed':'failed',passed:Boolean(ok),detail});return detail})()`);
   commands.push({command:'OpenCLI eval natural 4s guided timer wait',exitCode:0,stdout:JSON.stringify(progress),stderr:''});
 }
 const completedDesktop=evaluate(`(()=>{window.ScreenSizeAnalytics.track=window.__opt01DesktopOriginalTrack;return {checks:window.__opt01DesktopChecks,events:window.__opt01DesktopEvents,final:{mode:window.__lcdScreenTester.currentModeId,category:window.__lcdScreenTester.activeCategory,clean:!window.__lcdScreenTester.overlayOpen&&window.__lcdScreenTester.stepTimer===null,viewport:[innerWidth,innerHeight],width:document.documentElement.clientWidth,scrollWidth:document.documentElement.scrollWidth}}})()`);
 checks.push({name:'desktop-en: browser harness completed',status:Array.isArray(completedDesktop.checks)?'passed':'failed',passed:Array.isArray(completedDesktop.checks),detail:{hidden:browser.hidden,checks:completedDesktop.checks.length}});
 if (completedDesktop.checks) checks.push(...completedDesktop.checks.map(item=>({...item,status:item.status||(item.passed?'passed':'failed'),name:`desktop-en: ${item.name}`})));
await screenshot('desktop-en.png');

navigate('http://localhost:1868/es/devices/lcd-screen-tester?opt01=desktop-es');
await new Promise(resolve => setTimeout(resolve, 1200));
const spanish = evaluate(`(() => {const t=window.__lcdScreenTester;const texts=[...document.querySelectorAll('.lcd-hero-actions button,#lcd-overlay-pause,#lcd-overlay-next,#lcd-overlay-exit')].map(e=>({text:e.innerText.trim(),label:e.getAttribute('aria-label')}));return {lang:document.documentElement.lang,title:document.querySelector('#lcd-page-title')?.textContent,hero:texts,rawKey:texts.some(x=>/lcdTester\\./.test(x.text+' '+x.label)),mode:t.currentModeId,initialized:!!t}})()`);
check('desktop-es: controls are translated without exposed keys',spanish.lang==='es'&&spanish.initialized&&!spanish.rawKey,spanish);
await screenshot('desktop-es.png');

const desktopLayout = evaluate(`(async () => {
  const f=document.createElement('iframe');f.title='1280x800 simulated desktop LCD viewport';f.style='position:fixed;left:-2000px;top:0;width:1280px;height:800px;border:0';
  f.src='http://localhost:1868/devices/lcd-screen-tester?opt01=desktop-layout&opt01run=${runId}-1280';
  await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('desktop iframe timeout')),15000);f.onload=()=>{clearTimeout(timer);resolve()};f.onerror=()=>reject(Error('desktop iframe failed'));document.body.append(f)});
  await new Promise(r=>setTimeout(r,200));const d=f.contentDocument,t=f.contentWindow.__lcdScreenTester;
  const result={frameWidth:f.getBoundingClientRect().width,viewport:d.documentElement.clientWidth,scrollWidth:d.documentElement.scrollWidth,canvas:[t.previewCanvas.width,t.previewCanvas.height],lang:d.documentElement.lang};f.remove();return result;
})()`);
check('desktop-en-1280x800: canvas initializes without horizontal overflow',desktopLayout.frameWidth===1280&&desktopLayout.scrollWidth<=desktopLayout.viewport+1&&desktopLayout.canvas.every(v=>v>0),desktopLayout);

const viewportCases = ['en','zh','de','es','fr','pt'].flatMap(lang => [
    { lang, width: 320, height: 568 },
    { lang, width: 390, height: 844 }
]);
for (const { lang, width, height } of viewportCases) {
    navigate(`http://localhost:1868/${lang === 'en' ? '' : `${lang}/`}devices/lcd-screen-tester?opt01=mobile-${lang}`);
    await new Promise(resolve => setTimeout(resolve, 800));
    const mobile = evaluate(`(async () => {
      const old=document.querySelector('#opt01-mobile-frame');old?.remove();
      const f=document.createElement('iframe');f.id='opt01-mobile-frame';f.title='${width}x${height} simulated LCD viewport';f.setAttribute('allowfullscreen','');f.style='position:fixed;inset:0;width:${width}px;height:${height}px;border:0;z-index:2147483647;background:white';
      f.src='http://localhost:1868/${lang === 'en' ? '' : `${lang}/`}devices/lcd-screen-tester?opt01=frame-${lang}&opt01run=${runId}-${lang}-${width}';
      await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('iframe timeout')),15000);f.onload=()=>{clearTimeout(timer);resolve()};f.onerror=()=>reject(Error('iframe failed'));document.body.append(f)});
      const w=f.contentWindow,d=f.contentDocument,t=w.__lcdScreenTester,click=s=>{const e=d.querySelector(s);if(!e)throw Error('missing '+s);e.click()},wait=ms=>new Promise(r=>setTimeout(r,ms));
      click('#lcd-tab-motion');click('[data-mode="motion-lines"]');await wait(600);const plays=t.motionFrame!==null&&t.motionPosition>0;
      click('.lcd-hero-actions [data-action="start-guided"]');click('#lcd-overlay-exit');for(const name of ['resize','orientationchange','themeChanged'])w.dispatchEvent(new Event(name));await wait(100);
      const clean=!t.overlayOpen&&t.motionFrame===null&&t.stepTimer===null&&t.controlHideTimer===null&&!t.root.inert;
      const state={lang:d.documentElement.lang,width:d.documentElement.clientWidth,scrollWidth:d.documentElement.scrollWidth,plays,outerHidden:document.hidden,outerHasFocus:document.hasFocus(),clean,mode:t.currentModeId,canvas:[t.previewCanvas.width,t.previewCanvas.height]};
      click('[data-motion-speed="fast"]');await wait(600);state.resumed=t.motionFrame!==null&&t.motionPosition>0;
      click('.lcd-hero-actions [data-action="start-manual"]');click('#lcd-overlay-exit');state.stopped=t.motionFrame===null;state.scrollWidthAfter=d.documentElement.scrollWidth;
      f.remove();return state;
    })()`);
    const expected = mobile.lang === lang && mobile.width > 0 && mobile.width <= width && mobile.scrollWidth <= mobile.width + 1 && mobile.clean && mobile.mode === 'motion-lines' && mobile.stopped && mobile.canvas.every(v=>v>0) && mobile.scrollWidthAfter <= mobile.width + 1;
    check(`mobile-${lang}-${width}x${height}: layout and exit cleanup`,expected,mobile);
    if(mobile.outerHidden||!mobile.outerHasFocus)unverified(`mobile-${lang}-${width}x${height}: motion animation and explicit resume`,{outerDocumentHidden:mobile.outerHidden,outerHasFocus:mobile.outerHasFocus,plays:mobile.plays,resumed:mobile.resumed});
    else check(`mobile-${lang}-${width}x${height}: motion animation and explicit resume`,mobile.plays&&mobile.resumed,mobile);
}

await fs.writeFile(path.join(output, 'checks.json'), JSON.stringify({ browser, checks }, null, 2));
await fs.writeFile(path.join(output, 'commands.json'), JSON.stringify(commands, null, 2));
const summary={exitCode:checks.some(item=>item.status==='failed')?1:0,checks:checks.length,passed:checks.filter(item=>item.status==='passed').length,failed:checks.filter(item=>item.status==='failed'),unverified:checks.filter(item=>item.status==='unverified')};
await fs.writeFile(path.join(output, 'runner-summary.json'), JSON.stringify(summary,null,2));
console.log(JSON.stringify({ browser, summary, checks },null,2));
if (summary.exitCode!==0) process.exitCode=1;
