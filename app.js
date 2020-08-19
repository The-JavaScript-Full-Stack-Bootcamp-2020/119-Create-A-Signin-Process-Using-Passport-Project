const express = require('express');
const app = express();
const passport = require('passport');
const session = require('express-session');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const LocalStrategy = require('passport-local').Strategy;
const User = require('./user.js');
const sequelize = require('./database.js');
////////////////////////////////////////

const sessionStore = new SequelizeStore({
    db: sequelize
});

sessionStore.sync();
User.sync({ alter: true });

app.set('view engine', 'pug');
app.use(express.urlencoded({ extended: true }));
app.use(
    session({
        secret: '343ji43j4n3jn4jk3n', //enter a random string here
        resave: false,
        saveUninitialized: true,
        name: 'testingpassport',
        cookie: {
            secure: false, //CRITICAL on localhost
            maxAge: 30 * 24 * 60 * 60 * 1000, //30 days
        },
        store: sessionStore,
    }),
    passport.initialize(),
    passport.session()
  )

passport.serializeUser((user, done) => {
    done(null, user.email);
});

passport.deserializeUser((email, done) => {
    User.findOne({ where: { email: email } }).then((user) => {
    done(null, user);
    });
});

app.get('/', (req, res) => 
    req.session.passport ? res.render('index') : res.render('signup')
);

app.post('/register', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.create({ email, password });

    req.login(user, (err) => {
        return res.redirect('/');
    });

});

app.listen(3001, () => console.log('Server ready'));