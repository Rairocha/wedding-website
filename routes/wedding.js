var express = require('express');
var router = express.Router();

const Wedding = require('../models/Wedding');

const { isLoggedIn, isLoggedOut ,isOwner } = require('../middleware/route-guard.js');



router.get('/', isLoggedIn,(req, res, next) => {
    Wedding.find({owner:req.session.user._id})
    .then((foundWedding) => {       
        res.render('wedding/all-weddings.hbs', { weddings: foundWedding })
    })
    .catch((err) => {
        console.log(err)
        next(err)
    })
});
router.get('/create', isLoggedIn, (req, res, next) => {
    res.render('wedding/create-wedding.hbs')
})

router.post('/create', isLoggedIn, (req, res, next) => {

    const {name, description,imageUrl,location,date,time} = req.body

    Wedding.create({
        name,
        description,
        imageUrl,
        location,
        date,
        time,
        owner: [req.session.user._id]
    })
    .then((createdWedding) => {
        console.log("Created Wedding:", createdWedding)
        res.redirect('/wedding')
    })
    .catch((err) => {
        console.log(err)
        next(err)
    })

})

router.get('/details/:weddingId', (req, res, next) => {
    
    Wedding.findById(req.params.weddingId)
    .then((foundWedding) => {
        res.render('wedding/view-wedding.hbs', {foundWedding:foundWedding,showEdit:foundWedding.owner.includes(req.session.user._id)})
    })
    .catch((err) => {
        console.log(err)
        next(err)
    })

})

router.get('/edit/:weddingId', isLoggedIn, isOwner, (req, res, next) => {

    Wedding.findById(req.params.weddingId)
    .then((foundWedding) => {
        console.log("Wedding edit", foundWedding.date.getDay())
        res.render('wedding/edit-wedding.hbs', {foundWedding:foundWedding,
            dateMonth:(foundWedding.date.getMonth()+1).toString().padStart(2,"0"),
            dateYear:foundWedding.date.getFullYear(),
            dateDay:foundWedding.date.getDate().toString().padStart(2,"0")
        })
    })
    .catch((err) => {
        console.log(err)
        next(err)
    })

})

router.post('/edit/:weddingId', isLoggedIn, isOwner, (req, res, next) => {

    const {name, description,imageUrl,location,date,time} = req.body
    
    Wedding.findByIdAndUpdate(req.params.weddingId,{
        name:name,
        description:description,
        imageUrl:imageUrl,
        location:location,
        date:date,
        time:time
        // owner: [req.session.user._id]
    },{new:true})
    .then((updatedWedding) => {
        console.log("Updated Wedding:", updatedWedding)
        res.redirect(`/wedding/details/${req.params.weddingId}`)
    })
    .catch((err) => {
        console.log(err)
        next(err)
    })

})


router.get('/delete/:weddingId', isLoggedIn, isOwner, (req, res, next) => {
    
    Wedding.findByIdAndDelete(req.params.weddingId)
    .then((deletedWedding) => {
        console.log("Deleted room:", deletedWedding)
        res.redirect('/wedding')
    })
    .catch((err) => {
        console.log(err)
        next(err)
    })

})

module.exports = router;