const http = require('http');
const express = require('express');
const ejs = require('ejs');
const cookieParser = require('cookie-parser');

const  db = require('./database');

var app = express()

app.set('views','./views');
app.set('view engine','html');

app.use(cookieParser());
app.use(express.urlencoded({extended:true}));

app.engine('html',ejs.renderFile);

app.get('/', async (req,res) => {
    try {
        console.log("GET");
        if (!req.cookies.usertype){
            res.cookie('usertype','anonim');
            console.log("Added usertype cookie");
        }
        if (!req.cookies.filter){
            res.cookie('filter',{});
            console.log("Added filter cookie");
        }
        var keyword = req.query.keyword;
        var books;
        //var genres = await db.getGenres();
        //var publishers = await db.getPublishers();
        var genres = (await db.getGenres()).map(function(g){return g.name});
        var publishers = (await db.getPublishers()).map(function(g){return g.name});
        if (keyword) {
            books = await db.getMatchingProducts('title',keyword);
        }
        else {
            books = await db.getAllProducts();
        }
        res.render('index.ejs',{'books':books,'keyword':keyword,'genres':genres,'publishers':publishers});

        
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
    console.log("Searching for: " + search);
    var filter = req.body.filter;
    console.log("Filter option: " + filter)
    if(search){
        res.redirect('/?keyword='+search);
    }
    else res.redirect('/');
});

http.createServer(app).listen(3000);
console.log("Server is listening.");