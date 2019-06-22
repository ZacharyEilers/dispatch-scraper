const cheerio = require("cheerio");
var request = require("request-promise-native");

module.exports.getArticles = async function(categoryString) {
  if (categoryString === null) {
    categoryString = "news";
  }
  const firstPage = await request.get(
    `https://thedispatchonline.net/category/${categoryString}/`
  );
  const $ = cheerio.load(firstPage);
  const numberOfPages = $(".page")
    .eq(-1)
    .text();

  const pagePromiseArray = [];

  for (var i = 2; i <= numberOfPages; i++) {
    pagePromiseArray.push(
      request.get(
        `https://thedispatchonline.net/category/${categoryString}/page/${i}/`
      )
    );
  }

  const previewPages = await Promise.all(pagePromiseArray);

  const dataArray = [];

  previewPages.forEach(function(htmlString, index) {
    dataArray.push(...getCategoryPageLinks(htmlString));
  });

  const numberOfArticlePagesToScrape = 5;

  const articlePagePromiseArray = [];
  dataArray.forEach(function(obj, index) {
    if (index < numberOfArticlePagesToScrape) {
      articlePagePromiseArray.push(request.get(obj.link));
    }
  });

  const articlePages = await Promise.all(articlePagePromiseArray);

  //index > dataArray.length - numberOfArticlePagesToScrape
  //index < numberOfArticlePagesToScrape
  dataArray.map(function(obj, index) {
    if (true) {
      try {
        obj.body = getArticleBody(articlePages[index]).filter(
          obj => obj.content.trim().length > 2
        );
      } catch (e) {
        //  console.log("Caught Error", index, obj.link);
      }
    }
    return obj;
  });

  return dataArray;
};

module.exports.getCategoryPageLinks = function(htmlString) {
  const $ = cheerio.load(htmlString);

  const articlePreviews = [];

  const headlines = $("h2.searchheadline")
    .toArray()
    .map(elem => $(elem).text());
  const links = $("h2.searchheadline > a")
    .toArray()
    .map(elem => $(elem).attr("href"));

  const bodyPreviews = $("div.sno-animate")
    .toArray()
    .map(elem =>
      $(elem)
        .children("p")
        .eq(-1)
        .text()
        .replace(/\n/g, "")
    );

  headlines.forEach((text, index) => {
    articlePreviews.push({
      title: text,
      link: links[index],
      bodyPreview: bodyPreviews[index]
    });
  });
  return articlePreviews;
};

module.exports.getArticleBody = function(htmlString) {
  const $ = cheerio.load(htmlString);
  const body = [];
  // $(".p1").each(function (i, elem) {
  //     bodyParagraphs.push($(elem).text());
  // });
  $(".pf-content")
    .children("p, h2")
    .each(function(index, elem) {
      if ($(elem)[0].name === "h2") {
        body.push({ type: "subtitle", content: $(elem).text() });
      } else if ($(elem)[0].name === "p") {
        body.push({ type: "text", content: $(elem).text() });
      }
    });
  //return $('.pf-content').text();
  return body;
};
