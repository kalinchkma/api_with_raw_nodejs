/**
 * send user notification by https
 *
 * @format
 */

// dependencies
const https = require("https");
const { twilio } = require("./config");
const querystring = require("querystring");

// module scaffolding
const notification = {};

// send sms to user using twilio api
notification.sendTwilioSms = (phone, msg, callback) => {
  // input validation
  const userPhone =
    typeof phone === "string" && phone.trim().length === 11
      ? phone.trim()
      : false;
  const userMsg =
    typeof msg === "string" &&
    msg.trim().length > 0 &&
    msg.trim().length <= 1600
      ? msg.trim()
      : false;

  if (userMsg && userPhone) {
    // configure the request payload
    const payload = {
      From: twilio.fromPhone,
      To: `+88${userPhone}`,
      Body: userMsg,
    };

    // stringify the payload
    const stringifyPayload = querystring.stringify(payload);

    // configure the request details
    const requestDetails = {
      hostname: "api.twilio.com",
      method: "POST",
      path: `/2010-04-01/Accounts/${twilio.accountSid}/Messages`,
      auth: `${twilio.accountSid}:${twilio.authToken}`,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    };

    // instantiate the request onject
    const req = https.request(requestDetails, (res) => {
      // get the status code of sent request
      const status = res.statusCode;

      // check successfull status
      if (status === 200 || status === 201) {
        callback(false);
      } else {
        callback(`Status code return was ${status}`);
      }
    });

    req.on("error", (e) => {
      console.log("error events call");
      callback(e);
    });

    console.log("What is wrong here");
    req.write(stringifyPayload);
    req.end();
  } else {
    callback("Given parameters were missing or invalid!");
  }
};

// exports module
module.exports = notification;
