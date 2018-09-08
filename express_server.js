
var express = require("express");
var methodOverride = require("method-override");
var cookieSession = require("cookie-session");
const bodyParser = require("body-parser");
const bcrypt = require('bcryptjs');

var app = express();
var PORT = 8080;

app.use(methodOverride('_method'));
app.use(cookieSession({
  name: 'session',
  keys: ["ayjabayga186376479"],

  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

function findUserList(user_id){
  for(let id in urlDatabase){
    if (user_id === id){
      return true;
    }
  }
}

function findUser(email){
  for(let id in users){
    for(let key in users[id]){
      if (email === users[id][key]){
        return id;
      }
    }
  }
}

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

function generateRandomString(number) {
  let result = "";
  for(i = 0; i < number; i++){
    result += Math.random().toString(36).replace('0.', '').slice(1, 2);
  }
  return result;
}

const urlDatabase = {
  "user1": {
    "b2xVn2": {longURL: "http://www.lighthouselabs.ca", count: 0, userVisitCount: 0},
    "9sm5xk": {longURL: "http://www.google.com", count: 0, userVisitCount: 0}
  }
};

const users = {};
var templateVars = {};

app.post("/register", (req, res) => {
  let userId = generateRandomString(4);
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  users[userId] = {id: userId, email: req.body.email, password: hashedPassword};
  req.session.user_id = userId;
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
  } else if(bcrypt.compareSync(password, users[id].password)){
        req.session.user_id = id;
        res.redirect("/urls");
  } else {
    res.status(403).end();
  }
});

app.post("/logout", (req, res) => {
  req.session.user_id = null;
  res.redirect("/urls");
});

app.post("/urls", (req, res) => {
  let userId = req.session.user_id;
  let newURL = generateRandomString(6);
  if(findUserList(userId)){
    urlDatabase[userId][newURL] = {
      longURL: req.body.longURL,
      count: 1,
      userVisitCount: 1
    };
  } else{
    urlDatabase[userId] = {
      [newURL]: {longURL: req.body.longURL, count: 1, userVisitCount: 1}
    };
  }
  res.redirect("/urls");
});

app.delete("/urls/:id", (req, res) => {
  let longURL = req.params.id;
  delete urlDatabase[req.session.user_id][longURL];
  res.redirect("/urls");
});


app.put("/urls/:id", (req, res) => {
  console.log(urlDatabase[req.session.user_id][req.params.id]);
  urlDatabase[req.session.user_id][req.params.id]["longURL"] = req.body.longURL;
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

app.get("/u/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  let userIdByURL = findUserShortURL(shortURL);
  let longURL = urlDatabase[userIdByURL][shortURL]["longURL"];
  var address = "http://" + longURL;

  res.redirect(address);
});

app.get("/urls/:id", (req, res) => {

  let userId =  req.session.user_id;
  var shortURL = req.params.id;
  let countPlusOne = urlDatabase[userId][shortURL]["count"]++;
  let visitorCountPlusOne = urlDatabase[userId][shortURL]["userVisitCountcount"]++;
  let templateVars;
  let userIdByURL = findUserShortURL(shortURL);
  let longURL = urlDatabase[userIdByURL][shortURL]["longURL"];

  if(userId){
    templateVars = { id: userId, shortURL: shortURL, longURL: longURL, count: countPlusOne};
  } else{
    let userIdByURL = findUserShortURL(shortURL);
    templateVars = { id: "", shortURL: shortURL, longURL: longURL, count: countPlusOne, userVisitCount: visitorCountPlusOne};
  }
  res.render("urls_show", templateVars);
});


app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
