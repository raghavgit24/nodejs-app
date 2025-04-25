const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username) {
    return res.status(400).json({ message: "Please provide a username." });
  }

  if (!isValid(username)) {
    return res.status(400).json({ message: "Please provide your email as a username." });
  }

  if (!password) {
    return res.status(400).json({ message: "Please provide a password." });
  }

  const userExists = users.filter((user) => user.username === username);
  if (userExists.length) {
    return res.status(400).json({ message: "The entered username already exists." });
  } else {
    users.push({
      username: username,
      password: password
    });
    return res.status(200).json({ message: "User Registered Successfully." });
  }
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
  new Promise((resolve, reject) => {
    try {
      setTimeout(() => {
        resolve({ data: books });
      }, 1000);
    } catch (error) {
      reject(error);
    }
  })
    .then((data) => {
      return res.status(200).json(data);
    })
    .catch((error) => {
      return res.status(500).json({ error: 'Internal Server Error' });
    });
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async function (req, res) {
  try {
    const isbn = parseInt(req.params.isbn);
    const data = await new Promise((resolve, reject) => {
      if (books[isbn]) {
        resolve({ bookData: books[isbn] });
      } else {
        reject(new Error('Book not found'));
      }
    });
    return res.status(200).json(data);
  } catch (error) {
    return res.status(404).json({ error: error.message });
  }
});

// Get book details based on author
public_users.get('/author/:author', async function (req, res) {
  try {
    const author = (req.params.author).replaceAll('-', ' ');
    const filteredBooks = Object.values(books).filter(book => book.author === author);
    const data = await new Promise((resolve, reject) => {
      if (filteredBooks.length > 0) {
        resolve({ data: filteredBooks });
      } else {
        reject(new Error('No books found for this author'));
      }
    });
    return res.status(200).json(data);
  } catch (error) {
    return res.status(404).json({ error: error.message });
  }
});

// Get all books based on title
public_users.get('/title/:title', async function (req, res) {
  try {
    const title = (req.params.title).replaceAll('-', ' ');
    const filteredBooks = Object.values(books).filter(book => book.title === title);
    const data = await new Promise((resolve, reject) => {
      if (filteredBooks.length > 0) {
        resolve({ data: filteredBooks });
      } else {
        reject(new Error('No books found with this title'));
      }
    });
    return res.status(200).json(data);
  } catch (error) {
    return res.status(404).json({ error: error.message });
  }
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = parseInt(req.params.isbn);
  return res.status(300).json({ reviews: books[isbn]["reviews"] });
});

module.exports.general = public_users;
