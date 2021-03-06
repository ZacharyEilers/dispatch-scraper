const parseXML = require("xml2js").parseString;
const request = require("request-promise-native");
const cheerio = require("cheerio");
const { getArticleBody } = require("./scrape_old_articles.js");

module.exports.getAndParseRSSFeed = async function() {
  const rssXML = await request.get("https://thedispatchonline.net/feed/");
  const articleArray = [];

  parseXML(rssXML, (err, result) => {
    if (err) console.log(err);
    // console.log(result.rss.channel[0].item[0]);
    // for (const key in result.rss.channel[0].item[0]) {
    //     console.log(`key: ${key}, value:${result.rss.channel[0].item[0][key]}`);
    // }
    //res.json(result.rss.channel[0].item[0]);

    result.rss.channel[0].item.forEach(obj => {
      //const $ = cheerio.load(obj["content:encoded"][0]);
      const bodyParagraphs = getArticleBody(obj["content:encoded"][0]);
      articleArray.push({
        title: obj.title[0],
        pubDate: obj.pubDate[0],
        creator: obj["dc:creator"][0],
        categories: obj.category,
        description: obj.description[0],
        link: obj.link[0],
        body: bodyParagraphs
      });
    });
  });

  return {
    meta: {
      scrapedDate: Date.now()
    },
    articles: articleArray
  };
};
