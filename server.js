const http = require('http');
const express = require('express');
const session = require('express-session');
const ejs = require('ejs');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const multer = require('multer');
const fs = require('fs');

const  db = require('./database');
const { rename } = require('fs');

var app = express();
// var upload = multer({dest: 'images/'});

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'public/images')
    },
  });
var upload = multer({ storage: storage });

app.set('views','./views');
app.set('view engine','ejs');

app.disable('etag');

app.use(cookieParser('hje5q46qzdc5712323564gfdght6y6'));
app.use(express.urlencoded({extended:true}));
app.use(express.static('public'));
app.use(session({resave:true, saveUninitialized:true, secret:'qvfgsdfgtshgnhmesatuk'}));


app.engine('html',ejs.renderFile);

var emptyregister =  {'email':'','nickname':'','name':'','surname':'','password':''};

app.get('/', async(req,res) => {
    try {
        db.getMatchingProducts({description:'ad'});
        console.log("GET index");

        var role = null;
        if (req.signedCookies.role){
            role = req.signedCookies.role;
        }

        var query_properties = ['Title','Author','Description'];
        var match = {};

        var searchtype=req.query.type;
        if(!searchtype || !query_properties.includes(searchtype)){
            searchtype='Title';
        }
        //var searchtype = 'title';
        var searchbar = req.query.searchbar;
        if(searchbar){
            match[searchtype.toLowerCase()]=[searchbar];
        }

        var page = 1;
        if(req.query.page ){
            page = parseInt(req.query.page);
            if(!Number.isInteger(page) || page<1){
                page = 1;
            }
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

        console.log("Match:" );
        if (match){
            Object.keys(match).forEach( k => {
                console.log(`${k} : ${match[k]}`);
            });
        }

        try{
            var genres = await db.getGenres();
            var publishers = await db.getPublishers();
        }
        catch(error) {
            res.render('error.ejs', { error : {id: 1, description: error}});
            console.log(error);
            res.end();
            return;
        }

        var books;
        try{
            if (match){
                var numofelem = await db.getMatchingProductsCount(match);
                var maxpage = Math.ceil(numofelem/10);
                if(page > maxpage && page > 1 ){
                    page = maxpage;
                }
                books = await db.getMatchingProducts(match,10,(page-1)*10);
            }
            else {
                books = await db.getAllProducts();
            }
        }
        catch(error) {
            res.render('error.ejs', { error : {id: 1, description: error}});
            console.log(error);
            res.end();
            return;
        }
        console.log(role);

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
            'role':role,
            'page':page,
            'maxpage':maxpage
        };
        res.render('index_new.ejs',references);

        
    } catch (error) {
        console.log(error);
        res.render('error.ejs', { error : {id: 0, description: "Unexpected error"}});
       // res.redirect("/error",{type:"database error",error});
    }
});

app.post('/', (req,res) => {
    try {
        console.log("POST index");

        var searchtype = req.body.searchtype;
        //console.log(req.body.searchtype);
        //var searchtype = 'title';
        var searchbar = req.body.searchbar;

        if(searchbar){
            res.redirect(`/?type=${searchtype}&searchbar=${searchbar}`);
        }
        else res.redirect('/');
    } catch (error) {
        console.log(error);
        res.render('error.ejs', { error : {id: 0, description: "Unexpected error"}});
    }
});

app.post('/filter', (req,res) => {
    try{
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
    } catch(error){
        console.log(error);
        res.render('error.ejs', { error : {id: 0, description: "Unexpected error"}});
    }
});

app.get('/book',async (req,res) => {
    try {
        console.log("GET book");
        var bookid = parseInt(req.query.id);
        try{
            var book = (await db.getProductDetailsDescriptive(bookid))[0];
        }
        catch(error) {
            res.render('error.ejs', { error : {id: 1, description: error}});
            console.log(error);
            res.end();
            return;
        }
        console.log(book);
        res.render('book.ejs', { 'book':book, 'searchbar': '', 'searchtype': 'Title'});
    } catch (error) {
        console.log(error);
        res.render('error.ejs', { error : {id: 0, description: "Unexpected error"}});
    }
});

app.get('/bookedit', authorize(false,'admin'), async (req,res) => {
    try {
        console.log("GET book");
        var bookid = parseInt(req.query.id);
        var book;
        try{
            if(!Number.isNaN(bookid)){
                console.log("HERE "+bookid);
                book = (await db.getProductDetailsDescriptive(bookid))[0];
            }
            else{
                book = null;
            }
        }
        catch(error) {
            res.render('error.ejs', { error : {id: 1, description: error}});
            console.log(error);
            res.end();
            return;
        }
        res.render('book_admin.ejs', { 'book':book, 'searchbar': '', 'searchtype': 'Title'});
    } catch (error) {
        console.log(error);
        res.render('error.ejs', { error : {id: 0, description: "Unexpected error"}});
    }
});

