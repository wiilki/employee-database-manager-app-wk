-- For a NEW local database only. Back up existing data before changing schemas.
-- No DROP DATABASE: re-running this schema will not delete stored records.
CREATE DATABASE IF NOT EXISTS staff_db;
USE staff_db;

CREATE TABLE IF NOT EXISTS department (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(60) NOT NULL UNIQUE
);
CREATE TABLE IF NOT EXISTS role (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(80) NOT NULL,
  salary DECIMAL(12,2) NOT NULL,
  department_id INT NULL,
  CONSTRAINT fk_role_department FOREIGN KEY (department_id) REFERENCES department(id)
    ON DELETE SET NULL
);
CREATE TABLE IF NOT EXISTS employee (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(60) NOT NULL,
  last_name VARCHAR(60) NOT NULL,
  role_id INT NULL,
  manager_id INT NULL,
  CONSTRAINT fk_employee_role FOREIGN KEY (role_id) REFERENCES role(id)
    ON DELETE SET NULL,
  CONSTRAINT fk_employee_manager FOREIGN KEY (manager_id) REFERENCES employee(id)
    ON DELETE SET NULL
);
