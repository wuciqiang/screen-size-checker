/**
 * Run against an owned Chrome instance and an existing local preview server.
 * Uses OpenCLI's public browser API; no Playwright or raw protocol commands.
 * OPENCLI_MODULE_ROOT: absolute @jackwener/opencli install directory.
 * LCD_BROWSER_ENDPOINT: owned Chrome endpoint, e.g. http://127.0.0.1:9338.
 * node test/lcd-motion-lifecycle-opencli.mjs <artifact-dir> [--expect-bug]
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const artifacts = process.argv[2];
const endpoint = process.env.LCD_BROWSER_ENDPOINT;
const moduleRoot = process.env.OPENCLI_MODULE_ROOT;
if (!artifacts || !endpoint || !moduleRoot) {
    throw new Error('Provide artifact-dir, LCD_BROWSER_ENDPOINT and OPENCLI_MODULE_ROOT');
}
const expectBug = process.argv.includes('--expect-bug');
const base = process.env.LCD_PREVIEW_URL || 'http://localhost:1868';
const { CDPBridge } = await import(pathToFileURL(path.join(moduleRoot, 'dist/src/browser/index.js')));
const bridge = new CDPBridge();
const checks = [];
const commands = [];
await fs.mkdir(artifacts, { recursive: true });
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
let page;

async function evaluate(js) {
    commands.push({ action: 'OpenCLI.evaluate', js });
    return page.evaluate(js);
}

async function click(selector) {
    commands.push({ action: 'OpenCLI.click', selector });
    return page.click(selector);
}

const stateCode = `(() => {const t=window.__lcdScreenTester;return {
    mode:t.currentModeId,category:t.activeCategory,open:t.overlayOpen,guided:t.guidedActive,
    frame:t.motionFrame,motionEnabled:t.motionEnabled,position:t.motionPosition,resize:t.resizeFrame,step:t.stepTimer,
    controls:t.controlHideTimer,touch:t.touchStart,hidden:document.hidden,
    fullscreen:!!document.fullscreenElement,overlayHidden:t.overlay.classList.contains('is-hidden'),
    ariaHidden:t.overlay.getAttribute('aria-hidden'),inert:t.root.inert,
    bodyActive:document.body.classList.contains('lcd-test-active'),status:t.workbench.dataset.state,
    focusedAction:document.activeElement?.dataset.action,
    width:document.documentElement.clientWidth,scrollWidth:document.documentElement.scrollWidth,
    canvasWidth:t.previewCanvas.width,canvasHeight:t.previewCanvas.height
}})()`;
const state = () => evaluate(stateCode);
const guidedStart = '.lcd-hero-actions [data-action="start-guided"]';
const manualStart = '.lcd-hero-actions [data-action="start-manual"]';

async function passiveRedraws() {
    return evaluate(`(() => {
        for (const type of ['resize','orientationchange','themeChanged','languageChanged']) {
            window.dispatchEvent(new Event(type));
        }
        document.dispatchEvent(new Event('visibilitychange'));
        return true;
    })()`);
}

async function verifyMotionAction(selector, name) {
    await click(selector);
    await wait(150);
    const s = await state();
    await check(name, s.frame !== null && s.position > 0, s);
}

async function manualExit(name) {
    await click(manualStart);
    await wait(120);
    const started = await state();
    await check(`${name}: manual fullscreen plays motion`, started.open && started.fullscreen && started.frame !== null && started.position > 0, started);
    await click('#lcd-overlay-exit');
    await passiveRedraws();
    await wait(150);
    const stopped = await state();
    await check(`${name}: exit clears animation and modal state`, closed(stopped) && stopped.focusedAction === 'start-manual', stopped);
}

async function check(name, passed, detail) {
    checks.push({ name, passed: Boolean(passed), detail });
    console.log(`${passed ? 'PASS' : 'FAIL'} ${name}`);
    await fs.writeFile(path.join(artifacts, expectBug ? 'baseline-opencli.json' : 'e2e-opencli.json'),
        JSON.stringify({ environment: { base, endpoint, moduleRoot, browser: await evaluate('navigator.userAgent') }, checks }, null, 2));
}

function closed(s, status = 'ready') {
    return !s.open && !s.guided && s.overlayHidden && s.ariaHidden === 'true' && !s.inert &&
        !s.bodyActive && s.frame === null && s.step === null && s.controls === null &&
        s.touch === null && !s.fullscreen && s.status === status;
}

try {
    // Pin an actual page: OpenCLI 1.8.5 can otherwise prefer Chrome's browser_ui
    // popup over an about:blank tab, which has no real viewport or animation.
    const targets = await (await fetch(`${endpoint}/json/list`)).json();
    const target = targets.find(target => target.type === 'page' && target.url === 'about:blank')
        || targets.find(target => target.type === 'page');
    if (!target) throw new Error('Owned Chrome has no page target');
    page = await bridge.connect({ cdpEndpoint: target.webSocketDebuggerUrl });
    await page.goto(`${base}/devices/lcd-screen-tester?lcd-lifecycle=${Date.now()}`);
    await wait(1500);
    const initial = await state();
    await check('visible document and initialized tool', !initial.hidden && initial.width > 0 && closed(initial), initial);
    if (initial.hidden || !initial.width) throw new Error('Cannot verify animation without a visible viewport');
    await page.consoleMessages('error');
    await evaluate(`window.__lcdTestErrors=[];window.addEventListener('error',e=>window.__lcdTestErrors.push(e.message));
        window.addEventListener('unhandledrejection',e=>window.__lcdTestErrors.push(String(e.reason)))`);
    await click('#lcd-tab-motion');
    await click('[data-mode="motion-text"]');
    await wait(200);
    const moving = await state();
    await check('native control activation animates preview', moving.mode === 'motion-text' && moving.frame !== null && moving.position > 0, moving);
    await click(guidedStart);
    await wait(150);
    const running = await state();
    await check('guided start opens native fullscreen and timer', running.open && running.fullscreen && running.guided && running.inert && running.step !== null, running);
    await click('#lcd-overlay-exit');
    await wait(250);
    const exit = await state();
    if (!expectBug) await check('guided exit restores static motion preview and focus', closed(exit) && exit.mode === 'motion-text' && exit.focusedAction === 'start-guided', exit);
    await evaluate("window.dispatchEvent(new Event('resize'))");
    await wait(200);
    const resized = await state();
    await evaluate("window.dispatchEvent(new CustomEvent('themeChanged'))");
    await wait(200);
    const themed = await state();
    if (expectBug) {
        await check('baseline reproduces restart after exit and passive redraw', resized.frame !== null && themed.frame !== null && themed.position > 0, { exit, resized, themed });
    } else {
        await check('resize and theme preserve stopped preview', closed(resized) && closed(themed) && resized.position === themed.position, { resized, themed });
        const stillImage = await evaluate('window.__lcdScreenTester.previewCanvas.toDataURL()');
        await passiveRedraws();
        await wait(250);
        const passive = await state();
        const laterImage = await evaluate('window.__lcdScreenTester.previewCanvas.toDataURL()');
        await check('all passive redraws retain the visible static frame', closed(passive) && stillImage === laterImage, passive);

        // Controlled visibility fault injection; restore the browser getter before
        // continuing. We do not replace app handlers, RAF, timers or fullscreen logic.
        await evaluate(`Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});
            document.dispatchEvent(new Event('visibilitychange'))`);
        await passiveRedraws();
        const hiddenStopped = await state();
        await evaluate(`delete document.hidden;document.dispatchEvent(new Event('visibilitychange'))`);
        await wait(150);
        const visibleStopped = await state();
        await check('exited preview stays stopped through hidden/visible recovery', hiddenStopped.frame === null && closed(visibleStopped), { hiddenStopped, visibleStopped });

        await verifyMotionAction('[data-mode="motion-text"]', 'explicit mode selection resumes preview');
        await evaluate(`Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'))`);
        const hiddenActive = await state();
        await evaluate(`delete document.hidden;document.dispatchEvent(new Event('visibilitychange'))`);
        await wait(150);
        const visibleActive = await state();
        await check('active preview pauses while hidden and resumes when visible', hiddenActive.frame === null && visibleActive.frame !== null && visibleActive.position > 0, { hiddenActive, visibleActive });

        await manualExit('first manual run');
        await verifyMotionAction('[data-motion-speed="fast"]', 'speed control resumes stopped preview');
        await manualExit('second manual run');
        await verifyMotionAction('[data-motion-bg="white"]', 'background control resumes stopped preview');
        await manualExit('third manual run');
        await verifyMotionAction('#lcd-tab-motion', 'reselecting motion category resumes preview');

        await click(guidedStart);
        await wait(4250);
        const automatic = await evaluate('window.__lcdScreenTester.sequenceIndex');
        await click('[data-overlay-action="toggle-pause"]');
        const paused = await evaluate('({index:window.__lcdScreenTester.sequenceIndex,paused:window.__lcdScreenTester.paused,timer:window.__lcdScreenTester.stepTimer})');
        await wait(250);
        await check('guided automatic step and pause work', automatic >= 1 && paused.paused && paused.timer === null && await evaluate('window.__lcdScreenTester.sequenceIndex') === paused.index, { automatic, paused });
        await click('[data-overlay-action="toggle-pause"]');
        await check('guided resume restores timer', await evaluate('window.__lcdScreenTester.stepTimer !== null && !window.__lcdScreenTester.paused'), await state());
        await click('[data-overlay-action="previous"]');
        await check('guided previous returns to first pattern', await evaluate('window.__lcdScreenTester.sequenceIndex === 0'), await state());
        for (let step = 0; step < 12; step++) await click('[data-overlay-action="next"]');
        await passiveRedraws();
        await wait(150);
        const complete = await state();
        await check('guided completion restores original motion selection without animation', closed(complete, 'complete') && complete.mode === 'motion-text' && complete.category === 'motion', complete);

        for (const step of [0, 4, 8]) {
            await click(guidedStart);
            for (let i = 0; i < step; i++) await click('[data-overlay-action="next"]');
            // Queue resize immediately before exit, matching the lifecycle race.
            await evaluate(`window.dispatchEvent(new Event('resize'));document.querySelector('#lcd-overlay-exit').click()`);
            await wait(200);
            const s = await state();
            await check(`queued resize cannot revive animation after exit at step ${step}`, closed(s) && s.mode === 'motion-text', s);
        }

        // Browser-level fullscreen denial: the fallback must remain usable.
        await evaluate(`window.__lcdSavedFullscreen=window.__lcdScreenTester.overlay.requestFullscreen;
            window.__lcdScreenTester.overlay.requestFullscreen=()=>Promise.reject(new DOMException('Test denial','NotAllowedError'))`);
        await click(manualStart);
        await wait(150);
        const fallback = await state();
        await check('denied native fullscreen retains working overlay and motion', fallback.open && !fallback.fullscreen && fallback.frame !== null && fallback.position > 0, fallback);
        await page.screenshot({ path: path.join(artifacts, 'desktop-fallback.png') });
        await click('#lcd-overlay-exit');
        await evaluate('window.__lcdScreenTester.overlay.requestFullscreen=window.__lcdSavedFullscreen;delete window.__lcdSavedFullscreen');
        await passiveRedraws();
        await wait(150);
        await check('fullscreen denial exit fully cleans up', closed(await state()), await state());

        await click(manualStart);
        await page.pressKey('Escape');
        await wait(200);
        await check('Escape exits and returns keyboard focus', closed(await state()) && (await state()).focusedAction === 'start-manual', await state());

        // Delay only the native exit Promise to verify stale focus recovery cannot
        // override a later user action. The browser still leaves fullscreen normally.
        await evaluate(`window.__lcdSavedExit=document.exitFullscreen;
            document.exitFullscreen=function(){return window.__lcdSavedExit.call(this).then(()=>new Promise(resolve=>{window.__lcdResolveExit=resolve}))}`);
        await click(manualStart);
        await click('#lcd-overlay-exit');
        await wait(150);
        await click('[data-motion-speed="slow"]');
        await evaluate('window.__lcdResolveExit();delete window.__lcdResolveExit');
        await wait(100);
        await check('delayed fullscreen exit does not steal focus from another control', await evaluate("document.activeElement?.dataset.motionSpeed === 'slow'"), await state());
        await click(manualStart);
        await click('#lcd-overlay-exit');
        await wait(150);
        await click(manualStart);
        await evaluate('window.__lcdResolveExit();delete window.__lcdResolveExit');
        await wait(100);
        await check('delayed previous exit does not steal focus from reopened overlay', await evaluate('window.__lcdScreenTester.overlayOpen && window.__lcdScreenTester.overlay.contains(document.activeElement)'), await state());
        await evaluate('document.exitFullscreen=window.__lcdSavedExit;delete window.__lcdSavedExit');
        await click('#lcd-overlay-exit');
        await wait(150);
        await check('reopened overlay still cleans up', closed(await state()), await state());
        await page.screenshot({ path: path.join(artifacts, 'desktop-exited.png') });

        const browserErrors = await page.consoleMessages('error');
        const appErrors = await evaluate('window.__lcdTestErrors');
        await fs.writeFile(path.join(artifacts, 'desktop-console.json'), JSON.stringify({ browserErrors, appErrors }, null, 2));
        await check('no application runtime errors', appErrors.length === 0 && !browserErrors.some(e => /lcd-screen-tester\.js.*(TypeError|ReferenceError)|Uncaught/.test(e.text)), { browserErrors, appErrors });

        // 390 CSS px iframe layout is reproducible; it is not a physical phone.
        for (const lang of ['en','zh','de','es','pt','fr']) {
            const url = `${base}${lang === 'en' ? '' : '/' + lang}/devices/lcd-screen-tester`;
            const mobile = await evaluate(`(async () => {
                document.querySelector('#lcd-mobile-acceptance')?.remove();
                const f=document.createElement('iframe');f.id='lcd-mobile-acceptance';f.title='390 CSS px LCD acceptance';
                f.style='position:fixed;inset:0;width:390px;height:844px;border:0;z-index:2147483647;background:white';
                f.src=${JSON.stringify(url)};
                await new Promise((resolve,reject)=>{
                    const timeout=setTimeout(()=>reject(Error('mobile iframe timeout')),15000);
                    f.onload=()=>{clearTimeout(timeout);resolve()};f.onerror=()=>{clearTimeout(timeout);reject(Error('mobile iframe failed'))};document.body.append(f)
                });
                await new Promise(r=>setTimeout(r,300));
                const w=f.contentWindow,d=f.contentDocument,t=w.__lcdScreenTester;
                const click=s=>d.querySelector(s).click();
                click('#lcd-tab-motion');click('[data-mode="motion-lines"]');
                await new Promise(r=>setTimeout(r,150));
                const plays=t.motionFrame!==null&&t.motionPosition>0;
                click('.lcd-hero-actions [data-action="start-guided"]');
                click('#lcd-overlay-exit');
                for(const type of ['resize','orientationchange','themeChanged'])w.dispatchEvent(new Event(type));
                await new Promise(r=>setTimeout(r,150));
                const clean=!t.overlayOpen&&t.motionFrame===null&&t.stepTimer===null&&t.controlHideTimer===null&&!t.root.inert;
                const mode=t.currentModeId;
                click('[data-motion-speed="fast"]');await new Promise(r=>setTimeout(r,150));
                const resumed=t.motionFrame!==null&&t.motionPosition>0;
                click('.lcd-hero-actions [data-action="start-manual"]');click('#lcd-overlay-exit');
                t.root.querySelector('.lcd-workbench').scrollIntoView({block:'start'});
                return {lang:d.documentElement.lang,width:d.documentElement.clientWidth,scroll:d.documentElement.scrollWidth,
                    plays,clean,mode,resumed,finalStopped:t.motionFrame===null,canvasWidth:t.previewCanvas.width};
            })()`);
            await check(`${lang}: mobile layout, exit and explicit resume`, mobile.width <= 390 && mobile.width > 0 && mobile.scroll <= mobile.width + 1 && mobile.plays && mobile.clean && mobile.mode === 'motion-lines' && mobile.resumed && mobile.finalStopped && mobile.canvasWidth > 1, mobile);
            if (lang === 'en' || lang === 'es') await page.screenshot({ path: path.join(artifacts, `${lang}-390px.png`) });
        }
        await evaluate("document.querySelector('#lcd-mobile-acceptance')?.remove()");
    }
} catch (error) {
    await fs.writeFile(path.join(artifacts, 'runner-error.txt'), error.stack);
    process.exitCode = 1;
    console.error(error);
} finally {
    await fs.writeFile(path.join(artifacts, expectBug ? 'baseline-commands.json' : 'e2e-commands.json'), JSON.stringify(commands, null, 2));
    await bridge.close();
}
if (checks.some(check => !check.passed)) process.exitCode = 1;
