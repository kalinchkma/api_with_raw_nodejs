/**
 * Applications Routes
 *
 * @format
 */

// dependencies

const { homePage } = require("./handlers/routehandles/pageHandler");
const { userHandler } = require("./handlers/routehandles/userHandler");
const { tokenHandler } = require("./handlers/routehandles/tokenHandler");
const { checkHandler } = require("./handlers/routehandles/checkHandler");

// module scaffold
const routes = {
  home: homePage,
  user: userHandler,
  token: tokenHandler,
  check: checkHandler,
};

module.exports = routes;
