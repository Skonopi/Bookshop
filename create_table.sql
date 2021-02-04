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
    description VARCHAR(2000), 
    image_path VARCHAR(255),
    FOREIGN KEY (genre_id) REFERENCES genres(id),
    FOREIGN KEY (publisher_id) REFERENCES publishers(id));

INSERT INTO products(title, author, price, genre_id, publisher_id, publication_year, image_path, description) values
    ('Dziady', 'Adam Mickiewicz', 40, 1, 2, 1970, './images/book1.jpeg',
    'Dziady Adama Mickiewicza to jeden z najbardziej znanych utworów w literaturze polskiej
     i jednocześnie jedno z dzieł najbardziej reprezentatywnych dla polskiego romantyzmu. 
     Od lat regularnie wystawiane na deskach teatrów całej Polski, czytane przez kolejne pokolenia czytelników, 
     inspirujące twórców i niosące wciąż aktualne treści. Każda z części utworu porusza inne tematy, ale razem 
     tworzą spójną wizję świata rządzonego przez niezmienne prawa boskiej sprawiedliwości i miłosierdzia. - lubimyczytac.pl'),
    ('Autostopem przez galaktykę', 'Douglas Adams', 42, 3, 4, 1966, './images/book2.jpeg',
    'Pewnego dnia młody Ziemianin Arthur dowiaduje się z zaskoczeniem, że jego najbliższy przyjaciel Ford jest kosmitą, 
    a Ziemia niemal za chwilę zostanie zniszczona, gdyż znajduje się na trasie planowanej międzygalaktycznej autostrady. 
    Jak mu przekazuje beznamiętnie przyjaciel, informacja o tych planach została już dośc dawno wywieszona w jakimś galaktycznym 
    urzędzie na planecie Alfa Centauri, tyle że Ziemianie ich nie oprotestowali, co oznacza że wyrażają zgodę. 
    Unicestwienie ojczystej planety oraz zagłada całego ludzkiego gatunku to dla Arthura dopiero początek niesamowitych przygód, 
    albowiem tuż przed katastrofą Ford zabiera go statkiem kosmicznym w podróż po Galaktyce, w trakcie której zbiera materiały do 
    nowej edycji kompendium wszelkiej znanej wiedzy, czyli przewodnika Autostopem przez Galaktykę. W trakcie tej niekończącej się podróży, 
    odbywanej między innymi w towarzystwie neurotycznego robota Marvina, 
    Arthur spróbuje rozwiązać największą zagadkę kosmosu oraz spróbuje pojąć sens życia. - lubimyczytac.pl'),
    ('Kolor magii', 'Terry Pratchett', 150, 2, 5, 1989, './images/book3.jpeg', NULL),
    ('Władca pierścieni', 'Tolkien', 35.50, 2, 3, 1950, NULL, NULL),
    ('Przygody Sherlocka Holmesa', 'Sir Arthur Conan Doyle', 70, 6, 1, 1890, './images/book1.jpeg', NULL),
    ('Księga przypadków Sherlocka Holmesa', 'Sir Arthur Conan Doyle', 69.99, 6, 1, 1895, './images/book2.jpeg', NULL),
    ('Marsjanin', 'Andy Weir', 42.39, 2, 3, 2010, './images/book3.jpeg',
    'Mark Watney kilka dni temu był jednym z pierwszych ludzi, którzy stanęli na Marsie.
    Teraz jest pewien, że będzie pierwszym, który tam umrze!
    Straszliwa burza piaskowa sprawia, że marsjańska ekspedycja, w której skład wchodzi Mark Watney, 
    musi ratować się ucieczką z Czerwonej Planety. Kiedy ciężko ranny Mark odzyskuje przytomność, stwierdza, że został na 
    Marsie sam w zdewastowanym przez wichurę obozie, z minimalnymi zapasami powietrza i żywności, 
    a na dodatek bez łączności z Ziemią. - lubimyczytac.pl'),
    ('Kosmiczny poradnik życia na Ziemi', 'Chris Hadfield', 28, 4, 3, 2015, NULL,
    'Chris Hadfield już jako mały chłopiec marzył o podróżach kosmicznych. W kosmosie spędził prawie 4000 godzin. 
    Podczas swoich licznych misji musiał między innymi włamać się do stacji kosmicznej z pomocą żołnierskiego noża; 
    wyrzucić żywego węża z kabiny samolotu, który właśnie pilotował; został też na pewien czas oślepiony podczas „spaceru” na orbicie i 
    do promu kosmicznego wracał po omacku. Do najniebezpieczniejszych zdarzeń potrafi podejść z rozbrajającym dystansem. - lubimyczytac.pl'),
    ('Ostatni oddech Cezara', 'Sam Kean', 39.99, 5, 3, 2012, './images/book1.jpeg', NULL),
    ('Dziwne przypadki ludzkiego mózgu', 'Sam Kean', 39.99, 5, 3, 2015, './images/book2.jpeg', NULL),
    ('Felix, Net i Nika', 'Rafał Kosik', 33.33, 3, 4, 2008, './images/book3.jpeg',
    'Felix, Net i Nika jadą na zimowisko do pensjonatu „Trzy kuzynki”, położonego w lesie, w górach na odludziu, 
    a prowadzonego przez bardzo dziwne starsze panie. Stare meble i przedziwne obrazy tworzą niezwykłą atmosferę, 
    a naprawdę strasznie zaczyna się robić, kiedy nocą ktoś chodzi po domu, 
    pozostawiając przerażonym gimnazjalistom dziwne niespodzianki. - lubimyczytac.pl'),
    ('Pan raczy żartować, panie Feynman', 'Richard Feynman', 47, 4, 4, 1971, './images/book1.jpeg', NULL),
    ('Morderstwo w Orient Expressie', 'Agatha Christie', 18.50, 6, 5, 1920, './images/book2.jpeg', NULL),
    ('Morderstwo odbędzie się', 'Agatha Christie', 21, 6, 5, 1925, './images/book3.jpeg', NULL);

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
