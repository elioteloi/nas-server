const fs = require("fs");
const connection = require("../database/db");

function createFolder(req, res) {
  const { userid, folderName } = req.body;
  console.log("id user", userid);
  console.log("folder name", folderName);

  connection.query(
    "SELECT name, userdrive FROM users WHERE id = ? LIMIT 1;",
    [userid],
    (err, result) => {
      if (err) {
        console.error("Error querying user.");
        return res.status(500).json({ error: "Error querying user." });
      } else {
        if (result.length === 1) {
          fs.mkdir(
            `${process.env.PATH_OF_DRIVE}/${result[0].userdrive}/${folderName}`,
            (err) => {
              if (err) {
                console.error("Error creating the folder.", err);
                return res
                  .status(500)
                  .json({ error: "Error creating the folder." });
              } else {
                let folderPath = `${process.env.PATH_OF_DRIVE}/${result[0].userdrive}/${folderName}`;

                connection.query(
                  "INSERT INTO folder (userid, userdrive, foldername, path) VALUES (?, ?, ?, ?);",
                  [userid, result[0].userdrive, folderName, folderPath],
                  (err) => {
                    if (err) {
                      console.error(
                        "Error inserting the values in folder.",
                        err
                      );
                      return res.status(500).json({
                        error: "Error inserting the values in folder.",
                      });
                    } else {
                      console.log(
                        `${process.env.PATH_OF_DRIVE}/${result[0].userdrive}/${folderName}`
                      );

                      res.status(200).json({
                        success: folderName,
                        message: "Folder created.",
                      });
                    }
                  }
                );
              }
            }
          );
        } else {
          console.log("Folder already created.");
          return res.status(409).json({ error: "Folder already created." });
        }
      }
    }
  );
}

function fetchFolder(req, res) {
  const { id } = req.body;
  connection.query(
    "SELECT foldername FROM folder WHERE userid = ?",
    [id],
    (err, result) => {
      if (err) {
        console.error("Error querying the values in folder.", err);
        return res
          .status(500)
          .json({ error: "Error querying the values in folder." });
      } else {
        res.status(200).json({ result });
      }
    }
  );
}

function updateFolder(req, res) {
  const folderid = req.body.id;
  const newFolderName = req.body.folderName;

  connection.query(
    "SELECT foldername FROM folder WHERE foldername =  ? LIMIT 1",
    [newFolderName],
    (err, result) => {
      if (err) {
        console.log("Error querying the values in folder.");
        return res
          .status(500)
          .json({ error: "Error querying the values in folder." });
      } else {
        if (result.length === 0) {
          connection.query(
            "SELECT userdrive, foldername FROM folder WHERE id = ?",
            [folderid],
            (err, result) => {
              if (err) {
                console.error("Error querying the values in folder.", err);
                return res
                  .status(500)
                  .json({ error: "Error querying the values in folder." });
              } else {
                let OldFolderPath = `${process.env.PATH_OF_DRIVE}/${result[0].userdrive}/${result[0].foldername}`;
                let NewFolderPath = `${process.env.PATH_OF_DRIVE}/${result[0].userdrive}/${newFolderName}`;

                connection.query(
                  "UPDATE folder SET foldername = ?, path = ? where id = ?",
                  [newFolderName, NewFolderPath, folderid],
                  (err) => {
                    if (err) {
                      console.error("Error updating the name of folder.", err);
                      return res
                        .status(500)
                        .json({ error: "Error updating the name of folder." });
                    } else {
                      fs.rename(OldFolderPath, NewFolderPath, (err) => {
                        if (err) {
                          console.error(
                            "Error renaming the values in folder.",
                            err
                          );
                          return res
                            .status(500)
                            .json({ error: "Error renaming the folder." });
                        } else {
                          console.log("Folder renamed successfully");
                          res
                            .status(200)
                            .json({ message: "Folder renamed successfully." });
                        }
                      });
                    }
                  }
                );
              }
            }
          );
        } else {
          console.log("There is already a folder with this name.");
          res
            .status(409)
            .json({ error: "There is already a folder with that name." });
        }
      }
    }
  );
}

module.exports = { createFolder, fetchFolder, updateFolder };
