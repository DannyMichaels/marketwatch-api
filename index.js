const express = require('express');
const cors = require('cors');
const puppeteer = require('puppeteer');
// const puppeteer = require('puppeteer-extra');
// const StealthPlugin = require('puppeteer-extra-plugin-stealth');

const PORT = process.env.PORT || 3003;

const app = express();

app.use(cors());

app.get('/:symbol', async (req, res) => {
  const { symbol } = req.params;
  // puppeteer.use(StealthPlugin());
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    headless: 'new',
  });

  await browser.userAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'
  );

  const page = await browser.newPage();
  await page.setViewport({ width: 1818, height: 1055 });
  const url = `https://www.marketwatch.com/investing/index/${symbol}`;
  await page.goto(url);
  await page.waitForSelector('span.value');

  const result = await page.evaluate(() => {
    const currentValue = document.querySelector('span.value').textContent;
    const changePoint = document.querySelector(
      'span.change--point--q'
    ).textContent;
    const symbol = document.querySelector('.company__ticker').textContent;
    const companyName = document.querySelector('.company__name').textContent;
    const exchange = document.querySelector('.company__market').textContent;

    return {
      currentValue,
      changePoint,
      symbol,
      companyName,
      exchange,
    };
  });

  await browser.close();
  return res.status(200).json(result);
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
