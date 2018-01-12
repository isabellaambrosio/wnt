//CONNECTIONS
//==============================================================================
const express = require("express");
const bodyParser = require("body-parser");
const logger = require("morgan");
const mongoose = require("mongoose");
const request = require("request");

//Axious and cheerio for scraping
const axios = require("axios");
const cheerio = require("cheerio");

//requiring models
const db = require("./models");

//Port connection
const PORT = 8080;

// Express initialization
const app = express();


// Use morgan logger for logging requests
app.use(logger("dev"));
// Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({ extended: false }));
// Use express.static to serve the public folder as a static directory
app.use(express.static("public"));


// Set mongoose to leverage built in JavaScript ES6 Promises
// Connect to the Mongo DB
mongoose.Promise = Promise;
mongoose.connect("mongodb://localhost/wnt", {
    useMongoClient: true
});

//ROUTES
//==============================================================================

//Get route to scrape Charlotte Agenda
app.get("/scrape", function(req, res) {
    // axios to help on the get request
    axios.get("https://www.charlotteagenda.com/")
        .then(function(response) {
            //cheerio for scraping
            const $ = cheerio.load(response.data);

            //grabbing information from scraper and looping throught it so we get all of the headlines
            $("h1.entry-title").each(function(i, element) {
                //save each headline into an empty object
                const result = {};

                // Add the text and href of every link, and save them as properties of the result object
                result.title = $(this).children("a").text();
                result.link = $(this).children("a").attr("href");

                // Create a new Article using the `result` object built from scraping
                db.Article
                    .create(result)
                    .then(function(dbArticle) {
                        console.log(dbArticle)
                    })
                    //axios
                    .catch(function(err) {
                        //if an err, send it to the client
                        console.log(err)
                    });
            });
        });


    // If we were able to successfully scrape and save an Article, send a message to the client
    res.send("Scrape Complete");
});

//Getting all articles
app.get("/articles", function(req, res) {
    //mongoose grabs all documents from articles collection
    db.Article
        .find({})
        .then(function(dbArticle) {
            // If we were able to successfully find Articles, send them back to the client
            res.json(dbArticle);
        })
        .catch(function(err) {
            // If an error occurred, send it to the client
            res.json(err);
        });
});

//SAVING ARTICLE
app.put("/articles/saved/:id", function(req, res) {
    db.Article.findOneAndUpdate({ "_id": req.params.id }, { "saved": true },
        function(error, found) {
            if (error) {
                console.log(error);
            }
            else {
                res.json(found);
            }
        });
});

//GETTING SAVED ARTICLES
app.get("/articles/saved", function(req, res) {
    // db.Article.find({ "saved": true },
    //     function(error, found) {
    //         if (error) {
    //             console.log(error);
    //         }
    //         else {
    //             res.json(found)
    //         }
    //     });
    db.Article
        .find({ "saved": true })
        .populate("note")
        .then(function(dbArticle) {
            res.json(dbArticle);
        })
        .catch(function(err) {
            res.json(err);
        });
});

//ADDING NOTES
app.put("/articles/:id", function(req, res) {
    // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
    console.log("RUNNING 2");
    db.Article
        .findOne({ "_id": req.params.id })
        // ..and populate all of the notes associated with it
        // .populate("note")
        .then(function(dbArticle) {
            // If we were able to successfully find an Article with the given id, send it back to the client
            res.json(dbArticle);
        })
        .catch(function(err) {
            // If an error occurred, send it to the client
            res.json(err);
        });
});

// Route for saving/updating an Article's associated Note
app.post("/articles/:id", function(req, res) {
    // Create a new note and pass the req.body to the entry
    console.log("RUNNING");
    db.Note
        .create(req.body)
        .then(function(dbNote) {
            // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
            // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
            // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
            return db.Article.findOneAndUpdate({ "_id": req.params.id }, { $push: { "note": dbNote._id } }, { new: true });
        })
        .then(function(dbArticle) {
            // If we were able to successfully update an Article, send it back to the client
            res.json(dbArticle);
        })
        .catch(function(err) {
            // If an error occurred, send it to the client
            res.json(err);
        });
});


//DELETE
app.delete("/articles/saved/:id", function(req, res) {
    db.Article.findOneAndUpdate({ "_id": req.params.id }, { "saved": false },
        function(error, found) {
            if (error) {
                console.log(error);
            }
            else {
                res.json(found);
            }
        });
});


// Start the server
app.listen(PORT, function() {
    console.log("App running on port " + PORT + "!");
});
