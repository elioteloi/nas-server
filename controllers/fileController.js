const path = require("path");
const connection = require("../database/db");
const fs = require("fs");
require("dotenv").config();

function createFile(req, res) {
  const userid = req.body.ID;
  const foldername = req.body.folder;
  const files = req.files;

  console.log("ID user:", userid);
  console.log("File:", files);
  console.log("folder", foldername);

  if (files.length === 0) {
    console.log("There is no file.");
    return res.status(400).json({ errorInput: "There is no file." });
  } else {
    files.forEach((element) => {
      connection.query(
        "SELECT originalname FROM file WHERE originalname = ? AND foldername = ?;",
        [element.originalname, foldername],
        (err, result) => {
          if (err) {
            console.error("Error querying file.", err);
            return res.status(500).json({ error: "Error querying file." });
          } else if (result.length === 0) {
            connection.query(
              "SELECT name, userdrive FROM users WHERE id = ? LIMIT 1;",
              [userid],
              (err, result) => {
                if (err) {
                  console.error("Error querying id of user.", err);
                  return res
                    .status(500)
                    .json({ error: "Error querying id of user." });
                } else {
                  console.log("name", result[0].userdrive);

                  let oldFilePath = `${process.env.PATH_OF_DRIVE}/tempDir/${element.filename}`;
                  let filePath = `${process.env.PATH_OF_DRIVE}/${result[0].userdrive}/${foldername}/${element.filename}`;
                  let destination = `${process.env.PATH_OF_DRIVE}/${result[0].userdrive}/${foldername}/`;

                  fs.rename(oldFilePath, filePath, (err) => {
                    if (err) {
                      console.error("Error creating folder.", err);
                      return res
                        .status(500)
                        .json({ error: "Error creating the folder." });
                    } else {
                      connection.query(
                        "INSERT INTO file (userid, userdrive, fieldname, foldername, originalname, encoding, mimetype, destination, filename, path, size) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                        [
                          userid,
                          result[0].userdrive,
                          element.fieldname,
                          foldername,
                          element.originalname,
                          element.encoding,
                          element.mimetype,
                          destination,
                          element.filename,
                          filePath,
                          element.size,
                        ],
                        (err, result) => {
                          if (err) {
                            console.error(
                              "Error inserting value into file.",
                              err
                            );
                            return res.status(500).json({
                              error: "Error inserting value into file.",
                            });
                          } else {
                            console.log("query: ", result);
                            res.status(200).json({ message: "File created." });
                          }
                        }
                      );
                    }
                  });
                }
              }
            );
          } else {
            return res.status(409).json({
              error: "File already exists in the folder and in the database.",
            });
          }
        }
      );
    });
  }
}

module.exports = {
  createFile,
};
