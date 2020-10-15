const { searchController } = require("../controllers/search.controller");
const { mailController } = require("../controllers/mail.controller");
const { validationController } = require("../controllers/validation.controller");
require("dotenv").config();
const GOOGLE_ANALYTICS = process.env.GOOGLE_ANALYTICS;
var ua = require("universal-analytics");
var visitor = ua(GOOGLE_ANALYTICS);
const mongoose = require("mongoose");
const crypto = require("crypto");
const { promisify } = require("util");
const asyncify = require("express-asyncify");
const router = require("express").Router(),
  passport = require("passport"),
  middleware = require("../middleware/index"),
  User = require("../models/user.model"),
  Employer = require("../models/employer.model"),
  Job = require("../models/job.model"),
  Freelance = require("../models/freelance.model"),
  savedJob = require("../models/savedJobs.model"),
  savedFreelance = require("../models/savedFreelance.model");
// add new tag
const fs = require("fs"),
path = require('path'),    
filePath = path.join(__dirname, '../canopus-frontend/build/data.json');

// router.post("/tags",async (req,res)=>{
//    let rawdata = fs.readFileSync(filePath);
//    let data = JSON.parse(rawdata);
//    data.tags.push(req.body.tag);
//    tags = JSON.stringify(tags);
//    fs.writeFileSync(filePath,tags);
//    res.json(tags);
// });

router.get("/data",async(req,res)=>{
    let rawdata = fs.readFileSync(filePath);
    let data = JSON.parse(rawdata);
    res.json(data);
})
//update banners
router.post("/update/banner/subscription",async (req,res) => {
    let rawdata = fs.readFileSync(filePath);
    let data = JSON.parse(rawdata);
   // let banner = data.subscription_banner;
    let banner = req.body.banner;
    data.subscription_banner=banner;
    data = JSON.stringify(data);
    // do update
    fs.writeFileSync(filePath,data);
    res.json(banner);
});

router.post("/update/banner/sponsor",async (req,res) => {
    let rawdata = fs.readFileSync(filePath);
    let data = JSON.parse(rawdata);
    // banner = data.sponsor_banner;
    let banner = req.body.banner;
    data.sponsor_banner=banner;
    data = JSON.stringify(data);
    // do update
    fs.writeFileSync(filePath,data);
    res.json(banner);
});

//update search count
router.post("/update/count",async (req,res) => {
    let rawdata = fs.readFileSync(filePath);
    let data = JSON.parse(rawdata);
    let count = req.body.count;
    data.search_count = count;
    data = JSON.stringify(data);
    // do update
    fs.writeFileSync(filePath,data);
    res.json(count);
});

//update tags
router.post("/add/profession",async (req,res) => {
    let rawdata = fs.readFileSync(filePath);
    let data = JSON.parse(rawdata);
    let specializations = data.specializations;
    specializations = [ ...specializations , { profession:req.body.profession,specialization:req.body.specialization}];
    data.specializations=specializations;
    data = JSON.stringify(data);
    // do update
    fs.writeFileSync(filePath,data);
    res.json(specializations);
});


router.post("/add/super",async (req,res) => {
    let rawdata = fs.readFileSync(filePath);
    let data = JSON.parse(rawdata);
    let specializations = data.superSpecializations;
    specializations = [ ...specializations , { profession:req.body.profession,specialization:req.body.specialization,superSpecialization:req.body.superSpecialization}];
    data.superSpecializations=specializations;
    data = JSON.stringify(data);
    // do update
    fs.writeFileSync(filePath,data);
    res.json(specializations);
});

router.post("/update/specialization",async (req,res) => {
    let rawdata = fs.readFileSync(filePath);
    let data = JSON.parse(rawdata);
    let specializations = data.specializations;
    let index = specializations.findIndex(item => item.profession===req.body.profession);
    specializations[index] = { profession:req.body.profession,specialization:req.body.specialization};
    data.specializations=specializations;
    data = JSON.stringify(data);
    // do update
    fs.writeFileSync(filePath,data);
    res.json(specializations);
});

router.post("/update/super",async (req,res) => {
    let rawdata = fs.readFileSync(filePath);
    let data = JSON.parse(rawdata);
    let superSpecializations = data.superSpecializations;
    let index = superSpecializations.findIndex(item => item.specialization===req.body.specialization);
    superSpecializations[index] = { profession:req.body.profession,specialization:req.body.specialization,superSpecialization:req.body.superSpecialization};
    data.superSpecializations=superSpecializations;
    data = JSON.stringify(data);
    // do update
    fs.writeFileSync(filePath,data);
    res.json(superSpecializations);
});
router.post("/login", function (req, res, next) {
    passport.authenticate("user", (err, user, info) => {
      console.log(info);
      if (err) {
        return res.status(400).json({ err: err });
      }
      if (!user) {
        return res.status(400).json({ err: info });
      }
      req.logIn(user, function (err) {
        if (err) {
          return res.status(400).json({ err: err });
        }
        //visitor.event("User", "Login").send();
        return res.json({
          user: req.user,
          message: `${req.user.username} Logged in`,
        });
      });
    })(req, res, next);
  });

