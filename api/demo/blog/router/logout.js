var express = require('express');
var router = express.Router();

router.get('/', (req, res) => {
    req.session.userName = null;
    res.json({ code: 1, msg: 'successed logout' })
})

module.exports = router;