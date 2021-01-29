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
app.use(express.static('public'));

app.engine('html',ejs.renderFile);

app.get('/', async (req,res) => {
    try {
        console.log("GET");
        if (!req.cookies.usertype){
            res.cookie('usertype','anonim');
            console.log("Added usertype cookie");
        }

        var query_properties = ['title','author','description'];
        var match = {};
        //var searchtype=req.query.searchtype;
        var searchtype = 'title';
        var searchbar = req.query.searchbar;
        if(searchbar){
            match[searchtype]=[searchbar];
        }

        var genrefilter = req.cookies.genrefilter;
        console.log("Genre filter " + genrefilter);
        if(genrefilter){
            match.genre_id = [];
            genrefilter.forEach(g => {
                match.genre_id.push(g);
            });
        }

        var publisherfilter = req.cookies.publisherfilter;
        console.log("Publisher filter " + publisherfilter);
        if(publisherfilter){
            match.publisher_id = [];
            publisherfilter.forEach(g => {
                match.publisher_id.push(g);
            });
        }

        
        var genres = await db.getGenres();
        var publishers = await db.getPublishers();
        var books;

        console.log("Match:" );
        if (match){
            Object.keys(match).forEach( k => {
                console.log(`${k} : ${match[k]}`);
            });
        }

        if (match){
            books = await db.getMatchingProducts(match);
        }
        else {
            books = await db.getAllProducts();
        }

        var references = 
            {'books':books,
            'searchtype':searchtype,
            'searchbar':searchbar,
            'genres':genres,
            'publishers':publishers,
            'checkedGenres':genrefilter,
            'checkedPublishers':publisherfilter};
        res.render('index_new.ejs',references);

        
    } catch (error) {
        console.log("Error while reading database");
        console.log(error);
        res.end("Error while reading database");
       // res.redirect("/error",{type:"database error",error});
    }
});
app.post('/filter', (req,res) => {
    console.log("POST");
    var genrefilter = [];
    var array = req.body.genrefilter;

    if (array) {
        if (!Array.isArray(array)) {array = [array];}
        array.forEach(g => {
            genrefilter.push(parseInt(g.slice(2)));
        });
    }
    res.cookie('genrefilter',genrefilter);
    
   
    var publisherfilter = [];

    array = req.body.publisherfilter;
    if (array) {
        if (!Array.isArray(array)) {array = [array];}
        array.forEach(p => {
            console.log(p);
            publisherfilter.push(parseInt(p.slice(2)));
        });
    }
    res.cookie('publisherfilter',publisherfilter);

    var searchtype = req.query.type;
    var searchbar = req.query.searchbar;
    res.redirect(`/?type=${searchtype}&searchbar=${searchbar}`);
});

app.post('/', (req,res) => {
    try {
        console.log("POST");

        //var searchtype = req.body.type;
        var searchtype = 'title';
        var searchbar = req.body.searchbar;

        if(searchbar){
            res.redirect(`/?type=${searchtype}&searchbar=${searchbar}`);
        }
        else res.redirect('/');
    } catch (error) {
        console.log("Error while reading database");
        console.log(error);
        res.end("Error while reading database");
        // res.redirect("/error",{type:"database error",error});
    }
});

app.get('/book',async (req,res) => {
    try {
        console.log("GET");
        var bookid = req.query.id;
        var book = await db.getProductDetails(parseInt(bookid));
        console.log(book);
        res.render('book.ejs', { 'book':book[0], 'searchbar': '', 'searchtype': 'title'});
    } catch (error) {
        console.log("Error while reading database");
        console.log(error);
        res.end("Error while reading database");
        // res.redirect("/error",{type:"database error",error});
    }
});

http.createServer(app).listen(3000);
console.log("Server is listening.");