app.post('/bookedit', upload.single("coverFile"), async (req,res) => {
    try {
        console.log("POST book edit");
        var bookid = parseInt(req.query.id);
        var book = {
            title : req.body.title,
            author : req.body.author,
            genre : req.body.genre,
            publisher : req.body.publisher,
            publication_year : parseInt(req.body.publicationYear),
            description : req.body.description
        };

        try{
            if(Number.isNaN(bookid)){
                bookid = await db.insertProduct(book);
            }
            else{
                await db.updateProduct(bookid,book);
            }
            if(req.file){
                fs.rename(req.file.path,(req.file.destination+'/book'+bookid+'.jpeg'),err => console.log(err));
                await db.updateProduct(bookid,{image_path : './images/book'+bookid+'.jpeg'});
                //await db.updateProduct(bookid,{image_path : './' + req.file.path});
            }
        }
        catch(error) {
            res.render('error.ejs', { error : {id: 1, description: error}});
            console.log(error);
            res.end();
            return;
        }
        res.redirect('/bookedit?id='+bookid);
    } catch (error) {
        console.log(error);
        res.render('error.ejs', { error : {id: 0, description: "Unexpected error"}});
    }
});

app.post('/deletebook', async (req,res) => {
    try {
        console.log("POST delete book");
        var bookid = parseInt(req.query.id);
        try{
            await db.deleteProduct(bookid);
        }
        catch(error) {
            res.render('error.ejs', { error : {id: 1, description: error}});
            console.log(error);
            res.end();
            return;
        }
        res.redirect('/');
    } catch (error) {
        console.log(error);
        res.render('error.ejs', { error : {id: 0, description: "Unexpected error"}});
    }
});

app.post('/addbook', async (req,res) => {
    try {
        console.log("POST add book");
        var book = {
            title : req.body.title,
            author : req.body.author,
            genre : req.body.genre,
            publisher : req.body.publisher,
            publication_year : req.body.publicationYear,
            description : req.body.description
        };
        try{
            var bookid = await db.insertProduct(book);
        }
        catch(error) {
            res.render('error.ejs', { error : {id: 1, description: error}});
            console.log(error);
            res.end();
            return;
        }
        res.render('book_admin.ejs', { 'book':book, 'searchbar': '', 'searchtype': 'title'});
    } catch (error) {
        console.log(error);
        res.render('error.ejs', { error : {id: 0, description: "Unexpected error"}});
    }
});

app.get('/login',(req,res) => {
    try{
        console.log("GET login");
        res.render('login.ejs',{returnUrl:req.query.returnUrl,register:emptyregister});
    } catch (error) {
        console.log(error);
        res.render('error.ejs', { error : {id: 0, description: "Unexpected error"}});
}});

