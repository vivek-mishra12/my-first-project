const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");
const User = require("../models/user");
const { route } = require("./listing");
const { saveRedirectUrl } = require("../middleware");
// // const { saveRedirectUrl } = require("../middleware.js");

// const userController = require("../controllers/users.js");
// const { route } = require("./listing");

router.get("/signup",(req,res)=>{
    res.render("users/signup.ejs");
})

router.post("/signup",wrapAsync(async(req,res)=>{
    try{
        let {username, email, password} = req.body;
        const newUser = new User({email, username});
        const registeredUser = await User.register(newUser, password);
        console.log(registeredUser);

     
        req.login(registeredUser, (err) => {
        if(err) {
          return next(err);
        }
          req.flash("success", "Welcome to Wonderland!");
          res.redirect("/listings");
        });
        }  catch(e) {
         req.flash("error",e.message);
         res.redirect("/signup");
    }
}))

router.get("/login",(req,res)=>{
    res.render("users/login.ejs");
})

router.post(
    "/login",
    saveRedirectUrl,
    passport.authenticate("local", { failureRedirect: "/login", failureFlash: true }),
    async (req, res) => {
        req.flash("success","Welcome to Wonderland!! You are logged in");
        let redirectUrl = res.locals.redirectUrl || "/listings";
        res.redirect(redirectUrl);
    }
);

router.get("/logout",(req, res, next) => {
    req.logout((err) => {
        if(err) {
           return next(err);
        }
        req.flash("success", "you are logged out now");
        res.redirect("/listings");
    });
})


module.exports = router;