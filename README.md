justfolks_cobe
=======================================

# Install
----------
## 1. MySQL

### sudo apt install mysql-server-5.7
```
CREATE DATABASE cobe CHARACTER SET utf8 COLLATE utf8_bin;
CREATE USER 'cobe'@'%' IDENTIFIED BY 'cobe1q2w3e4r!' PASSWORD EXPIRE NEVER;
GRANT ALL PRIVILEGES ON cobe.* TO 'cobe'@'%';
```
### sudo vi /etc/mysql/my.cnf
```
[client]
default-character-set = utf8
[mysqld]
init_connect = SET collation_connection = utf8_general_ci
init_connect = SET NAMES utf8
character-set-server = utf8
collation-server = utf8_general_ci
[mysqldump]
default-character-set = utf8
[mysql]
default-character-set = utf8
```
### sudo vi /etc/mysql/mysql.conf.d/mysqld.cnf
```
port            = 3082
#bind-address           = 127.0.0.1
```
### sudo service mysql restart
### Firewall (AWS)
### restore database
```
mysql -u root -p cobe < [filename].sql
```


## 2. Install Redis
sudo apt install redis
