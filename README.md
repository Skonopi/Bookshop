# Bookshop
Final project for "Selected Elements of Objective Programming Practice"

Autorzy:
Anna Pacanowska 306412
Filip Knefel 310566
Maja Orłowska 310310

Nasza aplikacja to międzynarodowa księgarnia online. 
Dla klienta:
-przeglądanie zawartości sklepu
-wyszukiwanie po tytule, autorze i opisie
-filtrowanie wyświetlanych książek
-rejestracja i logowanie
-dodawanie książek do koszyka, składanie zamówienia
-informacje o koncie
-przeglądanie zamówień
-informacje szczegółowe o książce

Dla administratora:
-dodawanie, edytowanie i usuwanie książek
-przeglądanie listy użytkowników, usuwanie ich
-przeglądanie zamówień

Link do aplikacji: https://evening-cove-23598.herokuapp.com/

Klient: 
login: john.watson@wp.pl hasło:123
Administrator:
login: sherlock.holmes@gmail.com hasło:abc

Aby uruchomić aplikację lokalnie, należy:

- pobrać PostgreSQL.
```
sudo apt install postgresql postgresql-client-common
```
- stworzyć bazę poleceniami (podać hasło użytkownika app "password")
```
sudo -u postgres psql -f create_database.sql
psql -U app -d shop -h localhost -f create_table.sql
```
- zainstalować potrzebne moduły w folderze repozytorium poleceniem
`sudo npm install`.

- uruchomić `node server.js`

Zdjęcia pochodzą z domeny publicznej.
