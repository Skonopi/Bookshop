CREATE TABLE products (
      id SERIAL PRIMARY KEY, 
      title VARCHAR(255), author VARCHAR(100), 
      price FLOAT, genre VARCHAR(50), 
      publisher VARCHAR(50), publication_year INT, 
      binding VARCHAR(50), description VARCHAR(1000), 
      image_path VARCHAR(255));
INSERT INTO products(title, author, price, image_path) values
    ('Dziady', 'Adam Mickiewicz', 40, './images/book1.jpeg'),
    ('Autostopem przez galaktykę', 'Douglas Adams', 35, './images/book2.jpeg'),
    ('Kolor magii', 'Terry Pratchett', 150, './images/book3.jpeg'),
    ('Władca pierścieni', 'Tolkien', 35.50, NULL);
