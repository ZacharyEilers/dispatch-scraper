const express = require("express");
const app = express();
const bodyParser = require("body-parser");

const admin = require("firebase-admin");

const { getAndParseRSSFeed } = require("./scrape_rss.js");

app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", async (req, res) => {
  // const data = await getNewsArticles();
  // res.json(data);
  var parsedRSS = await getAndParseRSSFeed();

  res.json(parsedRSS);
});

app.listen(3000, function() {
  console.log("JBHS Dispatch Scraper is Running on localhost:3000");
});
