const express = require('express');
const app = express();
const path= require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");



//Middlewares
app.set("view engine","ejs");
app.set("views",path.join(__dirname, "views"));  //middleware
app.use(express.urlencoded({extended : true}));  //middleware
app.use(express.static(path.join(__dirname , "public")));  //middleware
app.use(express.static(path.join(__dirname , "public/css")));
app.use(express.static(path.join(__dirname , "public/img")));
app.use(express.static(path.join(__dirname , "public/js")));

const sessionOptions = {
    secret: "mysupersecretstring",
    resave: false,
    saveUninitialized: true,
    cookie: { // Changed "Cookie" to "cookie"
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), //with this yor temp memory get stored for 7 days
        maxAge: 7 * 24 * 60 * 60 * 1000, 
    }
};

app.use(session(sessionOptions));

//for passport
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

// use static serialize and deserialize of model for passport session support
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//db connectivity 
const MONGO_URL = "mongodb://127.0.0.1:27017/InstaClone";

//function to connect with mongoDB
main().then(()=>{
    console.log("connected to db");
})
.catch( err=>{
    console.log(err);
})

async function main() {
    await mongoose.connect(MONGO_URL);
}


//ROUTES
//get Login
app.get('/login',(req,res)=>{
    res.render('login.ejs');
});

//post Login
app.post('/login', 
    passport.authenticate('local', { failureRedirect: '/login', failureFlash: true }),
    async (req, res) => {
        // req.flash("success", "Welcome back to HackHub!");
        return res.render('index.ejs');
    }
);


//get Signup
app.get('/signup',(req,res)=>{
    res.render('signup.ejs');
});

//post Signup
app.post('/signup',async (req,res)=>{
    try{
        const {username, password, email} = req.body;
        const newUser= new User({username, email});
        const registerUser = await User.register(newUser, password);
        req.login(registerUser, (err)=>{
            if(err) {
                return next(err);
            }
            return res.render("index.ejs");
        });
    }catch (e) {
        // req.flash("error", e.message);
        return res.redirect("/signup");
    }
});


//listing on port
app.listen(3000,(req,res)=>{
    console.log('listning on port 3000');
})