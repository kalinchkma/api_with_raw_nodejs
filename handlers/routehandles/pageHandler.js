/**
 * Page handlers
 *
 * @format
 */

// module scaffolding

const pageHandler = {};

pageHandler.homePage = (requestProperties, callback) => {
  console.log(requestProperties);
  callback(200, {
    message: "this will be home page",
  });
};

module.exports = pageHandler;
