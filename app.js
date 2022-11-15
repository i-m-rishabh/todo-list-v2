//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB", {});

const itemSchema = new mongoose.Schema({
  name: String
});

const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({name: "buy food"});
const item2 = new Item({name: "cook food"});
const item3 = new Item({name: "eat food"});

let defaultItems = [item1,item2, item3];



app.get("/", function(req, res) {
  Item.find({}, function(err, findItems){
  if(err){
    console.log(err);
  }else{
    if(findItems.length === 0){
      Item.insertMany(defaultItems, function(err){
        if(err){
          console.log(err);
        }else{
          console.log(" default items added successfully");
        }
        res.redirect('/');
      });
    }else{
      res.render("list", {listTitle: "today", newListItems: findItems});
      console.log(" / rendered successfully")
    } 
  }
})
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName =  req.body.list;
  const item = new Item({
    name:itemName
  });
  if(listName == 'today'){
      item.save();
      res.redirect('/');
  }else{
    List.findOne({name: listName}, function(err, itemfound){
      if(!err){
        itemfound.items.push(item);
        itemfound.save();
        res.redirect('/'+listName);
      }
    })
  }


  // Item.insertMany([{
  //   name: item
  // }], function(err){
  //   if(err){
  //     console.log(err)
  //   }else{
  //     console.log("new item added successfully")
  //     res.redirect('/')
  //   }
  // })
  // if (req.body.list === "today") {
  //   // workItems.push(item);
  //   res.redirect("/work");
  // } else {
  //   // items.push(item);
  //   res.redirect("/");
  // }
});

app.post('/delete', function(req, res){
  let itemId = req.body.checkbox;
  let listName = req.body.listName;
  // console.log(itemId);
  if(listName === 'today'){
    Item.deleteOne({_id: itemId}, function(err){
    if(err){
      console.log(err);
    }else{
      console.log("item deleted with id "+itemId);
      res.redirect('/');
    }
  })
  }else{
    List.findOneAndUpdate({name:listName}, {$pull: {items: {_id:itemId}}}, function(err, foundList){
      if(!err){
        res.redirect('/'+listName);
      }
    })
  }

})

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemSchema]
});

const List = mongoose.model("List", listSchema);

app.get('/:customListName', function(req, res){
  const customListName = _.capitalize(req.params.customListName);
  List.findOne({name:customListName}, function(err, foundList){
    if(!err){
      if(!foundList){
         const newList = new List({
            name: customListName,
            items: defaultItems
         })
        newList.save();
        console.log("new list added");
        res.redirect('/'+customListName)
      }else{
        res.render('list',{listTitle: foundList.name, newListItems: foundList.items})
      }
      
    }
  })

})

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
