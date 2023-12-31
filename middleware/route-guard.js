// middleware/route-guard.js
const Wedding = require('../models/Wedding');
const mongoose = require('mongoose');
// checks if the user is logged in when trying to access a specific page
const isLoggedIn = (req, res, next) => {
    if (!req.session.user) {
      return res.redirect('/login');
    }
    next();
  };
   
  // if an already logged in user tries to access the login page it
  // redirects the user to the home page
  const isLoggedOut = (req, res, next) => {
    if (req.session.user) {
      return res.redirect('/');
    }
    next();
  };
   
  const isOwner = (req, res, next) => {

    Wedding.findById(req.params.weddingId)
    .then((foundWedding) => {
        if(foundWedding.owner.includes(req.session.user._id)) {
            next()
        } else {
            res.redirect('/wedding')
        }
    })
    .catch((err) => {
        console.log(err)
        next(err)
    })

}

const isOwnerOrGuest = (req, res, next) => {

  Wedding.findById(req.params.weddingId)
  .then((foundWedding) => {
      if(foundWedding.owner.includes(req.session.user._id)||foundWedding.guests.includes(req.session.user.email)) {
          next()
      } else {
          res.redirect('/wedding')
      }
  })
  .catch((err) => {
      console.log(err)
      next(err)
  })

}

  module.exports = {
    isLoggedIn,
    isLoggedOut,
    isOwner,
    isOwnerOrGuest
  };


