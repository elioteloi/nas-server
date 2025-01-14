let mysql = require("mysql2");
require("dotenv").config();

let connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

connection.connect((err) => {
  if (err) {
    throw err;
  } else {
    console.log("Connected to database");
  }
});
module.exports = connection;
