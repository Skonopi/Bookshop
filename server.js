const http = require('http');
const express = require('express');
const session = require('express-session');
const ejs = require('ejs');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const multer = require('multer');

const  db = require('./database');

var app = express();
var upload = multer();

app.set('views','./views');
app.set('view engine','html');

app.disable('etag');

app.use(cookieParser('hje5q46qzdc5712323564gfdght6y6'));
app.use(express.urlencoded({extended:true}));
app.use(express.static('public'));
app.use(session({resave:true, saveUninitialized:true, secret:'qvfgsdfgtshgnhmesatuk'}));

app.engine('html',ejs.renderFile);

var emptyregister =  {'email':'','nickname':'','name':'','surname':'','password':''};

/*app.post('/productAdded',upload.single(),(req,res) => {
    var newProduct = req.body.newProduct;
    if(newProduct){
        var cart = {};
        console.log(req.session.cart);
        if (req.session.cart){
            cart = JSON.parse(req.session.cart);
        }
        if (!cart[newProduct]) {
            cart[newProduct] = 0;
        }
        cart[newProduct] += 1;
        console.log(cart);
        req.session.cart = JSON.stringify(cart);
    }
});*/

app.get('/', async (req,res) => {
    try {
        console.log("GET index");

        var role = null;
        if (req.signedCookies.role){
            role = req.signedCookies.role;
        }

        var query_properties = ['title','author','description'];
        var match = {};

        var searchtype=req.query.type;
        if(!searchtype){
            searchtype='title';
        }
        //var searchtype = 'title';
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

        var price = [null,null];
        if(req.cookies.price && (req.cookies.price[0] || req.cookies.price[1])){
            price = req.cookies.price;
            match.price = [req.cookies.price];
        }

        var date = [null,null];
        if(req.cookies.date  && (req.cookies.date[0] || req.cookies.date[1])){
            date = req.cookies.date;
            match.publication_year = [req.cookies.date];
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
            'checkedPublishers':publisherfilter,
            'price':price,
            'date':date,
            'role':role};
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
        console.log("POST index");

        var searchtype = req.body.searchtype;
        console.log(req.body.searchtype);
        //var searchtype = 'title';
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
    console.log("POST filter");
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

    var price = [null,null];
    if (req.body.price_min){
        price[0] = req.body.price_min;
    }
    if (req.body.price_max){
        price[1] = req.body.price_max;
    }
    res.cookie('price',price);

    var date = [null,null];
    if (req.body.date_min){
        date[0] = req.body.date_min;
    }
    if (req.body.date_max){
        date[1] = req.body.date_max;
    }
    res.cookie('date',date);

    var searchtype = req.query.type;
    var searchbar = req.query.searchbar;
    res.redirect(`/?type=${searchtype}&searchbar=${searchbar}`);
});

app.get('/book',async (req,res) => {
    try {
        console.log("GET book");
        var bookid = req.query.id;
        var book = await db.getProductDetailsDescriptive(parseInt(bookid));
        console.log(book);
        res.render('book.ejs', { 'book':book[0], 'searchbar': '', 'searchtype': 'title'});
    } catch (error) {
        console.log("Error while reading database");
        console.log(error);
        res.end("Error while reading database");
        // res.redirect("/error",{type:"database error",error});
    }
});

app.get('/bookedit',async (req,res) => {
    try {
        console.log("GET book");
        var bookid = req.query.id;
        var book = await db.getProductDetailsDescriptive(parseInt(bookid));
        console.log(book);
        res.render('book_admin.ejs', { 'book':book[0], 'searchbar': '', 'searchtype': 'title'});
    } catch (error) {
        console.log("Error while reading database");
        console.log(error);
        res.end("Error while reading database");
        // res.redirect("/error",{type:"database error",error});
    }
});

app.get('/login',(req,res) => {
    console.log("GET login");
    res.render('login.ejs',{returnUrl:req.query.returnUrl,register:emptyregister});
});
app.post('/login',async (req,res) => {
    console.log('POST login');
    if(req.body.registerBtn){
        console.log("Register");
        //var password = await bcrypt.hash(req.body.passwordRegister, 12 );
        var u = {
            mail:req.body.emailRegister,
            nickname:req.body.nicknameRegister,
            name:req.body.nameRegister,
            surname:req.body.surnameRegister,
            password:req.body.passwordRegister,
            role:'client'
        };
        var udb = Object.assign({},u);
        udb.password = await bcrypt.hash(u.password, 12 );
        try{
            await db.insertUser(udb);
            res.render('login.ejs',{returnUrl:req.query.returnUrl,message:'Register completed. You can now log in.',register:emptyregister});
        }
        catch(error){
            console.log(error);
            switch( error ){
                case 'Mail already exists.':
                    //console.log("Szach mat zły mail.");
                    u.mail = '';
                    res.render('login.ejs',{returnUrl:req.query.returnUrl,message:'Email already exists.',register:u});
                    break;
                case 'Nickname already exists.':
                    u.nickname = '';
                    res.render('login.ejs',{returnUrl:req.query.returnUrl,message:'Nickname already exists.',register:u});
                    break;
                default:
                    res.render('login.ejs',{returnUrl:req.query.returnUrl,register:u});
                    //res.render('error.js',{})
                    break;
            }
        }
        //res.redirect('/login?returnUrl='+req.url);
    }
    else{
        var email = req.body.email;
        var pswd = req.body.password;

        var check = (await db.getPasswordByMail(email))[0];
        // console.log(pswd + ' ' + check.password);
        if(check){
            var result = await bcrypt.compare(pswd,check.password);
            if( result ){
                res.cookie('user',check.id,{signed:true});
                res.cookie('role',check.role,{signed:true});
                if(req.query.returnUrl){
                    res.redirect(req.query.returnUrl);
                }
                else{
                    res.redirect('/');
                }
            }
            else{
                console.log("Wrong password");
                res.render('login.ejs',{returnUrl:req.query.returnUrl,message:'Wrong password.',register:emptyregister});
            }
        }
        else{
            console.log("No user in db.");
            res.render('login.ejs',{returnUrl:req.query.returnUrl,message:'Wrong mail.',register:emptyregister});
        }
    }
});

app.get('/cart',authorize('client'), async (req,res) => {
    var cart = {};
    var products = [];
    var total_cost = 0;
    if(req.session.cart){
        var productsid = JSON.parse(req.session.cart);
        for ( const p of Object.keys(productsid)) {
            console.log(p);
            var book = await db.getProductDetailsDescriptive(parseInt(p));
            products.push({
                quantity : productsid[p],
                book : {
                    id : book.id,
                    title : book.title,
                    author: book.author,
                    price: book.price
                }
            });
            total_cost += book.price*parseInt(p);
        };
    }
    cart.total_cost = total_cost;
    cart.products = products;
    res.render('cart.ejs', { order : cart });
});

app.post('/register',async (req,res) =>{
    var u = {
        mail:req.body.emailRegister,
        nickname:req.body.nicknameRegister,
        name:req.body.nameRegister,
        surname:req.body.surnameRegister,
        password:req.body.passwordRegister,
        role:'client'
    };
    try{
        await db.insertUser(u);
        res.render('login.ejs',{returnUrl:req.query.returnUrl,message:'Register completed. You can now log in.',register:emptyregister});
    }
    catch(error){
        console.log("Some error");
        switch( error ){
            case 'Mail already exists.':
                console.log("Szach mat zły mail.");
                break;
            case 'Nickname already exists.':
                console.log("Wymyśl cos orginalnego");
                break;
            default:
                console.log(error);
                break;
        }
        res.render('login.ejs',{returnUrl:req.query.returnUrl,message:'Nickname already exists.',register:u});
    }
    //res.redirect('/login?returnUrl='+req.url);
});

app.get('/userslist',async (req,res) => {
    var users = await db.getUsers();
    console.log(users[0]);
    res.render('users.ejs',{users:users});
});

//user1 : 'abc'
//user2: '123'
//user3: 'abc123'
//user4: 'abc123'

async function f(password) { 
    var rounds = 12; 
    var hash = await bcrypt.hash(password, rounds );
    console.log( hash ); 
    var result = await bcrypt.compare( 'abc', '$2b$12$WqnY9kq3nbcoeyLsZ3WpS.N7u8nGG1y4s4eUu6nfSQzhyL7oiBXOi' );
    //console.log(result);
}
//f('123');
//f('abc123');


function authorize(permissions) {
    return async (req,res,next) => {
        if (req.signedCookies.user) {
            try{
                var user = (await db.getUserById(req.signedCookies.user))[0];
                if( user.role == permissions ){
                    console.log("Logged ->redirect");
                    next();
                }
                else{
                    console.log(`As ${user.role} you have no acces to requested page.`);
                    res.redirect('/login?returnUrl='+req.url);
                    //res.render('login.ejs',{returnUrl:req.query.returnUrl,message:`As ${user.role} you have no acces to requested page.`,register:emptyregister});
                }
            }
            catch (error) {
                console.log("Error while reading database");
                console.log(error);
                res.redirect('/login?returnUrl='+req.url);
            }
        }
        else{
            res.redirect('/login?returnUrl='+req.url);
        }
    }
}

app.post('/tocart',(req,res) => {
    var newProduct = req.body.cartBtn;
    if(newProduct){
        var cart = {};
        if (req.session.cart){
            cart = JSON.parse(req.session.cart);
        }
        if (!cart[newProduct]) {
            cart[newProduct] = 0;
        }
        cart[newProduct] += 1;
        console.log(cart);
        req.session.cart = JSON.stringify(cart);
    }
    res.redirect(`/?type=${req.query.searchtype}&searchbar=${req.query.searchbar}`);
});

http.createServer(app).listen(3000);
console.log("Server is listening.");