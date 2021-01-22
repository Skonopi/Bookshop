const http = require('http');
const express = require('express');
const ejs = require('ejs');
const  db = require('./database');

var app = express()

app.set('views','./views');
app.set('view engine','html');

app.use(express.urlencoded({extended:true}));

app.engine('html',ejs.renderFile);


app.get('/', async (req,res) => {
    try {
        console.log("GET");
        var keyword = req.query.keyword;
        var books;
        if (keyword) {
            books = await db.getMatchingProducts('title',keyword);
        }
        else {
            books = await db.getAllProducts();
        }
        console.log(books);
        res.render('index.ejs',{'books':books});
        
    } catch (error) {
        console.log("Error while reading database");
        console.log(error);
        res.end("Error while reading database");
       // res.redirect("/error",{type:"database error",error});
    }
});

app.post('/', (req,res) => {
    console.log("POST");
    var search = req.body.searchbar;
    console.log("Seraching for: " + req.body.searchbar);
    if(search){
        res.redirect('/?keyword='+search);
    }
    else res.redirect('/');
});

http.createServer(app).listen(3000);
console.log("Server is listening.");