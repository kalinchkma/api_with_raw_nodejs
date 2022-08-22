/**
 * User Handler
 * Handler user routes
 * @format
 */

// dependencies
const data = require("../../lib/data");
const { parseJSON, createRandomString } = require("../../utils/utilities");
const tokenHandler = require("./tokenHandler");
const { macChecks } = require("../../helpers/config");

// module scaffolding
const handler = {};

handler.checkHandler = (requestProperties, callback) => {
  const acceptedMethods = ["get", "post", "put", "delete"];
  if (acceptedMethods.indexOf(requestProperties.method) > -1) {
    handler._check[requestProperties.method](requestProperties, callback);
  } else {
    callback(405, {
      message: "Invalid method",
    });
  }
};

// method handler
handler._check = {};

// create check
handler._check.post = (requestProperties, callback) => {
  // validate inputs
  let protocol =
    typeof requestProperties.body.protocol === "string" &&
    ["http", "https"].indexOf(requestProperties.body.protocol) > -1
      ? requestProperties.body.protocol
      : false;

  let url =
    typeof requestProperties.body.url === "string" &&
    requestProperties.body.url.trim().length > 0
      ? requestProperties.body.url
      : false;
  let method =
    typeof requestProperties.body.method === "string" &&
    ["get", "post", "put", "delete"].indexOf(
      requestProperties.body.method.toLowerCase()
    ) > -1
      ? requestProperties.body.method
      : false;
  let successCodes =
    typeof requestProperties.body.successCodes === "object" &&
    requestProperties.body.successCodes instanceof Array
      ? requestProperties.body.successCodes
      : false;
  let timeoutSeconds =
    typeof requestProperties.body.timeoutSeconds === "number" &&
    requestProperties.body.timeoutSeconds % 1 === 0 &&
    requestProperties.body.timeoutSeconds >= 1 &&
    requestProperties.body.timeoutSeconds <= 5
      ? requestProperties.body.timeoutSeconds
      : false;

  if (protocol && url && method && successCodes && timeoutSeconds) {
    // check autentication
    let token =
      typeof requestProperties.headersObject.token === "string"
        ? requestProperties.headersObject.token
        : false;

    // check user by token
    data.read("tokens", token, (err, d) => {
      const tokenData = { ...parseJSON(d) };
      if (!err && tokenData) {
        let userPhone = tokenData.phoneNumber;
        // check user by phone number
        data.read("users", userPhone, (err, uData) => {
          if (!err && uData) {
            tokenHandler._token.verify(token, userPhone, (tokenId) => {
              if (tokenId) {
                let userObject = { ...parseJSON(uData) };
                let userChecks =
                  typeof userObject.checks === "object" &&
                  userObject.checks instanceof Array
                    ? userObject.checks
                    : [];
                if (userChecks.length < macChecks) {
                  let checkId = createRandomString(20);
                  let checkObject = {
                    id: checkId,
                    userPhone,
                    protocol,
                    url,
                    method,
                    successCodes,
                    timeoutSeconds,
                  };
                  // save the object
                  data.create("checks", checkId, checkObject, (err) => {
                    if (!err) {
                      // add check id to the user object
                      userObject.checks = userChecks;
                      userObject.checks.push(checkId);

                      // save the new user data
                      data.update("users", userPhone, userObject, (err) => {
                        if (!err) {
                          // return the data about the new check
                          callback(200, checkObject);
                        } else {
                          callback(500, {
                            error: "Internal server error",
                          });
                        }
                      });
                    } else {
                      callback(500, {
                        error: "Internal server error",
                      });
                    }
                  });
                } else {
                  callback(401, {
                    error: "User has already reached max check limits",
                  });
                }
              } else {
                callback(403, {
                  error: "Authentication Problem",
                });
              }
            });
          } else {
            callback(403, {
              error: "user not found",
            });
          }
        });
      } else {
        callback(403, {
          error: "Authorization Problem",
        });
      }
    });
  } else {
    callback(400, {
      error: "Bad Request",
    });
  }
};

// get check
handler._check.get = (requestProperties, callback) => {
  // check the id if valid
  const id =
    typeof requestProperties.queryStringObject.id === "string" &&
    requestProperties.queryStringObject.id.trim().length === 20
      ? requestProperties.queryStringObject.id
      : false;
  if (id) {
    // look for check
    data.read("checks", id, (err, checkDataS) => {
      const checkData = { ...parseJSON(checkDataS) };
      if (!err && checkData) {
        // check autentication
        let token =
          typeof requestProperties.headersObject.token === "string"
            ? requestProperties.headersObject.token
            : false;

        tokenHandler._token.verify(token, checkData.userPhone, (tokenId) => {
          if (tokenId) {
            callback(200, checkData);
          } else {
            callback(403, {
              error: "Authentication failure!",
            });
          }
        });
      } else {
        callback(500, {
          error: "Internal Server Error",
        });
      }
    });
  } else {
    callback(400, {
      error: "Bad request",
    });
  }
};

