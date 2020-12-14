const express = require('express');
const router = express.Router();
const { v4: uuidV4 } = require('uuid');

router.get('/', function (req, res) {
    res.render('index.html');
});

router.get('/login', function (req, res) {
    res.render('login.html');
});

router.get('/register', function (req, res) {
    res.render('register.html');
});
router.get('/main', function (req, res) {
    if (!req.session.user) res.redirect('/login');
    else {
        console.log(req.session);
        console.log('userid:', req.session.user.id);
        res.render('index1', {
            userid: req.session.user.id,
            username: req.session.user.name
        });
    }
});

router.get("/logout", function (req, res) {
    if (req.session.user) {
        req.session.destroy(
            function (err) {
                if (err) {
                    console.log("log out session error");
                    return;
                }
                console.log("log out");
                res.redirect("/");
            }
        );

    } else {
        console.log("no session");
        res.redirect('/login');
    }
});

router.get('/room/create', (req, res) => {
    res.redirect(`/room/${uuidV4()}/host`);
});

router.get('/room', (req, res) => {
    res.redirect(`/room/${uuidV4()}`);
});

router.get('/room/:room/host', (req, res) => {
    const user = req.session.user;
    if (!user) {
        res.redirect('/login');
    } else {
        res.render('professor', { roomID: req.params.room, username: user.name});
    }
});

router.get('/room/:room', (req, res) => {
    const user = req.session.user;
    if (!user) {
        res.redirect('/login');
    } else {
        res.render('student', { roomID: req.params.room, username: user.name });
    }
});

router.get('/room/:room/mobile', (req,res) => {
    const user = req.session.user;;
    if (!user) {
        res.redirect('/login');
    } else {
        res.render('Mobile_Speaker', { roomID: req.params.room, username: user.name });
    }
});

module.exports = router;