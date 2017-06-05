/**
 * Created by ryanrodwell on 6/5/17.
 */
// Scraping tools
var request = require("request");
var cheerio = require("cheerio");

// Requiring our Note and Article models
var Note = require("../models/Note.js");
var Article = require("../models/Article.js");



// Routes
// ======
module.exports = function(app) {

    var scrapeSite =  "https://www.nytimes.com/section/technology?WT.nav=page&action=click&contentCollection=Tech&module=HPMiniNav&pgtype=Homepage&region=TopBar";

    // A GET request to scrape the echojs website
    app.get("/scrape", function (req, res) {
        // First, we grab the body of the html with request
        request(scrapeSite, function (error, response, html) {
            // Then, we load that into cheerio and save it to $ for a shorthand selector
            var $ = cheerio.load(html);
            // Now, we grab every div within an article tag, and do the following:
            $("a.story-link").each(function (i, element) {

                // Save an empty result object
                var result = {};

                //Jumping into div with class story-meta inside a tag,
                //grabbing the h2 child of that div
                result.title = $("div.story-meta", this).children("h2").text().trim();
                //Grabbing the attr hrf from the a tag
                result.link = $(this).attr("href");
                //Jumping into grandchild p tag with class summary
                result.summary = $("p.summary", this).text();

                // Using our Article model, create a new entry
                // This effectively passes the result object to the entry (and the title and link)
                var entry = new Article(result);

                // Now, save that entry to the db
                entry.save(function (err, doc) {
                    // Log any errors
                    if (err) {
                        console.log(err);
                    }
                    // Or log the doc
                    else {
                        console.log(doc);
                    }
                });

            });
        });
        // Tell the browser that we finished scraping the text
        res.send("Scrape Complete");
    });

    // This will get the articles we scraped from the mongoDB
    app.get("/articles", function (req, res) {

        Article.find({}, function (err, doc) {
            if (err) {
                res.send(err);
            } else {
                res.send(doc);
            }
        });

    });

    // This will get all of the notes added to mongoDB
    app.get("/notes", function(req, res) {

        Note.find({}, function(err, doc){
            if(err){
                res.send(err);
            } else {
                res.send(doc);
            }
        });

    });

    // This will grab an article by it's ObjectId
    app.get("/articles/:id", function(req, res) {

        Article.findOne({_id: req.params.id})
            .populate("note")
            .exec(function(err, doc){
                if(err){
                    res.send(err);
                } else {
                    console.log("findOne: "+doc);
                    res.send(doc);
                }
            });

    });

    // Create a new note or replace an existing note
    app.post("/articles/:id", function(req, res) {

        var newNote = new Note(req.body);
        // Save the new note to mongoose
        newNote.save(function(error, doc) {
            // Send any errors to the browser
            if (error) {
                res.send(error);
            }
            // Otherwise
            else {
                console.log("doc: " +doc);
                // Find our user and push the new note id into the User's notes array
                Article.findOneAndUpdate({_id: req.params.id}, { $push: { "note": doc._id } }, { new: true }, function(err, newdoc) {
                    // Send any errors to the browser
                    if (err) {
                        res.send(err);
                    }
                    // Or send the newdoc to the browser
                    else {
                        console.log("newDoc: "+newdoc);
                        res.send(newdoc);
                    }
                });
            }
        });
    });

};//module.exports