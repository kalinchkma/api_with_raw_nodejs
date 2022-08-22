/**
 * Project initial file
 * This file will start the node server and workers
 * Author: MR Nanashi
 *
 * @format
 */

// dependencies
const server = require("./lib/server");
const workers = require("./lib/workers");

// module
const app = {};

app.init = () => {
  // start the node server
  server.init();

  // start the workers
  workers.init();
};

app.init();
