// Require mongoose
const mongoose = require("mongoose");
// Create Schema class
const Schema = mongoose.Schema;

// Create article schema
const SavedSchema = new Schema({
  // title is a required string
  title: {
    type: String,
    required: true,
    uniqque: true
  },
  // link is a required string
  link: {
    type: String,
    required: true
  },
  teaser: {
    type: String, 
    required: true
  },
  date: {
    type: Date, 
    required: true
  },
  // This only saves one note's ObjectId, ref refers to the Note model
  note: {
    type: Schema.Types.ObjectId,
    ref: "Note"
  }, 
  saved: {
    type: Boolean, 
    default: true
  }

});

// Create the Article model with the ArticleSchema
const Saved = mongoose.model("Saved", SavedSchema);

// Export the model
module.exports = Saved;
