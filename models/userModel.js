const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: {
    type: String,
  },
  email: {
    type: String,
  },
  password: {
    type: String,
  },
  created:{
      type: Date,
      default: new Date(),
  }
});

module.exports = mongoose.model("User", userSchema);
