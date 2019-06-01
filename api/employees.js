const express = require('express');
const employeesRouter = express.Router();

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

const timesheetsRouter = require('./timesheets');

employeesRouter.param('employeeId', (req, res, next, id) => {
  db.get('SELECT * FROM Employee WHERE id = $id', {
    $id: id
  }, (error, row) => {
    if (error) {
      res.sendStatus(500);
    } else if (!row) {
      res.status(404).send('Employee not found');
    } else {
      req.employee = row;
      next();
    }
  });
});

employeesRouter.use('/:employeeId/timesheets/', timesheetsRouter);

employeesRouter.get('/', (req, res, next) => {
  db.all('SELECT * FROM Employee WHERE is_current_employee = 1', (error, rows) => {
    if (error) {
      res.sendStatus(500);
    }
    res.status(200).json({employees: rows});
  });
});

employeesRouter.post('/', (req, res, next) => {
  const name = req.body.employee.name;
  const position = req.body.employee.position;
  const wage = req.body.employee.wage;
  const isCurrentEmployee = req.body.employee.isCurrentEmployee === 0 ? 0 : 1;
  if (!name || !position || !wage) {
    res.status(400).send('Required fields are missing');
  }
  db.run('INSERT INTO Employee (name, position, wage, is_current_employee) VALUES ($name, $position, $wage, $isCurrentEmployee)', {
    $name: name,
    $position: position,
    $wage: wage,
    $isCurrentEmployee: isCurrentEmployee
  }, function(error) {
    if (error) {
      res.sendStatus(500);
    }
    db.get(`SELECT * FROM Employee WHERE id = ${this.lastID}`, (error, row) => {
      if (error) {
        res.sendStatus(500);
      }
      res.status(201).json({employee: row});
    });
  });
});

employeesRouter.get('/:employeeId', (req, res, next) => {
  res.status(200).json({employee: req.employee});
});

employeesRouter.put('/:employeeId', (req, res, next) => {
  const name = req.body.employee.name;
  const position = req.body.employee.position;
  const wage = req.body.employee.wage;
  const isCurrentEmployee = req.body.employee.isCurrentEmployee === 0 ? 0 : 1;
  if (!name || !position || !wage) {
    res.status(400).send('Required fields are missing');
  }
  db.run('UPDATE Employee SET name = $name, position = $position, wage = $wage, is_current_employee = $isCurrentEmployee WHERE id = $id', {
    $id: req.params.employeeId,
    $name: name,
    $position: position,
    $wage: wage,
    $isCurrentEmployee: isCurrentEmployee
  }, function(error) {
    if (error) {
      res.sendStatus(500);
    }
    db.get('SELECT * FROM Employee WHERE id = $id', {
      $id: req.params.employeeId
    }, (error, row) => {
      if (error) {
        res.sendStatus(500);
      }
      res.status(200).json({employee: row});
    });
  });
});

employeesRouter.delete('/:employeeId', (req, res, next) => {
  db.run('UPDATE Employee SET is_current_employee = 0 WHERE id = $id', {
    $id: req.params.employeeId
  }, function(error) {
    if (error) {
      res.sendStatus(500);
    }
    db.get('SELECT * FROM Employee WHERE id = $id', {
      $id: req.params.employeeId
    }, (error, row) => {
      if (error) {
        res.sendStatus(500);
      }
      res.status(200).json({employee: row});
    });
  });
});

module.exports = employeesRouter;
