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

function fetchUser(req, res) {
  const { email } = req.body;

  if (req.body.email === "" && req.body.password === "") {
    console.log("There is nothing on the input.");
    return res
      .status(400)
      .json({ errorInput: "There is nothing on the input." });
  } else {
    connection.query(
      `SELECT id, email, password FROM users WHERE email = ? LIMIT 1;`,
      [email],
      (err, result) => {
        if (err) {
          console.error("Error querying user.", err);
          return res.status(400).json({ message: "Error querying user." });
        }

        if (result.length === 1) {
          console.log("id", result[0].id);

          bcrypt.compare(
            req.body.password,
            result[0].password,
            (err, resultOfBcrypt) => {
              if (err) {
                console.log("Error comparing password");
              }

              if (resultOfBcrypt) {
                console.log("result", result);

                console.log("its the same password.");
                return res.status(200).json({
                  success: true,
                  redirectUrl: "home",
                  id: result[0].id,
                  user: email,
                });
              } else {
                console.log("The password is incorrect.");
                return res
                  .status(401)
                  .json({ errorPassword: "The password is incorrect." });
              }
            }
          );
        } else {
          console.error("No account found.", err);
          return res.status(404).json({ errorEmail: "No account found." });
        }
      }
    );
  }
}

module.exports = { createUser, fetchUser };
