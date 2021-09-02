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

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

function updateDatabase(urlDatabase) {
  urlDatabase[shortUrl] = 'http://www.in-tac.ca';
}
updateDatabase(urlDatabase);
console.log(urlDatabase);

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
  const templateVars = { 
    urls: urlDatabase,
    user: req.cookies["username"] 
  };
  res.render("urls_index", templateVars);
});
app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: req.cookies["username"]
  };
  res.render("urls_new", templateVars);
});
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { 
    shortURL: req.params.shortURL, 
    longURL: "http://www.lighthouselabs.ca",
    user: req.cookies["username"] 
  };
  res.render("urls_show", templateVars);
});
app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  res.send(`urls/:${shortUrl}`);         // Respond with 'Ok' (we will replace this)
});
app.get("/u/:shortURL", (req, res) => {
  //console.log(req);
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
  res.cookie("username", req.body.name);
  res.redirect("/urls");
});
app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/urls");
})
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});