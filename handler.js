const chromium = require("chrome-aws-lambda");

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

    await page.goto(event.url || "https://example.com");

    result = await page.title();
  } catch (error) {
    return { statusCode: 500, body: error.toString() };
  } finally {
    if (browser !== null) {
      await browser.close();
    }
  }

  return { statusCode: 200, body: result };
};
