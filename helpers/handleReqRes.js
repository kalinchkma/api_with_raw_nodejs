/**
 * Response and request halpers
 *
 * @format
 */

// dependencies
const url = require("url");
// string decoder for decoding body data
const { StringDecoder } = require("string_decoder");
const routes = require("../routes");
const {
  notFoundHandler,
} = require("../handlers/routehandles/notFoundHandlers");
const { parseJSON } = require("../utils/utilities");

// scaffolding
const handler = {};

handler.handleReqRes = (req, res) => {
  // request handling

  // get the url and parse it
  const parseUrl = url.parse(req.url, true);
  const path = parseUrl.pathname;
  const trimPath = path.replace(/^\/+|\/+$/g, "");
  const method = req.method.toLowerCase();
  const queryStringObject = parseUrl.query;
  const headersObject = req.headers;

  const requestProperties = {
    parseUrl,
    path,
    trimPath,
    method,
    queryStringObject,
    headersObject,
  };

  // decoding req body
  const decoder = new StringDecoder("utf-8");
  let realData = "";

  const choosenHandler = routes[trimPath] ? routes[trimPath] : notFoundHandler;

  req.on("data", (chunk) => {
    realData += decoder.write(chunk);
  });

  req.on("end", (chunk) => {
    realData += decoder.end();

    requestProperties.body = parseJSON(realData);

    choosenHandler(requestProperties, (statusCode, payload) => {
      statusCode = typeof statusCode === "number" ? statusCode : 5000;
      payload = typeof payload === "object" ? payload : {};

      const payloadObject = JSON.stringify(payload);

      // return response
      res.writeHead(statusCode);
      res.end(payloadObject);
    });
  });
};

module.exports = handler;
