// var db = require("./../models/data");


module.exports = function (app) {


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

  function DropScrapData(callback) {
    db.scrapedData.remove({}, function (err, delOK) {
      if (err) {
        throw err;
      }
      if (delOK) {
        console.log("Collection deleted****************************************");
        db.createCollection("scrapedData", function () {
          callback();
        });
      }
    });
  }

  function GetAllScrapedData(callback) {
    db.scrapedData.find({}, function (error, found) {
      // Throw any errors to the console
      if (error) {
        console.log(error);
      }
      // If there are no errors, send the data to the browser as json
      else {
        callback(found);
      }
    });
  }

  function ScrapeNews(callback) {

    DropScrapData(function () {
      axios.get("https://www.levelup.com/").then(function (response) {
        var $ = cheerio.load(response.data);

        $(".newswrap article").each(function (i, element) {
          var title = $(element).find("a").attr("title");
          var link = $(element).find("a").attr("href");

          if (title && link) {
            db.scrapedData.insert(
              {
                title: title,
                link: link,
                comments: []
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

        db.scrapedData.find({}, function (error, found) {
          // Throw any errors to the console
          if (error) {
            console.log(error);
          }
          // If there are no errors, send the data to the browser as json
          else {
            callback(found);
          }
        });

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
    // We just have to specify which todo we want to destroy with "where"
    // console.log("adding comment id:"+req.params.id+ " comment: "+ req.body.comment);
    // db.scrapedData.find({ _id: req.params.id }).insert({ comment: req.body.comment });
    db.scrapedData.update({ _id: mongojs.ObjectId(req.params.id) }, { $push: { comments: req.body.comment } }, function () {
      console.log("Update for " + req.params.id + "... done");
    });
    res.redirect("/#comments");
  });

  app.post("/deletecomment/:id/:comment", function (req, res) {
    // We just have to specify which todo we want to destroy with "where"
    // console.log("adding comment id:"+req.params.id+ " comment: "+ req.body.comment);
    // db.scrapedData.find({ _id: req.params.id }).insert({ comment: req.body.comment });
    db.scrapedData.update({ _id: mongojs.ObjectId(req.params.id) }, { $pull: { comments: req.params.comment } }, function () {
      console.log("Delete for " + req.params.id + "... done");
    });
    res.redirect("/#comments");
  });

  // Render 404 page for any unmatched routes
  app.get("*", function (req, res) {
    res.render("404");
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

};