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

var emptyregister =  {'email':'','nickname':'','name':'','surname':'','password':''};

app.get('/', async (req,res) => {
    try {
        console.log("GET index");

        var role = null;
        if (req.signedCookies.role){
            role = req.signedCookies.role;
        }

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

        if(req.cookies.prize){
            match.prize = req.cookies.prize;
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
            'role':role
        };
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

    var prize = [null,null];
    if (req.body.prize_min){
        prize[0] = req.body.prize_min;
    }
    if (req.body.prize_max){
        prize[1] = req.body.prize_max;
    }
    res.cookie('prize',prize);

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

app.get('/login',(req,res) => {
    console.log("GET login");
    res.render('login.ejs',{returnUrl:req.query.returnUrl,register:emptyregister});
});
app.post('/login',async (req,res) => {
    console.log('POST login');
    if(req.body.registerBtn){
        console.log("Register");
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
    }
    else{
        var email = req.body.email;
        var pswd = req.body.password;

        var check = (await db.getPasswordByMail(email))[0];
        console.log(pswd + ' ' + check.password);
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
            res.render('login.ejs',{returnUrl:req.query.returnUrl,message:'Wrong mail.'});
        }
    }
});

app.get('/cart',authorize('client'),(req,res) => {
    res.render('cart.ejs', { order : {total_cost:0,products:[]} });
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
                    res.render('login.ejs',{returnUrl:req.query.returnUrl,message:`As ${user.role} you have no acces to requested page.`});
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

http.createServer(app).listen(3000);
console.log("Server is listening.");