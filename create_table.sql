DROP TABLE IF EXISTS OrdersProducts;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS genres;
DROP TABLE IF EXISTS publishers;
DROP TABLE IF EXISTS roles;

SET datestyle = dmy;

CREATE TABLE genres (
    id SERIAL PRIMARY KEY,
    genre VARCHAR(50));

INSERT INTO genres(genre) values
    ('Literatura piękna'),
    ('Fantastyka'),
    ('Science-Fiction'),
    ('Biografia'),
    ('Popularnonaukowa'),
    ('Kryminał'),
    ('Sensacja');

CREATE TABLE publishers (
    id SERIAL PRIMARY KEY,
    publisher VARCHAR(50));

INSERT INTO publishers(publisher) values
    ('PWN'),
    ('Wydawnictwo literackie'),
    ('Czarna owca'),
    ('Wydawnictwo Poznańskie'),
    ('Wydawnictwo ABC');

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

INSERT INTO products(title, author, price, genre_id, publisher_id, publication_year, image_path) values
    ('Dziady', 'Adam Mickiewicz', 40, 1, 2, 1970, './images/book1.jpeg'),
    ('Autostopem przez galaktykę', 'Douglas Adams', 42, 3, 4, 1966, './images/book2.jpeg'),
    ('Kolor magii', 'Terry Pratchett', 150, 2, 5, 1989, './images/book3.jpeg'),
    ('Władca pierścieni', 'Tolkien', 35.50, 2, 3, 1950, NULL),
    ('Przygody Sherlocka Holmesa', 'Sir Arthur Conan Doyle', 70, 6, 1, 1890, './images/book1.jpeg'),
    ('Księga przypadków Sherlocka Holmesa', 'Sir Arthur Conan Doyle', 69.99, 6, 1, 1895, './images/book2.jpeg'),
    ('Marsjanin', 'Andy Weir', 42.39, 2, 3, 2010, './images/book3.jpeg'),
    ('Kosmiczny poradnik życia na Ziemi', 'Chris Hadfield', 28, 4, 3, 2015, NULL),
    ('Ostatni oddech Cezara', 'Sam Kean', 39.99, 5, 3, 2012, './images/book1.jpeg'),
    ('Dziwne przypadki ludzkiego mózgu', 'Sam Kean', 39.99, 5, 3, 2015, './images/book2.jpeg'),
    ('Felix, Net i Nika', 'Rafał Kosik', 33.33, 3, 4, 2008, './images/book3.jpeg'),
    ('Pan raczy żartować, panie Feynman', 'Richard Feynman', 47, 4, 4, 1971, './images/book1.jpeg'),
    ('Morderstwo w Orient Expressie', 'Agatha Christie', 18.50, 6, 5, 1920, './images/book2.jpeg'),
    ('Morderstwo odbędzie się', 'Agatha Christie', 21, 6, 5, 1925, './images/book3.jpeg');

CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    role VARCHAR(50));

INSERT INTO roles(role) values 
    ('client'), 
    ('admin');

CREATE TABLE users (
    id SERIAL PRIMARY KEY, 
    mail VARCHAR(100) UNIQUE, 
    nickname VARCHAR(100) UNIQUE, 
    name VARCHAR(100), 
    surname VARCHAR(100), 
    password VARCHAR(100), 
    role_id INT,
    creation_date DATE,
    FOREIGN KEY (role_id) REFERENCES roles(id));

INSERT INTO users (mail, nickname,  name, surname, password, role_id, creation_date) values
    ('sherlock.holmes@gmail.com', 'detective', 'Sherlock', 'Holmes', '$2b$12$WqnY9kq3nbcoeyLsZ3WpS.N7u8nGG1y4s4eUu6nfSQzhyL7oiBXOi', 2, '1.9.2018'),
    ('john.watson@wp.pl', 'doctor', 'John', 'Watson', '$2b$12$WGhsXNTzLWMaPc0uc0QBQupQ143y1uHbwFT/U1llO7s3A.s1S.9wu', 1, '13.7.2019'),
    ('mrshudson@o2.pl', 'landlady', 'Martha', 'Hudson', '$2b$12$7NHf8wWk1xTZvqjSTMrDquTnZjkA8u59fFY.IX3rwOC8CakDhBA2W', 1, '26.9.2019'),
    ('toby@gmail.com', 'woof', 'Toby', 'Sherman', '2b$12$7NHf8wWk1xTZvqjSTMrDquTnZjkA8u59fFY.IX3rwOC8CakDhBA2W', 1, '28.2.2020');

CREATE TABLE orders(
    id SERIAL PRIMARY KEY,
    user_id INT,
    date DATE,
    address VARCHAR(100),
    postal_code VARCHAR(30),
    city VARCHAR(100),
    finished BOOLEAN,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE);

INSERT INTO orders(user_id, date, address, postal_code, city, finished) values
    (2, '14.7.2019', 'Baker Street 221B', '675-12', 'London', true),
    (4, '29.2.2020', 'Archer Street 17', '123-45', 'Derry', false),
    (2, '7.1.2020', 'Central Park', '675-14', 'London', true),
    (3, '27.9.2019', 'Main Street', '456-12', 'Spancill Hill', false);

CREATE TABLE OrdersProducts(
    order_id INT,
    product_id INT,
    number INT,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE);

INSERT INTO OrdersProducts(order_id, product_id, number) values
    (1, 2, 1),
    (1, 4, 2),
    (1, 10, 1),
    (2, 10, 4),
    (3, 7, 1),
    (3, 6, 1),
    (3, 12, 1),
    (4, 6, 1);
