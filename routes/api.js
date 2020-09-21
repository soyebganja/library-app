'use strict';

const express = require("express");
const bookRouter = require("./book");

const app = express();

app.use("/book/", bookRouter);

module.exports = app;