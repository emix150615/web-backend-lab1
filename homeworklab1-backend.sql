CREATE DATABASE IF NOT EXISTS library_db;
USE library_db;
CREATE TABLE authors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    author_name VARCHAR(100) NOT NULL,
    nationality VARCHAR(50)
);
