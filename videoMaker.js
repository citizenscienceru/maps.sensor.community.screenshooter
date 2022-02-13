const nconf = require("nconf");
const exec = require("child_process").exec;
const { upload } = require("youtube-videos-uploader");
const fs = require("fs");

nconf.argv().env().file({
  file: "./config.json",
});

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

const uploadpm25 = async (credentials, title, description, screenShotPath) => {
  // pm2.5 upload
  const video1 = {
    path: `${screenShotPath}out-pm2.5.mp4`,
    title: title,
    description: description,
    tags: ["pm2.5", "Saint-Petersburg", "SPb", "CitizenScience.ru"],
    playlist: "Санкт-Петербург - тонкодисперсные частицы",
  };
  return await upload(credentials, [video1]).then(console.log);
};

const uploadpm10 = async (credentials, title, description, screenShotPath) => {
  const video2 = {
    path: `${screenShotPath}out-pm10.mp4`,
    title: title,
    description: description,
    tags: ["pm2.5", "Saint-Petersburg", "SPb", "CitizenScience.ru"],
    playlist: "Санкт-Петербург - тонкодисперсные частицы",
  };
  return await upload(credentials, [video2]).then(console.log);
};

(async () => {
  // let screenShotPath = nconf.get("screenshotsPath");
  let today = new Date();
  let screenShotPath = "7-Feb-2022";
  // today.getDate() + "-" + getMonth[today.getMonth() + 1] + "-" + today.getFullYear();

  const date = screenShotPath;
  screenShotPath = nconf.get("screenshotsPath") + `/${screenShotPath}/`;

  exec(
    `ffmpeg -framerate 5 -pattern_type glob -i '${screenShotPath}/*pm10.png.ready.png' -c:v libx264 -pix_fmt yuv420p ${screenShotPath}out-pm10.mp4`,
    function callback(error, stdout, stderr) {
      if (error) {
        console.error(error);
        process.exit(1);
      }
    }
  );

  exec(
    `ffmpeg -framerate 5 -pattern_type glob -i '${screenShotPath}/*pm2.5.png.ready.png' -c:v libx264 -pix_fmt yuv420p ${screenShotPath}out-pm2.5.mp4`,
    function callback(error, stdout, stderr) {
      if (error) {
        console.error(error);
        process.exit(1);
      }
    }
  );

  // Upload video
  // recoveryemail is optional, only required to bypass login with recovery email if prompted for confirmation
  const credentials = {
    email: "contact@citizenscience.ru",
    pass: "Yjdfz;bpym2410_",
    recoveryemail: "contact@citizenscience.ru",
  };

  await uploadpm25(
    credentials,
    "PM 2.5" + date,
    "Санкт-Петербург. Мониторинг качества воздуха.",
    screenShotPath
  );
  await uploadpm10(
    credentials,
    "PM 10" + date,
    "Санкт-Петербург. Мониторинг качества воздуха.",
    screenShotPath
  );

  fs.rmdirSync(screenShotPath, { recursive: true });

  process.exit(0);
})();
