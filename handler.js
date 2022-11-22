const chromium = require("chrome-aws-lambda");

const korailUrl =
  "https://www.letskorail.com/ebizprd/EbizPrdTicketPr21111_i1.do?&txtGoAbrdDt=20221125&txtGoHour=185000&selGoYear=2022&selGoMonth=11&selGoDay=25&selGoHour=15&txtGoPage=2&txtGoStartCode=0104&txtGoStart=%EC%9A%A9%EC%82%B0&txtGoEndCode=0030&txtGoEnd=%EC%9D%B5%EC%82%B0&selGoTrain=00&selGoRoom=&selGoRoom1=&txtGoTrnNo=&useSeatFlg=&useServiceFlg=&selGoSeat=&selGoService=&txtPnrNo=&hidRsvChgNo=&hidStlFlg=&radJobId=1&SeandYo=&hidRsvTpCd=03&selGoSeat1=015&selGoSeat2=&txtPsgCnt1=1&txtPsgCnt2=0&txtMenuId=11&txtPsgFlg_1=1&txtPsgFlg_2=0&txtPsgFlg_3=0&txtPsgFlg_4=0&txtPsgFlg_5=0&txtPsgFlg_8=0&chkCpn=N&txtSeatAttCd_4=015&txtSeatAttCd_3=000&txtSeatAttCd_2=000&txtGoStartCode2=&txtGoEndCode2=&hidDiscount=&hidEasyTalk=&adjcCheckYn=N";

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

    await page.goto(korailUrl);

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