//Get validated recruiters
router.get("/all/employer",(req,res) => {
    Employer.aggregate([
        { 
        $match:{
            validated:true
            }
        },
        {
            $project:{
                _id:1,
                username:1,
                phone:1,
                'description.organization':1,
                'sponsors.posted':1,
                'sponsors.allowed':1,
                'sponsors.closed':1,
                'jobtier.posted':1,
                'jobtier.allowed':1,
                'jobtier.closed':1,
                'freelancetier.posted':1,
                'freelancetier.allowed':1,
                'freelancetier.closed':1,
                'locumtier.posted':1,
                'locumtier.allowed':1,
                'locumtier.closed':1,
            }
        }
    ],(err, employer) => {
    if (err)
        res.status(400).json({
            err: err,
        });
    else res.json({ employer:employer});
},);

});
//Get unvalidated recruiters
router.get("/validate/employer",(req,res) => {
    Employer.aggregate([
        { 
        $match:{
            validated:false
            }
        },
        {
            $project:{
                _id:1,
                username:1,
                phone:1,
                'description.organization':1,
            }
        }
    ],(err, employer) => {
    if (err)
        res.status(400).json({
            err: err,
        });
    else res.json({ employer:employer});
},);

});
router.post("/validate/employer",(req,res) => {
        let ID=req.body.id;
        //console.log(ID);
//         Job.updateMany({title:{$ne:""}},
// {$set:{validated:"true"}}).then(console.log("Hello"));
        Employer.updateMany({_id:{$in:ID}},{$set:{validated:true}}).then((employer) =>{
            Job.updateMany({"author.id":{$in:ID}},{$set:{validated:true}}).then((jobs) =>{
                Freelance.updateMany({"author.id":{$in:ID}},{$set:{validated:true}}).then((freelance) =>{
                    res.json({employer:employer,jobs:jobs,freelance:freelance});
                }).catch((err) => {res.json({err:err})});
            }).catch((err) => {res.json({err:err})});
            }).catch((err) => {res.json({err:err})});

});

// router.get("/validate/user",middleware.isAdmin,(req,res) => {
//     User.aggregate([{ 
//         $match:{
//             validated:false
//         }
//      }],(err, employer) => {
//     if (err)
//         res.status(400).json({
//             err: err,
//         });
//     else res.json({ employer:employer});
// },);

// });

// router.post("/validate/user",middleware.isAdmin,(req,res) => {
//         ID=req.body.id;
//         User.updateMany({_id:{$in:ID}},{$set:{validated:true}},{nModified:1}).then((employer) =>{
//             Job.updateMany({"author.id":{$in:ID}},{$set:{validated:true}}).then((jobs) =>{
//                 Freelance.updateMany({"author.id":{$in:ID}},{$set:{validated:true}}).then((freelance) =>{
//                     res.json({employer:employer,jobs:jobs,freelance:freelance});
//                 }).catch((err) => {res.json({err:err})});
//             }).catch((err) => {res.json({err:err})});
//             }).catch((err) => {res.json({err:err})});

// });

// Update subscriptions
router.post("/subscription/employer",(req,res) => {
    var update = {};
    if(req.body.job)
    update['jobtier.allowed']=req.body.job;
    if(req.body.freelance)
    update['freelancetier.allowed']=req.body.freelance;
    if(req.body.locum)
    update['locumtier.allowed']=req.body.locum;
    if(req.body.sponsors)
    update['sponsors.allowed']=req.body.sponsors;
    Employer.findOneAndUpdate({username:req.body.username},{$inc:update}).then((employer)=>{
        res.json({employer:employer});
    }).catch((err)=>{res.status(500).json({err:err})});
});

// router.post("/subscription/user", middleware.isAdmin,(req,res) => {
//     var update = {};
//     if(req.body.job)
//     update['jobtier.allowed']=req.body.job;
//     if(req.body.freelance)
//     update['freelancetier.allowed']=req.body.freelance;
//     if(req.body.locum)
//     update['locumtier.allowed']=req.body.locum;
//     User.findOneAndUpdate({username:req.body.username},{$inc:update}).then((employer)=>{
//         res.json({employer:employer});
//     }).catch((err)=>{res.status(500).json({err:err})});
// });




