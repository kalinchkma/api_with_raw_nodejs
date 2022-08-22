/**
 * autentication token handlers
 *
 * @format
 */
// dependencies
const {
  hash,
  parseJSON,
  createRandomString,
} = require("../../utils/utilities");
const data = require("../../lib/data");

// module
const handler = {};

handler.tokenHandler = (requestProperties, callback) => {
  const acceptedMethods = ["get", "post", "put", "delete"];
  if (acceptedMethods.indexOf(requestProperties.method) > -1) {
    handler._token[requestProperties.method](requestProperties, callback);
  } else {
    callback(405);
  }
};

handler._token = {};

// create token
handler._token.post = (requestProperties, callback) => {
  // validate user credentials
  const phoneNumber =
    typeof requestProperties.body.phoneNumber === "string" &&
    requestProperties.body.phoneNumber.trim().length === 11
      ? requestProperties.body.phoneNumber
      : false;

  const password =
    typeof requestProperties.body.password === "string" &&
    requestProperties.body.password.trim().length > 0
      ? requestProperties.body.password
      : false;

  if (phoneNumber && password) {
    data.read("users", phoneNumber, (err, d) => {
      const userData = { ...parseJSON(d) };
      let hashedpassword = hash(password);
      if (hashedpassword === userData.password) {
        let tokenId = createRandomString(20);
        let expires = Date.now() + 60 * 60 * 1000;
        let tokenObject = {
          phoneNumber,
          id: tokenId,
          expires,
        };

        // store token
        data.create("tokens", tokenId, tokenObject, (err) => {
          if (!err) {
            callback(200, tokenObject);
          } else {
            callback(500, {
              error: "There was a problem in server side!",
            });
          }
        });
      } else {
        callback(400, {
          error: "password is no valid",
        });
      }
    });
  } else {
    callback(400, {
      error: "You have problem in your request",
    });
  }
};

// get token
handler._token.get = (requestProperties, callback) => {
  // check the id if valid
  const id =
    typeof requestProperties.queryStringObject.id === "string" &&
    requestProperties.queryStringObject.id.trim().length === 20
      ? requestProperties.queryStringObject.id
      : false;
  if (id) {
    // check token
    data.read("tokens", id, (err, tokenData) => {
      const token = { ...parseJSON(tokenData) };
      if (!err && tokenData) {
        callback(200, token);
      } else {
        callback(404, {
          error: "Token is not found",
        });
      }
    });
  } else {
    callback(404, {
      error: "Request was not found",
    });
  }
};

// update token
handler._token.put = (requestProperties, callback) => {
  // validate IO
  const id =
    typeof requestProperties.body.id === "string" &&
    requestProperties.body.id.trim().length === 20
      ? requestProperties.body.id
      : false;
  const extend =
    typeof requestProperties.body.extend === "boolean" &&
    requestProperties.body.extend === true
      ? true
      : false;

  if (id && extend) {
    data.read("tokens", id, (err, d) => {
      const tokenData = { ...parseJSON(d) };
      if (tokenData.expires > Date.now()) {
        tokenData.expires = Date.now() + 60 * 60 * 1000;
        // store the updated token
        data.update("tokens", id, tokenData, (err) => {
          if (!err) {
            callback(200, {
              message: "token expires time has been extended",
            });
          } else {
            callback(500, {
              error: "Internal server error",
            });
          }
        });
      } else {
        callback(400, {
          error: "Token already expires",
        });
      }
    });
  } else {
    callback(400, {
      error: "There was a problem in request",
    });
  }
};

// delete token
handler._token.delete = (requestProperties, callback) => {
  // check the phone number id valid
  const id =
    typeof requestProperties.queryStringObject.id === "string" &&
    requestProperties.queryStringObject.id.trim().length === 20
      ? requestProperties.queryStringObject.id
      : false;
  if (id) {
    // look token on database
    data.read("tokens", id, (err, tokenData) => {
      if (!err && tokenData) {
        // finally delete token by its id
        data.delete("tokens", id, (err) => {
          if (!err) {
            callback(200, {
              message: "Token was deleted successfully",
            });
          } else {
            callback(500, {
              error: "internal server error",
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
    callback(400, {
      error: "Bad Request",
    });
  }
};

// verify token
handler._token.verify = (id, phone, callback) => {
  data.read("tokens", id, (err, tokenData) => {
    if (!err && tokenData) {
      if (
        parseJSON(tokenData).phoneNumber === phone &&
        parseJSON(tokenData).expires > Date.now()
      ) {
        callback(true);
      } else {
        callback(false);
      }
    } else {
      callback(false);
    }
  });
};

// exports module
module.exports = handler;
