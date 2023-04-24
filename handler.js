const chromium = require("chrome-aws-lambda");

const url = process.env.TARGET_URL;

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
    await page.waitForSelector('.t_btn_type_01');
    await page.click('.t_btn_type_01')
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
