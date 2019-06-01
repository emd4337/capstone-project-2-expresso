const express = require('express');
const itemsRouter = express.Router({mergeParams: true});

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

itemsRouter.param('menuItemId', (req, res, next, id) => {
  db.get('SELECT * FROM MenuItem WHERE id = $id', {
    $id: id
  }, (error, row) => {
    if (error) {
      res.sendStatus(500);
    } else if (!row) {
      res.status(404).send('Menu item not found');
    } else {
      req.menuItem = row;
      next();
    }
  });
});

itemsRouter.get('/', (req, res, next) => {
  db.all('SELECT * FROM MenuItem WHERE menu_id = $menuId', {
    $menuId: req.params.menuId
  }, (error, rows) => {
    if (error) {
      res.sendStatus(500);
    }
    res.status(200).json({menuItems: rows});
  });
});

itemsRouter.post('/', (req, res, next) => {
  const name = req.body.menuItem.name;
  const description = req.body.menuItem.description || '';
  const inventory = req.body.menuItem.inventory;
  const price = req.body.menuItem.price;
  const menuId = req.params.menuId;
  if (!name || !inventory || !price || !menuId) {
    res.status(400).send('Required fields are missing');
  }
  db.run('INSERT INTO MenuItem (name, description, inventory, price, menu_id) VALUES ($name, $description, $inventory, $price, $menuId)', {
    $name: name,
    $description: description,
    $inventory: inventory,
    $price: price,
    $menuId: menuId
  }, function(error) {
    if (error) {
      res.sendStatus(500);
    }
    db.get(`SELECT * FROM MenuItem WHERE id = ${this.lastID}`, (error, row) => {
      if (error) {
        res.sendStatus(500);
      }
      res.status(201).json({menuItem: row});
    });
  });
});

itemsRouter.put('/:menuItemId', (req, res, next) => {
  const name = req.body.menuItem.name;
  const description = req.body.menuItem.description || '';
  const inventory = req.body.menuItem.inventory;
  const price = req.body.menuItem.price;
  const menuId = req.params.menuId;
  if (!name || !inventory || !price || !menuId) {
    res.status(400).send('Required fields are missing');
  }
  db.run('UPDATE MenuItem SET name = $name, description = $description, inventory = $inventory, price = $price, menu_id = $menuId WHERE id = $id', {
    $id: req.params.menuItemId,
    $name: name,
    $description: description,
    $inventory: inventory,
    $price: price,
    $menuId: menuId
  }, function(error) {
    if (error) {
      res.sendStatus(500);
    }
    db.get('SELECT * FROM MenuItem WHERE id = $id', {
      $id: req.params.menuItemId
    }, (error, row) => {
      if (error) {
        res.sendStatus(500);
      }
      res.status(200).json({menuItem: row});
    });
  });
});

itemsRouter.delete('/:menuItemId', (req, res, next) => {
  db.run('DELETE FROM MenuItem WHERE id = $id', {
    $id: req.params.menuItemId
  }, function(error) {
    if (error) {
      res.sendStatus(500);
    }
    res.status(204).send();
  });
});

module.exports = itemsRouter;