// update check
handler._check.put = (requestProperties, callback) => {
  let id =
    typeof requestProperties.body.id === "string" &&
    requestProperties.body.id.length === 20
      ? requestProperties.body.id
      : false;
  // validate inputs
  let protocol =
    typeof requestProperties.body.protocol === "string" &&
    ["http", "https"].indexOf(requestProperties.body.protocol.toLowerCase()) >
      -1
      ? requestProperties.body.protocol
      : false;

  let url =
    typeof requestProperties.body.url === "string" &&
    requestProperties.body.url.trim().length > 0
      ? requestProperties.body.url
      : false;
  let method =
    typeof requestProperties.body.method === "string" &&
    ["get", "post", "put", "delete"].indexOf(
      requestProperties.body.method.toLowerCase()
    ) > -1
      ? requestProperties.body.method
      : false;
  let successCodes =
    typeof requestProperties.body.successCodes === "object" &&
    requestProperties.body.successCodes instanceof Array
      ? requestProperties.body.successCodes
      : false;
  let timeoutSeconds =
    typeof requestProperties.body.timeoutSeconds === "number" &&
    requestProperties.body.timeoutSeconds % 1 === 0 &&
    requestProperties.body.timeoutSeconds >= 1 &&
    requestProperties.body.timeoutSeconds <= 5
      ? requestProperties.body.timeoutSeconds
      : false;
  if (id) {
    if (protocol || url || method || successCodes || timeoutSeconds) {
      data.read("checks", id, (err, stringcheckData) => {
        const checkData = { ...parseJSON(stringcheckData) };
        if (!err && checkData) {
          // check authentication token
          let token =
            typeof requestProperties.headersObject.token === "string"
              ? requestProperties.headersObject.token
              : false;
          tokenHandler._token.verify(
            token,
            checkData.userPhone,
            (tokenIsValid) => {
              if (tokenIsValid) {
                if (protocol) {
                  checkData.protocol = protocol;
                }
                if (url) {
                  checkData.url = url;
                }
                if (method) {
                  checkData.method = method;
                }
                if (successCodes) {
                  checkData.successCodes = successCodes;
                }
                if (timeoutSeconds) {
                  checkData.timeoutSeconds = timeoutSeconds;
                }
                // store the checkobject
                data.update("checks", id, checkData, (err) => {
                  if (!err) {
                    callback(200, {
                      message: "check updated succcessfully",
                    });
                  } else {
                    callback(500, {
                      error: "Internal Server Error",
                    });
                  }
                });
              } else {
                callback(403, {
                  error: "Authentication failure!",
                });
              }
            }
          );
        } else {
          callback(500, {
            error: "Internal server error",
          });
        }
      });
    } else {
      callback(400, {
        error: "You must provide at least one field to update",
      });
    }
  } else {
    callback(400, {
      error: "You have a problem on your request",
    });
  }
};

// delete check
handler._check.delete = (requestProperties, callback) => {
  // check the id if valid
  const id =
    typeof requestProperties.queryStringObject.id === "string" &&
    requestProperties.queryStringObject.id.trim().length === 20
      ? requestProperties.queryStringObject.id
      : false;
  if (id) {
    // look for check
    data.read("checks", id, (err, checkDataS) => {
      const checkData = { ...parseJSON(checkDataS) };
      if (!err && checkData) {
        // check autentication
        let token =
          typeof requestProperties.headersObject.token === "string"
            ? requestProperties.headersObject.token
            : false;

        tokenHandler._token.verify(token, checkData.userPhone, (tokenId) => {
          if (tokenId) {
            // delete check data
            data.delete("checks", id, (err) => {
              if (!err) {
                data.read("users", checkData.userPhone, (err, userData) => {
                  const userObject = { ...parseJSON(userData) };
                  if (!err && userData) {
                    const userChecks =
                      typeof userObject.checks === "object" &&
                      userObject.checks instanceof Array
                        ? userObject.checks
                        : [];
                    // remove the deleted check id from checks list
                    let checkPosition = userChecks.indexOf(id);
                    if (checkPosition > -1) {
                      userChecks.splice(checkPosition, 1);
                      // update the user data
                      userObject.checks = userChecks;
                      data.update(
                        "users",
                        userObject.phoneNumber,
                        userObject,
                        (err) => {
                          if (!err) {
                            callback(200, {
                              message: "Check Deleted successfully",
                            });
                          } else {
                            callback(500, {
                              error: "Server Error!",
                            });
                          }
                        }
                      );
                    } else {
                      callback(400, {
                        error:
                          "The check id that you are trying to delete is not found in user",
                      });
                    }
                  } else {
                    callback(500, {
                      error: "Server error",
                    });
                  }
                });
              } else {
                callback(500, {
                  error: "Internal server error",
                });
              }
            });
          } else {
            callback(403, {
              error: "Authentication failure!",
            });
          }
        });
      } else {
        callback(500, {
          error: "Internal Server Error",
        });
      }
    });
  }
};

// exports modules
module.exports = handler;
