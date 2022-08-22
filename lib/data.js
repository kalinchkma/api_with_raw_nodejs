/** @format */

// dependencies
const fs = require("fs");
const path = require("path");

// module scaffolding
const lib = {};

// data directory
lib.baseDir = path.join(__dirname, "./../.data/");

// write to file
lib.create = function (dir, file, data, callback) {
  // open file for writting
  fs.open(
    lib.baseDir + dir + "/" + file + ".json",
    "wx",
    (err, fileDescriptor) => {
      if (!err && fileDescriptor) {
        // convert data to json string
        const stringData = JSON.stringify(data);

        // write data to file and then close it
        fs.writeFile(fileDescriptor, stringData, (err) => {
          if (!err) {
            fs.close(fileDescriptor, (err) => {
              if (!err) {
                callback(false);
              } else {
                callback("Error closing the file");
              }
            });
          } else {
            callback("Error to writting file");
          }
        });
      } else {
        callback(err);
      }
    }
  );
};

// read to file
lib.read = (dir, file, callback) => {
  fs.readFile(`${lib.baseDir}${dir}/${file}.json`, "utf8", (err, data) => {
    callback(err, data);
  });
};

// update exsisting file contents
lib.update = (dir, file, data, callback) => {
  // open file for writing
  fs.open(
    lib.baseDir + dir + "/" + file + ".json",
    "r+",
    (err, fileDescriptor) => {
      if (!err && fileDescriptor) {
        // convert data to json string
        const stringData = JSON.stringify(data);

        // truncate the file
        fs.ftruncate(fileDescriptor, (err) => {
          if (!err) {
            // write to file and close it
            fs.writeFile(fileDescriptor, stringData, (err) => {
              if (!err) {
                // close the file
                fs.close(fileDescriptor, (err) => {
                  if (!err) {
                    callback(false);
                  } else {
                    callback("Error closing file");
                  }
                });
              } else {
                callback("Error writing to file");
              }
            });
          } else {
            callback("Error truncating file");
          }
        });
      } else {
        callback("Error updating, File may not exsists");
      }
    }
  );
};

// delete exsisting file
lib.delete = (dir, file, callback) => {
  // unlink existing file
  fs.unlink(lib.baseDir + dir + "/" + file + ".json", (err) => {
    if (!err) {
      callback(false);
    } else {
      callback("Error deleting file");
    }
  });
};

// list all the items in a directory
lib.list = (dir, callback) => {
  fs.readdir(`${lib.baseDir + dir}/`, (err, fileNames) => {
    if (!err && fileNames && fileNames.length > 0) {
      let trimmedFileNames = [];
      fileNames.forEach((fileName) => {
        trimmedFileNames.push(fileName.replace(/\.json/g, ""));
        callback(false, trimmedFileNames);
      });
    } else {
      callback("Error reading directory");
    }
  });
};

// exports: module
module.exports = lib;
