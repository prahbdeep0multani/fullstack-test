const express = require('express');
const controller = require('../controllers/users');
const { isAuth } = require('../middlewares/isAuth');
const rbac = require('../middlewares/rbac');
const { validator } = require('../middlewares/validator');

const router = express.Router({ mergeParams: true });

router.route('/').get(isAuth, rbac('users', 'read'), controller.getByCompany);

router.route('/:id').delete(validator({ params: 'id' }), isAuth, rbac('users', 'delete'), controller.delete);

module.exports = router;
