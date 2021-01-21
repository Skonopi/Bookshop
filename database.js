module.exports = {getAllProducts, getMatchingProducts, getProductDetails};

var pg = require('pg');

class ShopRepository {
  constructor(pool) {
    this.pool = pool;
    this.text_columns = ['title', 'author', 'genre', 'publisher', 'binding', 'description'];
    this.num_columns = ['price', 'publication year'];
  }

  async retrieveBasic(property, value){
    try {
      var sql = 'select id, title, author, image_path, price from products ';

      // Make sure property is a valid column name.
      if (this.text_columns.includes(property)){
        value = `%${value}%`
        sql += `where ${property} like $1`;
      }
      else if (this.num_columns.includes(property)) {
        sql += `where ${property} = $1`;
      }
      else if (property){
        return [];
      }

      var result = await this.pool.query(sql, property ? [value] : []);
      return result.rows;
    }
    catch (err) {
      console.log(err);
      return [];
    }
  }
  
  async retrieveDetails(id){
    try {
      var sql = `select * from products where id = ${id}`;

      var result = await this.pool.query(sql);
      return result.rows;
    }
    catch (err) {
      console.log(err);
      return [];
    }
  }
}

var pool = new pg.Pool({
  host: 'localhost',
  database: 'shop',
  user: 'app',
  password: 'password'
})

repo = new ShopRepository(pool);

/**
 * Get all available products.
 */
async function getAllProducts() {
  var res = await repo.retrieveBasic();
  return res;
}

/**
 * Get all products where property contains substring given by value. 
 * @param {string} property
 * @param {string} value 
 */
async function getMatchingProducts(property, value) {
  var res = await repo.retrieveBasic(property, value);
  return res;
}

/**
 * Get all details about the product with given id.
 * @param {Number} id 
 */
async function getProductDetails(id) {
  var res = await repo.retrieveDetails(id);
  return res;
}