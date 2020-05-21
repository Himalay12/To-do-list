const express = require('express');
const bodyParser = require('body-parser');
const date = require(`${__dirname}/Date.js`);
const mongoose = require('mongoose');

const app = express();


app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


//Create new Database

mongoose.connect("mongodb://localhost:27017/todolistDB", { useUnifiedTopology: true, useNewUrlParser: true });

const ItemsSchema = new mongoose.Schema({
    name: String
});

const Item = mongoose.model("Item", ItemsSchema);
const WorkItem = mongoose.model("WorkItem", ItemsSchema);
// const Item1 = new Item({
//     name: "Welcome to your todolist!."
// });

// const Item2 = new Item({
//     name: "Hit the + button to add a new item."
// });

// const Item3 = new Item({
//     name: "<-- Hit this to delete an item."
// })

//const defaultItems = [Item1, Item2, Item3];



// let Items = [];
// let workItems = [];

app.get("/", (req, res) => {
    
    Item.find({}, (err, Items) => {
        res.render("list", {ListTitle: date(), newListItem: Items});
    })
    // if(currentDay === 6 || currentDay === 0){
    //     res.sendFile(`${__dirname}/weekend.html`);
    // } else {
    //     res.sendFile(`${__dirname}/weekday.html`);
    // }
})


app.get("/work", (req, res) => {
    WorkItem.find({}, (err, workItems) => {
        res.render("list", {ListTitle: "Work List", newListItem: workItems});
    })
});

// app.post("/work", (req, res) => {
    
//     let item = req.body.newItem;
//     workItems.push(item);
//     res.redirect("/work");
// })


//post
app.post("/", (req, res) => {

    const Item1 = new Item({
        name: req.body.Items
    });

    if(req.body.list === "Work List"){
        WorkItem.insertMany([Item1], err => {
            if(err) throw err;
        });
        res.redirect("/work")
    } else {
        Item.insertMany([Item1], err => {
            if(err) throw err;
        });
        res.redirect("/");
    }
});


app.post("/delete", (req, res) => {
    
    const checkbox = req.body.checkbox.split(" ");
    
    if(checkbox[1] === "Work"){
        WorkItem.findByIdAndDelete(checkbox[0], (err) => {
            if(err) throw err;
        });
        res.redirect("/work");    
    }
    else{
        Item.findByIdAndDelete(checkbox[0], (err) => {
            if(err) throw err;
        });
        res.redirect("/");
    }
});

let port = process.env.PORT;

if(port == null || port == "") port = 8845

app.listen(port, () => {
    console.log("Server started on port 8845");
})