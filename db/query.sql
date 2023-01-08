-- VIEW DEPARTMENTS
SELECT * FROM department;

-- VIEW ROLES
SELECT role.id, role.title, department.name AS department, role.salary FROM role JOIN department ON role.department_id = department.id;

-- VIEW EMPLOYEES
SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department, role.salary, employee.manager_id AS manager FROM employee INNER JOIN role ON employee.id = role.id INNER JOIN department ON role.department_id = department.id;