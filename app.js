if(process.env.NODE_ENV!="production"){
    require('dotenv').config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsmate = require("ejs-mate")
const wrapAsync = require("./utils/wrapAsync.js");
 const ExpressError = require("./utils/ExpressError.js");
 const session = require("express-session")
 const MongoStore = require('connect-mongo');
 const flash = require("connect-flash")
 const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
 const listingRouter = require("./routes/listing.js");
 const reviewRouter = require("./routes/review.js"); 
 const userRouter = require("./routes/user.js");
//const MONGO_URL = "mongodb://127.0.0.1:27017/dreamworlds"
const dbUrl = process.env.ATLASDB_URL

main()
.then(()=>{
    console.log("connected to db")
})
.catch((err)=>{
    console.log(err)
})

async function main() {
    await mongoose.connect(dbUrl)
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
 app.engine("ejs",ejsmate);
app.use(express.static(path.join(__dirname,"/public")));


const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret: process.env.SECRET,
    },
    touchAfter: 24 * 3600,
});

store.on("error", () => {
    console.log("ERROR IN MONGO SESSION STORE", err);
})

app.use(
    session({
        store,
        secret:"mysecretecode",
        resave:false,
        saveUninitialized:true,
        cookie:{
            expires: Date.now() + 7*24*60*60*1000,
            maxAge: 7*24*60*60*1000,
            httpOnly: true,
        }
    })
)




app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
})

// app.get("/demouser",async(req,res)=>{
//     let fakeUser = new User({
//         email: "vivek@gamil.com",
//         username: "vivek", 
//     })
//     let registerUser = await User.register(fakeUser,"goku");
//     res.send(registerUser);
// })


app.use("/listings",listingRouter)
//reviews
app.use("/listings/:id/reviews",reviewRouter)
app.use("/",userRouter);

app.all("*",(req,res,next)=>{
    next(new ExpressError(404,"Page Not Found!"));
})

app.use((err,req,res,next)=>{
    let {statuscode=500,message="something went wrong!"} = err;
    res.status(statuscode).render("error.ejs",{err});
    //  res.status(statuscode).send(message);
})

app.listen(8080,()=>{
    console.log("server is listing")
})
