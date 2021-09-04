const { assert } = require('chai');
const bcrypt = require('bcrypt');

const { compareUserInfoByEmail, compareUserInfoByPassword, compareUserInfoByID, getUrlsForUserId } = require('../helper');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("purple-monkey-dinosaur", 10)
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk", 10)
  }
};

const testUrlDatabase = {
  "b2xVn2": { longURL : "http://www.lighthouselabs.ca", userID : "user2RandomID" },
  "9sm5xK": { longURL : "http://www.google.com", userID : "user2RandomID" }
};

describe('compareUserInfo', function() {
  it('should return true if enteredEmail exits in users object', function() {
    const user = compareUserInfoByEmail("user@example.com", testUsers);
    const expectedOutput = true;
    assert.equal(user, expectedOutput);
  });
  it('should return false if enteredEmail is not found in users object', function() {
    const user = compareUserInfoByEmail("user3@example.com", testUsers);
    const expectedOutput = false;
    assert.equal(user, expectedOutput);
  });
  it('should return true if enteredPassword exits in users object', function() {
    const user = compareUserInfoByPassword("purple-monkey-dinosaur", testUsers);
    const expectedOutput = true;
    assert.equal(user, expectedOutput);
  });
  it('should return false if enteredPassword is not found in users object', function() {
    const user = compareUserInfoByPassword("diswasher-junk", testUsers);
    const expectedOutput = false;
    assert.equal(user, expectedOutput);
  });
  it('should return true if ID exits in users object', function() {
    const user = compareUserInfoByID("userRandomID", testUsers);
    const expectedOutput = true;
    assert.equal(user, expectedOutput);
  });
  it('should return false if ID is not found in users object', function() {
    const user = compareUserInfoByID("user4RandomID", testUsers);
    const expectedOutput = false;
    assert.equal(user, expectedOutput);
  });
  it('should return URLs for given userId from users object', function() {
    const user = getUrlsForUserId("user2RandomID", testUrlDatabase);
    const expectedOutput = {
      "b2xVn2": { longURL : "http://www.lighthouselabs.ca"},
      "9sm5xK": { longURL : "http://www.google.com"}
    };
    assert.deepEqual(user, expectedOutput);
  });
  it('should return undefined if URLs for given userId does not exist in users object', function() {
    const user = getUrlsForUserId("user4RandomID", testUrlDatabase);
    const expectedOutput = {};
    assert.deepEqual(user, expectedOutput);
  });
});
