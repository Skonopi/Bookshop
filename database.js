module.exports = {
  getAllProducts, getSomeProducts, getMatchingProducts, 
  getProductDetails, getGenres, getPublishers, 
  insertProduct, deleteProduct
};

const pg = require('pg');

class ShopRepository {
  constructor(pool) {
    this.pool = pool;
    this.text_columns = ['title', 'author', 'description'];
    this.num_columns = ['price', 'publication year'];
    this.id_columns = ['id'];
  }

  constructSelectQuery(table, columns, conditions, limit, offset) {
    // Variables table and columns are visible only to internal functions, 
    // so there is no danger of SQL Injection. 
    var sql;
    if (columns) {
      sql = `select ${columns.join(',')} from ${table}`; 
    }
    else {
      sql = `select * from ${table}`;
    }

    // Construct 'where' clause and the array of parameters.
    var clauses = [];
    var values = [];
    var n = 1;
    for (var property in conditions) {
      // For each property in conditions, construct a proper constraint.
      var constraints = [];
      if (this.text_columns.includes(property)){
        for (var value of conditions[property]) {
          // Ignore case.
          constraints.push(` upper(${property}) like upper($${n}) `);
          n++;

          values.push(`%${value}%`);
        }
      }
      else if (this.num_columns.includes(property)){
        for (var value of conditions[property]) {
          constraints.push(` ${property} >= $${n} and ${property} <= $${n+1} `);
          n += 2;

          values.push(value[0]);
          values.push(value[1]);
        }
      }
      else if (this.id_columns.includes(property)) {
        for (var value of conditions[property]) {
          constraints.push(` id = $${n} `);
          n++;

          values.push(value);
        }
      }

      // Join the contraints with 'or'.
      if (constraints.length > 0)
        clauses.push(` (${constraints.join('or')}) `);
    }

    // If there is at least one condition, add where clause joining them with 'and'.
    if (clauses.length > 0)
      sql += ` where ${clauses.join('and')}`

    // Check if there are valid limit and offset parameters.
    if (typeof limit == 'number' && typeof offset == 'number') {
      sql += ` limit ${limit} offset ${offset}`;
    }
    return [sql, values];
  }

  async retrieve(table, columns, conditions, limit, offset) {
    try {
      var [sql, values] = this.constructSelectQuery(table, columns, conditions, limit, offset);

      var result = await this.pool.query(sql, values);
      return result.rows;
    }
    catch (err) {
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
  var res = await repo.retrieve('products', ['id', 'title', 'author', 'image_path', 'price'], null, limit, offset);
  return res;
}

/**
 * Get all products where that match given conditions.
 * Conditions is a dictionary of form property: list of possible values.
 * For text properties values are strings and for numeric properties values are lists [min_value, max_value].
 * Valid text properties: title, author, description.
 * Valid numeric properties: price, publication_year.
 * @param {object} conditions
 */
async function getMatchingProducts(conditions) {
  var res = await repo.retrieve('products', ['id', 'title', 'author', 'image_path', 'price'], conditions);
  return res;
}

/**
 * Get all details about the product with given id.
 * @param {number} id 
 */
async function getProductDetails(id) {
  var res = await repo.retrieve('products', null, {'id': [id]});
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