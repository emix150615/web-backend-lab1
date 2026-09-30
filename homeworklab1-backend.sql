CREATE DATABASE IF NOT EXISTS library_db; USE library_db;
CREATE TABLE authors (
  id INT AUTO_INCREMENT PRIMARY KEY, 
  author_name VARCHAR(100) NOT NULL, 
  nationality VARCHAR(50) 
);

CREATE TABLE books (
  id INT AUTO_INCREMENT PRIMARY KEY, 
  title VARCHAR(200) NOT NULL, 
  author_id INT NOT NULL, 
  category VARCHAR(50), 
  publish_year INT, 
  FOREIGN KEY (author_id) REFERENCES authors(id) ON DELETE CASCADE 
);

CREATE TABLE borrow_records (
   id INT AUTO_INCREMENT PRIMARY KEY, 
   book_id INT NOT NULL, 
   borrower_name VARCHAR(100) NOT NULL, 
   borrow_date DATE NOT NULL, 
   return_date DATE, 
   FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
);
INSERT INTO authors (author_name, nationality) VALUES 
  ('J.K. Rowling', 'British'), 
  ('Haruki Murakami', 'Japanese'), 
  ('Nguyen Nhat Anh', 'Vietnamese');  
INSERT INTO books (title, author_id, category, publish_year) VALUES 
  ('Harry Potter and the Sorcerer''s Stone', 1, 'Fantasy', 1997), 
  ('Norwegian Wood', 2, 'Novel', 1987), 
  ('Kinh Van Hoa', 3, 'Children', 1995); 
INSERT INTO borrow_records (book_id, borrower_name, borrow_date, return_date) VALUES 
  (1, 'Nguyen Van A', '2026-09-01', '2026-09-15'), 
  (2, 'Tran Thi B', '2026-09-10', NULL), 
  (3, 'Le Van C', '2026-09-20', '2026-09-28');
SELECT 
  b.title AS "Book Title", 
  a.author_name AS "Author Name", 
  br.borrower_name AS "Borrower Name", 
  br.borrow_date AS "Borrow Date" 
FROM borrow_records br 
INNER JOIN books b ON br.book_id = b.id 
INNER JOIN authors a ON b.author_id = a.id;
