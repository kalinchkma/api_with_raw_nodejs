/**
 * workers library
 * Author: MR Nanashi
 * Description: workers fils
 *
 * @format
 */

// dependencies
const url = require("url");
const data = require("./data");
const { parseJSON } = require("../utils/utilities");
const http = require("http");
const https = require("https");

// worker object - module scaffholding
const worker = {};

// check all checks
worker.gatherAllChecks = () => {
  // get all the checks
  data.list("checks", (err, checks) => {
    if (!err && checks && checks.length > 0) {
      checks.forEach((check) => {
        // read the checks
        data.read("checks", check, (err, checkData) => {
          if (!err && checkData) {
            const checkObject = { ...parseJSON(checkData) };
            // pass the data to the check validator
            worker.validateCheckData(checkObject);
          } else {
            console.log(err);
          }
        });
      });
    } else {
      console.log("Error could not find any checks to process");
    }
  });
};

// validate check data
worker.validateCheckData = (checkObject) => {
  const originalCheckData = checkObject;
  if (originalCheckData && originalCheckData.id) {
    originalCheckData.state =
      typeof originalCheckData.state === "string" &&
      ["up", "down"].indexOf(originalCheckData.state) > -1
        ? originalCheckData.state
        : "down";
    originalCheckData.lastChecked =
      typeof originalCheckData.lastChecked === "number" &&
      originalCheckData.lastChecked > 0
        ? originalCheckData.lastChecked
        : false;
    // pass the next process
    worker.performCheck(originalCheckData);
  } else {
    console.log("Error check was invalid or not properly formated");
  }
};

// perform Check
worker.performCheck = (checkObject) => {
  // prepare the initial check outcome
  let checkOutcome = {
    error: false,
    responseCode: false,
  };
  // mark the outcome has not been sent yet
  let outcomeSent = false;

  // parse the hostname & full url from check data
  const parseUrl = url.parse(
    checkObject.protocol + "://" + checkObject.url,
    true
  );
  const hostName = parseUrl.hostname;
  const path = parseUrl.path;

  // construct the request
  const requestObject = {
    protocol: checkObject.protocol + ":",
    hostname: hostName,
    method: checkObject.method.toUpperCase(),
    path: path,
    timeout: checkObject.timeoutSeconds * 1000,
  };

  // choose method to use
  const protocolToUse = checkObject.protocol === "http" ? http : https;
  const req = protocolToUse.request(requestObject, (res) => {
    // grab the response code
    const status = res.statusCode;

    // update the check outcome and pass to the next process
    checkOutcome.responseCode = status;
    if (!outcomeSent) {
      worker.processCheckOutcome(checkObject, checkOutcome);
      outcomeSent = true;
    }
  });

  req.on("error", (e) => {
    checkOutcome = {
      error: true,
      value: e,
    };
    // update the check outcome and pass to the next process
    if (!outcomeSent) {
      worker.processCheckOutcome(checkObject, checkOutcome);
      outcomeSent = true;
    }
  });

  req.on("timeout", (e) => {
    checkOutcome = {
      error: true,
      value: "Timeout",
    };
    // update the check outcome and pass to the next process
    if (!outcomeSent) {
      worker.processCheckOutcome(checkObject, checkOutcome);
      outcomeSent = true;
    }
  });
  // req send
  req.end();
};

// save check outcome to database and send to next process
worker.processCheckOutcome = (checkObject, checkOutcome) => {
  // check if check outcome is up or down
  let state =
    !checkOutcome.error &&
    checkOutcome.responseCode &&
    checkObject.successCodes.indexOf(checkOutcome.responseCode) > -1
      ? "up"
      : "dowm";

  // decide whether we should alert the user or not
  let alertWanted =
    checkOutcome.lastChecked && checkObject.state !== state ? true : false;

  // update the check data
  let newCheckData = checkObject;

  newCheckData.state = state;
  newCheckData.lastChecked = Date.now();

  // update the check to disk
  data.update("checks", newCheckData.id, newCheckData, (err) => {
    if (!err) {
      if (alertWanted) {
        // send the check data to next process
        // it will call if i use twilio
        worker.alertUserToStatusChange(newCheckData);
      } else {
        console.log("Alert is not needed as there is no state change!");
      }
    } else {
      console.log("Error trying to save check data of one of the checks!");
    }
  });
};

// send notification sms to user if state changes
worker.alertUserToStatusChange = (checkObject) => {
  // @TODO: send sms to user by its phone number
  console.log("SMS sent");
};
// timer to execute the worker process once per minute
worker.loop = () => {
  setInterval(() => {
    worker.gatherAllChecks();
  }, 5000);
};

// start the worker
worker.init = () => {
  // execute all the checks
  worker.gatherAllChecks();

  // call the loop so that checks continue
  worker.loop();
};

// exports module
module.exports = worker;
