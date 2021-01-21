const http = require('http');
const express = require('express');

var app = express();

var books = [];
for(var i = 0; i < 3; i++){
    book = {
        title: "Harry Potter " + (i+1),
        author: "J. K. Rowling",
        price: (i+1)*10.0,
        path: ""
    };
    books[i] = book;
}
// app.set('views', '/views');
app.use( express.static( 'public' ) );
app.get('/', (req, res) => {
    titles = ['hp1', 'hp2', 'hp3']
    res.render('index.ejs', { books: books, genres: genres });
});


http.createServer( app ).listen(3000);
console.log('Server created');