import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';
import path from 'path';

const htmlPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'slides.html');
const outputPath = '/mnt/c/Users/hiden/Downloads/AccessRoute_プレゼン.pdf';

const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});
const page = await browser.newPage();
await page.setViewport({ width: 1920, height: 1080 });
await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0', timeout: 30000 });

// Wait for fonts
await page.evaluate(() => document.fonts.ready);
await new Promise(r => setTimeout(r, 1000));

const slides = await page.$$('.slide');
const pdfPages = [];

for (let i = 0; i < slides.length; i++) {
  // Activate only current slide
  await page.evaluate((idx) => {
    document.querySelectorAll('.slide').forEach((s, j) => {
      s.classList.toggle('active', j === idx);
      s.style.display = j === idx ? 'flex' : 'none';
    });
    // Hide nav, timer, counter
    document.querySelector('.nav').style.display = 'none';
    document.querySelector('.timer').style.display = 'none';
    document.querySelector('.slide-counter').style.display = 'none';
  }, i);

  await new Promise(r => setTimeout(r, 300));

  const screenshotBuffer = await page.screenshot({
    type: 'png',
    clip: { x: 0, y: 0, width: 1920, height: 1080 },
  });
  pdfPages.push(screenshotBuffer);
}

// Create PDF from screenshots
const pdfPage = await browser.newPage();
const htmlContent = pdfPages.map((buf, i) => {
  const b64 = buf.toString('base64');
  const pageBreak = i < pdfPages.length - 1 ? 'page-break-after: always;' : '';
  return `<div style="margin:0;padding:0;${pageBreak}"><img src="data:image/png;base64,${b64}" style="width:100%;height:auto;display:block;"></div>`;
}).join('');

await pdfPage.setContent(`<!DOCTYPE html><html><head><style>@page{size:1920px 1080px;margin:0}body{margin:0;padding:0}</style></head><body>${htmlContent}</body></html>`, { waitUntil: 'load' });

await pdfPage.pdf({
  path: outputPath,
  width: '1920px',
  height: '1080px',
  margin: { top: 0, right: 0, bottom: 0, left: 0 },
  printBackground: true,
  preferCSSPageSize: true,
});

await browser.close();
console.log(`PDF saved: ${outputPath}`);
