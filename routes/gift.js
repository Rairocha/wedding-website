var express = require('express');
var router = express.Router();
var document

const Wedding = require('../models/Wedding');
const Gift = require('../models/Gift');

const { isLoggedIn, isLoggedOut ,isOwner } = require('../middleware/route-guard.js');

router.get('/:weddingId', isLoggedIn,(req, res, next) => {
    Wedding.findById(req.params.weddingId)
    .then(foundWedding=>{
    Gift.find({wedding:req.params.weddingId})
    .populate('wedding')
    .then((foundGift) => {    
        console.log(foundGift);
        res.render('gifts/gifts-page.hbs',
        {foundGift:foundGift,
        showEdit:foundWedding.owner.includes(req.session.user._id),
        weddingId:req.params.weddingId} )
    })
    .catch((err) => {
        console.log(err)
        next(err)
    })})
    .catch((err) => {
        console.log(err)
        next(err)})
        
});

router.get('/create/:weddingId', isLoggedIn,(req, res, next) => {
    res.render('gifts/create-gift.hbs',{weddingId:req.params.weddingId})

});

router.post('/create/:weddingId', isLoggedIn,(req, res, next) => {
    const {name, description,price, imageUrl, quantity} = req.body

    Gift.create({
        name,
        description,
        price,
        imageUrl,
        quantity,
        availableAmount:quantity,
        wedding: req.params.weddingId
    })
    .then((createdGift) => {
        console.log("Created gift:", createdGift)
        res.redirect(`/registry/${req.params.weddingId}`)
    })
    .catch((err) => {
        console.log(err)
        next(err)
    })
});

router.get('/edit/:giftId', isLoggedIn, (req, res, next) => {
    Gift.findById(req.params.giftId)
    .then((foundGift) => {
        res.render('gifts/edit-gift.hbs', foundGift)
    })
    .catch((err) => {
        console.log(err)
        next(err)
    })
    

});

router.post('/edit/:giftId', isLoggedIn,(req, res, next) => {
    const {name, description,price, imageUrl, quantity} = req.body

    Gift.findById(req.params.giftId)
    .then((updatedGift)=>{
        updatedGift.name=name;
        updatedGift.description=description;
        updatedGift.price=price;
        updatedGift.imageUrl=imageUrl;
        updatedGift.quantity=quantity;
        if(updatedGift.buyers){
            updatedGift.availableAmount=quantity - updatedGift.buyers.length
        }
        else{updatedGift.availableAmount=quantity;}
        return updatedGift.save();
    })
    .then((updatedGift) => {
        console.log(updatedGift)
        res.redirect(`/registry/${updatedGift.wedding}`)
    })
    .catch((err) => {
        console.log(err)
        next(err)
    })
});

router.get('/delete/:giftId', isLoggedIn, (req, res, next) => {
    console.log('teste')
    Gift.findByIdAndDelete(req.params.giftId)
    .then((deletedGift) => {
        console.log("Deleted gift:", deletedGift)
        res.redirect(`/registry/${deletedGift.wedding}`)
    })
    .catch((err) => {
        console.log(err)
        next(err)
    })

})

router.get('/buy/:giftId', isLoggedIn,(req, res, next) => {
    Gift.findById(req.params.giftId)
    .then((foundGift)=>{
        foundGift.buyers.push(req.session.user._id);
        foundGift.availableAmount = (foundGift.quantity - foundGift.buyers.length)
        return foundGift.save(); 
    })
    .then((foundGift)=>{
        console.log(foundGift)
        res.redirect(`/registry/${foundGift.wedding}`)
    })
    .catch((err) => {
        console.log(err)
        next(err)
    })
    
});
module.exports = router;