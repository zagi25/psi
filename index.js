const psi = require('psi');

// const MAIN_URL = 'https://test-main--milo--zagi25.hlx.page/drafts/ratko/lcp-fcp-test-multiple-blocks-in-section?martech=off';
const MAIN_URL = 'https://main--milo--zagi25.hlx.page/drafts/ratko/lcp-fcp-test-multiple-blocks-in-section?martech=off';
const BRANCH_URL = 'https://display-section-on-first-block--milo--zagi25.hlx.page/drafts/ratko/lcp-fcp-test-multiple-blocks-in-section?martech=off';
// const BRANCH_URL = 'https://only-first-block--milo--zagi25.hlx.page/drafts/ratko/lcp-fcp-test-multiple-blocks-in-section?martech=off';
// const BRANCH_URL = 'https://first-and-last--milo--zagi25.hlx.page/drafts/ratko/lcp-fcp-test-multiple-blocks-in-section?martech=off';
const REQ_NUM = 50;
const MOBILE_STRATEGY = {
  nokey: 'true',
  strategy: 'mobile'
};
const DESKTOP_STRATEGY = {
  nokey: 'true',
  strategy: 'desktop'
};

const extractData = ({ data }) => {
  return {
    score: data.lighthouseResult.categories.performance.score,
    FCP: data.lighthouseResult.audits['first-contentful-paint'].numericValue,
    LCP: data.lighthouseResult.audits['largest-contentful-paint'].numericValue,
    CLS: data.lighthouseResult.audits['cumulative-layout-shift'].numericValue,
  }
}

const calculateAverage = (data) => {
  const sumData = data.reduce((acc, obj) => {
    Object.entries(obj).forEach(([key,value]) => {
      if (typeof value === 'number') {
        acc[key] = (acc[key] || 0) + value;
      }
    });
    return acc;
  },{});

  return {
    score: sumData.score / data.length,
    FCP: sumData.FCP / data.length,
    LCP: sumData.LCP / data.length,
    CLS: sumData.CLS / data.length,
  }
};

const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

(async () => {
  const mainMobileResults = [];
  const mainDesktopResults = [];
  const branchMobileResults = [];
  const branchDesktopResults = [];

  for (let i = 0; i < REQ_NUM; i++) {
    process.stdout.clearLine(0);
    process.stdout.cursorTo(0);
    process.stdout.write(`${i+1} / ${REQ_NUM}`);
    if (i === REQ_NUM - 1) {
      process.stdout.write('\n');
    }

    const mainMobile = psi(MAIN_URL, MOBILE_STRATEGY);
    const mainDesktop = psi(MAIN_URL, DESKTOP_STRATEGY);
    const branchMobile = psi(BRANCH_URL, MOBILE_STRATEGY);
    const branchDesktop = psi(BRANCH_URL, DESKTOP_STRATEGY);

    await Promise.all([mainMobile, mainDesktop, branchMobile, branchDesktop]).then((results) => {
      mainMobileResults.push(extractData(results[0]));
      mainDesktopResults.push(extractData(results[1]));
      branchMobileResults.push(extractData(results[2]));
      branchDesktopResults.push(extractData(results[3]));
    });

    await sleep(3000);
  }

  const mainMobileAverage = calculateAverage(mainMobileResults);
  const mainDesktopAverage = calculateAverage(mainDesktopResults);
  const branchMobileAverage = calculateAverage(branchMobileResults);
  const branchDesktopAverage = calculateAverage(branchDesktopResults);

  // console.log('Main mobile results:');
  // console.log(mainMobileResults);
  console.log(MAIN_URL);
  console.log('Main mobile average:');
  console.log(mainMobileAverage);
  // console.log('Main desktop results:');
  // console.log(mainDesktopResults);
  console.log('Main desktop average:');
  console.log(mainDesktopAverage);
  // console.log('Branch mobile results:');
  // console.log(branchMobileResults);
  console.log(BRANCH_URL);
  console.log('Branch mobile average:');
  console.log(branchMobileAverage);
  // console.log('Branch desktop results:');
  // console.log(branchDesktopResults);
  console.log('Branch desktop average:');
  console.log(branchDesktopAverage);
})();
