var express = require('express');
var grade = require('../src/db/snake_grade');
var router = express.Router();


grade.createGradeTable(function (err, res) {
    if (err) {
        console.log(`create grade table error ${JSON.stringify(err)}`);
    } else {
        console.log(`create grade table ok ${JSON.stringify(res)}`);
    }
})

function query() {
    console.log(`grade query`);
}

function add() {
    console.log(`grade add`)
}

function update() {
    console.log(`grade update`)
}

router.get('/list', query);

router.get('/add', add);

router.get('/update', update);

module.exports = router;