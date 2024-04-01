const mongoose = require('mongoose');

const alarmSchema = mongoose.Schema({ 

    title: {
        type : String,
        maxlength: 50
    },
    body: {
        type: String,
    },
    date: {
        type: String
    },
    isRead: {
        type: Boolean,
        default: false
    },
    image: String
})

const Alarm = mongoose.model('Alarm', alarmSchema) 

module.exports = { Alarm }  