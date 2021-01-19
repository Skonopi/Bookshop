# Bookshop
Final project for "Selected Elements of Objective Programming Practice"

https://uniwroc-my.sharepoint.com/:w:/g/personal/310566_uwr_edu_pl/EbrY35Gxc1VGkah_ZtSFIy0Bvyvxgm_0B6X8aRBPDqh3Ew?e=sUBZoB

Aby uruchomić aplikację, należy pobrać PostgreSQL.
```
sudo apt install postgresql postgresql-client-common
sudo -u postgres psql
```
Następnie stworzyć bazę poleceniami (podać hasło użytkownika app "password")
```
sudo -u postgres psql -f create_database.sql
psql -U app -d shop -h localhost -f create_table.sql
```
Na koniec zainstalować moduł `pg` poleceniem
`sudo npm install pg`.

Zdjęcia pochodzą z domeny publicznej.
