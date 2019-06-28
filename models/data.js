module.exports = function () {

    var mongojs = require("mongojs");
    var axios = require("axios");
    var cheerio = require("cheerio");

    // Database configuration
    var databaseUrl = "scraper";
    var collections = ["scrapedData"];

    // Hook mongojs configuration to the db variable
    var db = mongojs(databaseUrl, collections);
    db.on("error", function (error) {
        console.log("Database Error:", error);
    });

    db.once("open", function () {
        console.log("Mongoose connection successful.");
    });

    function ScrapNews() {
        axios.get("https://www.levelup.com/").then(function (response) {

            // Load the HTML into cheerio and save it to a variable
            // '$' becomes a shorthand for cheerio's selector commands, much like jQuery's '$'
            var $ = cheerio.load(response.data);

            // An empty array to save the data that we'll scrape
            var results = [];

            // Select each element in the HTML body from which you want information.
            // NOTE: Cheerio selectors function similarly to jQuery's selectors,
            // but be sure to visit the package's npm page to see how it works
            $(".newswrap article").each(function (i, element) {

                // var title = $(element).children().text();
                // var link = $(element).find("a").attr("href");

                var title = $(element).find("a").attr("title");
                var link = $(element).find("a").attr("href");

                if (title && link) {
                    // Insert the data in the scrapedData db
                    db.scrapedData.insert({
                        title: title,
                        link: link
                    },
                        function (err, inserted) {
                            if (err) {
                                // Log the error if one is encountered during the query
                                console.log(err);
                            }
                            else {
                                // Otherwise, log the inserted data
                                console.log(inserted);
                            }
                        }
                    );
                }
            });

            console.log(ScrapData);
            return db.scrapedData.find();
        }
    }


};
