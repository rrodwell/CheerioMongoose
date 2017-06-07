/**
 * Created by ryanrodwell on 6/5/17.
 */
// Dependencies
var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");

var PORT = process.env.PORT||8080;

// Set mongoose to leverage built in JavaScript ES6 Promises
mongoose.Promise = Promise;


// Initialize Express
var app = express();

// Use morgan and body parser with our app
app.use(logger("dev"));
app.use(bodyParser.urlencoded({
    extended: false
}));

// Make public a static dir
app.use(express.static(__dirname + "/public"));

// Database configuration with mongoose
// mongoose.connect("mongodb://localhost/cheerioMongoose");
mongoose.connect("mongodb://heroku_kmsvwgrs:a94e5gpjg3o924c4ibe8ke511t@ds111622.mlab.com:11622/heroku_kmsvwgrs");
var db = mongoose.connection;

// Show any mongoose errors
db.on("error", function(error) {
    console.log("Mongoose Error: ", error);
});

// Once logged in to the db through mongoose, log a success message
db.once("open", function() {
    console.log("Mongoose connection successful.");
});

// // Set Handlebars.
// var exphbs = require("express-handlebars");
//
// app.engine("handlebars", exphbs({ defaultLayout: "main" }));
// app.set("view engine", "handlebars");

//Routes
require("./routing/routes")(app);

// Listen on port PORT
app.listen(PORT, function() {
    console.log("App running on port " + PORT +"!");
});
