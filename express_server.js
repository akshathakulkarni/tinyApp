const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const cookieParser = require('cookie-parser');
app.use(cookieParser());

const bcrypt = require('bcrypt');

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
}

function updateDatabase(urlDatabase) {
  urlDatabase[shortUrl] =  {
    longURL : 'http://www.in-tac.ca',
    userID : randomId
  };
}
updateDatabase(urlDatabase);
console.log(urlDatabase);

function getUserInfoByEmail(loggedInEmail) {
  
  for (let userId in users) {
    if (loggedInEmail === users[userId].email) {
      console.log('IngetuserEmail=', loggedInEmail);
      console.log('userId from users', users[userId].email);
      return true;
    }
  }
}

function getUserInfoByPassword(enteredPassword) {
  for (let userId in users) {
    if (bcrypt.compareSync(enteredPassword, users[userId].password)) {
      return true;
    }
  }
}

function getUserInfoByID(userid) {
  for (let key in users) {
    if (userid === users[key].id) {
      console.log('USerID from getUserinfobyId function', userid)
      return true;
    }
  }
} 

function getUrlsForUserId(userId) {
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
  console.log('user id in home page', userId);
  const user = users[userId];
  //to get all the urls for this specific user
  let result = getUrlsForUserId(userId);

  const templateVars = { 
    urls: result,
    user
  };
  //console.log("result = ",result);
  res.render("urls_index",templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]]
  };
  if (templateVars.user === undefined) {
    return res.redirect('/login');
  }
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  console.log('data1', req.params.shortURL);
  console.log('data...', urlDatabase[req.params.shortURL].longURL);
  let longUrl = urlDatabase[req.params.shortURL].longURL;
  let userID = req.cookies["user_id"];
  let user_id = '';
  if (getUserInfoByID(userID)) {
    user_id = userID;
  }
  const templateVars = { 
    shortURL: req.params.shortURL, 
    longURL: longUrl,
    user: users[user_id]
  };
  console.log('templatevars...', templateVars);
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  let shortURL = generateRandomString(6, '12345abcdeFG');
  let temp = {
    longURL: req.body.longURL,
    userID: req.cookies["user_id"]
  }
  urlDatabase[shortURL] = temp;

  res.redirect("/urls");         // Respond with 'Ok' (we will replace this)
});

app.get("/u/:shortURL", (req, res) => {
  shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  if (!longURL){
    return res.send('Requested shortURL is not defined in the urlDatabase');
  }
  res.redirect(longURL);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const Id = req.cookies["user_id"];
  console.log('id', Id);
  console.log('users', users);
  for (let key in users) {
    if (Id === users[key].id) {
      console.log('userdata', users[key].id);
      const shortURL = req.params.shortURL;
      delete urlDatabase[shortURL];
      return res.redirect("/urls");
    } else {
      continue;     
    }
  }
  return res.send('Only registered users have permission to delete their urls');
});

app.post("/urls/:shortURL", (req, res) => {
  const ID = req.cookies["user_id"];
  for (let key in users) {
    if (ID === users[key].id) {
      const newlongURL = req.body.longURL;
      shortURL = req.params.shortURL;
      urlDatabase[shortURL] = {
      longURL : newlongURL,
      userID : req.cookies["user_id"]
      }
      console.log('url', urlDatabase);
      res.redirect("/urls");
    } else {
      continue;
    }
    res.send('Only registered users have permission to edit/update their urls');
  }
});

app.post("/login", (req, res) => {
  const emailFromUser = req.body.email;
  const passwordFromUser = req.body.password;
  console.log('email - cleartext...', req.body.email);
  console.log('password - cleartext...', req.body.password);
  console.log('passwordFromUser...', passwordFromUser);

  if (getUserInfoByEmail(emailFromUser)) {
    console.log('in login', users);
    if (getUserInfoByPassword(passwordFromUser)) {
      console.log('users=', users);
      
      for (let user in users) {
        if (req.body.email === users[user].email) {
          user_id = users[user].id;
          res.cookie("user_id", user_id);
        }
      }
    } else {
      return res.send('Error : StatusCode 403. Entered password does not match with registered password');
    }
  } else {
    return res.send('Error : StatusCode 403. Entered email has not been registered');
  }
  console.log('logged in', users);
  
  res.redirect("/urls");
});

app.get("/login", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]]
  }
  console.log('user with cookie id', templateVars);
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
  console.log('plainTextPasswordFromRegister - ', req.body.password);
  const hashedPassword = bcrypt.hashSync(req.body.password, 10);
  console.log('hashedpassword', hashedPassword);
  const user = {
    id : generateRandomString(6, '12345abcdeFG'),
    email: req.body.email,
    password: hashedPassword
  };
  users[user.id] = user;
  console.log('Register', users);
  res.cookie("user_id", user.id);
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});