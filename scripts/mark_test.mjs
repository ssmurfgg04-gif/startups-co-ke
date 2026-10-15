import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 620, height: 560 }, deviceScaleFactor: 2 });
await p.goto('file:///home/z/my-project/scripts/marktest.html');
await p.waitForTimeout(400);
await p.screenshot({ path: '/home/z/my-project/qa/mark_test.png' });
await b.close();
console.log('shot saved');
