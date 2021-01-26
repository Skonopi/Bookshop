module.exports = {
  getAllProducts, getSomeProducts, getMatchingProducts, 
  getProductDetails, getGenres, getPublishers, 
  getProductsByRange, insertProduct, deleteProduct
};

const pg = require('pg');

class ShopRepository {
  constructor(pool) {
    this.pool = pool;
    this.text_columns = ['title', 'author', 'description'];
    this.num_columns = ['price', 'publication year'];
  }

  constructSelectQuery(table, columns, query_type, property, limit, offset) {
    // Variables table and columns are visible only to internal functions, 
    // so there is no danger of SQL Injection. 
    var sql;
    if (columns) {
      sql = `select ${columns.join(',')} from ${table}`; 
    }
    else {
      sql = `select * from ${table}`;
    }

    if (query_type == 'text') {
      // Make sure property is a text column name.
      if (this.text_columns.includes(property)){
        // Ignore case.
        sql += ` where upper(${property}) like upper($1)`;
      }
      else {
        throw "Invalid column name.";
      }
    }

    else if (query_type == 'range') {
      // Make sure property is a numeric column name.
      if (this.num_columns.includes(property)){
        sql += ` where ${property} >= $1 and ${property} <= $2 `;
      }
      else {
        throw "Invalid column name.";
      }
    }

    else if (query_type == 'id') {
      sql += ` where id = $1 `;
    }

    // Check if there are valid limit and offset parameters.
    if (typeof limit == 'number' && typeof offset == 'number') {
      sql += ` limit ${limit} offset ${offset}`;
    }
    return sql;
  }

  async retrieve(table, columns, query_type, property, value1, value2, limit, offset) {
    try {
      var sql = this.constructSelectQuery(table, columns, query_type, property, limit, offset);

      // Construct list of parameters for the query.
      var values = [];
      if (query_type == 'text') {
        values = [`%${value1}%`];
      }
      else if (query_type == 'range') {
        values = [value1, value2];
      }
      else if (query_type == 'id') {
        values = [value1];
      }

      var result = await this.pool.query(sql, values);
      return result.rows;
    }
    catch (err) {
      if (err == "Invalid column name.")
        throw err;
      else
        throw "Database error.";
    }
  }

  async insertProduct(title, author, price, genre, publisher, 
    publication_year, binding, description, image_path) {
    try {
      var values = [];
      var sql = 
      `insert into products (
        title, author, price, genre_id, publisher_id, 
        publication_year, binding, description, image_path) 
      values($1, $2, $3, $4, $5, $6, $7, $8, $9)`;

      if (genre) {
        // Get id of requested genre.
        var result = await this.pool.query('select id from genres where upper(name) = upper($1)', [genre]);

        if (result.rows.length == 0) {
          // If genre does not exist, add it to the table.
          result = await this.pool.query('insert into genres(name) values($1) returning id', [genre]);
        }
        genre = result.rows[0].id;
      }

      if (publisher) {
        // Get id of requested publisher.
        var result = await this.pool.query('select id from publishers where upper(name) = upper($1)', [publisher]);

        if (result.rows.length == 0) {
          // If publisher does not exist, add it to the table.
          result = await this.pool.query('insert into publishers(name) values($1) returning id', [publisher]);
        }
        publisher = result.rows[0].id;
      }
      
      var values = [title, author, price, genre, publisher, publication_year, binding, description, image_path];
      this.pool.query(sql, values);
    }
    catch (err) {
      throw "Database error."
    }
  }

  async deleteProduct(id) {
    try {
      var sql = 'delete from products where id = $1';
      this.pool.query(sql, [id]);
    }
    catch (err) {
      throw "Database error."
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
  var res = await repo.retrieve('products', ['id', 'title', 'author', 'image_path', 'price']);
  return res;
}

/**
 * Get limit of available product at offset.
 * @param {number} limit 
 * @param {number} offset 
 */
async function getSomeProducts(limit, offset) {
  var res = await repo.retrieve('products', ['id', 'title', 'author', 'image_path', 'price'], 'all', null, null, null, limit, offset);
  return res;
}

/**
 * Get all products where property contains substring given by value.
 * Valid properties: title, author, description.
 * @param {string} property
 * @param {string} value 
 */
async function getMatchingProducts(property, value) {
  var res = await repo.retrieve('products', ['id', 'title', 'author', 'image_path', 'price'], 'text', property, value);
  return res;
}

/**
 * Get all details about the product with given id.
 * @param {number} id 
 */
async function getProductDetails(id) {
  var res = await repo.retrieve('products', null, 'id', 'id', id);
  return res;
}

/**
 * Get all existing genres.
 */
async function getGenres() {
  var res = await repo.retrieve('genres');
  return res;
}

/**
 * Get all existing publishers.
 */
async function getPublishers() {
  var res = await repo.retrieve('publishers');
  return res;
}

/**
 * Get all products where property is between low and high.
 * Valid properties: price, publication_year.
 * @param {string} property 
 * @param {number} low 
 * @param {number} high 
 */
async function getProductsByRange(property, low, high) {
  var res = await repo.retrieve('products', ['id', 'title', 'author', 'image_path', 'price'], 'range', property, low, high);
  return res;
}

/**
 * Insert product with given values. Each of them can be null.
 * @param {string} title 
 * @param {string} author 
 * @param {number} price 
 * @param {string} genre 
 * @param {string} publisher 
 * @param {number} publication_year 
 * @param {string} binding 
 * @param {string} description 
 * @param {string} image_path 
 */
async function insertProduct(title, author, price, genre, publisher, publication_year, binding, description, image_path) {
  await repo.insertProduct(title, author, price, genre, publisher, publication_year, binding, description, image_path);
}

/**
 * Delete product with given id.
 * @param {number} id 
 */
async function deleteProduct(id) {
  await repo.deleteProduct(id);
}