module.exports = {
  getAllProducts, getSomeProducts, getMatchingProducts, 
  getProductDetails, getProductDetailsDescriptive, getGenres, getPublishers, 
  insertProduct, deleteProduct, updateProduct,
  getUsers, getPasswordByMail, getUserById,
  deleteUser, insertUser, updateUser
};

const pg = require('pg');

class ShopRepository {
  constructor(pool) {
    this.pool = pool;
    this.text_columns = ['title', 'author', 'description'];
    this.num_columns = ['price', 'publication year'];
    this.id_columns = ['id', 'genre_id', 'publisher_id', 'mail'];
    this.users_columns = ['mail', 'nickname', 'name', 'surname', 'password'];
    this.products_columns = [
      'title', 'author', 'price', 'genre_id', 'publisher_id', 
      'publication_year', 'binding', 'description' ,'image_path']
  }

  constructSelectQuery(table, columns, conditions, limit, offset) {
    // Variables table and columns are visible only to internal functions, 
    // so there is no danger of SQL Injection. 
    var sql;
    if (columns) {
      sql = `select t.${columns.join(',')} from ${table} t`; 
    }
    else {
      sql = `select * from ${table} t`;
    }

    if (table == 'users' && columns && columns.includes('role')) {
      sql += ' join roles r on role_id = r.id ';
    }
    if (table == 'products' && columns && columns.includes('genre')) {
      sql += ' join genres g on genre_id = g.id ';
    }
    if (table == 'products' && columns && columns.includes('publisher')) {
      sql += ' join publishers p on publisher_id = p.id ';
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
          constraints.push(` upper(t.${property}) like upper($${n}) `);
          n++;

          values.push(`%${value}%`);
        }
      }
      else if (this.num_columns.includes(property)){
        for (var value of conditions[property]) {
          constraints.push(` t.${property} >= $${n} and ${property} <= $${n+1} `);
          n += 2;

          values.push(value[0]);
          values.push(value[1]);
        }
      }
      else if (this.id_columns.includes(property)) {
        for (var value of conditions[property]) {
          constraints.push(` t.${property} = $${n} `);
          n++;

          values.push(value);
        }
      }

      // Join the constraints with 'or'.
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
        var result = await this.pool.query('select id from genres where upper(genre) = upper($1)', [genre]);

