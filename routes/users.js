var express = require('express');
var router = express.Router();
const userController = require('../controller/user.controller')
const { upload_pan } = require('../middleware/upload')
const { authenticate_user } = require('../middleware/auth')
const watchListsController = require('../controller/watchLists.controleer')


// /* GET users listing. */
router.get('/', (req, res, next) => {
  res.send('respond with a resource');
});

router.post('/create', upload_pan, userController.createUser)
router.post('/login', userController.login)
router.get('/is-found/:username', userController.isUserExist)
// router.post('/upload-profile/:user_id', upload_profile, userController.add_profile_image)
router.get('/get/:userId', userController.getUser)
router.delete('/delete/:userId', userController.deleteUser)
router.post('/reset-password', userController.resetPassword)

router.post('/watchList/add', watchListsController.add)
router.get('/watchList/get/:userId', watchListsController.getWatchlist)
router.delete('/watchList/remove', watchListsController.removeWatchlist)

module.exports = router;
