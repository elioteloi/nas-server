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

module.exports = { createFolder, fetchFolder };
