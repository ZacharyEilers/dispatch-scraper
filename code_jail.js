//  CODE JAIL

// function getArticlePageData(htmlString) {
//     const title = getTitle(htmlString);
//     const bodyParagraphs = getAllBodyParagraphs(htmlString);

//     return {
//         title: title,
//         bodyParagraphs: bodyParagraphs
//     }
// }

// function getTitle(htmlString) {
//     const $ = cheerio.load(htmlString);
//     return $("h1.storyheadline").text();
// }

// dataArray.forEach(function (articlePreviewObj, index) {
//     console.log(articlePreviewObj);
//     request.get(articlePreviewObj.link).then(function (articleHtml) {
//         try {
//             dataArray[index].content = getArticlePageData(articleHtml);
//         } catch (e) {
//             console.log('CAUGHT ERROR');
//             console.log(e);
//         }

//     });
// });

// dataArray.map(function (articlePreviewObj) {

//     request.get({
//         uri: "https://www.google.com/",
//         headers: {
//             'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36'
//         }
//     }).then(function (articleHtml) {
//         try {
//             //2articlePreviewObj.content = getArticlePageData(articleHtml);
//             return articlePreviewObj;
//         } catch (e) {
//             console.log('CAUGHT ERROR');
//             console.log(e);
//         }
//         return {};

//     }).catch((e) => {
//         console.log("there was an error");
//         console.log(e);
//     });

// });
