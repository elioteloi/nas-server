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

function updateUser(req, res) {
  console.log(req.body.id);
  console.log(req.body.password);

  const userId = req.body.id;
  const userPassword = req.body.password;
  const newPassword = req.body.newPassword;

  connection.query(
    "SELECT * FROM users WHERE id = ?",
    [userId],
    (err, result) => {
      if (err) {
        console.log("Error querying user");
        res.status(500).json({ error: "Error querying user" });
      } else {
        bcrypt.compare(
          userPassword,
          result[0].password,
          (err, resultOfBcrypt) => {
            if (err) {
              console.log("Error decrypting password", err);
              res.status(500).json({ error: "Error hashing password" });
            } else {
              if (resultOfBcrypt) {
                bcrypt.genSalt(saltRounds, (err, salt) => {
                  if (err) {
                    console.log("Error generating salt");
                    res.status(500).json({ error: "Error generating salt" });
                  } else {
                    bcrypt.hash(newPassword, salt, (err, hash) => {
                      if (err) {
                        console.log("Error hashing password");
                        res
                          .status(500)
                          .json({ error: "Error hashing password" });
                      } else {
                        connection.query(
                          "UPDATE users SET password = ? WHERE id = ?",
                          [hash, userId],
                          (err) => {
                            if (err) {
                              console.log("Error updating the password", err);
                              res
                                .status(500)
                                .json({ error: "Error updating the password" });
                            } else {
                              console.log("password changed successfully");

                              res.status(200).json({
                                message: "password changed successfully",
                              });
                            }
                          }
                        );
                      }
                    });
                  }
                });
              } else {
                console.log("Password is not the same");
                res.status(401).json({ error: "Password is not the same" });
              }
            }
          }
        );
      }
    }
  );
}

module.exports = { createUser, fetchUser, updateUser };
