const router = require('express').Router();
const auth = require('../middleware/auth');
const c = require('../controllers/reportsController');
router.use(auth);
router.get('/daily', c.daily);
router.get('/month-to-date', c.monthToDate);
router.get('/previous-month', c.previousMonth);
module.exports = router;
