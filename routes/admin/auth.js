const express = require('express');
const { check } = require('express-validator');

const usersRepo = require('../../repositories/users');
const signupTemplate = require('../../views/admin/auth/signup');
const signinTemplate = require('../../views/admin/auth/signin');

const router = express.Router();

router.get('/signup', (req, res) => {
    res.send(signupTemplate({ req }));
});

router.post('/signup', [
    check('email'),isEmail(),
    check('password'),
    check('passwordConfirmation')
], async (req, res) => {
    const { email, password, passwordConfirmation } = req.body;

    const existingUser = await usersRepo.getOneBy({ email }); 
    if (existingUser) {
        return res.send('email in use');
    }
    if (password !== passwordConfirmation) {
        return res.send('passwords must match')
    }

    const user = await usersRepo.create({ email, password });

    req.session.userId = user.id;

    res.send('account created');
});

router.get('/signout', (req, res) => {
    req.session = null;
    res.send('logged out')
});

router.get('/signin', (req, res) => {
    res.send(signinTemplate({ req }));
});

router.post('/signin', async (req, res) => {
    const { email, password } = req.body;
    
    const user = await usersRepo.getOneBy({ email });

    if (!user) {
        return res.send('email not found');
    }

    const validPassword = await usersRepo.comparePasswords(
        user.password, 
        password
    );
    if (!validPassword) {
        return res.send('invalid password');
    }

    req.session.userId = user.id;

    res.send('yer signed in bud');
});

module.exports = router;