app.post('/login',async (req,res) => {
    console.log('POST login');
    try{
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
                res.render('login.ejs',{returnUrl:req.query.returnUrl,popoutMessage:'Register completed. You can now log in.',register:emptyregister});
            }
            catch(error){
                console.log(error);
                switch( error ){
                    case 'Mail already exists.':
                        u.mail = '';
                        res.render('login.ejs',{returnUrl:req.query.returnUrl,message:'Email already exists.',register:u});
                        break;
                    case 'Nickname already exists.':
                        u.nickname = '';
                        res.render('login.ejs',{returnUrl:req.query.returnUrl,message:'Nickname already exists.',register:u});
                        break;
                    default:
                        res.render('error.ejs', { error : {id: 0, description: "Unexpected error"}});
                        break;
                }
            }
        }
        else{
            var email = req.body.email;
            var pswd = req.body.password;

            try{
                var check = (await db.getPasswordByMail(email))[0];
            }
            catch(error) {
                res.render('error.ejs', { error : {id: 1, description: error}});
                console.log(error);
                res.end();
                return;
            }

            if(check){
                var result = await bcrypt.compare(pswd,check.password);
                if( result ){
                    req.session.destroy(null);
                    res.cookie('user',check.id,{signed:true,httpOnly:true});
                    res.cookie('role',check.role,{signed:true,httpOnly:true});
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
    } catch (error) {
        console.log(error);
        res.render('error.ejs', { error : {id: 0, description: "Unexpected error"}});
    }
});

app.post('/logout',async(req,res) => {
    try {
        console.log("POST logout");
        req.session.destroy(null);
        Object.keys(req.cookies).forEach( c => {
            res.cookie(c,'',{maxAge:-1});
        });
        Object.keys(req.signedCookies).forEach( c => {
            res.cookie(c,'',{maxAge:-1});
        });
        res.redirect('/');
    } catch (error) {
        console.log(error);
        res.render('error.ejs', { error : {id: 0, description: "Unexpected error"}});
    }
});

app.get('/cart',authorize(false,'client'), async (req,res) => {
    try{
        var cart = {};
        var products = [];
        var total_cost = 0;
        if(req.session.cart){
            var productsid = JSON.parse(req.session.cart);
            for ( const p of Object.keys(productsid)) {
                //console.log(p);

                try{
                    var book = (await db.getProductDetailsDescriptive(parseInt(p)))[0];
                }
                catch(error) {
                    res.render('error.ejs', { error : {id: 1, description: error}});
                    console.log(error);
                    res.end();
                    return;
                }

                products.push({
                    quantity : productsid[p],
                    book : {
                        id : book.id,
                        title : book.title,
                        author: book.author,
                        price: book.price,
                        image_path : book.image_path
                    }
                });
                total_cost += book.price*parseInt(productsid[p]);
            }
        }
        cart.total_cost = total_cost;
        cart.products = products;
        console.log(cart);
        res.render('cart.ejs', { order : cart });
    } catch (error) {
        console.log(error);
        res.render('error.ejs', { error : {id: 0, description: "Unexpected error"}});
    }
});

app.post('/cart', async(req,res) => {
    try {
        if(req.session.cart){
            var order = {
                user_id : req.signedCookies.user,
                address : req.body.address,
                postal_code : req.body.postalCode,
                city : req.body.city,
                finished : false
            };
            var products = [];
            var productsid = JSON.parse(req.session.cart);
            for ( const p of Object.keys(productsid)) {
                products.push([p,productsid[p]]);
            }
            order.product_list = products;
            try{
                await db.insertOrder(order);
                req.session.destroy(null);
                res.render('message.ejs',{message:"Your order has been register"});
            }
            catch(error) {
                res.render('error.ejs', { error : {id: 1, description: error}});
                console.log(error);
                res.end();
                return;
            }
        }
        else{
            res.render('error.ejs', { error : {id: 4, description: "Cart is empty"}});
        }
    } catch (error) {
        console.log(error);
        res.render('error.ejs', { error : {id: 0, description: "Unexpected error"}});
    }
});

app.get('/users', authorize(false,'admin'), async (req,res) => {
    try{
        var user ={};
        if(req.body.filterEmail){
            user.mail = req.body.filterEmail;
        }
        if(req.body.filterNickname){
            user.nickname = req.body.filterNickname;
        }
        if(req.body.filterName){
            user.name = req.body.filterName;
        }
        if(req.body.filterSurname){
            user.surname = req.body.filterSurname;
        }
        if(req.body.filterDate){
            user.date = req.body.filterDate;
        }
        console.log(user);
        
        try{
            var users = await db.getUsers();
        }
        catch(error) {
            res.render('error.ejs', { error : {id: 1, description: error}});
            console.log(error);
            res.end();
            return;
        }

        Object.keys(users).forEach( u => {u.password = null;});
        
        res.render('users.ejs',{users:users});
    } catch (error) {
        console.log(error);
        res.render('error.ejs', { error : {id: 0, description: "Unexpected error"}});
    }
});

app.post('/deleteuser', async (req,res) => {
    try {
        console.log("POST delete user");
        var userid = parseInt(req.query.id);
        try{
            await db.deleteUser(userid);
        }
        catch(error) {
            res.render('error.ejs', { error : {id: 1, description: error}});
            console.log(error);
            res.end();
            return;
        }
        res.redirect('/users');
    } catch (error) {
        console.log(error);
        res.render('error.ejs', { error : {id: 0, description: "Unexpected error"}});
    }
});


app.get('/orders',authorize(false,'admin','client'),async (req,res) => {
    try{
        try{
            if(req.signedCookies.role=='admin'){
                console.log(req.session);
                if(req.session.ordersFiltr){
                    var order = JSON.parse(req.session.ordersFiltr);
                    console.log(order);
                    var orders = await db.getMatchingOrders(order);
                }
                else{
                    var orders = await db.getOrders();
                }
            }
            else{
                var orders = await db.getMatchingOrders({user_id:[req.signedCookies.user]});
            }
        }
        catch(error) {
            res.render('error.ejs', { error : {id: 1, description: error}});
            console.log(error);
            res.end();
            return;
        }
        
        res.render('orders.ejs',{orders:orders,role:req.signedCookies.role});
    } catch (error) {
        console.log(error);
        res.render('error.ejs', { error : {id: 0, description: "Unexpected error"}});
    }
});

app.post('/orders',(req,res) => {
    if(req.signedCookies.role=='admin'){
        var order ={};
        if(req.body.orderId){
            order.id = [req.body.orderId];
        }
        if(req.body.userId){
            order.user_id = [req.body.userId];
        }
        //+1?
        if(req.body.date){
            order.date = [req.body.date,req.body.date];
        }
        if(req.body.date){
            if(req.body.date == 'Completed'){
                order.status = [true];
            }
            if(req.body.date == 'In progress'){
                order.status = [false];
            }
        }
        //console.log(order);
        req.session.ordersFiltr = JSON.stringify(order);
    }
    res.redirect('/orders');
})

app.get('/order',async (req,res) => {
    try {
        console.log("GET order");
        var orderid = parseInt(req.query.id);
        try{
            var order = (await db.getMatchingOrders({id:[orderid]}))[0];
            var products = [];
            var total_cost=0;
            console.log(order);
            for ( const [p,n] of order.product_list) {
                var book = (await db.getProductDetailsDescriptive(p))[0];

                products.push({
                    quantity : n,
                    book : {
                        id : book.id,
                        title : book.title,
                        author: book.author,
                        price: book.price,
                        image_path : book.image_path
                    }
                });
                total_cost += book.price*n;
            }
            order.products = products;
            order.total_cost = total_cost;
        }
        catch(error) {
            res.render('error.ejs', { error : {id: 1, description: error}});
            console.log(error);
            res.end();
            return;
        }
        res.render('order.ejs', { 'order':order });
    } catch (error) {
        console.log(error);
        res.render('error.ejs', { error : {id: 0, description: "Unexpected error"}});
    }
});

app.get('/profile',authorize(false,'admin','client'),async (req,res) => {
    try{
        try{
            var user = (await db.getUserById(req.signedCookies.user))[0];
        }
        catch(error) {
            res.render('error.ejs', { error : {id: 1, description: error}});
            console.log(error);
            res.end();
            return;
        }
        
        res.render('user_profile.ejs',{user:user});
    } catch (error) {
        console.log(error);
        res.render('error.ejs', { error : {id: 0, description: "Unexpected error"}});
    }
});

app.post('/profile', async(req,res) => {
    try {
        var user = {
            mail : req.body.email,
            nickname : req.body.nickname,
            name : req.body.name,
            surname : req.body.surname
        };
        try{
            await db.updateUser(user);
        }catch(error) {
            res.render('error.ejs', { error : {id: 1, description: error}});
            console.log(error);
            res.end();
            return;
        }
    } catch (error) {
        console.log(error);
        res.render('error.ejs', { error : {id: 0, description: "Unexpected error"}});
    }
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

function authorize(returnToMain,...args) {
    return async (req,res,next) => {
        if (req.signedCookies.user) {
            try{
                var user = (await db.getUserById(req.signedCookies.user))[0];
                if( args.includes(user.role) ){
                    console.log("Logged ->redirect");
                    next();
                }
                else{
                    console.log(`As ${user.role} you have no acces to requested page.`);
                    res.render('error.ejs', { error : {id: 2, description: (`As ${user.role} you have no acces to requested page.`)}});
                    res.end();
                }
            }
            catch (error) {
                res.render('error.ejs', { error : {id: 1, description: error}});
                console.log(error);
                res.end();
                return;
            }
        }
        else{
            if(!returnToMain){
                res.redirect('/login?returnUrl='+req.url);
            }
            else{
                res.redirect('/login?returnUrl=/');
            }
        }
    }
}

app.post('/tocart',authorize(true,'client'),(req,res) => {
    try{
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
        if(req.query.searchbar){
            res.redirect(`/?type=${req.query.searchtype}&searchbar=${req.query.searchbar}`);
        }
        else{
            res.redirect('/');
        }
    } catch (error) {
        console.log(error);
        res.render('error.ejs', { error : {id: 0, description: "Unexpected error"}});
    }
});

http.createServer(app).listen(process.env.PORT || 3000);
console.log("Server is listening.");