const connection = require("../database/db");
const fs = require("fs");
const bcrypt = require("bcrypt");

const saltRounds = 10;

function createUser(req, res) {
  const { name, email, password } = req.body;
  let userdrive = `${name}.drive`;

  if (!req.body.name || !req.body.email || !req.body.password) {
    console.log("there is nothing on the input.");
    return res
      .status(400)
      .json({ errorInput: "there is nothing on the input." });
  } else {
    connection.query(
      `SELECT email FROM users WHERE email = ? LIMIT 1;`,
      [email],
      (err, result) => {
        if (err) {
          console.error("Error querying user.", err);
          return res.status(500).json({ error: "Error querying user." });
        }

        if (result.length === 0) {
          bcrypt.genSalt(saltRounds, (err, salt) => {
            if (err) {
              console.log("Error generating salt");
            } else {
              bcrypt.hash(password, salt, (err, hash) => {
                if (err) {
                  console.log("Error hashing the password");
                } else {
                  connection.query(
                    "INSERT INTO users (name, email, password, userdrive) VALUES (?, ?, ?, ?);",
                    [name, email, hash, userdrive],
                    (err, result) => {
                      if (err) {
                        console.error(
                          "Error inserting user into the database.",
                          err
                        );
                        return res.status(500).json({
                          message: "Error inserting user into the database.",
                        });
                      } else {
                        fs.mkdir(
                          `${process.env.PATH_OF_DRIVE}/${userdrive}`,
                          (err) => {
                            if (err) {
                              console.error("Folder already created.", err);
                              return res
                                .status(409)
                                .json({ error: "Folder already created." });
                            } else {
                              fs.mkdir(
                                `${process.env.PATH_OF_DRIVE}/${userdrive}/uploads`,
                                (err) => {
                                  if (err) {
                                    console.error(
                                      "Folder uploads already created.",
                                      err
                                    );
                                    return res.status(409).json({
                                      error: "Folder uploads already created",
                                    });
                                  } else {
                                    console.log(
                                      "New directory uploads successfully created"
                                    );

                                    fs.mkdir(
                                      `${process.env.PATH_OF_DRIVE}/${userdrive}/bin`,
                                      (err) => {
                                        if (err) {
                                          console.error(
                                            "Folder bin already created",
                                            err
                                          );
                                          return res.status(409).json({
                                            error: "Folder bin already created",
                                          });
                                        } else {
                                          console.log("profil created");

                                          return res.status(200).json({
                                            success: true,
                                            redirectUrl: "login",
                                          });
                                        }
                                      }
                                    );
                                  }
                                }
                              );
                            }
                          }
                        );
                      }
                    }
                  );
                }
              });
            }
          });
        } else {
          console.log("there is already an email");
          return res
            .status(409)
            .json({ errorEmail: "there is already an email" });
        }
      }
    );
  }
}

module.exports = { createUser };
