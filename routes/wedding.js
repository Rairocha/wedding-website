var FileReader = require('filereader');
var fapi = require('file-api');


var express = require('express');
var router = express.Router();

const Wedding = require('../models/Wedding');
const User = require('../models/User');

const { isLoggedIn, isLoggedOut ,isOwner, isOwnerOrGuest } = require('../middleware/route-guard.js');



router.get('/', isLoggedIn,(req, res, next) => {
    Wedding.find({owner:req.session.user._id})
    .then((foundWedding) => {       
        res.render('wedding/all-weddings.hbs', { weddings: foundWedding, showNew:true})
    })
    .catch((err) => {
        console.log(err)
        next(err)
    })
});

router.get('/guest', isLoggedIn,(req, res, next) => {
    console.log(req.session.user.email)
    Wedding.find({guests:req.session.user.email})
    .then((foundWedding) => {       
        res.render('wedding/all-weddings.hbs', { weddings: foundWedding, showNew:false})
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

router.get('/details/:weddingId', isLoggedIn, isOwnerOrGuest, (req, res, next) => {
    
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

router.get('/add-guests/:weddingId',isLoggedIn, isOwner,(req, res, next) => {
    
    Wedding.findById(req.params.weddingId)
    .then((addGuestWedding) => {
        console.log("Wedding to add:", addGuestWedding)
        res.render('wedding/guest/add-guests.hbs',addGuestWedding)
    })
    .catch((err) => {
        console.log(err)
        next(err)
    })
})

router.post('/add-guests/:weddingId',isLoggedIn, isOwner,(req, res, next) => {
    
    Wedding.findById(req.params.weddingId)
    .then((addGuestWedding) => {
        var listGuests = req.body.guests.toString().match(/^\S+@\S+\.\S+$/gm);
        listGuests.forEach(element => { addGuestWedding.guests.push(element)});
        
        addGuestWedding.guests = [... new Set(addGuestWedding.guests)];
        return addGuestWedding.save()         
        })
    .then((addGuestWedding) => {
        res.render('wedding/guest/add-guests.hbs',addGuestWedding)
    })
    .catch((err) => {
        console.log(err)
        next(err)
    })
})

router.get('/edit-guests/:weddingId',isLoggedIn, isOwner,(req, res, next) => {
    
    Wedding.findById(req.params.weddingId)
    .then((addGuestWedding) => {
        console.log("Wedding to add:", {...addGuestWedding.guests})
        res.render('wedding/guest/edit-guests.hbs',{guests:{...addGuestWedding.guests},_id:req.params.weddingId})
    })
    .catch((err) => {
        console.log(err)
        next(err)
    })
})
router.post('/edit-guests/:weddingId',isLoggedIn, isOwner,(req, res, next) => {
    Wedding.findById(req.params.weddingId)
    .then((addGuestWedding) => {
        addGuestWedding.guests = [... new Set(Object.values(req.body))];
        return addGuestWedding.save()         
        })
    .then((addGuestWedding) => {
        res.redirect(`/wedding/details/${req.params.weddingId}`)
        })
    .catch((err) => {
        console.log(err)
        next(err)
    })
})

router.get('/delete-guests/:weddingId',isLoggedIn, isOwner,(req, res, next) => {
    
    Wedding.findById(req.params.weddingId)
    .then((addGuestWedding) => {
        var cleanGuest = addGuestWedding.guests.filter(function(m){m!='on'});
        console.log("guest to delete:", {...cleanGuest})
        res.render('wedding/guest/delete-guests.hbs',{guests:{...cleanGuest},_id:req.params.weddingId,noGuest:cleanGuest.length>0})
    })
    .catch((err) => {
        console.log(err)
        next(err)
    })
})
router.post('/delete-guests/:weddingId',isLoggedIn, isOwner,(req, res, next) => {
    Wedding.findById(req.params.weddingId)
    .then((addGuestWedding) => {
        addGuestWedding.guests = [... new Set(Object.values(req.body))];
        return addGuestWedding.save()         
        })
    .then((addGuestWedding) => {
        res.redirect(`/wedding/details/${req.params.weddingId}`)
        })
    .catch((err) => {
        console.log(err)
        next(err)
    })
})


router.get('/add-organizer/:weddingId', isLoggedIn, isOwner,(req, res, next) => {
    res.render('wedding/organizer/add-organizer.hbs',{_id:req.params.weddingId})
})

router.post('/add-organizer/:weddingId', isLoggedIn, isOwner,(req, res, next) => {
    
    Wedding.findById(req.params.weddingId)
    .then((addOrganizerWedding) => {
        var listOrganizers = req.body.organizer.toString().match(/^\S+@\S+\.\S+$/gm);
        User.find({email:{ $in:listOrganizers}})
        .then((usersFound)=>{
            return usersFound.map(u=>u._id)})
        .then((idList) => {
            idList.forEach(element => {if(addOrganizerWedding.owner.includes(element)){} else{ addOrganizerWedding.owner.push(element)}});
            addOrganizerWedding.owner = [... new Set(addOrganizerWedding.owner)];
            return addOrganizerWedding.save()
        })
        .then((addOrganizerWedding) => {
            res.redirect(`/wedding/remove-organizer/${req.params.weddingId}`)
        })
    .catch((err) => {
        console.log(err)
        next(err)
        })
    })
})

router.get('/remove-organizer/:weddingId',isLoggedIn, isOwner,(req, res, next) => {
    
    Wedding.findById(req.params.weddingId)
    .populate('owner')
    .then((editOrganizerWedding) => {
        //console.log("owner to remove:",{owner:{...editOrganizerWedding.owner},weddingId:req.params.weddingId})
        res.render('wedding/organizer/remove-organizer.hbs',{owner:{...editOrganizerWedding.owner},weddingId:req.params.weddingId})
    })
    .catch((err) => {
        console.log(err)
        next(err)
    })
})

router.post('/remove-organizer/:weddingId',isLoggedIn, (req, res, next) => {
    var ownersToRemove= Object.keys(req.body);
    console.log(ownersToRemove)
    Wedding.findById(req.params.weddingId)
    .then((removeOwnerWedding) => {
            
             if(removeOwnerWedding.owner.length == ownersToRemove.length){
                throw new Error ('Cannot remove all owners of event')
             }
             else{
                ownersToRemove.forEach(o => removeOwnerWedding.owner.splice(removeOwnerWedding.owner.indexOf(o),1))
                return removeOwnerWedding.save()
             }
        })
    .then((removeOwnerWedding) => {
        console.log(removeOwnerWedding)
        res.redirect(`/wedding/remove-organizer/${req.params.weddingId}`)
        })
    .catch((err) => {
        console.log(err)
        res.render('wedding/organizer/remove-organizer.hbs', 
        {   weddingId:req.params.weddingId,
            errorMessage: err
          });
    })
})

module.exports = router;