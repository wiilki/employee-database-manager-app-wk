-- VIEW ROLES
ELECT role.id, role.title, department.name AS department, role.salary FROM role JOIN department ON role.department_id = department.id;