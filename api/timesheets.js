const express = require('express');
const timesheetsRouter = express.Router({mergeParams: true});

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

timesheetsRouter.param('timesheetId', (req, res, next, id) => {
  db.get('SELECT * FROM Timesheet WHERE id = $id', {
    $id: id
  }, (error, row) => {
    if (error) {
      res.sendStatus(500);
    } else if (!row) {
      res.status(404).send('Timesheet not found');
    } else {
      req.timesheet = row;
      next();
    }
  });
});

timesheetsRouter.get('/', (req, res, next) => {
  db.all('SELECT * FROM Timesheet WHERE employee_id = $employeeId', {
    $employeeId: req.params.employeeId
  }, (error, rows) => {
    if (error) {
      res.sendStatus(500);
    }
    res.status(200).json({timesheets: rows});
  });
});

timesheetsRouter.post('/', (req, res, next) => {
  const hours = req.body.timesheet.hours;
  const rate = req.body.timesheet.rate;
  const date = req.body.timesheet.date;
  const employeeId = req.params.employeeId;
  if (!hours || !rate || !date || !employeeId) {
    res.status(400).send('Required fields are missing');
  }
  db.run('INSERT INTO Timesheet (hours, rate, date, employee_id) VALUES ($hours, $rate, $date, $employeeId)', {
    $hours: hours,
    $rate: rate,
    $date: date,
    $employeeId: employeeId
  }, function(error) {
    if (error) {
      res.sendStatus(500);
    }
    db.get(`SELECT * FROM Timesheet WHERE id = ${this.lastID}`, (error, row) => {
      if (error) {
        res.sendStatus(500);
      }
      res.status(201).json({timesheet: row});
    });
  });
});

timesheetsRouter.put('/:timesheetId', (req, res, next) => {
  const hours = req.body.timesheet.hours;
  const rate = req.body.timesheet.rate;
  const date = req.body.timesheet.date;
  const employeeId = req.params.employeeId;
  if (!hours || !rate || !date || !employeeId) {
    res.status(400).send('Required fields are missing');
  }
  db.run('UPDATE Timesheet SET hours = $hours, rate = $rate, date = $date, employee_id = $employeeId WHERE id = $id', {
    $id: req.params.timesheetId,
    $hours: hours,
    $rate: rate,
    $date: date,
    $employeeId: employeeId
  }, function(error) {
    if (error) {
      res.sendStatus(500);
    }
    db.get('SELECT * FROM Timesheet WHERE id = $id', {
      $id: req.params.timesheetId
    }, (error, row) => {
      if (error) {
        res.sendStatus(500);
      }
      res.status(200).json({timesheet: row});
    });
  });
});

timesheetsRouter.delete('/:timesheetId', (req, res, next) => {
  db.run('DELETE FROM Timesheet WHERE id = $id', {
    $id: req.params.timesheetId
  }, function(error) {
    if (error) {
      res.sendStatus(500);
    }
    res.status(204).send();
  });
});

module.exports = timesheetsRouter;
