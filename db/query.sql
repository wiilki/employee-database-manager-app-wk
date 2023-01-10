-- VIEW DEPARTMENTS
SELECT
    *
FROM
    department;

-- VIEW ROLES
SELECT
    role.id,
    role.title,
    department.name AS department,
    role.salary
FROM
    role
    JOIN department ON role.department_id = department.id;

-- VIEW EMPLOYEES
SELECT
    e.id,
    e.first_name,
    e.last_name,
    r.title,
    d.name AS department,
    r.salary,
    CONCAT(m.first_name, ' ', m.last_name) AS manager
FROM
    employee e
    LEFT JOIN role r ON e.role_id = r.id
    LEFT JOIN department d ON d.id = r.department_id
    LEFT JOIN employee m ON m.id = e.manager_id;

-- ADD DEPARTMENT
INSERT INTO
    department (id, name)
VALUES
    (0, '${response.name}');

-- ADD ROLE
INSERT INTO
    role (id, title, salary, department_id)
VALUES
    (
        0,
        '${response.title}',
        '${response.salary}',
        '${response.department}'
    );

-- ADD EMPLOYEE
INSERT INTO
    role (id, first_name, last_name, role_id, manager_id)
VALUES
    (
        0,
        '${response.first_name}',
        '${response.last_name}',
        '${response.role}',
        '${response.manager}'
    );

    