module.exports = function (app) {


  var mongojs = require("mongojs");
  var axios = require("axios");
  var cheerio = require("cheerio");

  // Database configuration
  var databaseUrl = "scraper";
  var collections = ["scrapedData"];

  var data = require("./../models/data.js");

  function DropScrapData(callback) {
    data.remove({}, function (err, delOK) {
      if (err) {
        throw err;
      }
      if (delOK) {
        console.log("Collection deleted****************************************");
        data.createCollection(function () {
          callback();
        });
      }
    });

  }

  function GetAllScrapedData(callback) {
    data.find({}, function (error, found) {
      // Throw any errors to the console
      if (error) {
        console.log(error);
      }
      // If there are no errors, send the data to the browser as json
      else {
        callback(found);
      }
    }
    ).sort({ _id: 1 });
  }

  function ScrapeNews(callback) {

    DropScrapData(function () {

      axios.get("https://www.levelup.com/").then(function (response) {
        var $ = cheerio.load(response.data);

        $(".newswrap article").each(function (i, element) {

          var scrapTitle = $(element).find("a").attr("title");
          var scrapLink = $(element).find("a").attr("href");

          if (scrapTitle && scrapLink) {
            var dataToInsert = (
              {
                title: scrapTitle,
                link: scrapLink,
                comments: []
              }
            );
            console.log("data to insert----");
            console.log(dataToInsert);
            data.create(dataToInsert, function (err, inserted) {
              if (err) {
                // Log the error if one is encountered during the query
                console.log(err);
              }
              else {
                // Otherwise, log the inserted data
                console.log(inserted);
              }
            });
          }
        });

        data.find({}, function (error, found) {
          // Throw any errors to the console
          if (error) {
            console.log(error);
          }
          // If there are no errors, send the data to the browser as json
          else {
            callback(found);
          }
        }
        );

      });
    });
  }
  // Load Home page
  app.get("/", function (req, res) {
    GetAllScrapedData(function (data) {
      // console.log(data);
      res.render("homepage", { scrap: data });
    });
  });

  app.get("/delete", function (req, res) {
    DropScrapData(function () {
      res.redirect("/");
    });
  });

  app.post("/addcomment/:id", function (req, res) {

    data.updateOne({ _id: mongojs.ObjectId(req.params.id) }, { $push: { comments: req.body.comment } }, function (error, success) {
      if (error) {
        console.log(error);
      } else {
        console.log("Adding comment " + req.body.comment + " for id: " + req.params.id + "... done");
      }
    });

    res.redirect("/#comments");
  });

  app.post("/deletecomment/:id/:commentid", function (req, res) {
    var indexVal = "comments." + req.params.commentid;
    data.findOneAndUpdate({ _id: mongojs.ObjectId(req.params.id) }, { $set: { [indexVal]: null } }, function (error) {
      if (error) {
        console.log(error);
      } else {
        console.log("setting for removal " + req.params.id + " val: " + indexVal + " ... done");
        data.findOneAndUpdate({ _id: mongojs.ObjectId(req.params.id) }, { $pull: { comments: null } }, function (error) {
          if (error) {
            console.log(error);
          } else {
            console.log("Deleting comment in " + req.params.id + " position: " + req.params.commentid + " ... done");
            res.redirect("/#comments");
          }

        });
      }

    });
  });


  app.get("/scrap", function (req, res) {
    ScrapeNews(function (data) {
      console.log("Data Scraped - Redirect****************************************");
      // console.log(data);
      res.redirect("/");
    });
  });

  app.get("/all", function (req, res) {
    GetAllScrapedData(function (data) {
      res.json(data);
    });
  });

  // Render 404 page for any unmatched routes
  app.get("*", function (req, res) {
    res.render("404");
  });


};