var sqlite3 = require('sqlite3');
var db = new sqlite3.Database('./database.sqlite');

const createEmployeeTable = () => {
  db.serialize(function() {
    db.run(`DROP TABLE IF EXISTS Employee`);
    db.run(`CREATE TABLE Employee (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      position TEXT NOT NULL,
      wage INTEGER NOT NULL,
      is_current_employee INTEGER DEFAULT 1)`);
  });
};

const createTimesheetTable = () => {
  db.serialize(function() {
    db.run(`DROP TABLE IF EXISTS Timesheet`);
    db.run(`CREATE TABLE Timesheet (
      id INTEGER PRIMARY KEY,
      hours INTEGER NOT NULL,
      rate INTEGER NOT NULL,
      date INTEGER NOT NULL,
      employee_id INTEGER NOT NULL,
      FOREIGN KEY (employee_id) REFERENCES Employee (id))`);
  });
};

const createMenuTable = () => {
  db.serialize(function() {
    db.run(`DROP TABLE IF EXISTS Menu`);
    db.run(`CREATE TABLE Menu (
      id INTEGER PRIMARY KEY,
      title TEXT NOT NULL)`);
  });
};

const createMenuItemTable = () => {
  db.serialize(function() {
    db.run(`DROP TABLE IF EXISTS MenuItem`);
    db.run(`CREATE TABLE MenuItem (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      inventory INTEGER NOT NULL,
      price INTEGER NOT NULL,
      menu_id INTEGER NOT NULL,
      FOREIGN KEY (menu_id) REFERENCES Menu (id))`);
  });
};

createEmployeeTable();
createTimesheetTable();
createMenuTable();
createMenuItemTable();
