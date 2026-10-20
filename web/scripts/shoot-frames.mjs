import { chromium } from "playwright";

const url = process.env.LAB_URL ?? "http://localhost:3200/render-lab";
const out = process.env.LAB_OUT ?? "frame-lab.png";

const browser = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader"] });
const page = await browser.newPage({ viewport: { width: 1440, height: 1100 }, deviceScaleFactor: 2 });
await page.goto(url, { waitUntil: "networkidle" });
await page.waitForFunction(
  () => document.querySelectorAll("#specimens li img, #specimens li div[style*='background-image']").length > 0,
  null,
  { timeout: 60000 },
);
await page.waitForTimeout(1500);
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));
await page.screenshot({ path: out, fullPage: true });
const count = await page.locator("#specimens li").count();
console.log(`shot ${out}: ${count} specimens, pageerrors ${errors.length}`);
await browser.close();
