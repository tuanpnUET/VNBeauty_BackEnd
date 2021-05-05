const mongoose = require('mongoose');

const siteSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true
    },
    image: {
        type: String,
        default: "https://media.istockphoto.com/videos/loading-circle-icon-on-white-background-animation-video-id1093418606?s=640x640"
    },
    location: {
        type: String,
        default: ''
    },
    rating : {
        type: Number,
        default:0
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required:true
    },
   
})

siteSchema.method('toJSON', function(){
    const { __v, ...object } = this.toObject();
    const { _id:id, ...result } = object;
    return { ...result, id };
});


exports.Site = mongoose.model('Site', siteSchema);