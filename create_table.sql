DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS genres;
DROP TABLE IF EXISTS publishers;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS roles;

CREATE TABLE genres (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50));

INSERT INTO genres(name) values
    ('Literatura piękna'),
    ('Fantastyka'),
    ('Science-Fiction'),
    ('Biografia'),
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
    ('Władca pierścieni', 'Tolkien', 35.50, 2, 3, NULL),
    ('Przygody Sherlocka Holemesa', 'Sir Arthur Conan Doyle', 70, 6, 1, './images/book1.jpeg'),
    ('Księga przypadków Sherlocka Holmesa', 'Sir Arthur Conan Doyle', 69.99, 6, 1, './images/book2.jpeg'),
    ('Marsjanin', 'Andy Weir', 42.39, 2, 3, './images/book3.jpeg'),
    ('Kosmiczny poradnik życia na Ziemi', 'Chris Hadfield', 28, 4, 3, NULL),
    ('Ostatni oddech Cezara', 'Sam Kean', 39.99, 5, 3, './images/book1.jpeg'),
    ('Dziwne przypadki ludzkiego mózgu', 'Sam Kean', 39.99, 5, 3, './images/book2.jpeg'),
    ('Felix, Net i Nika', 'Rafał Kosik', 33.33, 3, 4, './images/book3.jpeg'),
    ('Pan raczy żartować, panie Feynman', 'Richard Feynman', 47, 4, 4, './images/book1.jpeg'),
    ('Morderstwo w Orient Expressie', 'Agatha Christie', 18.50, 6, 5, './images/book2.jpeg'),
    ('Morderstwo odbędzie się', 'Agatha Christie', 21, 6, 5, './images/book3.jpeg');

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
    FOREIGN KEY (role_id) REFERENCES roles(id));

INSERT INTO users (mail, nickname,  name, surname, password, role_id) values
    ('sherlock.holmes@gmail.com', 'detective', 'Sherlock', 'Holmes', '$2b$12$Rk4lSzq2na7wNVOVgxWgkOxaadIpsNOWY143i8d6O3t4xU81M425S', 2),
    ('john.watson@wp.pl', 'doctor', 'John', 'Watson', '$2b$12$sVbpxO92.iuiR6HXBpVXaeeFEy9P.o.QU8K67u6eumOg3xYx.v9vG', 1),
    ('mrshudson@o2.pl', 'landlady', 'Martha', 'Hudson', '$2b$12$P5b4lrfUyNorRwtt1d/Y8OLoCTRx5YYck3Yd7LPjokPCP7ZpBqkFm', 1),
    ('toby@gmail.com', 'woof', 'Toby', 'Sherman', '$2b$12$P5b4lrfUyNorRwtt1d/Y8OLoCTRx5YYck3Yd7LPjokPCP7ZpBqkFm', 1);
