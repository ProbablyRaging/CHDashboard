const discordStrategy = require('passport-discord').Strategy;
const passport = require('passport');
const discordUser = require('../schema/discord_user');
const fetch = require('node-fetch');

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    const user = await discordUser.findById(id);
    if (user) done(null, user);
});

passport.use(new discordStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: process.env.CLIENT_REDIRECT,
    scope: ['identify', 'guilds']
}, async (accessToken, refreshToken, profile, done) => {
    try {
        const user = await discordUser.findOne({ userId: profile.id });

        const headers = {
            "Content-Type": "application/json",
            "Authorization": process.env.API_TOKEN
        }
        const resolve = await fetch(`https://discord.com/api/v9/guilds/${process.env.SERVER_ID}/members/${profile.id}`, { method: 'GET', headers: headers });
        const discordUserData = await resolve.json();

        if (discordUserData.roles.includes(`${process.env.AUTH_ROLE_ID}`)) {
            if (user) {
                done(null, user);
            } else {
                const newUser = await discordUser.create({
                    userId: profile.id,
                    username: profile.username,
                    discriminator: profile.discriminator,
                    avatar: profile.avatar,
                    accessToken: accessToken,
                    refreshToken: refreshToken,
                    guilds: profile.guilds
                });

                const savedUser = await newUser.save();
                done(null, savedUser);
            }
        } else {
            done('missing permissions', null);
        }
    } catch (err) {
        console.error(err);
        done(err, null);
    }
}));