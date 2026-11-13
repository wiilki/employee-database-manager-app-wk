# Northstar People

A rebuilt employee database manager with a modern, responsive browser frontend and a safer MySQL command-line manager. Originally a terminal-only employee tracker; now a portfolio-ready people operations dashboard.

## Browser dashboard

The published website is **a demo, not a live employee database**. It starts with 18 fictional sample employees. You can safely explore:

- **Overview:** headcount, workforce status, payroll estimates, distribution charts, and recent hires.
- **People directory:** search, filter, and sort by name, email, role, department, status, and salary.
- **Employee editor:** create, update, and delete sample employees; edit manager, job role, status, and start date.
- **Departments:** create/edit departments, see team sizes, and compare payroll to annual budgets.
- **Job roles:** create/edit roles, adjust salary values, and manage role assignments.
- **Analytics:** salary totals, average compensation, and budget utilization.
- **CSV export:** download the current directory (spreadsheet formula-injection safe).
- **Responsive layout:** designed for desktop, tablet, and mobile.

All demo edits are saved using **localStorage in your own browser**. Changes are not shared across devices, do not affect MySQL, and can be reset with **Reset demo**. Clearing browser storage resets data. The demo contains no real employee records and no backend credentials.

### Run the frontend locally

Requires Node.js 18 or later.

~~~sh
npm run dev
~~~

Open http://localhost:4173 in a browser. The static site has no frontend dependencies and does not require MySQL.

### Build

~~~sh
npm run build
npm test
~~~

Only index.html, styles.css, and app.js are copied into dist/. Vercel deploys dist/ and does not publish the database scripts, CLI, or configuration examples.

## MySQL command-line manager

The original MySQL employee/role/department data model is preserved in db/schema.sql and db/seeds.sql. The command-line tool has been rewritten to use **bound SQL parameters**, environment-based credentials, async/await, basic validation, and reliable connection shutdown.

To set up a **fresh local database**:

1. Install MySQL 8+ and Node.js 18+.
2. Import db/schema.sql and then db/seeds.sql into your local MySQL instance. Do **not** import seed records into a real employee database.
3. Set your credentials as environment variables. On macOS Terminal:

~~~sh
export DB_HOST=127.0.0.1
export DB_PORT=3306
export DB_USER=root
export DB_NAME=staff_db
export DB_PASSWORD='your-local-mysql-password'
npm install
npm start
~~~

There is deliberately no default password. The CLI has no internet-facing endpoint and is distinct from the browser demonstration.

**Security note:** The legacy repository's commit history contained a hard-coded MySQL password. Removing it from the current source **does not remove it from Git history**. If that password was ever used, **rotate it**. Never commit database passwords or a populated .env file.

## Architecture and production readiness

- Browser: HTML, CSS, and vanilla JavaScript, with localStorage for fictional sample data.
- CLI: Node.js, Inquirer, mysql2, MySQL; credentials passed through environment variables.
- Deployment: Vercel static build, CSP, and hardened response headers.
- Tests: Node's built-in test runner plus a JavaScript syntax check.

**For real HR data**, do not use the public demo. Before connecting real records, add authenticated role-based access, HTTPS-only server APIs, persistent storage with secure credentials, audit logs, and backups. Client-side localStorage is not an appropriate database for confidential employee information.

## Database schema

Local tables remain department, role, and employee. The schema avoids an unconditional DROP DATABASE and stores salary with an explicit DECIMAL(12,2). Re-running the schema does not migrate existing tables; back up and handle schema migrations separately.

## Licensing

MIT. Fictional Northstar Studio data is included for demonstration only.
