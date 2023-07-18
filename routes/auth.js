var express = require('express');
var router = express.Router();

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const salt= 10;

/* GET signup page. */
router.get('/signup', (req, res, next) => {
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

router.get('/userProfile', (req, res) => res.render('users/user-profile'));

module.exports = router;

/*

router.get('/login', (req, res, next) => {
    res.render('auth/login.hbs')
})

router.post('/login', (req, res, next) => {
    console.log('SESSION =====> ', req.session);
    const { username, password } = req.body;
   
    if (username === '' || password === '') {
      res.render('auth/login.hbs', {
        errorMessage: 'Please enter both username and password to login.'
      });
      return;
    }
   
    User.findOne({ username })
      .then(user => {
        if (!user) {
          console.log("Email not registered. ");
          res.render('auth/login.hbs', { errorMessage: 'User not found and/or incorrect password.' });
          return;
        } else if (
          bcrypt.compareSync(password, user.password)) {
          
          req.session.user = user  
  
          console.log("Sessions after login:", req.session)
  
          res.redirect('/')
        } else {
          console.log("Incorrect password. ");
          res.render('auth/login.hbs', { errorMessage: 'User not found and/or incorrect password.' });
        }
      })
      .catch(error => next(error));
  });



module.exports = router;
*/