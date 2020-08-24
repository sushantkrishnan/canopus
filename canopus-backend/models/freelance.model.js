const mongoose = require("mongoose"),
    passportLocalMongoose = require("passport-local-mongoose");
// var blogSchema =
module.exports = mongoose.model(
    "Freelance",
    new mongoose.Schema({
        title: String,
        profession: String,
        specialization: String,
        superSpecialization:Array,
        address: Object,
        createdAt:Date,
        expireAt:Date,
        // {
        //     line: String, //specific addresss
        //     city: String,
        //     state: String,
        //     pin: Number,
        // },
        startDate: Date,
        endDate: Date,
        // {
        //     day:String
        //     start:Number,
        //     end:Number
        // },
        description: Object,
        // {
        //     time:String,
        //     line: String,
        //     experience: String,
        //     incentives: String,
        //     type: String,
        //     status: String,
        //     location: String,
        //     salary: Number,
        // },
        validated: String,
        sponsored: Boolean,
        tag: Array,
        // date: Date,
        author: {
            id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Employer",
            },
            username: String,
        },
        applicants: [
            {
                id: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User",
                },
                username: String,
            },
        ],
        // likes: [
        //     {
        //         id: {
        //             type: mongoose.Schema.Types.ObjectId,
        //             ref: "User",
        //         },
        //         username: String,
        //     },
        // ],
    }).plugin(passportLocalMongoose),
);