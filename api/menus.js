const express = require('express');
const menuRouter = express.Router();

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

const itemsRouter = require('./items');

menuRouter.param('menuId', (req, res, next, id) => {
  db.get('SELECT * FROM Menu WHERE id = $id', {
    $id: id
  }, (error, row) => {
    if (error) {
      res.sendStatus(500);
    } else if (!row) {
      res.status(404).send('Menu not found');
    } else {
      req.menu = row;
      next();
    }
  });
});

menuRouter.use('/:menuId/menu-items/', itemsRouter);

menuRouter.get('/', (req, res, next) => {
  db.all('SELECT * FROM Menu', (error, rows) => {
    if (error) {
      res.sendStatus(500);
    }
    res.status(200).json({menus: rows});
  });
});

menuRouter.post('/', (req, res, next) => {
  const title = req.body.menu.title;
  if (!title) {
    res.status(400).send('Required fields are missing');
  }
  db.run('INSERT INTO Menu (title) VALUES ($title)', {
    $title: title
  }, function(error) {
    if (error) {
      res.sendStatus(500);
    }
    db.get(`SELECT * FROM Menu WHERE id = ${this.lastID}`, (error, row) => {
      if (error) {
        res.sendStatus(500);
      }
      res.status(201).json({menu: row});
    });
  });
});

menuRouter.get('/:menuId', (req, res, next) => {
  res.status(200).json({menu: req.menu});
});

menuRouter.put('/:menuId', (req, res, next) => {
  const title = req.body.menu.title;
  if (!title) {
    res.status(400).send('Required fields are missing');
  }
  db.run('UPDATE Menu SET title = $title WHERE id = $id', {
    $id: req.params.menuId,
    $title: title
  }, function(error) {
    if (error) {
      res.sendStatus(500);
    }
    db.get('SELECT * FROM Menu WHERE id = $id', {
      $id: req.params.menuId
    }, (error, row) => {
      if (error) {
        res.sendStatus(500);
      }
      res.status(200).json({menu: row});
    });
  });
});

menuRouter.delete('/:menuId', (req, res, next) => {
  db.get('SELECT * FROM MenuItem WHERE menu_id = $menuId', {
    $menuId: req.params.menuId
  }, (error, row) => {
    if (error) {
      res.sendStatus(500);
    } else if (row) {
      res.status(400).send('Cannot delete menu with related menu items');
    } else {
      db.run('DELETE FROM Menu WHERE id = $id', {
        $id: req.params.menuId
      }, function(error) {
        if (error) {
          res.sendStatus(500);
        }
        res.status(204).send();
      });
    }
  });
});

module.exports = menuRouter;
