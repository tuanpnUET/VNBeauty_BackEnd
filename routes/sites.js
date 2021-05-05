const { Site } = require('../models/site');
const express = require('express');
const { Category } = require('../models/category');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');

const FILE_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg',
};

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const isValid = FILE_TYPE_MAP[file.mimetype];
        let uploadError = new Error('invalid image type');

        if (isValid) {
            uploadError = null;
        }
        cb(uploadError, 'public/upload');
    },
    filename: function (req, file, cb) {
        const fileName = file.originalname.split(' ').join('-');
        const extension = FILE_TYPE_MAP[file.mimetype];
        cb(null, `${fileName}-${Date.now()}.${extension}`);
    },
});

const uploadOptions = multer({ storage: storage });

router.get(`/`, async (req, res) => {
    let filter = {};
    if (req.query.categories) {
        filter = { category: req.query.categories.split(',') };
    }
    
    const siteList = await Site.find(filter).populate('category');

    if (!siteList) {
        res.status(500).json({ success: false });
    }
    res.send(siteList);
});

router.get(`/:id`, async (req, res) => {
    const site = await Site.findById(req.params.id).populate('category');

    if (!site) {
        res.status(500).json({ success: false });
    }
    res.send(site);
});

router.post(`/`, uploadOptions.single('image'), async (req, res) => {
    const category = await Category.findById(req.body.category);
    if (!category) return res.status(400).send('Invalid Category');

    const file = req.file;
    if (!file) return res.status(400).send('No image in the request');

    const fileName = file.filename;
    const basePath = `${req.protocol}://${req.get('host')}/public/upload/`;
    let site = new Site({
        name: req.body.name,
        description: req.body.description,
        image: `${basePath}${fileName}`, // "http://localhost:3000/public/upload/image-2323232"
        location: req.body.location,
        rating: req.body.rating,
        category: req.body.category,
    });

    site = await site.save();

    if (!site) return res.status(500).send('The site cannot be created');

    res.send(site);
});

//UPDATE SITE
router.put('/:id', async (req, res) => {
    
    if (!mongoose.isValidObjectId(req.params.id)) {
        res.status(400).send('Invalid Site Id')
    }
    const category = await Category.findById(req.body.category);
    if (!category) return res.status(400).send('Invalid Category')

    const site = await Site.findByIdAndUpdate(
        
        { _id:  req.params.id },
        {
            name: req.body.name,
            description: req.body.description,
            location: req.body.location,
            rating: req.body.rating,
            category: req.body.category,
        },
        { new: true }
    );

    if (!site)
        return res.status(404).send('The site cannot be updated!');
    res.send(site);
})





router.delete('/:id', (req, res) => {
    Site.findByIdAndRemove(req.params.id)
        .then((site) => {
            if (site) {
                return res
                    .status(200)
                    .json({
                        success: true,
                        message: 'the site is deleted!',
                    });
            } else {
                return res
                    .status(404)
                    .json({ success: false, message: 'site not found!' });
            }
        })
        .catch((err) => {
            return res.status(500).json({ success: false, error: err });
        });
});



module.exports = router;