const chromium = require("chrome-aws-lambda");
const TelegramBot = require("node-telegram-bot-api");
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN);

const url = "";

module.exports.run = async (event, context) => {
  let result = null;
  let browser = null;

  try {
    browser = await chromium.puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath,
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
    });

    let page = await browser.newPage();

    await page.goto(url);

    const timesAndAvailabilities = await page.evaluate(() =>
      Array.from(document.querySelectorAll("tr"))
        .filter((_, i, arr) => i !== 0 && i !== arr.length - 1)
        .map((n) => [
          `${n.querySelector("td:nth-child(3)").textContent.trim()} ~ ${n
            .querySelector("td:nth-child(4)")
            .textContent.trim()}`,
          n.querySelector(
            "td:nth-child(6) > a:first-child > img, td:nth-child(6) > img"
          ).alt,
        ])
    );

    result = timesAndAvailabilities.some(
      ([_, _availability]) => _availability === "예약하기"
    )
      ? timesAndAvailabilities.filter(
          ([_, _availability]) => _availability === "예약하기"
        )
      : false;

    if (result) {
      await bot.sendMessage(
        process.env.TELEGRAM_CHANNEL_ID,
        `예약 가능한 시간대: ${result?.map?.(([time, _]) => time).join(", ")}`
      );
    }

    console.log(result);
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: error.message,
      }),
    };
  } finally {
    if (browser !== null) {
      await browser.close();
    }
  }

  return {
    statusCode: 200,
    body: JSON.stringify(result, null, 2),
  };
};
