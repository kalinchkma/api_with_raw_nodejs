/**
 * Server file
 * Author: MR Nanashi
 * Description: Rest-full api with raw node js
 *
 * @format
 */

// dependencies
const http = require("http");
const config = require("../helpers/config");
const { sendTwilioSms } = require("../helpers/notidication");
// helpers methods
const { handleReqRes } = require("../helpers/handleReqRes");

// server object - module scaffholding
const server = {};

// create server object
server.createServer = () => {
  const serverInstance = http.createServer(server.handleReqRes);
  // starting server
  serverInstance.listen(config.port, () => {
    console.log(`Server listening on port ${config.port}`);
  });
};

// request/response handleing
server.handleReqRes = handleReqRes;

// initialize the server
server.init = () => {
  server.createServer();
};

// exports module
module.exports = server;
