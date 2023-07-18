var express = require('express');
var router = express.Router();

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { isLoggedIn, isLoggedOut } = require('../middleware/route-guard.js');

const salt= 10;

/* GET signup page. */
router.get('/signup', isLoggedOut, (req, res, next) => {
  res.render('auth/signup.hbs')
})

router.post('/signup', (req, res, next) => {
  const { username, email, password } = req.body;
  
  if (!username || !email || !password) {
    res.render("auth/signup", {errorMessage: "All fields are mandatory. Please provide your username, email and password."});
    return;
  }
  
  /* Strong password verification */
  const regex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
  if (!regex.test(password)) {
    res
      .status(500)
      .render('auth/signup', { errorMessage: 'Password needs to have at least 6 chars and must contain at least one number, one lowercase and one uppercase letter.' });
    return;
  }
  /* Password encryption */
  bcrypt
    .genSalt(salt)
    .then((salts) => {
      return bcrypt.hash(password, salts);
    })
  /* Creation of user in mongodb database */
    
    .then((hashedPass) =>{
      return User.create({ username, email , passwordHash: hashedPass })
  })
  /* Go to user profile update */
  .then(userFromDB => {
    res.redirect('/userProfile');
  })
  //
  .catch(error => {
    if (error instanceof mongoose.Error.ValidationError) {
        res.status(500).render('auth/signup', { errorMessage: error.message });
    }
    else if (error.code === 11000) {
      console.log(error);
      console.log("Username must be unique. Username is already used. "); 
      res.status(500).render("auth/signup", {errorMessage: "User already exists."});
    }
    else {
        next(error);
    }
  })
});

router.get('/userProfile',isLoggedIn, (req, res) => res.render('users/user-profile',{user:req.session.user}));

router.get('/login', (req, res, next) => {
  res.render('auth/login.hbs')
})

router.post('/login', (req, res, next) => {
  console.log('SESSION =====> ', req.session);
  const { email, password } = req.body;
 
  if (email === '' || password === '') {
    res.render('auth/login', {
      errorMessage: 'Please enter both, email and password to login.'
    });
    return;
  }
  User.findOne({ email })
    .then(user => {
      if (!user) {
        res.render('auth/login', { errorMessage: 'User not found and/or incorrect password.' });
        return;
      } else if (bcrypt.compareSync(password, user.passwordHash)) {
        req.session.user = user 
        res.render('users/user-profile', { user });
      } else {
        res.render('auth/login', { errorMessage: 'User not found and/or incorrect password.' });
      }
    })
    .catch(error => next(error));
});

router.post('/logout', (req, res, next) => {
  req.session.destroy(err => {
    if (err) next(err);
    res.redirect('/');
  });
});
module.exports = router;