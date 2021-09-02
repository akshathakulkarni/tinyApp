const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const cookieParser = require('cookie-parser');
app.use(cookieParser());

app.set('view engine', 'ejs');

function generateRandomString(length, chars) {
  let result = '';
    for (let i = length; i > 0; i--) {
        result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
}
const shortUrl = generateRandomString(6, '12345abcdeFG');
const randomId = generateRandomString(6, 'ert5437cvxTM&');

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}

function updateDatabase(urlDatabase) {
  urlDatabase[shortUrl] = 'http://www.in-tac.ca';
}
updateDatabase(urlDatabase);
console.log(urlDatabase);

function getUserInfoByEmail(loggedInEmail) {
  for (let userId in users) {
    if (loggedInEmail === users[userId].email) {
      return true;
    }
  }
}

function getUserInfoByPassword(enteredPassword) {
  for (let userId in users) {
    if (enteredPassword === users[userId].password) {
      return true;
    }
  }
}

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
  const userId = req.cookies["user_id"];
  const user = users[userId];
  const templateVars = { 
    urls: urlDatabase,
    user
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { 
    shortURL: req.params.shortURL, 
    longURL: "http://www.lighthouselabs.ca",
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  res.send(`urls/:${shortUrl}`);         // Respond with 'Ok' (we will replace this)
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]
  if (!longURL){
    return res.send('Requested shortURL is not defined in the urlDatabase');
  }
  res.redirect(longURL);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

app.post("/urls/:shortURL", (req, res) => {
  const newlongURL = req.body.longURL;
  shortURL = req.params.shortURL;
  urlDatabase[shortURL] = newlongURL;
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  if (!getUserInfoByEmail(req.body.email)) {
    return res.send('Error : StatusCode 403. Entered email has not been registered');
  }
  if (getUserInfoByEmail(req.body.email)) {
    if (!getUserInfoByPassword(req.body.password)) {
      return res.send('Error : StatusCode 403. Entered password does not match with registered password');
    }
  }
  const user = {
    id : randomId,
    email: req.body.email,
    password: req.body.password
  };
  users[randomId] = user;
  console.log(users);
  res.cookie("user_id", randomId);
  res.redirect("/urls");
});

app.get("/login", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]]
  }
  console.log('user...', templateVars);
  res.render("login", templateVars);
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

app.get("/register", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]]
  }
  res.render("urls_register", templateVars);
});

app.post("/register", (req, res) => {
  if (req.body.email === '' || req.body.password === '') {
    return res.send('Error : StatusCode 400. Invalid email or password.');
  }
  if (getUserInfoByEmail(req.body.email)) {
    return res.send('Error : StatusCode 400. Entered email already exists.');
  }
  const user = {
    id : randomId,
    email: req.body.email,
    password: req.body.password
  };
  users[randomId] = user;
  console.log(users);
  res.cookie("user_id", randomId);
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});