module.exports = {getAllProducts, getMatchingProducts, getProductDetails};

var pg = require('pg');

class ShopRepository {
  constructor(pool) {
    this.pool = pool;
  }

  async retrieveBasic(property, value){
    try {
      // Nie do końca wiem co z tym zrobić - jeżeli zostawię tak, to jest możliwość SQL injection.
      // Żeby to naprawić, musiałabym użyć parametrów - ale wtedy nie mogę wziąć nazwy kolumny jako parametru.
      var sql = 'select id, title, author, image_path, price from products '
      + (property ? `where ${property} like '%${value}%'` : "");

      var result = await this.pool.query(sql);
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