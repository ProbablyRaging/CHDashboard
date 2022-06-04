const router = require('express').Router();
const passport = require('passport');
require('../strategies/google_strategy')(passport);

// Auth root
router.get('/', passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/youtube.force-ssl'], accessType: 'offline', responseType: 'code' }));

// Redirect
router.get('/callback', passport.authenticate('google', { session: false }),
    (req, res) => {
        res.redirect('/creatorcrew');
    }
);

module.exports = router;