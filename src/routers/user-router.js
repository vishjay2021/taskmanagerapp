const express = require("express");
const path = require ("path");
const ObjectId = require ("mongodb").ObjectId;
const User = require("../models/user.js");
const auth = require("../middleware/auth.js");
const apiAuth = require("../middleware/api-auth.js");
const email = require("../email/account.js");



const router = express.Router();

// Route for user

router.get("/",(req,res)=>{
    if(req.session.user){
        req.session.user = undefined;
    }
    res.render("index", {msg: req.query.msg});
});

router.get("/profile",auth,(req,res)=>{
    res.render("profile", {user: req.session.user});
});

router.get("/signup", (req,res)=>{
    res.render("signup")
});

router.post("/profile",auth, async (req,res)=>{
    if(req.files){
        const result = User.uploadAvatar(req.files.profileImage);
        

        if(result.error){
            return res.send ({error:result.error})
        }
        req.body.imagePath = result.fileName;
    }; 
    const allowed = ["name","age","password", "email", "imagePath"];
    const reqchanges= Object.keys(req.body);

    const isValid= reqchanges.every((field)=>{
        return allowed.includes(field);
    })

    if(!isValid){
      return  res.send({error: "Invaild input"})
    }

    try {
        const userUpdate = await User.findById(req.session.user._id);
        const prevImage = userUpdate.imagePath;
        if(!userUpdate){
                    return  res.send({error: "user not found"});
                  }
        reqchanges.forEach((update)=>{
            userUpdate[update] = req.body[update]
        });
        
        await userUpdate.save();
        req.session.user = User.getUserPublicData(userUpdate);
        res.redirect("/profile");
        if(prevImage !== userUpdate.imagePath){
          await  User.deleteAvatar(prevImage);
        }
    } catch (error) {
        res.send(error)
    };
});


//____ API End Point ________

//end point for login
router.post("/api/users/login", async (req,res)=>{
    try {
        const user = await User.finByCredentials(req.body.email, req.body.password);

        if(user.error){
            return res.send (user);
        }
        req.session.user = user;
        res.send(User.getUserPublicData(user));

    } catch (error) {
        console.log(error);
    }
});


//endpoint for creating user
router.post("/api/users", async (req,res)=>{
    req.body.secret = new ObjectId().toHexString();
    const user = new User (req.body);
    try{    
        await user.save();
        res.send(User.getUserPublicData(user));
        email.sendConfirmMail(user)
    }catch(e){
        res.send(e)
    }
    // user.save().then(()=>{
    //     res.send(user);
    // }).catch((error)=>{
    //     res.send(error);
    // })
});



router.get("/api/users/confirm_account", async (req,res) =>{
    const userId = req.query.userId;
    const secret= req.query.secret;
    try {
        const user = await User.findOneAndUpdate({_id: userId, secret: secret}, {confirmed: true});
        if(!user){
            return res.redirect("/")
        }
         res.redirect("/?msg=Email confirmed. please login.")

    } catch (error) { 
        res.redirect("/")
    }
    res.send ("We will confirm ur account")
});




//endpoint for reading all users
router.get("/api/users",async (req,res)=>{
    try {
        const user = await User.find({}, {password: 0});
        res.send(user)
    } catch (error) {
        res.send(error)
    }
    // User.find({}).then((user)=>{
    //     res.send(user);
    // }).catch((e)=>{
    //     res.send(e);
    // });
});

//endpoint for read a user
router.get("/api/users",apiAuth, async(req,res)=>{
    try {
        const id = req.session.user._id;
        const user = await User.findById(id);
        if(!user){
            return res.send("Theres No such a user");
        }
        res.send(User.getUserPublicData(user)); 
 
    } catch (error) {
        res.send(error);
    };
   
    // User.findById(req.params.id).then((user)=>{
    //     if(!user){
    //       return  res.send({error: "user not found"});
    //     }
    //     res.send(user);
    // }).catch((e)=>{
    //     res.send(e);
    // })
});




// //endpoint for Update a user
router.patch("/api/users",apiAuth, async (req,res)=>{

        if(req.files){
            const result = User.uploadAvatar(req.files.profileImage);
            

            if(result.error){
                return res.send ({error:result.error})
            }
            
            req.body.imagePath = result.fileName;
    }

    const id = req.session.user._id;
    const allowed = ["name","age","password", "email", "imagePath"];
    const reqchanges= Object.keys(req.body);

    const isValid= reqchanges.every((field)=>{
        return allowed.includes(field);
    })

    if(!isValid){
      return  res.send({error: "Invaild input"})
    }

    try {
        const userUpdate = await User.findById(id);
        const prevImage = userUpdate.imagePath;
      
        if(!userUpdate){
                    return  res.send({error: "user not found"});
                  }

        reqchanges.forEach((update)=>{
            userUpdate[update] = req.body[update]
        });

        await userUpdate.save();
        req.session.user = User.getUserPublicData(userUpdate);
        res.send(User.getUserPublicData(userUpdate));

        if(prevImage !== userUpdate.imagePath){
          await  User.deleteAvatar(prevImage);
        }
    } catch (error) {
        res.send(error)
    };

    // User.findByIdAndUpdate(id,req.body,{new:true}).then((user)=>{
    //     if(!user){
    //         return  res.send({error: "user not found"});
    //       }
    //      res.send(user);
    //     }).catch((e)=>{
    //         res.send(e);
    //     })
});

// //endpoint for delete a user
router.delete("/api/users",apiAuth, async (req,res)=>{
    try {
        const id = req.session.user._id;
        const user = await User.findByIdAndDelete(id);
        if(!user){
                    return  res.send({error: "user not found"});
                  }
        res.send(User.getUserPublicData(user));
    } catch (error) {
        res.send(error);
    };
    // User.findByIdAndDelete(id).then((user)=>{
    //     if(!user){
    //         return  res.send({error: "user not found"});
    //       }
    //     res.send(`user deleted ${id}`);
    // }).catch((e)=>{
    //     res.send(e);
    // })
});

module.exports = router;



