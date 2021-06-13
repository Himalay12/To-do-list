require('dotenv').config()
const express = require('express');
const date = require(`${__dirname}/Date.js`);
const mongoose = require('mongoose');
const ejs = require("ejs");
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');

const app = express();


app.set('view engine', 'ejs');
app.use(express.urlencoded({extended: false}));
app.use(express.static("public"));

mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);

 //below all the uses function
 app.use(session({
    secret: "our little secret.",
    resave: false,
    saveUninitialized: false
}));

//initialize passport
app.use(passport.initialize());
app.use(passport.session());

//Create new Database
// mongodb+srv://:@cluster0-y70r4.mongodb.net/todolistDB
mongoose.connect(`mongodb+srv://hg8848:ICQLnv9hrNLHz6lz@cluster0-y70r4.mongodb.net/todolistDB`, { useUnifiedTopology: true, useNewUrlParser: true })
    .then(() => console.log( 'Database Connected' ))
    .catch(err => console.log( err ));

const ItemsSchema = new mongoose.Schema({
    UserName: String,
    email: String,
    Item: [String]
});

//user schema
const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

//userSchema.plugin(encrypt, {secret: process.env.SECRET, encryptedFields:['password'] });
userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("User", userSchema);

//create strategy
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Item schema for users
const WorkItem = mongoose.model("WorkItem", ItemsSchema);

// main page
app.route("/")
    .get((req, res) => {
        res.render("list", {ListTitle: date(), newListItem: [], Token: ""});
    })
    .post((req, res) => {
        res.redirect('/login');
    });

//Login Page
app.route("/login")
    .get((req, res) => {
        res.render("login");
    })
    .post((req, res) => {

        const user = new User({
            username: req.body.username,
            password: req.body.password
        });
    
        req.login(user, err => {
            if(err) {
                console.log(err);
            }
            else passport.authenticate("local")(req, res, () => {
                res.redirect("/"+req.user.username);
            })
        });  
     });

//Register Page
app.route("/register")
    .get((req, res) => {
        res.render("register");
    })
    .post((req, res) => {

        User.register({ username: req.body.username}, req.body.password, (err, user) => {
            if (err) console.log(err);
            else {
                const userData = new WorkItem({
                    UserName: req.body.name,
                    email: req.body.username,
                    Item: []
                })
                WorkItem.insertMany(userData, err => {
                    if(err) throw err;
                    console.log('successfully registered');
                })
                res.redirect("/login");
            }
            res.redirect("/register");
        })
    });

// Delete 
app.route("/delete/:Token")
    .post((req, res) => {
        console.log(req.body.checkbox);
        if(req.params.Token!=""){
            WorkItem.findOneAndUpdate(
                { email: req.params.Token},
                { $pull: {Item: req.body.checkbox} }, 
                { new: true},
                (err, doc) => {
                    if(err) throw err;
                    console.log("successfully removed")
                }
            );
        }
        res.redirect("/"+req.params.Token);
    });

//list rendering
app.route("/:Token")
    .get((req, res) => {
        if(!req.isAuthenticated()) res.redirect("/login");
        let list;
        if(req.params.Token!=""){
            WorkItem.findOne({email: req.params.Token}, (err, Items) => {
                if(err) throw err;
                if(Items!=null){
                    res.render("list", {ListTitle: date(), newListItem: Items.Item, Token: req.params.Token});
                }
            });
        }
    })
    .post((req, res) => {
        if(req.params.Token==""){
            return res.status(400).json({
                status: 'error',
                error: 'req body cannot be empty',
              });
        }    
        WorkItem.findOneAndUpdate(
            { email: req.params.Token},
            { $push: {Item: req.body.Items} }, 
            { new: true},
            (err, doc) => {
                if(err) throw err;
                console.log("successfully added")
            }
        );
        res.redirect("/"+req.params.Token);
    });

app.route("/logout")
    .get((req, res) => {
        req.logout();
        res.redirect("/");
    });

let port = process.env.PORT;

if(port == null || port == "") port = 8845

app.listen(port, () => {
    console.log(`Server started on port ${port}`);
})