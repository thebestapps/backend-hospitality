var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());
var Blog = require('../Blog/Blog');
var Tour = require('../Tour/Tour');
var Property = require('../Property/Property');
var Product = require('../Product/Product');



router.get('/', async function (req, res) {
   
    var stays = await Property.countDocuments();
    var tours = await Tour.countDocuments();
    var blogs = await Blog.countDocuments();
    var products = await Product.countDocuments()

    var count = {
        stays: stays,
        tours: tours,
        blogs: blogs,
        products: products
    }
  
    return res.status(200).send(count)
    

});

module.exports = router;