const bcrypt = require('bcrypt');


function generateRandomString(length, chars) {
  let result = '';
    for (let i = length; i > 0; i--) {
        result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
};

function getUserInfoByEmail(loggedInEmail, users) {
  for (let userId in users) {
    if (loggedInEmail === users[userId].email) {
      console.log('IngetuserEmail=', loggedInEmail);
      console.log('userId from users', users[userId].email);
      return true;
    }
  }
  return false;
};

function getUserInfoByPassword(enteredPassword, users) {
  for (let userId in users) {
    if (bcrypt.compareSync(enteredPassword, users[userId].password)) {
      return true;
    }
  }
  return false;
};

function getUserInfoByID(userid, users) {
  for (let key in users) {
    if (userid === users[key].id) {
      console.log('USerID from getUserinfobyId function', userid)
      return true;
    }
  }
  return false;
};

function getUrlsForUserId(userId, urlDatabase) {
  console.log('userid', userId);
  let result = {};
  for (let key in urlDatabase) {
    if (urlDatabase[key].userID === userId) {
      // return urlDatabase[user];
      let temp = {longURL: urlDatabase[key].longURL};
      result[key] = temp; 
    }
  }
  console.log("in function getURLS",result);
  return result;
}

module.exports = { generateRandomString, getUserInfoByEmail , getUserInfoByPassword, getUserInfoByID, getUrlsForUserId };
