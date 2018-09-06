
var express = require("express");
var app = express();
var PORT = 8080;

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

var cookieParser = require('cookie-parser');

app.use(cookieParser());

function findUser(email){
  for(let id in users){
    for(let key in users[id]){
      if (email === users[id][key]){
        return id;
      }
    }
  }
  return null;
}

function generateRandomString(number) {
  let result = "";
  for(i = 0; i < number; i++){
    result += Math.random().toString(36).replace('0.', '').slice(1, 2);
  }
  return result;
}

const urlDatabase = {
  "userRandomID": {
    "b2xVn2": "http://www.lighthouselabs.ca",
    "9sm5xK": "http://www.google.com"
  }
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
    password: "123"
  }
};

var templateVars = {};

app.post("/register", (req, res) => {
  let userId = generateRandomString(4);
  users[userId] = {id: userId, email: req.body.email, password: req.body.password};
  res.cookie('id', userId);
  if(!req.body.email || !req.body.password){
    res.status(400).end();
  } else{
    res.redirect("/urls");
  }
});

app.post("/login", (req, res) => {
  let email = req.body["email"];
  let password = req.body["password"];
  let id = findUser(email);
  if(!id){
    res.status(403).end();
  } else{
    if(users[id].password === password){
        res.cookie('id', id);
        res.redirect("/urls");
    } else {
      res.status(403).end();
    }
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie('id', req.body["id"]);
  res.redirect("/urls");
});

app.post("/urls", (req, res) => {
  let userId = req.cookies["id"];
  let newURL = generateRandomString(6);
  urlDatabase[userId][newURL] = req.body.longURL;
  res.redirect("/urls");
});

app.post("/urls/:id/delete", (req, res) => {
  let longURL = req.params.id;
  delete urlDatabase[req.cookies["id"]][longURL];
  res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect("/urls");
});

app.get("/register", (req, res) => {
  templateVars = { urls: urlDatabase, id: req.cookies["id"]};
  res.render("urls_register", templateVars);
});

app.get("/login", (req, res) => {
  templateVars = { urls: urlDatabase, id: req.cookies["id"]};
  res.render("urls_login", templateVars);
});

app.get("/urls", (req, res) => {
  templateVars = { urls: urlDatabase[req.cookies["id"]], id: req.cookies["id"]};
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  if(req.cookies["id"]){
    templateVars = { urls: urlDatabase[req.cookies["id"]], id: req.cookies["id"]};
    res.render("urls_new", templateVars);
  }else{
    res.redirect("/login");
  }
});

app.get("/urls/:id", (req, res) => {
  // console.log(urlDatabase[req.params.id]);
  let userId =  req.cookies["id"];
  templateVars = { id: userId, shortURL: req.params.id, longURL: urlDatabase[userId][req.params.id]};
  res.render("urls_show", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
