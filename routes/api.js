const router = require('express').Router(); 
const db = require('../models');

// Our scraping tools
const request = require("request");
const cheerio = require("cheerio");

router.route('/scrape')
    .get((req, res) => {
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
            // res.redirect("/articles"); 
        });
    })

// This will get the articles we scraped from the mongoDB and display to the articles page
router.route('/articles') 
    .get((req, res) => {

        db.Article
            .find()
            .sort({ date: -1 })
            .limit(50)
            .then(results => res.json(results)) 
            .cath(err => res.status(500).json(err));
  });

// router.route('/fetch')
//     .get((req, res) => {
//         db.Todo
//             .find()
//             .then(results => res.json(results))
//             .catch(err => res.status(500).json(err));
//     });

// router.route('/create')
//     .post((req, res) => {
//         db.Todo
//             .create(req.body)
//             .then(results => res.json(results))
//             .catch(err => res.status(500).json(err));
//     });

// router.route('/complete/:id')
//     .put((req, res) => {
//         db.Todo
//             .findOneAndUpdate({ _id: req.params.id}, {$set: { completed: true}})
//             .then(results => res.json(results))
//             .catch(err => res.status(500).json(err));
//     })

// router.route('/uncomplete/:id')
//     .put((req, res) => {
//         db.Todo
//             .findOneAndUpdate({ _id: req.params.id}, {$set: { completed: false}})
//             .then(results => res.json(results))
//             .catch(err => res.status(500).json(err));
//     })

// router.route('/delete')
//     .delete((req, res) => {
//         db.Todo
//             .findById({ _id: req.params.id})
//             .then(results => results.remove())
//             .then(results => res.json(results))
//             .catch(err => res.status(500).json(err));
//     });

module.exports = router;