        if (result.rows.length == 0) {
          // If genre does not exist, add it to the table.
          result = await this.pool.query('insert into genres(genre) values($1) returning id', [genre]);
        }
        genre = result.rows[0].id;
      }

      if (publisher) {
        // Get id of requested publisher.
        var result = await this.pool.query('select id from publishers where upper(publisher) = upper($1)', [publisher]);

        if (result.rows.length == 0) {
          // If publisher does not exist, add it to the table.
          result = await this.pool.query('insert into publishers(publisher) values($1) returning id', [publisher]);
        }
        publisher = result.rows[0].id;
      }
      
      var values = [title, author, price, genre, publisher, publication_year, binding, description, image_path];
      await this.pool.query(sql, values);
    }
    catch (err) {
      throw "Database error."
    }
  }

  async constructUpdateQuery(table, columns, id, updates) {
    // If change of genre is requested, first get its id. If it does not exist, add it to the table.
    var genre = updates['genre'];
    if (genre) {
      var result = await this.pool.query('select id from genres where upper(genre) = upper($1)', [genre]);
      if (result.rows.length == 0) {
        result = await this.pool.query('insert into genres(genre) values($1) returning id', [genre]);
      }
      updates['genre_id'] = result.rows[0].id;
    }

    // Do the same for publisher.
    var publisher = updates['publisher'];
    if (publisher) {
      var result = await this.pool.query('select id from publishers where upper(publisher) = upper($1)', [publisher]);

      if (result.rows.length == 0) {
        result = await this.pool.query('insert into publishers(publisher) values($1) returning id', [publisher]);
      }
      updates['publisher_id'] = result.rows[0].id;
    }

    // Construct 'set' clause.
    var sql = `update ${table}`, n = 1, changes = [], values = [];
    for (var property of columns) {
      if (updates[property]) {
        changes.push(` ${property} = $${n} `);
        values.push(updates[property]);
        n++;
      }
    }

    if (changes.length) {
      sql += ` set ${changes.join(',')} `
    }
    else {
      return ['', []];
    }

    sql += ` where id = $${n}`;
    values.push(id);

    return [sql, values];
  }

  handleUserError(err) {
    if (err.constraint == 'users_mail_key') {
      throw "Mail already exists.";
    }
    else if (err.constraint == 'users_nickname_key') {
      throw "Nickname already exists.";
    }
    else if (err == "Role does not exist.") {
      throw "Role does not exist.";
    }
    else {
      throw "Database error.";
    }
  }

  async update(table, id, updates) {
    try {
      var columns = [];
      if (table == 'users')
        columns = this.users_columns;
      else if (table == 'products')
        columns = this.products_columns;

        var [sql, values] = await this.constructUpdateQuery(table, columns, id, updates)
      await this.pool.query(sql, values);
    }
    catch (err) {
      this.handleUserError(err);
    }
  }

  async insertUser(mail, nickname, name, surname, password, role) {
    try {
      var sql = 'select id from roles where upper(role) = upper($1)';
      var res = await this.pool.query(sql, [role]);
      if (res.rows.length == 0) {
        throw "Role does not exist.";
      }

      var role_id = res.rows[0].id;
      sql = `insert into users(
        mail, nickname, name, surname, password, role_id) 
      values ($1, $2, $3, $4, $5, $6)`;
      var values = [mail, nickname, name, surname, password, role_id];

      await this.pool.query(sql, values);
    }
    catch (err) {
      this.handleUserError(err);
    }
  }

  async delete(table, id) {
    try {
      var sql = `delete from ${table} where id = $1`;
      await this.pool.query(sql, [id]);
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
 * Get products where that match given conditions. Fetch limit rows at offset.
 * Conditions is a dictionary of form property: list of possible values.
 * For text properties values are strings.
 * For numeric properties values are lists [min_value, max_value].
 * For id properties values are ids.
 * Valid text properties: title, author, description.
 * Valid numeric properties: price, publication_year.
 * Valid id properties: id, genre_id, publisher_id.
 * @param {object} conditions
 * @param {number} limit
 * @param {number} offset
 */
async function getMatchingProducts(conditions, limit, offset) {
  var res = await repo.retrieve('products', ['id', 'title', 'author', 'image_path', 'price'], conditions, limit, offset);
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
 * Get all details about the product with given id. Get names of genre and publisher instead of id.
 * @param {number} id 
 */
async function getProductDetailsDescriptive(id) {
  var res = await repo.retrieve('products', 
  ['id', 'title','author','price', 'genre', 'publisher', 'publication_year', 'binding', 'description' ,'image_path'],
  {'id': [id]});
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
  await repo.delete('products',id);
}

/**
 * Update product with given id.
 * Updates is a dictionary of form property: value.
 * Valid properties: title, author, price, genre, publisher, 
    publication_year, binding, description, image_path.
 * @param {number} id 
 * @param {object} updates 
 */
async function updateProduct(id, updates) {
  await repo.update('products', id, updates);
}

/**
 * Get all users.
 */
async function getUsers() {
  var res = await repo.retrieve('users', ['id', 'mail', 'nickname', 'name', 'surname', 'role_id']);
  return res;
}

/**
 * Get id and password of user with given mail.
 * @param {string} mail 
 */
async function getPasswordByMail(mail) {
  var res = await repo.retrieve('users', ['id', 'password'], {'mail' : [mail]});
  return res;
}

/**
 * Get user with given id.
 * @param {number} id 
 */
async function getUserById(id) {
  var res = await repo.retrieve('users', ['id', 'mail', 'nickname', 'name', 'surname', 'role'], {'id' : [id]});
  return res;
}

/**
 * Delete user with given id.
 * @param {number} id 
 */
async function deleteUser(id) {
  await repo.delete('users', id);
}

/**
 * Insert user with given values.
 * @param {string} mail 
 * @param {string} nickname 
 * @param {string} name 
 * @param {string} surname 
 * @param {string} password 
 * @param {string} role 
 */
async function insertUser(mail, nickname, name, surname, password, role) {
  await repo.insertUser(mail, nickname, name, surname, password, role);
}

/**
 * Update product with given id.
 * Updates is a dictionary of form property: value.
 * Valid properties: mail, nickname, name, surname, password.
 * @param {number} id 
 * @param {object} updates 
 */
async function updateUser(id, updates) {
  await repo.update('users', id, updates);
}