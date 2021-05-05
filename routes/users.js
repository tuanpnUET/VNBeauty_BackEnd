const { User } = require('../models/user');
const { authenticateJWT } = require('../helpers/jwt')
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs')
// Json web token
const jwt = require('jsonwebtoken')
const accessTokenSecret = process.env.secret;


//GET ALL
router.get(`/`, authenticateJWT, async (req, res) => {
    const userList = await User.find().select('-passwordHash');
    // console.log(req.user)
    if (!userList) {
        res.status(500).json({ success: false })
    }
    res.send(userList);
})


// GET CURRENT USER
router.get(`/getCurrentUser`, authenticateJWT, async (req, res) => {
    try {
        const user = req.user;
        user.passwordHash = 'hidden value';
        return res.send(user);
    }
    catch (err) {
        console.log(err);
    }
})

//GET BY ID
router.get(`/:id`, async (req, res) => {
    const user = await User.findById(req.params.id).select('-passwordHash');

    if (!user) {
        res.status(500).send('The user with given Id was not fount')
    }
    return res.send(user);
})

//REGISTER
router.post('/register', async (req, res) => {
    let user = new User({
        name: req.body.name,
        email: req.body.email,
        passwordHash: bcrypt.hashSync(req.body.password, 10),
        isAdmin: req.body.isAdmin
    })
    user = await user.save();
    if (!user) {
        res.status(400).send('The user cannot be created!')
    }
    res.send(user);
})

//LOGIN
router.post('/login', async (req, res) => {
    const user = await User.findOne({ email: req.body.email })
    const secret = process.env.secret
    if (!user) {
        return res.status(400).send('The user not fount')
    }
    if (user && bcrypt.compareSync(req.body.password, user.passwordHash)) {
        const token = jwt.sign(
            {
                id: user.id,
                isAdmin: user.isAdmin
            },
            secret,
            { expiresIn: '1d' }
        )
        res.status(200).send({ user: user.email, token: token })
    } else {
        res.status(400).send('password is wrong!');
    }
})

// UPDATE info
router.put('/updateUser', authenticateJWT, async (req, res) => {

    const user = await User.findByIdAndUpdate(
        { _id: req.user._id },
        {
            name: req.body.name,
            email: req.body.email
        },
        { new: true }
    );
    if (!user)
        return res.status(500).send('The user cannot be updated')
    res.send(user);
})
// Update password
router.put('/changePassword', authenticateJWT, async (req, res) => {
    try {
        const user = req.user
        if (user) {
            const cmp = await bcrypt.compare(req.body.oldPassword, user.passwordHash);
            if (cmp) {
                const result = await User.updateOne({ _id: user._id }, { passwordHash: bcrypt.hashSync(req.body.newPassword, 10) });
                if (result.ok === 1) {
                    return res.send("Password Changed!")
                }
                return res.send("Failed")
            } else {
                return res.send("Wrong password.");
            }
        } else {
            return res.send("Wrong password.");
        }
    }
    catch (error) {
        console.log(error);
    }
})

//DELETE
router.delete('/:id', (req, res) => {
    User.findByIdAndRemove(req.params.id)
        .then(user => {
            if (user) {
                return res.status(200).json({ success: true, message: 'The user deleted!' })
            } else {
                return res.status(404).json({ success: false, message: 'The user not found' })
            }
        })
        .catch(err => {
            return res.status(400).json({ success: false, error: err })
        })
})


// GET USER COUNT
router.get('/get/count', async (req, res) => {


    const userCount = await User.countDocuments((count) => count)


    if (!userCount) {
        res.status(500).json({ success: false })
    }
    res.send({
        userCount: userCount
    });
})

module.exports = router;