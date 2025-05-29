const express = require('express');
const { add, index, view, deleteData, deleteMany } = require('./meeting');
const router = express.Router();

router.post('/add', add);
router.get('/', index);
router.get('/view/:id', view);
router.delete('/delete/:id', deleteData);
router.post('/deleteMany', deleteMany);

module.exports = router