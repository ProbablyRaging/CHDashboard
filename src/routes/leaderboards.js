const router = require('express').Router();
const { isAuthortized } = require('../strategies/auth_check');
const bodyParser = require('body-parser');
const urlencodedParser = bodyParser.urlencoded({ extended: false });
const fetch = require('node-fetch');
const mongo = require('../database/mongodb');
const rankSchema = require('../schema/rank_schema');
const lastletterSchema = require('../schema/lastletter_schema');
const countingSchema = require('../schema/counting_schema');

// Leaderboards root
router.get('/', async (req, res) => {
    res.redirect('/');
});

// Ranks
router.get('/ranks', async (req, res) => {
    if (req.user) {
        mongo.then(async mongo => {
            const results = await rankSchema.find({ 'rank': { $gte: 1, $lt: 101 } }).sort({ 'rank': 1 });

            res.render('ranks', {
                username: `${req.user.username}#${req.user.discriminator}`,
                userId: req.user.userId,
                avatar: req.user.avatar,
                results
            });
        });
    } else {
        res.redirect('/');
    }
});

// Messages
router.get('/messages', async (req, res) => {
    if (req.user) {
        mongo.then(async mongo => {
            const results = await rankSchema.find({ 'rank': { $gte: 1, $lt: 101 } });

            dataArr = [];
            for (const data of results) {
                const { id, username, msgCount, rank, level, avatar, xp } = data;

                dataArr.push({ id, username, msgCount, rank, level, avatar, xp });
            }

            dataArr.sort(function (a, b) {
                return b.msgCount - a.msgCount;
            });

            res.render('messages', {
                username: `${req.user.username}#${req.user.discriminator}`,
                userId: req.user.userId,
                avatar: req.user.avatar,
                dataArr
            });
        });
    } else {
        res.redirect('/');
    }
});

// Last letter
router.get('/lastletter', async (req, res) => {
    if (req.user) {
        mongo.then(async mongo => {
            const results = await lastletterSchema.find();

            dataArr = [];
            for (const data of results) {
                const { userId, username, avatar, correctCount } = data;

                dataArr.push({ userId, username, avatar, correctCount });
            }

            dataArr.sort(function (a, b) {
                return b.correctCount - a.correctCount;
            });

            res.render('lastletter', {
                username: `${req.user.username}#${req.user.discriminator}`,
                userId: req.user.userId,
                avatar: req.user.avatar,
                dataArr
            });
        });
    } else {
        res.redirect('/');
    }
});

// Coutning
router.get('/counting', async (req, res) => {
    if (req.user) {
        mongo.then(async mongo => {
            const results = await countingSchema.find();

            dataArr = [];
            for (const data of results) {
                const { userId, username, avatar, counts } = data;

                dataArr.push({ userId, username, avatar, counts });
            }

            dataArr.sort(function (a, b) {
                return b.counts - a.counts;
            });

            res.render('counting', {
                username: `${req.user.username}#${req.user.discriminator}`,
                userId: req.user.userId,
                avatar: req.user.avatar,
                dataArr
            });
        });
    } else {
        res.redirect('/');
    }
});

module.exports = router;