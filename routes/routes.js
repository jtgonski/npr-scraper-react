
const express = require("express"); 

// Our scraping tools
const request = require("request");
const cheerio = require("cheerio");


//notes and articles models
const Note = require("../models/Note.js");
const Article = require("../models/Article.js");
const Saved = require("../models/Saved.js"); 

const app = express();

// Routes
// ======

module.exports = (app) => {

//default route
app.get("/", (req, res) => {
  res.render("index"); 

  Article.remove({}, (err) => {
    if (err) return handleError(err); 
  });

});

// A GET request to scrape NPR website
app.get("/scrape", function(req, res) {

  // First, we grab the body of the html with request
  request("http://www.npr.org/sections/news/", function(error, response, html) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(html);
    // Now, we grab every h2 within an article tag, and do the following:
    $("article").each(function(i, element) {

      // Save an empty result object
      const result = {};

      // Add the text and href of every link, and save them as properties of the result object
     result.title = $(this).children("div.item-info").children("h2.title").children("a").text();
     result.link = $(this).children("div.item-info").children("h2.title").children("a").attr("href");
     result.teaser =  $(this).children("div.item-info").children("p.teaser").children("a").text();
     result.date =  $(this).children("div.item-info").children("p.teaser").children("a").children("time").attr("datetime");


      // Using our Article model, create a new entry
      // This effectively passes the result object to the entry (and the title and link)
      var entry = new Article(result);

      // Now, save that entry to the db
      entry.save((err, doc) => {
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
    res.redirect("/articles"); 
});

});


// This will get the articles we scraped from the mongoDB and display to the articles page
app.get("/articles", (req, res) => {
  // Grab every doc in the Articles array
  Article.find().sort({ date: -1 }).limit(50).exec( (error, doc) => {
    const hbsObject = {
      article: doc
    }
    console.log(hbsObject); 
    // Log any errors
    if (error) {
      console.log(error);
    }
    // Or send the doc to the browser as a json object
    else {
      res.render("index", hbsObject);
      // res.json(doc);
    }
  });
});



// save an article to the saved collections
app.get("/articles/:id", (req, res) => {

  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  Article.findOne({ "_id": req.params.id }).exec((error, doc) => {
    console.log(doc)
    const savedArticleInfo = {
      title: doc.title,
      link: doc.link,
      teaser: doc.teaser,
      date: doc.date
    }

    // Saved.find({ "title": doc.title }).exec((error3, doc3) => {
    //   if (error) {
    //     console.log(error)
    //   }
    //   else {
    //     console.log(`DOC3: ${doc3}`)
    //   }
    // });

    var entry = new Saved(savedArticleInfo); 

    entry.save((err, doc2) => {
      if (err) {
        console.error(err);
      }
      else {
        console.log(`doc2: ${doc2}`); 
      }
    })
    // Log any errors
    if (error) {
      console.log(error);
    }
    // Otherwise, send the doc to the browser as a json object
    else {
      console.log(`We sucessfully found and updated the article`);
    }
  });
});

//this will get the saved articles and post them to the page
app.get("/saved-articles", (req, res) => {
  // Grab every doc in the Articles array
  Saved.find().sort({ date: -1 }).populate("note").exec( (error, doc) => {
    const hbsObject = {
      article: doc
    }
    console.log(hbsObject); 
    // Log any errors
    if (error) {
      console.log(error);
    }
    // Or send the doc to the browser as a json object
    else {
      res.render("index", hbsObject);
      // res.json(doc);
    }
  });
});


// Create a new note or replace an existing note
app.post("/save-note/:id", (req, res) => {

  console.log("req.body ", req.body);
  console.log("req.query: ", req.query);
  console.log("req", req); 
  // Create a new note and pass the req.body to the entry
  const newNote = new Note(req.body);


  // And save the new note the db
  newNote.save((error, doc) => {
    // Log any errors
    if (error) {
      console.log(error);
    }
    // Otherwise
    else {
      res.json(doc);
      // Use the article id to find and update it's note
      Saved.findOneAndUpdate({ "_id": req.params.id }, { "note": doc._id })
      // Execute the above query
      .exec((err, doc) => {
        // Log any errors
        if (err) {
          console.log(err);
        }
        else {
          // Or send the document to the browser
          console.log("Doc:", doc);
        }
      });
    }
  });
});

}

