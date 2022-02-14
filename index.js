const puppeteer = require("puppeteer");
const nconf = require("nconf");
const Jimp = require("jimp");
const fs = require("fs");

nconf.argv().env().file({
  file: "./config.json",
});

const getPM25 = async (page, screenshotFileName) => {
  console.log("Getting PM2.5");
  await page.waitForTimeout(100000);
  return await page.screenshot({
    path: `${screenshotFileName}_pm2.5.png`,
  });
};

const getPM10 = async (page, screenshotFileName) => {
  console.log("Getting PM10");
  let elem = await page.$(".select-selected");
  let selector = await elem.boundingBox();
  await page.mouse.click(selector.x + selector.width / 2, selector.y + selector.height / 2);
  elem = await page.$("#select-item-PM10");
  selector = await elem.boundingBox();
  await page.mouse.click(selector.x + selector.width / 2, selector.y + selector.height / 2);
  page.waitForTimeout(50000);
  return await page.screenshot({
    path: `${screenshotFileName}_pm10.png`,
  });
};

const getMonth = {
  // 1: "Января",
  // 2: "Февраля",
  // 3: "Марта",
  // 4: "Апреля",
  // 5: "Мая",
  // 6: "Июня",
  // 7: "Июля",
  // 8: "Августа",
  // 9: "Сентября",
  // 10: "Октября",
  // 11: "Ноября",
  // 12: "Декабря",
  1: "Jan",
  2: "Feb",
  3: "Mar",
  4: "Apr",
  5: "May",
  6: "Jun",
  7: "Jul",
  8: "Aug",
  9: "Sep",
  10: "Oct",
  11: "Nov",
  12: "Dec",
};

const writeImage = async (screenshotFileName, name) => {
  // добавление надписей
  const image = await Jimp.read(`${screenshotFileName}`);
  const font = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);

  let today = new Date();
  let minutes = today.getMinutes() + "";
  if (minutes.length <= 1) {
    minutes = `0${minutes}`;
  }
  let hours =
    today.getDate() +
    "-" +
    getMonth[today.getMonth() + 1] +
    "-" +
    today.getFullYear() +
    " " +
    today.getHours() +
    ":" +
    minutes;
  console.log(minutes);
  image.print(font, 800, 10, name + " " + hours);

  await image.write("./tmp/t.png");

  // логотип гражданской науки
  let watermark = await Jimp.read(nconf.get("logo"));
  watermark = watermark.resize(100, 100); // Resizing watermark image
  const image1 = await Jimp.read("./tmp/t.png");
  watermark = await watermark;
  image1.composite(watermark, 1948, 0, {
    mode: Jimp.BLEND_SOURCE_OVER,
    opacityDest: 1,
    opacitySource: 0.5,
  });
  const font1 = await Jimp.loadFont(Jimp.FONT_SANS_12_BLACK);
  image1.print(font1, nconf.get("logoText").x, nconf.get("logoText").y, nconf.get("logoText").text);
  return await image1.writeAsync(`${screenshotFileName}.ready.png`);
};

const start = async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox']
  });
  const page = await browser.newPage();

  process.on("SIGINT", function () {
    browser.close();
    process.exit(err ? 1 : 0); // err is not defied anywhere
  });

  // directory for current date
  let today = new Date();
  let dir =
    nconf.get("screenshotsPath") +
    today.getDate() +
    "-" +
    getMonth[today.getMonth() + 1] +
    "-" +
    today.getFullYear();
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, {});
  }

  const screenshotFileName = new Date().getTime();
  console.log(screenshotFileName);

  await page.setViewport({
    width: 2048,
    height: 1080,
    deviceScaleFactor: 1,
  });
  await page.goto(nconf.get("url"));

  if (nconf.get("getPM2.5")) {
    await getPM25(page, `${dir}/${screenshotFileName}`);
    writeImage(`${dir}/${screenshotFileName}_pm2.5.png`, "PM 2.5");
  }
  if (nconf.get("getPM10")) {
    await getPM10(page, `${dir}/${screenshotFileName}`);
    writeImage(`${dir}/${screenshotFileName}_pm10.png`, "PM 10");
  }

  browser.close();
};

setInterval(() => {
  start();
}, 120000); // every two minutes

start();
