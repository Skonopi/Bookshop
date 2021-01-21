const http = require('http');
const express = require('express');
const ejs = require('ejs');
const  db = require('./database');

var app = express()

app.set('views','./views');
app.set('view engine','html');

app.engine('html',ejs.renderFile);

async function read(){
    var res = await db.getAllProducts();
    console.log(res);
    console.log(await db.getProductDetails(id=1));
}

app.get('/', async (req,res) => {
    try {
        var result = await db.getAllProducts();
    } catch (error) {
        console.log("Error while reading database");
       // res.redirect("/error",{type:"database error",error});
    }
});

app.post

http.createServer(app).listen(3000);
console.log("Server is listening.")