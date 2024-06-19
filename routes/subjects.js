const express = require('express');

const router = express.Router();

const subjectController = require('../controllers/subjects');

const isAuth = require('../middleware/is-auth');

router.get("/subjects/:subId", isAuth , subjectController.getSubjectDetails);


module.exports = router;
