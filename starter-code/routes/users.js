
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/User');
const bcryptSalt = 12;

/* GET users listing. */
// router.get('/', function(req, res, next) {
//   res.send('respond with a resource');
// });

router.get('/signup', (req, res) => {
  if(req.session.currentUser){
    res.redirect('/');
  }else{
  res.render('auth/signup', {
    title: 'Signup'
  });
}
});

router.post('/signup', (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username === "" || password === "") {
    res.render("auth/signup", {
      errorMessage: "Indicate a username and a password to sign up"
    });
    return;
  }

  User.findOne({ "name": username }).then(user =>{
    if(user){
      res.render("auth/signup", {
        errorMessage: "User already exists"
      });
      return;
    }

    const salt = bcrypt.genSaltSync(bcryptSalt);
    const hashPass = bcrypt.hashSync(password, salt);

    new User({
        name: username,
        password: hashPass,
        email:"@",
        summary:"",
        imgUrl:"img",
        company:"--",
        jobTitle:"--",
      })
      .save()
      .then(() => res.redirect('/'))
      .catch(e => next(e));
  });
});

router.get('/login', (req, res) => {
  if(req.session.currentUser){
    res.redirect('/');
  }else{
  res.render('auth/login', {
    title: 'Login Here!'
  });
}
});

router.post("/login", (req, res, next) => {
  var username = req.body.username;
  var password = req.body.password;

  if (username === "" || password === "") {
    res.render("auth/login", {
      errorMessage: "Indicate a username and a password to sign up"
    });
    return;
  }

  User.findOne({ "name": username }, (err, user) => {
      if (err || !user) {
        res.render("auth/login", {
          errorMessage: "The username doesn't exist"
        });
        return;
      }
      if (bcrypt.compareSync(password, user.password)) {
        req.session.currentUser = user;
        res.redirect("/");
      } else {
        res.render("auth/login", {
          errorMessage: "Incorrect password"
        });
      }
  });
});


router.get("/profile",(req,res,next)=>{
  if(req.session.currentUser){
    res.render('auth/profile', {
      user: req.session.currentUser.name,
      jobTitle:req.session.currentUser.jobTitle,
      img: req.session.currentUser.imgUrl,
      company: req.session.currentUser.company

    });
  }else{
  res.redirect('/');
  }
});

router.get("/logout", (req, res, next) => {
  req.session.destroy((err) => {
    // cannot access session here
    res.redirect("/login");
  });
});

module.exports = router;
