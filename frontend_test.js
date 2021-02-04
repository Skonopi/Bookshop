const http = require('http');
const express = require('express');
const { O_DIRECT } = require('constants');

var app = express();

var books = [];
for (var i = 0; i < 17; i++) {
    book = {
        id: i,
        title: "Title" + i,
        author: "Author" + i,
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
        price: i * 10.0,
        image_path: "/images/cover" + (i % 2 + 1) + ".jpg",
        publisher: "publisher" + (i%7),
        publication_year: 1987 + i,
        genre: "Fantasy"
    };
    books[i] = book;
}
genres = ['fantasy', 'criminal', 'sci-fi', 'romance', '1', '2', '3'];
publishers = ['us'];
// app.set('views', '/views');
app.use(express.static('public'));
app.get('/', (req, res) => {
    titles = ['hp1', 'hp2', 'hp3']
    res.render('index_new.ejs', { books: books, genres: genres, publishers: publishers, keyword: 'keyword' });
});
var users = [];
for(var i = 0; i < 10; i++)
{
    users.push({
        id : i,
        mail : "user" + i + "@email.com",
        nickname : "user" + i,
        name : "user" + i,
        surname : "userowich" + i,
        creation_date: '2020-01-01'
    });
}
var products = [];
for(var i = 0; i < 10; i++)
{
    products.push({
        quantity : i%4 + 1,
        book : {
            id : i,
            title : "book" + i,
            author: "author" + i,
            prize: i,
            image_path: "images/cover" + (i%2 + 1) + ".jpg"
        }
    })
}
var order = {
    total_cost: 10,
    products : products
};

var order_db = {
    id : 1234,
    user_id : 18,
    date : '2020-01-01',
    address : 'addressy street 5',
    postal_code : '123-45',
    city : 'wroclaw',
    finished : true,
    products : products,
};
var orders = [];
for(var i = 0; i < 20; i++)
{
    orders[i] = order_db;
}
app.get('/users', (req, res) => {
    res.render('users.ejs', { users : users });
});
app.get('/book', (req, res) => {
    res.render('book.ejs', { book: books[0] });
});
app.get('/login', (req, res) => {
    res.render('login.ejs', {});
});
app.get('/cart', (req, res) => {
    res.render('cart.ejs', { order : order });
});
app.get('/admin', (req, res) => {
    res.render('admin.ejs', { order : order });
});
app.get('/error', (req, res) => {
    res.render('error.ejs', { error : {id: 404, description: "This error was caused intentionally."}});
});
app.get('/products', (req, res) => {
    res.render('products.ejs', { products: products});
});
app.get('/order', (req, res) => {
    res.render('order.ejs', { order : order_db});
});
app.get('/orders', (req, res) => {
    res.render('orders.ejs', { orders : orders});
});
app.get('/book_admin', (req, res) => {
    res.render('book_admin.ejs', { book: books[0]}); // or book : null for adding new book
});
app.get('/user_profile', (req, res) => {
    res.render('user_profile.ejs', { user: users[0]}); // or book : null for adding new book
});


http.createServer(app).listen(3000);
console.log('Server created');