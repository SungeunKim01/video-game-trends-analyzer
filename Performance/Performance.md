# Performance of Video Game Trends Analyzer

## Introduction and Methodology

<!-- Briefly state how you gathered data about app performance, and in what environment
(which browsers, what browser versions, what kind of device, OS,
width and height of viewport as reported in the console with `window.screen`) -->

For measuring the performance of our site, we mostly used WebPageTest's Instant Test on the Render deployment of our site, testing both Site Performance and doing the Lighthouse test. We also looked at the network tab of the inspector to check how long requests took and if things were being cached. The width and height of the viewport is 1920 x 1080.

Yan Chi: I used Google Chrome version 142.0.7444.176 on my Windows desktop.
Sungeun: I used Google Chrome version 142.0.7444.176 on my Windows10 desktop

---

## Baseline Performance

<!-- Summarize initial results for each tool that you used. Did the tools
detect all the performance issues you see as a user? -->

![Initial Performance and Lighthouse Scores](./screenshots/initial%20performance.png)

In the initial test for our application, we got a pretty good score on both Page Performance and the Lighthouse report, though there was defintely places that we could have improved on.

![Initial Issues](./screenshots/initial%20issues.png)

In particular, we had some issues with render blocking from external CSS files, which we later found out had to do with the use of Google Fonts. We also saw an issue that stated our final HTML size was much larger than the initial delivered HTML, but that was because of us using React. There were also some accessibility changes we could make, such as adding labels to select tags and changing some of the colour contrast.

![Initial Requests](./screenshots/inital%20requests.png)

When looking in our network tab, we saw that after changing the year, it took almost half a second to fetch the data from our api, which was quite slow, and may affect the user's experience. There was also no caching on the server-side, so the data from a previously selected year had to be re-fetched.

---

## Summary of Changes

<!-- Briefly describe each change and the impact it had on performance (be specific). If there
was no performance improvement, explain why that might be the case -->

### Change 1: Enable gzip compression on the Express server

Lead: Sungeun Kim

Link:

[Imported the compression & Enable gzip compression](https://gitlab.com/dawson-cst-cohort-2026/520/section2/teams/TeamL-23-JenSungeunYanChi/520-project-huang-ng-kim/-/blob/PerformanceImprovements/Video_Game_Trends_Analyzer_Project/server/app.js?ref_type=heads#L2)

#### Before I make changes

WebPageTest showed that main JS file index-ek_CDui.js blocked the main thread for 326ms and had a large transfer size. so, enabling gzip compression reduces the transfer size of this file and all other text assets, so they arrive faster and reduce the time spent before parsing and execution

<img height="300" src="./screenshots/Change1_1.png"/>
<img height="300" src="./screenshots/Change1_2.png"/>

#### After I make changes

- I tested the Render deployment using chrome devtool. On larger api responses, the Content-Encoding header now appears with the value br. This means the response is being compressed before it is sent to the browser. both br (Brotli) and gzip are supported, so seeing Content-Encoding: br confirms that the Express compression middleware is working correctly.

<img height="300" src="./screenshots/Change1_3.png"/>

...

### Change 2: Add Cache Control headers for API GET responses

Lead: Sungeun Kim

Link:

[Add Cache Control headers for API GET responses](https://gitlab.com/dawson-cst-cohort-2026/520/section2/teams/TeamL-23-JenSungeunYanChi/520-project-huang-ng-kim/-/blob/PerformanceImprovements/Video_Game_Trends_Analyzer_Project/server/app.js?ref_type=heads#L35)

#### Before I make changes

WebPageTest flagged 9 of our /api/sales/... and /api/trends/... urls with FAILED (no max-age or expires). So adding Cache Control: public, max-age=300 to all API GET responses directly fixes this issue and lets the browser cache our read only JSON data

<img height="300" src="./screenshots/Change2.png"/>

#### After I make changes

- I tested the Render deployment using chrome devtool. I also checked the Response Headers of the same api request on the deployed site. The response now includes Cache-Control: max-age=300. This shows that middleware is correctly setting the caching on all /api/.. GET responses in production. On a second reload, chrome serves some of these requests from disk or memory cache, confirming that the browser is reusing the json

<img height="300" src="./screenshots/Change2_1.png"/>

---

## Conclusion

<!-- Summarize which changes had the greatest impact, note any surprising results and list 2-3 main
things you learned from this experience. -->
