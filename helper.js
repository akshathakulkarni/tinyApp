const bcrypt = require('bcrypt');

const generateRandomString = function(length, chars) {
  let result = '';
  for (let i = length; i > 0; i--) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
};

const compareUserInfoByEmail = function(loggedInEmail, users) {
  for (let userId in users) {
    if (loggedInEmail === users[userId].email) {
      return true;
    }
  }
  return false;
};

const compareUserInfoByPassword = function(enteredPassword, users) {
  for (let userId in users) {
    if (bcrypt.compareSync(enteredPassword, users[userId].password)) {
      return true;
    }
  }
  return false;
};

const compareUserInfoByID = function(userid, users) {
  for (let key in users) {
    if (userid === users[key].id) {
      return true;
    }
  }
  return false;
};

const getUrlsForUserId = function(userId, urlDatabase) {
  let result = {};
  for (let key in urlDatabase) {
    if (urlDatabase[key].userID === userId) {
      let temp = {longURL: urlDatabase[key].longURL};
      result[key] = temp;
    }
  }
  return result;
};

module.exports = { generateRandomString, compareUserInfoByEmail , compareUserInfoByPassword, compareUserInfoByID, getUrlsForUserId };
