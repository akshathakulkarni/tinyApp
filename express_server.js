const express = require("express");
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const { generateRandomString, compareUserInfoByEmail, compareUserInfoByPassword, compareUserInfoByID, getUrlsForUserId } = require('./helper');

const app = express();
const PORT = 8080; // default port 8080
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2'],
  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));
app.set('view engine', 'ejs');

const urlDatabase = {
  "b2xVn2": { longURL : "http://www.lighthouselabs.ca", userID : "user2RandomID" },
  "9sm5xK": { longURL : "http://www.google.com", userID : "user2RandomID" }
};

const users = {
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

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId];
  //to get all the urls for this specific user
  let result = getUrlsForUserId(userId, urlDatabase);

  const templateVars = {
    urls: result,
    user
  };
  res.render("urls_index",templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.session.user_id]
  };
  if (templateVars.user === undefined) {
    return res.redirect('/login');
  }
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  let longUrl = urlDatabase[req.params.shortURL].longURL;
  let userID = req.session.user_id;
  let user_id = '';
  if (compareUserInfoByID(userID, users)) {
    user_id = userID;
  }
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: longUrl,
    user: users[user_id]
  };
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  let shortURL = generateRandomString(6, '12345abcdeFG');
  let temp = {
    longURL: req.body.longURL,
    userID: req.session.user_id
  };
  urlDatabase[shortURL] = temp;

  res.redirect("/urls");
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  if (!longURL) {
    return res.send('Requested shortURL is not defined in the urlDatabase');
  }
  res.redirect(longURL);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const Id = req.session.user_id;
  for (let key in users) {
    if (Id === users[key].id) {
      const shortURL = req.params.shortURL;
      delete urlDatabase[shortURL];
      return res.redirect("/urls");
    }
  }
  return res.send('Only registered users have permission to delete their urls');
});

app.post("/urls/:shortURL", (req, res) => {
  const ID = req.session.user_id;
  for (let key in users) {
    if (ID === users[key].id) {
      const newlongURL = req.body.longURL;
      const shortURL = req.params.shortURL;
      urlDatabase[shortURL] = {
        longURL : newlongURL,
        userID : req.session.user_id
      };
      return res.redirect("/urls");
    }
  }
  res.send('Only registered users have permission to edit/update their urls');
});

app.post("/login", (req, res) => {
  const emailFromUser = req.body.email;
  const passwordFromUser = req.body.password;

  if (compareUserInfoByEmail(emailFromUser, users)) {
    if (compareUserInfoByPassword(passwordFromUser, users)) {
      for (let user in users) {
        if (req.body.email === users[user].email) {
          const user_id = users[user].id;
          req.session.user_id = user_id;
        }
      }
    } else {
      res.statusCode = 403;
      return res.send('Error : Entered password does not match with registered password');
    }
  } else {
    res.statusCode = 403;
    return res.send('Error : Entered email has not been registered');
  }
  res.redirect("/urls");
});

app.get("/login", (req, res) => {
  const templateVars = {
    user: users[req.session.user_id]
  };
  res.render("login", templateVars);
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

app.get("/register", (req, res) => {
  const templateVars = {
    user: users[req.session.user_id]
  };
  res.render("urls_register", templateVars);
});

app.post("/register", (req, res) => {
  if (req.body.email === '' || req.body.password === '') {
    res.statusCode = 400;
    return res.send('Error : Invalid email or password.');
  }
  if (compareUserInfoByEmail(req.body.email, users)) {
    res.statusCode = 400;
    return res.send('Error : Entered email already exists.');
  }
  const hashedPassword = bcrypt.hashSync(req.body.password, 10);
  const user = {
    id : generateRandomString(6, '12345abcdeFG'),
    email: req.body.email,
    password: hashedPassword
  };
  users[user.id] = user;
  req.session.user_id = user.id;
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});