router.post("/post/jobs", async (req,res) =>{
    //start transaction
  const session = await mongoose.startSession();
  session.startTransaction();
  const server_error = new Error("500");
  const client_error = new Error("400");
  //try block
  try{
    let promises = [];
    let jobs=req.body.jobs;
    for (let i = 0; i < jobs.length; i++) {
        promises.push(
            new Promise((resolve, reject) => {
                const author=jobs[i].email;
                let employer =Employer.findOne({username:author}).session(session);
                        var expiry= new Date();
                        expiry.setDate(expiry.getDate() + 45);
                        var description={};
                        if(jobs[i].line)description.line=jobs[i].line;
                        if(jobs[i].about)description.about=jobs[i].about;
                        if(jobs[i].experience)description.experience=jobs[i].experience;
                        if(jobs[i].incentives)description.incentives=jobs[i].incentives;
                        if(jobs[i].type)description.type=jobs[i].type;
                        if(jobs[i].location)description.location=jobs[i].location;
                        if(jobs[i].skills)description.skills=jobs[i].skills;
                        if(jobs[i].salary)description.salary=jobs[i].salary;
                        if(jobs[i].count)description.count=jobs[i].count;
                        if(employer.instituteName) description.company=employer.instituteName;
                        let job = new Job({
                            title: jobs[i].title,
                            profession: jobs[i].profession,
                            specialization: jobs[i].specialization,
                            superSpecialization:jobs[i].superSpecialization,
                            description: description,
                           // address: req.body.jobs[i].address,
                            createdAt:new Date(),
                            createdBy:"Employer",
                            expireAt:expiry,
                            validated:employer.validated,
                            extension:1,
                        });
                        Job.create(job)
                        .then((job) => {
                            job.author.username = employer.username;
                             job.author.id = employer._id;
                            //if(employer.instituteName){console.log("Hello");
                            job.author.instituteName = employer.instituteName;
                           // if(employer.logo)
                            job.author.photo = employer.logo;
                           // if(employer.description.about) 
                            //// job.author.about = employer.description.about;
                           // console.log(job);
                            job.save()
                            .then((job) => {
                                //let sJob= new savedJob()
                                let sjob = new savedJob({
                                    jobRef:job._id,
                                    status:"Active",
                                    author:job.author,
                                    title: jobs[i].title,
                                    profession: jobs[i].profession,
                                    specialization: jobs[i].specialization,
                                    superSpecialization:jobs[i].superSpecialization,
                                    description: description,
                                // address: req.body.jobs[i].address,
                                    createdAt:new Date(),
                                    createdBy:"Employer",
                                    expireAt:expiry,
                                    validated:employer.validated,
                                    extension:1,
                                });
                                savedJob.create(sjob).then((sjob) =>{
                                    employer.jobtier.posted+=1;
                                    employer.jobs = [
                                    ...employer.jobs,
                                    {
                                        title: job.title,
                                        id: job._id,
                                        sid:sjob._id,
                                    },
                                    ];
                                    employer
                                    .save().then((updatedEmployer)=>{
                                        console.log(updatedEmployer);
                                        resolve("Done")
                                    }).catch((err)=>{res.status(500).json({err:"Error saving employer jobs"})});
                               // }).catch((err)=>{res.status(500).json({err:"Employer email invalid"})});
                                }).catch((err)=>{res.status(500).json({err:"Error creating sjob"})});
                            }).catch((err)=>{res.status(500).json({err:"Error saving job"})});
                        }).catch((err)=>{res.status(500).json({err:"Error creating job"})});
                    //}).catch((err)=>{res.status(500).json({err:"Employer email invalid"})});
                    })
               
           // }),
        );
    }
    Promise.all(promises)
        .then((msg) => {
            console.log("All promises resolved");
            res.json({jobs:"Done"});
    })
    .catch((err) => res.json({ err:"Couldn't find employer" }));

  } catch (err) {
    // any 500 error in try block aborts transaction
    await session.abortTransaction();
    session.endSession();
    console.log(err);
    res.status(500).json({status:"500"});
  } 
})
//add jobs for employer
router.post("/add/jobs" ,middleware.isAdmin, async (req,res)=>{

   // console.log(await tokenGen());
    //const token = (await promisify(crypto.randomBytes)(20)).toString('hex');
    let promises = [];
    let newLogins={};
    let jobs=req.body.jobs;
    console.log(jobs);
    for (let i = 0; i < jobs.length; i++) {
        promises.push(
            new Promise((resolve, reject) => {


               // const token = (await promisify(crypto.randomBytes)(20)).toString('hex');
                const author=jobs[i].email;
                 Employer.findOne({username:author}).then((employer)=>{
                        // const expiry=new Date(req.body.jobs[i].expireAt);
                        // var days=(expiry-Date.now())/(1000*60*60*24);
                        // if(days<0 || days>90 )
                        // return res.status(400).json({err:"Invalid time format"});
                        // if(employer.jobtier.allowed-employer.jobtier.posted<=0)
                        // return res.status(400).json({err:"Max Jobs Posted"});
                        var expiry= new Date();
                        expiry.setDate(expiry.getDate() + 45);
                        var description={};
                        if(jobs[i].line)description.line=jobs[i].line;
                        if(jobs[i].about)description.about=jobs[i].about;
                        if(jobs[i].experience)description.experience=jobs[i].experience;
                        if(jobs[i].incentives)description.incentives=jobs[i].incentives;
                        if(jobs[i].type)description.type=jobs[i].type;
                        if(jobs[i].location)description.location=jobs[i].location;
                        if(jobs[i].skills)description.skills=jobs[i].skills;
                        if(jobs[i].salary)description.salary=jobs[i].salary;
                        if(jobs[i].count)description.count=jobs[i].count;
                        if(employer.instituteName) description.company=employer.instituteName;
                        let job = new Job({
                            title: jobs[i].title,
                            profession: jobs[i].profession,
                            specialization: jobs[i].specialization,
                            superSpecialization:jobs[i].superSpecialization,
                            description: description,
                           // address: req.body.jobs[i].address,
                            createdAt:new Date(),
                            createdBy:"Employer",
                            expireAt:expiry,
                            validated:employer.validated,
                            extension:1,
                        });
                        Job.create(job)
                        .then((job) => {
                            job.author.username = employer.username;
                             job.author.id = employer._id;
                            //if(employer.instituteName){console.log("Hello");
                            job.author.instituteName = employer.instituteName;
                           // if(employer.logo)
                            job.author.photo = employer.logo;
                           // if(employer.description.about) 
                            //// job.author.about = employer.description.about;
                           // console.log(job);
                            job.save()
                            .then((job) => {
                                //let sJob= new savedJob()
                                let sjob = new savedJob({
                                    jobRef:job._id,
                                    status:"Active",
                                    author:job.author,
                                    title: jobs[i].title,
                                    profession: jobs[i].profession,
                                    specialization: jobs[i].specialization,
                                    superSpecialization:jobs[i].superSpecialization,
                                    description: description,
                                // address: req.body.jobs[i].address,
                                    createdAt:new Date(),
                                    createdBy:"Employer",
                                    expireAt:expiry,
                                    validated:employer.validated,
                                    extension:1,
                                });
                                savedJob.create(sjob).then((sjob) =>{
                                    employer.jobtier.posted+=1;
                                    employer.jobs = [
                                    ...employer.jobs,
                                    {
                                        title: job.title,
                                        id: job._id,
                                        sid:sjob._id,
                                    },
                                    ];
                                    employer
                                    .save().then((updatedEmployer)=>{
                                        console.log(updatedEmployer);
                                        resolve("Done")
                                    }).catch((err)=>{res.status(500).json({err:"Error saving employer jobs"})});
                               // }).catch((err)=>{res.status(500).json({err:"Employer email invalid"})});
                                }).catch((err)=>{res.status(500).json({err:"Error creating sjob"})});
                            }).catch((err)=>{res.status(500).json({err:"Error saving job"})});
                        }).catch((err)=>{res.status(500).json({err:"Error creating job"})});
                    //}).catch((err)=>{res.status(500).json({err:"Employer email invalid"})});
                    })
               
            }),
        );
    }
    Promise.all(promises)
        .then((msg) => {
            console.log("All promises resolved");
            res.json({new:newLogins});
    })
    .catch((err) => res.json({ err:"Couldn't find employer" }));
});

//analytics
// router.get("/analytics/location",middleware.isAdmin,(req,res)=>{
//     Job.aggregate([
//         { $sortByCount: "$description.location" }
//     ]).then((results)=>{res.json({results:results})});
// });
// router.get("/analytics/profession",middleware.isAdmin,(req,res)=>{
//     Job.aggregate([
//         { $sortByCount: "$profession" }
//     ]).then((results)=>{res.json({results:results})});
// });
// router.get("/analytics/specialization",(req,res)=>{
//     Job.aggregate([
//         { $sortByCount: "$specialization" }
//     ]).then((results)=>{res.json({results:results})});
// });
// router.get("/analytics/superSpecialization",(req,res)=>{
//     Job.aggregate([
//         { $sortByCount: "$superSpecialization" }
//     ]).then((results)=>{res.json({results:results})});
// });
module.exports = router;
//Testing valodation code this doesnt work but is more efficient
// Employer.aggregate([{ $project:{"validated" :{ $cond: {
//     if: { $eq: [truth , "$validated" ] },
//     then: "$$REMOVE",
//     else: "$validated"
//  }}}}