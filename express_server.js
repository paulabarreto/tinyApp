
var express = require("express");
var app = express();
var PORT = 8080;

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

var cookieParser = require('cookie-parser');

app.use(cookieParser());

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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
  },
  "userid": {
    id: "userid",
    email: "userid@example.com",
    password: "coffelatte"
  }
};

var usersDatabase = {};
var templateVars = {};

app.post("/urls", (req, res) => {
  let newURL = generateRandomString(6);
  urlDatabase[newURL] = req.body.longURL;
  res.redirect(`/urls`);
});

app.post("/urls/:id/delete", (req, res) => {
  let longURL= req.params.id;
  delete urlDatabase[longURL];
  res.redirect(`/urls`);
});

app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect(`/urls`);
});

// res.cookie('name', 'tobi', { path: '/admin' });
// res.clearCookie('name', { path: '/admin' });

// app.post("/login", (req, res) => {
//   res.cookie('username', req.body['username']);
//   res.cookie('password', req.body['password']);
//   // console.log(req.cookies);
//   res.redirect("/urls");
// });

app.post("/logout", (req, res) => {
  res.clearCookie('username', req.body['username']);
  res.redirect("/urls");
});

app.post("/register", (req, res) => {
  //console.log(req.body.email, req.body.password);
  // users[req.body.email + "id"] = req.body.email + "id";
  let userId = generateRandomString(4);
  users[userId] = {id: userId, email: req.body.email, password: req.body.password};
  res.cookie('id', userId);
  // console.log(users);
  if(!req.body.email || !req.body.password){
    res.status(400).end();
  }
  res.redirect("/urls");
});

app.get("/register", (req, res) => {
  res.render("urls_register", templateVars);
});

app.get("/login", (req, res) => {
  res.render("urls_login", templateVars);
});

app.get("/urls", (req, res) => {
  templateVars = { urls: urlDatabase, users: users};
  // console.log(templateVars);
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  templateVars = { urls: urlDatabase, users: users};
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  // console.log(urlDatabase[req.params.id]);
  templateVars = { shortURL: req.params.id, longURL: urlDatabase[req.params.id], users: users };
  res.render("urls_show", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


function generateRandomString(number) {
  let result = "";
  for(i = 0; i < number; i++){
    result += Math.random().toString(36).replace('0.', '').slice(1, 2);
  }
  return result;
}
