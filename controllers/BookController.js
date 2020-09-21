'use strict';

const Book = require("../models/BookModel");
const { body, validationResult } = require("express-validator");
const apiResponse = require("../helpers/apiResponse");
const mongoose = require("mongoose");
mongoose.set("useFindAndModify", false);


// Book Schema
function BookData(data) {
  this.id = data._id;
  this.author = data.author;
  this.title = data.title;
  this.isbn = data.isbn;
  this.releaseDate = data.releaseDate;
  this.createdAt = data.createdAt;
}


/**
 * Book List.
 * 
 * @returns {Object}
 */
exports.bookList = [
  (req, res) => {
    try {
      Book.find({}, "_id author title isbn releaseDate createdAt").then((books) => {
        if (books.length > 0) {
          return apiResponse.successResponseWithData(res, "Operation success", books);
        } else {
          return apiResponse.successResponseWithData(res, "Operation success", []);
        }
      });
    } catch (err) {
      //throw error in json response with status 500. 
      return apiResponse.ErrorResponse(res, err);
    }
  }
];


/**
 * Book store.
 * 
 * @param {string}      author
 * @param {string}      title 
 * @param {string}      isbn
 * @param {string}      releaseDate
 * 
 * @returns {Object}
 */
exports.bookStore = [
  body("author", "Author must not be empty.").isLength({ min: 1 }).trim(),
  body("title", "Title must not be empty.").isLength({ min: 1 }).trim(),
  body("isbn", "ISBN must not be empty").isLength({ min: 1 }).trim().custom((value) => {
    return Book.findOne({ isbn: value }).then(book => {
      if (book) {
        return Promise.reject("Book already exist with this ISBN no.");
      }
    });
  }),
  (req, res) => {
    try {
      const errors = validationResult(req);
      const book = new Book({
        author: req.body.author,
        title: req.body.title,
        isbn: req.body.isbn,
        releaseDate: req.body.releaseDate
      });

      if (!errors.isEmpty()) {
        return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
      } else {
        //Save book.
        book.save((err) => {
          if (err) throw err;
          const bookData = new BookData(book);
          return apiResponse.successResponseWithData(res, "Book add Success.", bookData);
        });
      }
    } catch (err) {
      //throw error in json response with status 500. 
      return apiResponse.ErrorResponse(res, err);
    }
  }
];

/**
 * Book update.
 * 
 * @param {string}      author 
 * @param {string}      title
 * @param {string}      isbn
 * @param {string}      releaseDate
 * 
 * @returns {Object}
 */
exports.bookUpdate = [
  body("author", "Author must not be empty.").isLength({ min: 1 }).trim(),
  body("title", "Title must not be empty.").isLength({ min: 1 }).trim(),
  body("isbn", "ISBN must not be empty").isLength({ min: 1 }).trim().custom((value, { req }) => {
    return Book.findOne({ isbn: value, _id: { "$ne": req.params.id } }).then(book => {
      if (book) {
        return Promise.reject("Book already exist with this ISBN no.");
      }
    });
  }),
  (req, res) => {
    try {
      const errors = validationResult(req);
      const book = new Book({
        _id: req.params.id,
        author: req.body.author,
        title: req.body.title,
        isbn: req.body.isbn,
        releaseDate: req.body.releaseDate
      });

      if (!errors.isEmpty()) {
        return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
      } else {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
          return apiResponse.validationErrorWithData(res, "Invalid Error.", "Invalid ID");
        } else {
          Book.findById(req.params.id, (err, foundBook) => {
            if (err) throw err;
            if (!foundBook) {
              return apiResponse.notFoundResponse(res, "Book not exists with this id");
            } else {
              //update book.
              Book.findByIdAndUpdate(req.params.id, book, {}, (err) => {
                if (err) throw err;
                const bookData = new BookData(book);
                return apiResponse.successResponseWithData(res, "Book update Success.", bookData);
              });
            }
          });
        }
      }
    } catch (err) {
      //throw error in json response with status 500. 
      return apiResponse.ErrorResponse(res, err);
    }
  }
];

/**
 * Book Delete.
 * 
 * @param {string}      id
 * 
 * @returns {Object}
 */
exports.bookDelete = [
  (req, res) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return apiResponse.validationErrorWithData(res, "Invalid Error.", "Invalid ID");
      }

      Book.findById(req.params.id, (err, foundBook) => {
        if (err) throw err;
        if (!foundBook) {
          return apiResponse.notFoundResponse(res, "Book not exists with this id");
        } else {
          //delete book.
          Book.findByIdAndRemove(req.params.id, (err) => {
            if (err) throw err;
            return apiResponse.successResponse(res, "Book delete Success.");
          });
        }
      });
    } catch (err) {
      //throw error in json response with status 500. 
      return apiResponse.ErrorResponse(res, err);
    }
  }
];
