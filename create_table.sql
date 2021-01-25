CREATE TABLE genres (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50));

INSERT INTO genres(name) values
    ('Literatura piękna'),
    ('Fantastyka'),
    ('Science-Fiction'),
    ('Thriller'),
    ('Popularnonaukowa'),
    ('Kryminał'),
    ('Sensacja');

CREATE TABLE publishers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50));

INSERT INTO publishers(name) values
    ('PWN'),
    ('Wydawnictwo literackie'),
    ('Czarna owca'),
    ('Wydawnictwo Poznańskie'),
    ('Wydawnictwo ABC');

DROP TABLE IF EXISTS products;

CREATE TABLE products (
    id SERIAL PRIMARY KEY, 
    title VARCHAR(255), 
    author VARCHAR(100), 
    price FLOAT, 
    genre_id INT, 
    publisher_id INT, 
    publication_year INT, 
    binding VARCHAR(50), 
    description VARCHAR(1000), 
    image_path VARCHAR(255),
    FOREIGN KEY (genre_id) REFERENCES genres(id),
    FOREIGN KEY (publisher_id) REFERENCES publishers(id));

INSERT INTO products(title, author, price, genre_id, publisher_id, image_path) values
    ('Dziady', 'Adam Mickiewicz', 40, 1, 2, './images/book1.jpeg'),
    ('Autostopem przez galaktykę', 'Douglas Adams', 42, 3, 4, './images/book2.jpeg'),
    ('Kolor magii', 'Terry Pratchett', 150, 2, 5, './images/book3.jpeg'),
    ('Władca pierścieni', 'Tolkien', 35.50, 2, 3, NULL);
