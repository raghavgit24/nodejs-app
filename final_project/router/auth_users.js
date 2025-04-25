const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];
const jwtSecretKey = "skj3cb7DBcbdH6J4WS@^dcb@#%w8r";

const isValid = (username) => { //returns boolean
  return (/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/).test(username.toLowerCase());
}

const authenticatedUser = (username, password) => { //returns boolean
  const userExists = users.some(user =>
    user.username === username && user.password === password
  );
  return userExists;
}

//only registered users can login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username) {
    return res.status(400).json({ message: "Please provide a username." });
  }

  if (!isValid(username)) {
    return res.status(400).json({ message: "Please provide a valid username." });
  }

  if (!password) {
    return res.status(400).json({ message: "Please provide a password." });
  }

  const userExists = users.filter((user) => user.username === username);
  if (userExists.length) {
    const isUserValid = authenticatedUser(username, password);
    if (isUserValid) {
      const userJwt = jwt.sign(userExists[0], jwtSecretKey, { expiresIn: '24h' });
      req.session.authorization = {
        userJwt, username
      };
      return res.status(200).json({ message: "User Logged In successfully.", token: userJwt });
    } else {
      return res.status(400).json({ message: "Please enter the correct credentials." });
    }
  } else {
    return res.status(404).json({ message: "User Not Found." });
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const { review } = req.query;
  const isbn = parseInt(req.params.isbn);
  const postingUsername = req.user;

  if (!review) {
    return res.status(400).json({ message: "Please provide a book review." });
  }

  // Checking the same user's review posting status
  const pastReviewExist = books[isbn]["reviews"].findIndex((review) => {
    return review.username === postingUsername;
  });

  if (pastReviewExist !== -1) {
    (books[isbn]["reviews"][pastReviewExist]).review = review;
    return res.status(200).json({ message: "Book review modified." });
  } else {
    (books[isbn]["reviews"]).push({
      username: postingUsername,
      review: review.toString()
    });
    return res.status(200).json({ message: "Book review added." });
  }
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = parseInt(req.params.isbn);
  const postingUsername = req.user;

  // Checking the index of the user's posted review
  const pastReviewIndex = (books[isbn]["reviews"]).findIndex((review) => {
    return review.username === postingUsername;
  });

  if (pastReviewIndex !== -1) {
    (books[isbn]["reviews"]).splice(pastReviewIndex, 1);
    return res.status(200).json({ message: "Reviews Deleted Successfully." });
  } else {
    return res.status(200).json({ message: "No Reviews Found for your user." });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
module.exports.jwtSecretKey = jwtSecretKey;
