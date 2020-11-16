#!/usr/bin/env node
process.title = "preview-ide";
const express = require("express");
var app = express();
var fs = require("fs");

app.get("/ls", (req, res) => {
  fs.readdir("./template", function (err, items) {
    res.send(items);
  });
});

app.get("/*", (req, res) => {
  if (req.path.includes("favicon.ico")) {
    return res.sendStatus(204);
  }
  res.sendFile(req.path.substring(1), {
    root: "./",
  });
});

app.listen(1534);
