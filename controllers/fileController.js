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

function fetchFile(req, res) {
  const userid = req.body.id;
  const foldername = req.body.folder;
  console.log("id fetch", userid);
  console.log("folder fetch", foldername);

  connection.query(
    "SELECT id, userid, userdrive, originalname, filename, foldername FROM file WHERE userid = ? AND foldername = ?;",
    [userid, foldername],
    (err, result) => {
      if (err) {
        console.error("Error querying data from file.", err);
        return res.status(500).json({
          error: "Error querying data from file.",
        });
      } else {
        console.log(result);
        res.status(200).json({ result });
      }
    }
  );
}

function updateFile(req, res) {
  console.log(req.body.id);
  console.log(req.body.name);

  const fileId = req.body.id;
  const newName = req.body.name;

  connection.query(
    "SELECT userdrive, filename, foldername FROM file WHERE id = ?;",
    [fileId],
    (err, result) => {
      if (err) {
        console.error("Error querying data from file.", err);
        return res.status(500).json({
          error: "Error querying data from file.",
        });
      } else {
        console.log("the result", result[0]);

        const uniqueSuffix = Date.now();

        let newNameOfFilename =
          uniqueSuffix + "-" + newName + path.extname(result[0].filename);

        let newNameOfOriginalname = newName + path.extname(result[0].filename);

        let OldFilePath = `${process.env.PATH_OF_DRIVE}/${result[0].userdrive}/${result[0].foldername}/${result[0].filename}`;
        let NewFilePath = `${process.env.PATH_OF_DRIVE}/${result[0].userdrive}/${result[0].foldername}/${newNameOfFilename}`;

        console.log("oldFile", OldFilePath);
        console.log("newFile", NewFilePath);

        connection.query(
          "UPDATE file SET filename = ?, originalname = ? WHERE id = ?;",
          [newNameOfFilename, newNameOfOriginalname, fileId],
          (err) => {
            if (err) {
              console.error("Error updating the name of the file.", err);
              return res
                .status(409)
                .json({ error: "Error updating the name of the file." });
            } else {
              fs.rename(OldFilePath, NewFilePath, (err) => {
                if (err) {
                  console.error("Error renaming the file.", err);
                  return res
                    .status(500)
                    .json({ error: "Error renaming the file." });
                } else {
                  console.log("File renamed successfully.");
                  return res
                    .status(200)
                    .json({ message: "File renamed successfully." });
                }
              });
            }
          }
        );
      }
    }
  );
}

function deleteFile(req, res) {
  console.log("request id user from frontend", req.params.id);

  let fileId = req.params.id;
  console.log("id file", fileId);

  connection.query(
    "SELECT userdrive, filename, foldername FROM file WHERE id = ?;",
    [fileId],
    (err, result) => {
      if (err) {
        console.error("Error querying data from file.", err);
        return res.status(500).json({
          error: "Error querying data from file.",
        });
      } else {
        let OldFilePath = `${process.env.PATH_OF_DRIVE}/${result[0].userdrive}/${result[0].foldername}/${result[0].filename}`;
        let NewFilePath = `${process.env.PATH_OF_DRIVE}/${result[0].userdrive}/bin/${result[0].filename}`;

        connection.query(
          "DELETE FROM file WHERE id = ? LIMIT 1;",
          [fileId],
          (err, result) => {
            if (err) {
              console.error("Error deleting file.", err);
              return res.status(500).json({ error: "Error deleting file." });
            } else {
              console.log(result);
              fs.rename(OldFilePath, NewFilePath, (err) => {
                if (err) {
                  console.error(err);
                  return res
                    .status(500)
                    .json({ error: "Error deleting the file." });
                } else {
                  console.log("File deleted successfully.");
                  return res
                    .status(200)
                    .json({ message: "File deleted successfully." });
                }
              });
            }
          }
        );
      }
    }
  );
}

module.exports = {
  createFile,
  fetchFile,
  updateFile,
  deleteFile,
};
