/**
 * Utility function
 *
 * @format
 */
// dependencies
const crypto = require("crypto");
const config = require("../helpers/config");

// module scaffolding
const util = {};

// parse json string to js object
util.parseJSON = (jsonstring) => {
  let output;
  try {
    output = JSON.parse(jsonstring);
  } catch (err) {
    output = {};
  }
  return output;
};

// hash string
util.hash = (str) => {
  if (typeof str == "string" && str.length > 0) {
    const hash = crypto
      .createHmac("sha256", config.secretKey)
      .update(str)
      .digest("hex");
    return hash;
  } else {
    return false;
  }
};

// create random  string
util.createRandomString = (strlength) => {
  let length = strlength;
  length = typeof strlength === "number" && strlength > 0 ? strlength : false;

  if (length) {
    const passiblecharacters =
      "abcdefghijklmnopqrstwxyz0123456789ABCDEFGHIJKLOMNOPQSTWXYZ@#!-_/\\$%^&*+=";
    let output = "";
    for (let i = 0; i < strlength; i++) {
      const randomCharacter = passiblecharacters.charAt(
        Math.floor(Math.random() * passiblecharacters.length)
      );
      output += randomCharacter;
    }
    return output;
  } else {
    return false;
  }
};

// exports module
module.exports = util;
