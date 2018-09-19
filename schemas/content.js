let express = require('express');

let mongoose = require('mongoose');

module.exports = new mongoose.Schema({
    title:String,
    category:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Category'
    },
    description:String,
    addTime:{
      type:Date,
      default:Date.now
    },
    views:{
        type:Number,
        default:0
    },
    content:String,
    writer:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    comments:{
        type:Array,
        default:[]
    }

});