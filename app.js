//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb://127.0.0.1:27017/todolistDB");

//items schema
const itemsSchema = {
  name: String,
};

//item model
const Item = mongoose.model("Item", itemsSchema);

//item documents
const item1 = new Item({
  name: "Welcome to your todolist!",
});

const item2 = new Item({
  name: "Hit the + button to add new item.",
});

const item3 = new Item({
  name: "<-- Hit this to delete an item.",
});

//an array containing all default items
const defaultItems = [item1, item2, item3];


//list schema
const listSchema = {
  name: String,
  items: [itemsSchema]
};

//list model
const List = mongoose.model("List", listSchema);





//inserting the array of default items into the collection
app.get("/", function (req, res) {
  //find all items in the collection and console.log them in the callback function
  Item.find({}, function (err, foundItems) {
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function (err) {
        if (err) console.log(err);
        else console.log("Successfully saved default items to database");
      });
      res.redirect("/");
    } else {
      res.render("list", { listTitle: "Today", newListItems: foundItems });
    }
  });
});

//create a new list with a name base on what the user has typed
app.get("/:customListName", function(req, res){
  const customListName = req.params.customListName;

  List.findOne({name:customListName}, function(err, foundList){
    
    if (!err){
      if (!foundList) {
        //create a new list
        const list = new List({
          name: customListName,
          items: defaultItems
        })
        list.save();
        res.redirect("/" + customListName);

      } else {
        //show existing list
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items})
        
      }
    }
    else console.log(err);

  });

});

app.post("/", function (req, res) {
  
  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item ({
    name: itemName,
  });

  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  };



});

app.post("/delete", function(req, res){
  const checkedItemId = req.body.checkbox
  Item.findByIdAndRemove(checkedItemId, function(err){
    if (!err) console.log("Successfully removed items from list");
    res.redirect("/");
  })
});

app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
