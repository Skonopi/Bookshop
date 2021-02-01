const http = require('http');
const express = require('express');
const { O_DIRECT } = require('constants');

var app = express();

var books = [];
for (var i = 0; i < 17; i++) {
    book = {
        title: "Harry Potter " + (i + 1),
        author: "J. K. Rowling",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
        price: (i + 1) * 10.0,
        path: "images/book1.jpeg",
        publisher: "some publisher",
        publication_year: "1987",
        genre: "Fantasy",
        id: i
    };
    books[i] = book;
}
genres = ['fantasy', 'criminal', 'sci-fi', 'romance', '1', '2', '3'];
publishers = ['us'];
// app.set('views', '/views');
app.use(express.static('public'));
app.get('/', (req, res) => {
    titles = ['hp1', 'hp2', 'hp3']
    res.render('index.ejs', { books: books, genres: genres, publishers: publishers, keyword: 'keyword' });
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
            prize: i
        }
    })
}
var order = {
    total_cost: 10,
    products : products
};
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


http.createServer(app).listen(3000);
console.log('Server created');