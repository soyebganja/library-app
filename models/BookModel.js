'use strict';

const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const BookSchema = new Schema({
	author: { type: String, required: true },
	title: { type: String, required: true },
	isbn: { type: String, required: true },
	releaseDate: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model("Book", BookSchema);