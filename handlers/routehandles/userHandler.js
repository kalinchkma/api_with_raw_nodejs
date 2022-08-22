/**
 * User Handler
 * Handler user routes
 * @format
 */

// dependencies
const data = require("../../lib/data");
const { hash, parseJSON } = require("../../utils/utilities");
const tokenHandler = require("./tokenHandler");

// module scaffolding
const handler = {};

handler.userHandler = (requestProperties, callback) => {
  const acceptedMethods = ["get", "post", "put", "delete"];
  if (acceptedMethods.indexOf(requestProperties.method) > -1) {
    handler._users[requestProperties.method](requestProperties, callback);
  } else {
    callback(405, {
      message: "Invalid method",
    });
  }
};

// method handler
handler._users = {};

// @no need authentication post users on database
handler._users.post = (requestProperties, callback) => {
  // validate users inputed properties
  const firstName =
    typeof requestProperties.body.firstName === "string" &&
    requestProperties.body.firstName.trim().length > 0
      ? requestProperties.body.firstName
      : false;

  const lastName =
    typeof requestProperties.body.lastName === "string" &&
    requestProperties.body.lastName.trim().length > 0
      ? requestProperties.body.lastName
      : false;

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
  const toAgreement =
    typeof requestProperties.body.toAgreement === "boolean" &&
    requestProperties.body.toAgreement === true
      ? requestProperties.body.toAgreement
      : false;

  console.log(
    firstName,
    lastName,
    phoneNumber,
    hash(password),
    "type of arguments is",
    toAgreement
  );

  if (firstName && lastName && password && toAgreement && phoneNumber) {
    // check user already exists
    data.read("users", phoneNumber, (err, user) => {
      if (err) {
        let userObject = {
          firstName,
          lastName,
          phoneNumber,
          password: hash(password),
          toAgreement,
        };
        // store info into database
        data.create("users", phoneNumber, userObject, (err) => {
          if (!err) {
            callback(200, { message: "User created successfully" });
          } else {
            callback(500, { error: "could not create user" });
          }
        });
      } else {
        callback(500, { error: "User creation failed" });
      }
    });
  } else {
    callback(400, { message: "Bad Request" });
  }
};

// @Authentication needed get user from database
handler._users.get = (requestProperties, callback) => {
  // check the phone number id valid
  const phoneNumber =
    typeof requestProperties.queryStringObject.phone === "string" &&
    requestProperties.queryStringObject.phone.length === 11
      ? requestProperties.queryStringObject.phone
      : false;

  if (phoneNumber) {
    // verify token
    let token =
      typeof requestProperties.headersObject.token === "string"
        ? requestProperties.headersObject.token
        : false;

    tokenHandler._token.verify(token, phoneNumber, (tokenId) => {
      if (tokenId) {
        // look users by phone number
        data.read("users", phoneNumber, (err, u) => {
          const user = { ...parseJSON(u) };
          if (!err && user) {
            delete user.password;
            callback(200, user);
          } else {
            callback(404, {
              error: "Requested user was not found!",
            });
          }
        });
      } else {
        callback(403, {
          error: "Autentication Failed",
        });
      }
    });
  } else {
    callback(400, {
      error: "request was not found!",
    });
  }
};

// @Authentication needed update user by phone number
handler._users.put = (requestProperties, callback) => {
  // check the phone number id valid
  const phoneNumber =
    typeof requestProperties.body.phoneNumber === "string" &&
    requestProperties.body.phoneNumber.length === 11
      ? requestProperties.body.phoneNumber
      : false;

  const firstName =
    typeof requestProperties.body.firstName === "string" &&
    requestProperties.body.firstName.trim().length > 0
      ? requestProperties.body.firstName
      : false;

  const lastName =
    typeof requestProperties.body.lastName === "string" &&
    requestProperties.body.lastName.trim().length > 0
      ? requestProperties.body.lastName
      : false;

  const password =
    typeof requestProperties.body.password === "string" &&
    requestProperties.body.password.trim().length > 0
      ? requestProperties.body.password
      : false;

  if (phoneNumber) {
    // verify token
    let token =
      typeof requestProperties.headersObject.token === "string"
        ? requestProperties.headersObject.token
        : false;

    tokenHandler._token.verify(token, phoneNumber, (tokenId) => {
      if (tokenId) {
        if (firstName || lastName || password) {
          // check user
          data.read("users", phoneNumber, (err, user) => {
            const userData = { ...parseJSON(user) };
            if (!err && user) {
              if (firstName) {
                userData.firstName = firstName;
              }
              if (lastName) {
                userData.lastName = lastName;
              }
              if (password) {
                userData.password = hash(password);
              }

              // finally update the database
              data.update("users", phoneNumber, userData, (err) => {
                if (!err) {
                  callback(200, {
                    message: "User was updated successfully",
                  });
                } else {
                  callback(500, {
                    message: "there was a error in server",
                  });
                }
              });
            } else {
              callback(400, {
                error: "Error in your request",
              });
            }
          });
        } else {
          callback(400, {
            error: "Error in your request",
          });
        }
      } else {
        callback(403, {
          error: "Autentication Failed",
        });
      }
    });
  } else {
    callback(400, {
      error: "invaild phone number",
    });
  }
};

// @Authentication needed delete users from database
handler._users.delete = (requestProperties, callback) => {
  // check the phone number id valid
  const phoneNumber =
    typeof requestProperties.queryStringObject.phone === "string" &&
    requestProperties.queryStringObject.phone.length === 11
      ? requestProperties.queryStringObject.phone
      : false;

  if (phoneNumber) {
    // verify token
    let token =
      typeof requestProperties.headersObject.token === "string"
        ? requestProperties.headersObject.token
        : false;

    tokenHandler._token.verify(token, phoneNumber, (tokenId) => {
      if (tokenId) {
        // look user on database
        data.read("users", phoneNumber, (err, userData) => {
          if (!err && userData) {
            // finally delete user by its phone number
            data.delete("users", phoneNumber, (err) => {
              if (!err) {
                callback(200, {
                  message: "User was deleted successfully",
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
        callback(403, {
          error: "Autentication Failed",
        });
      }
    });
  } else {
    callback(400, {
      error: "Bad Request",
    });
  }
};

// exports modules
module.exports = handler;
