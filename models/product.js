const mongoose = require('mongoose');

const productSchema = mongoose.Schema({ 

    name: {
        type : String,
        maxlength: 50,
        unique: true
    },
    category: {
        type: String,
    },
    amount: {
        type: Number,
        default: 1
    },
    now_amount: {
        type: Number,
        default: 1
    },
    image: String
})

const Product = mongoose.model('Product', productSchema) 

module.exports = { Product }  