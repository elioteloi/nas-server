const express = require("express");
const path = require("path");
const app = express();
require("dotenv").config();

const routesFile = require("./routes/file");
const routesUser = require("./routes/user");
const routesFolder = require("./routes/folder");
const hostname = process.env.HOSTNAME;
const port = process.env.PORT;

const cors = require("cors");
app.use(cors());

app.use(express.json());

app.use(routesFile);
app.use(routesUser);
app.use(routesFolder);

app.use(
  "/path_Of_Drive",
  express.static(path.join(`${process.env.PATH_OF_DRIVE}`))
);

app.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
