const express = require('express');
const router = express.Router();
const { v4: uuidV4 } = require('uuid');

router.get('/', (req, res) => {
    res.render('index');
});

router.get('/room/create', (req, res) => {
    res.redirect(`/room/${uuidV4()}/host`);
});

router.get('/room', (req, res) => {
    res.redirect(`/room/${uuidV4()}`);
});

router.get('/room/:room/host', (req, res) => {
    res.render('professor', { roomID: req.params.room, userID: `${uuidV4()}` });
});

router.get('/room/:room', (req, res) => {
    res.render('student', { roomID: req.params.room, userID: `${uuidV4()}` });
});

module.exports = router;