const chromium = require('chrome-aws-lambda');

exports.handler = async (event, context) => {

    const pageToScreenshot = JSON.parse(event.body).pageToScreenshot;

    if (!pageToScreenshot) return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Page URL not defined' })
    }
    
    const pathToExtension = [require('path').join(__dirname, 'hcaptcha')];

    const browser = await chromium.puppeteer.launch({
        args: [chromium.args,`--disable-extensions-except=${pathToExtension}`,
    `--load-extension=${pathToExtension}`,],
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath,
        headless: chromium.headless,
    });
    
    const page = await browser.newPage();

    await page.goto(pageToScreenshot, { waitUntil: 'networkidle2' });
    
    await page.waitForTimeout(50000)

    const screenshot = await page.screenshot({ encoding: 'binary' });

    await browser.close();
  
    return {
        statusCode: 200,
        body: JSON.stringify({ 
            message: `Complete screenshot of ${pageToScreenshot}`, 
            buffer: screenshot 
        })
    }

}
