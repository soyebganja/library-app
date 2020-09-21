'use strict';

const express = require("express");
const BookController = require("../controllers/BookController");

const router = express.Router();

router.post("/", BookController.bookStore);
router.get("/", BookController.bookList);
router.put("/:id", BookController.bookUpdate);
router.delete("/:id", BookController.bookDelete);

module.exports = router;