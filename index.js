var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var cheerio = require("cheerio");
var request = require("request-promise-native");

const parseXML = require("xml2js").parseString;


app.use(bodyParser.urlencoded({ extended: true }));



const homeRoute = async (req, res) => {

    // const data = await getNewsArticles();
    // res.json(data);
    const parsedRSS = await getAndParseRSSFeed();
    res.json(parsedRSS);
}
app.get("/", homeRoute);


async function getAndParseRSSFeed() {
    const rssXML = await request.get("https://thedispatchonline.net/feed/");
    const articleArray = [];

    parseXML(rssXML, (err, result) => {
        if (err) console.log(err);
        // console.log(result.rss.channel[0].item[0]);
        // for (const key in result.rss.channel[0].item[0]) {
        //     console.log(`key: ${key}, value:${result.rss.channel[0].item[0][key]}`);
        // }
        //res.json(result.rss.channel[0].item[0]);

        result.rss.channel[0].item.forEach((obj) => {
            const $ = cheerio.load(obj['content:encoded'][0]);
            const bodyParagraphs = [];
            $('.pf-content').children("p").each((index, elem) => {
                bodyParagraphs.push($(elem).text());
            });
            articleArray.push({
                title: obj.title,
                link: obj.link,
                pubDate: obj.pubDate,
                creator: obj.creator,
                categories: obj.categories,
                description: obj.description,
                body: bodyParagraphs
            });
        });
    });

    return articleArray;
}




async function getArticles(categoryString) {
    if (categoryString === null) {
        categoryString = "news"
    }
    const firstPage = await request.get(`https://thedispatchonline.net/category/${categoryString}/`);
    const $ = cheerio.load(firstPage);
    const numberOfPages = $(".page").eq(-1).text();

    const pagePromiseArray = [];

    for (var i = 2; i <= numberOfPages; i++) {
        pagePromiseArray.push(request.get(`https://thedispatchonline.net/category/${categoryString}/page/${i}/`));
    }

    const previewPages = await Promise.all(pagePromiseArray);



    const dataArray = [];

    previewPages.forEach(function (htmlString, index) {
        dataArray.push(...getCategoryPageLinks(htmlString));
    });

    const numberOfArticlePagesToScrape = 5;

    const articlePagePromiseArray = [];
    dataArray.forEach(function (obj, index) {
        if (index < numberOfArticlePagesToScrape) {
            articlePagePromiseArray.push(request.get(obj.link));
        }
    });

    const articlePages = await Promise.all(articlePagePromiseArray);

    //index > dataArray.length - numberOfArticlePagesToScrape
    //index < numberOfArticlePagesToScrape
    dataArray.map(function (obj, index) {
        if (true) {
            try {
                obj.body = getArticleBody(articlePages[index]).filter(obj => obj.content.trim().length > 2);
            } catch (e) {
                //  console.log("Caught Error", index, obj.link);
            }
        }
        return obj;
    });


    return dataArray;
}

function getCategoryPageLinks(htmlString) {

    const $ = cheerio.load(htmlString);

    const articlePreviews = [];

    const headlines = $("h2.searchheadline").toArray().map((elem) => $(elem).text());
    const links = $("h2.searchheadline > a").toArray().map((elem) => $(elem).attr('href'));

    const bodyPreviews = $("div.sno-animate").toArray().map((elem) => $(elem).children("p").eq(-1).text().replace(/\n/g, ''));


    headlines.forEach((text, index) => {
        articlePreviews.push({ title: text, link: links[index], bodyPreview: bodyPreviews[index] });
    });
    return articlePreviews;
}



function getArticleBody(htmlString) {
    const $ = cheerio.load(htmlString);
    const body = [];
    // $(".p1").each(function (i, elem) {
    //     bodyParagraphs.push($(elem).text());
    // });
    $(".pf-content").children('p, h2').each(function (index, elem) {

        if ($(elem)[0].name === "h2") {
            body.push({ type: "subtitle", content: $(elem).text() });
        } else if ($(elem)[0].name === "p") {
            body.push({ type: "text", content: $(elem).text() });
        }
    });
    //return $('.pf-content').text();
    return body;
}


app.listen(3000, function () {
    console.log("JBHS Dispatch Scraper is Running on localhost:3000");
});






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