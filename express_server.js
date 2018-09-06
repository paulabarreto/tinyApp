
var express = require("express");
const bcrypt = require('bcryptjs');
var app = express();
var PORT = 8080;

var cookieSession = require('cookie-session');

app.use(cookieSession({
  name: 'session',
  keys: ["ayjabayga186376479"],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");


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
    "9sm5xk": "http://www.google.com"
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
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  users[userId] = {id: userId, email: req.body.email, password: hashedPassword};
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
  // console.log(password);
  // console.log(users[id].password);
  if(!id){
    res.status(403).end();
  } else if(bcrypt.compareSync(password, users[id].password)){
        req.session.user_id = "id";
        //res.cookie('id', id);
        res.redirect("/urls");
  } else {
    res.status(403).end();
  }
});

app.post("/logout", (req, res) => {
  req.session.user_id = null;
  res.redirect("/urls");
});

function findUserList(user_id){
  for(let id in urlDatabase){
    if (user_id === id){
      return true;
    }
  }
}

app.post("/urls", (req, res) => {
  let userId = req.session.user_id;
  //let userId = req.session.user_id;
  let newURL = generateRandomString(6);
  if(findUserList(userId)){
    urlDatabase[userId][newURL] = req.body.longURL;
  } else{
    urlDatabase[userId] = {[newURL]: req.body.longURL};
  }
  res.redirect("/urls");
});

app.post("/urls/:id/delete", (req, res) => {
  let longURL = req.params.id;
  delete urlDatabase[req.session.user_id][longURL];
  //delete urlDatabase[req.session.user_id][longURL];
  res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {
  urlDatabase[req.session.user_id][req.params.id] = req.body.longURL;
  res.redirect("/urls");
});

app.get("/register", (req, res) => {
  templateVars = { urls: urlDatabase, id: req.session.user_id};
  res.render("urls_register", templateVars);
});

app.get("/login", (req, res) => {
  templateVars = { urls: urlDatabase, id: req.session.user_id};
  res.render("urls_login", templateVars);
});

app.get("/urls", (req, res) => {
  templateVars = { urls: urlDatabase[req.session.user_id], id: req.session.user_id};
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  if(req.session.user_id){
    templateVars = { urls: urlDatabase[req.session.user_id], id: req.session.user_id};
    res.render("urls_new", templateVars);
  }else{
    res.redirect("/login");
  }
});

function findUserShortURL(shortUrl){
  for(let id in urlDatabase){
    for(let key in urlDatabase[id]){
      if (key === shortUrl){
        return id;
      }
    }
  }
  return null;
}


app.get("/urls/:id", (req, res) => {
  // console.log(urlDatabase[req.params.id]);
  let userId =  req.session.user_id;
  var shortURL = req.params.id

  let userIdByURL = findUserShortURL(shortURL);
  if(userId){
    templateVars = { id: userId, shortURL: shortURL, longURL: urlDatabase[userId][req.params.id]};
  } else{
    let userIdByURL = findUserShortURL(shortURL);
    templateVars = { id: "", shortURL: shortURL, longURL: urlDatabase[userIdByURL][req.params.id]};
  }
  res.render("urls_show", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
