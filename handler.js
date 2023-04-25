const chromium = require("chrome-aws-lambda");
const TelegramBot = require("node-telegram-bot-api");
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN);

const url = process.env.TARGET_URL;
const targetNumbers = [232, 221, 237, 220, 224, 249, 270, 262, 274];

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

    await page.type('#MEM_ID', process.env.ID);
    await page.type('#MEM_PWD', process.env.PASSWORD);
    await page.click('.loginBtn');
    await page.waitForTimeout(500);

    await page.goto('https://www.jeonjufest.kr/Ticket/timetable_day.asp');
    const newPagePromise = new Promise(x => browser.once('targetcreated', target => x(target.page())));
    await page.waitForSelector('.t_btn_type_01');
    await page.click('.t_btn_type_01')
    const newPage = await newPagePromise;

    for await (const targetNumber of targetNumbers) {
      await newPage.waitForSelector('#xticket');
      const elementHandle = await newPage.$('#xticket')
      const frame = await elementHandle.contentFrame();
      await frame.waitForSelector('.schedule-search-wrap')
      await frame.waitForSelector('.schedule-search')
      await frame.waitForSelector('.list1')
      await frame.$eval('.schedule-search', el => el.value = '')
      await frame.type('.schedule-search', `${targetNumber}`)
      await newPage.keyboard.press('Enter')
      await frame.waitForSelector('.list-title')
      await frame.click('#step0 .full')
      const isAvailable = await frame.$eval('#popup-area-msg', el => el.style.display) !== 'block'

      if (isAvailable) {
        await bot.sendMessage(process.env.TELEGRAM_CHANNEL_ID, `남은 좌석이 있습니다. 번호 : ${targetNumber}\n${url}`)
      }

      // reload page
      await newPage.reload()
      await newPage.waitForTimeout(1500);
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: error.message,
      }),
    };
  } finally {
    if (browser !== null) {
      // await browser.close();
    }
  }

  return {
    statusCode: 200,
    body: JSON.stringify(result, null, 2),
  };
};
