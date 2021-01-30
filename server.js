const http = require('http');
const express = require('express');
const ejs = require('ejs');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');

const  db = require('./database');

var app = express()

app.set('views','./views');
app.set('view engine','html');

app.use(cookieParser('hje5q46qzdc5712323564gfdght6y6'));
app.use(express.urlencoded({extended:true}));
app.use(express.static('public'));

app.engine('html',ejs.renderFile);

app.get('/', async (req,res) => {
    try {
        console.log("GET");
       /* if (!req.cookies.user){
            res.cookie('usertype','anonim');
            console.log("Added usertype cookie");
        }*/

        var query_properties = ['title','author','description'];
        var match = {};
        //var searchtype=req.query.searchtype;
        var searchtype = 'title';
        var searchbar = req.query.searchbar;
        if(searchbar){
            match[searchtype]=[searchbar];
        }

        var genrefilter = []
        if (req.cookies.genrefilter){
            genrefilter = req.cookies.genrefilter;
        }
        
        var publisherfilter = [];
        if(req.cookies.publisherfilter){
            publisherfilter = req.cookies.publisherfilter;
        }

        match.genre_id = genrefilter;

        match.publisher_id = publisherfilter;
        
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
            publisherfilter.push(parseInt(p.slice(2)));
        });
    }
    res.cookie('publisherfilter',publisherfilter);

    var searchtype = req.query.type;
    var searchbar = req.query.searchbar;
    res.redirect(`/?type=${searchtype}&searchbar=${searchbar}`);
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

app.get('/login',(req,res) => {
    res.render('login.ejs');
});

//user1 : 'abc'
//user2: '123'
//user3: 'abc123'
//user4: 'abc123'

async function f(password) { 
    var rounds = 12; 
    var hash = await bcrypt.hash(password, rounds );
    console.log( hash ); 
    var result = await bcrypt.compare( password, hash );
    console.log(result);
}


function authorize(req,res,next){
    async (permissions) => {
        if (req.signedCookies.user) {
            var userperm = await db.getUserPermissions();
            permissions.forEach( p => {
                if( !userperm.includes(p) ){
                    res.redirect('/login?returnUrl='+req.url);
                }
            });
            next();
        }
    };
}

http.createServer(app).listen(3000);
console.log("Server is listening.");