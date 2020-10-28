const { adminController } = require("../controllers/admin.controller");
require("dotenv").config();
const router = require("express").Router(),
  passport = require("passport"),
  mongoose = require("mongoose"),
  middleware = require("../middleware/index"),
  Employer = require("../models/employer.model"),
  Job = require("../models/job.model"),
  Freelance = require("../models/freelance.model"),
  savedJob = require("../models/savedJobs.model"),
  savedFreelance = require("../models/savedFreelance.model");
// add new tag
const fs = require("fs"),
path = require('path'),    
filePath = path.join(__dirname, '../canopus-frontend/build/data.json');
//get all json
router.get("/data",async(req,res)=>{
    let rawdata = fs.readFileSync(filePath);
    let data = JSON.parse(rawdata);
    res.json(data);
})
//update banners
router.post("/update/banner/subscription",middleware.isAdmin,async (req,res) => {
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

router.post("/update/banner/sponsor",middleware.isAdmin,async (req,res) => {
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

router.post("/update/banner/search",middleware.isAdmin,async (req,res) => {
    let rawdata = fs.readFileSync(filePath);
    let data = JSON.parse(rawdata);
    // banner = data.sponsor_banner;
    let banner = req.body.banner;
    data.banner=banner;
    data = JSON.stringify(data);
    // do update
    fs.writeFileSync(filePath,data);
    res.json(banner);
});
//delete banner
router.delete("/update/banner/search",middleware.isAdmin,async (req,res) => {
    let rawdata = fs.readFileSync(filePath);
    let data = JSON.parse(rawdata);
    // banner = data.sponsor_banner;
    //let banner = req.body.banner;
    data.banner=null;
    data = JSON.stringify(data);
    // do update
    fs.writeFileSync(filePath,data);
    res.json("done");
});

//update search count
// router.post("/update/count",async (req,res) => {
//     let rawdata = fs.readFileSync(filePath);
//     let data = JSON.parse(rawdata);
//     let count = req.body.count;
//     data.search_count = count;
//     data = JSON.stringify(data);
//     // do update
//     fs.writeFileSync(filePath,data);
//     res.json(count);
// });

//update tags
router.post("/add/profession",middleware.isAdmin,async (req,res) => {
    let rawdata = fs.readFileSync(filePath);
    let data = JSON.parse(rawdata);
   // let specializations = data.specializations;
  //  specializations = [ ...specializations , { profession:req.body.profession,specialization:req.body.specialization}];
    data.specializations=req.body.specializations;
    data = JSON.stringify(data);
    // do update
    fs.writeFileSync(filePath,data);
    res.json("done");
});


router.post("/add/super",middleware.isAdmin,async (req,res) => {
    let rawdata = fs.readFileSync(filePath);
    let data = JSON.parse(rawdata);
   // let specializations = data.superSpecializations;
   // specializations = [ ...specializations , { profession:req.body.profession,specialization:req.body.specialization,superSpecialization:req.body.superSpecialization}];
    data.superSpecializations=req.body.superSpecializations;
    data = JSON.stringify(data);
    // do update
    fs.writeFileSync(filePath,data);
    res.json("done");
});

// router.post("/update/specialization",async (req,res) => {
//     let rawdata = fs.readFileSync(filePath);
//     let data = JSON.parse(rawdata);
//     let specializations = data.specializations;
//     let index = specializations.findIndex(item => item.profession===req.body.profession);
//     specializations[index] = { profession:req.body.profession,specialization:req.body.specialization};
//     data.specializations=specializations;
//     data = JSON.stringify(data);
//     // do update
//     fs.writeFileSync(filePath,data);
//     res.json(specializations);
// });

// router.post("/update/super",async (req,res) => {
//     let rawdata = fs.readFileSync(filePath);
//     let data = JSON.parse(rawdata);
//     let superSpecializations = data.superSpecializations;
//     let index = superSpecializations.findIndex(item => item.specialization===req.body.specialization);
//     superSpecializations[index] = { profession:req.body.profession,specialization:req.body.specialization,superSpecialization:req.body.superSpecialization};
//     data.superSpecializations=superSpecializations;
//     data = JSON.stringify(data);
//     // do update
//     fs.writeFileSync(filePath,data);
//     res.json(superSpecializations);
// });
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
//Logout route
router.get("/logout", (req, res) => {
    req.session.destroy((err) => {
    res.json({ message: "Logged Out" });
    });
  });
  router.get("/current", (req, res) => {
    res.json({ user: req.user });
  });
//Get validated recruiters
router.get("/all/employer",middleware.isAdmin,(req,res) => {
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
router.get("/validate/employer",middleware.isAdmin,(req,res) => {
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
router.post("/validate/employer",middleware.isAdmin,(req,res) => {
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
router.post("/subscription/employer",middleware.isAdmin,(req,res) => {
    var update = {};
    if(req.body.job)
    update['jobtier.allowed']=req.body.job;
    if(req.body.freelance)
    update['freelancetier.allowed']=req.body.freelance;
    if(req.body.locum)
    update['locumtier.allowed']=req.body.locum;
    if(req.body.sponsors)
    update['sponsors.allowed']=req.body.sponsors;
    Employer.findOneAndUpdate({username:req.body.username},{$inc:update},{new:true}).then((employer)=>{
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

// employer.jobtier.posted+=1;
// employer.jobs = [
// ...employer.jobs,
// {
//     title: job.title,
//     id: job._id,
//     sid:sjob._id,
// },
// ];
//add jobs for employer
router.post("/add/jobs" , async (req,res)=>{
    //start transaction
    // let session = await mongoose.startSession();
    // await session.startTransaction();
    let jobs=req.body.jobs;
    let job_ids=[];
    let batch_jobs = [];
    let batch_savedjobs = [];
    try {
        let promises = jobs.map(async job => {
            let employer = await Employer.findOne({username:job.email});
            //.session(session);
            var expiry= new Date();
            expiry.setDate(expiry.getDate() + 45);
            let author = {};
            author.username = employer.username;
            author.id = employer._id;
            if(employer.description.organization)author.instituteName = employer.description.organization;
            if(employer.logo)author.photo = employer.logo;
            var description={};
            if(job.line)description.line=job.line;
            if(job.about)description.about=job.about;
            if(job.experience)description.experience=job.experience;
            if(job.incentives)description.incentives=job.incentives.split(',');
            if(job.type)description.type=job.type;
            if(job.location)description.location=job.location;
            if(job.salary)description.salary=job.salary;
            if(job.count)description.count=job.count;
            if(employer.description.organization) description.company=employer.description.organization;
            job.employer=employer.description.organization;
            if(job.category==="Locum"){
                let datearr1 = job.startDate.split('/');
                job.startDate = new Date(`${datearr1[1]}/${datearr1[0]}/${datearr1[2]}`);
                let datearr2 = job.endDate.split('/');
                job.endDate=new Date(`${datearr2[1]}/${datearr2[0]}/${datearr2[2]}`);
                if(job.procedure)description.procedure=job.procedure;
            }
            if(job.category==="Day Job"){
                let datearr = job.date.split('/');
                job.date = `${datearr[1]}/${datearr[0]}/${datearr[2]}`
                job.startDate=new Date(`${job.date}, ${job.startHour}`);
                job.endDate=new Date(`${job.date}, ${job.endHour}`);
                if(job.procedure)description.procedure=job.procedure;
            }
            if(job.category==="Full-time"){
                let insert_job = new Job({
                    author:author,
                    title: job.title,
                    profession: job.profession,
                    specialization: job.specialization,
                    superSpecialization:job.superSpecialization,
                    description: description,
                   // address: req.body.job.address,
                    createdAt:new Date(),
                    createdBy:"Employer",
                    expireAt:expiry,
                    validated:employer.validated,
                    extension:1,
                    category:"Full-time",
                });
                let insert_sjob = new savedJob({
                    jobRef:insert_job._id,
                    author:author,
                    title: job.title,
                    profession: job.profession,
                    specialization: job.specialization,
                    superSpecialization:job.superSpecialization,
                    description: description,
                    status:"Active",
                   // address: req.body.job.address,
                    createdAt:new Date(),
                    createdBy:"Employer",
                    expireAt:expiry,
                    validated:employer.validated,
                    extension:1,
                    category:"Full-time",
                });
                batch_jobs.push(insert_job);
                batch_savedjobs.push(insert_sjob);
                let update ={};
                update["jobtier.allowed"]=employer.jobtier.allowed+1;
                update["jobtier.posted"]=employer.jobtier.posted+1;
                update_push={
                    title: insert_job.title,
                    id: insert_job._id,
                    sid:insert_sjob._id,
                };
                await Employer.findOneAndUpdate({_id:employer._id},{$set:update,$push:{jobs:update_push}});
            }
            else{
                let insert_job = new Freelance({
                    author:author,
                    title: job.title,
                    profession: job.profession,
                    specialization: job.specialization,
                    superSpecialization:job.superSpecialization,
                    description: description,
                    startDate:job.startDate,
                    endDate:job.endDate,
                   // address: req.body.job.address,
                    createdAt:new Date(),
                    createdBy:"Employer",
                    expireAt:job.endDate,
                    validated:employer.validated,
                    extension:1,
                    category:job.category,
                });
                let insert_sjob = new savedFreelance({
                    author:author,
                    title: job.title,
                    profession: job.profession,
                    specialization: job.specialization,
                    superSpecialization:job.superSpecialization,
                    description: description,
                    status:"Active",
                    startDate:job.startDate,
                    endDate:job.endDate,
                   // address: req.body.job.address,
                    createdAt:new Date(),
                    createdBy:"Employer",
                    expireAt:job.endDate,
                    validated:employer.validated,
                    extension:1,
                    category:job.category,
                });    
                batch_jobs.push(insert_job);
                batch_savedjobs.push(insert_sjob);
                let update = {};
                if(job.category==="Locum"){
                    //update.locumtier={};
                    update["locumtier.allowed"]=employer.locumtier.allowed+1;
                    update["locumtier.posted"]=employer.locumtier.posted+1;
                    //update.locumtier.allowed=employer.locumtier.allowed+1;
                    //update.locumtier.posted=employer.locumtier.posted+1;
                    //console.log(employer);
                }
                else{
                    // update.freelancetier={};
                    update["freelancetier.allowed"]=employer.freelancetier.allowed+1;
                    update["freelancetier.posted"]=employer.freelancetier.posted+1;
                }
                update_push={
                    title: insert_job.title,
                    id: insert_job._id,
                    sid:insert_sjob._id,
                };
                await Employer.findOneAndUpdate({_id:employer._id},{$set:update,$push:{freelanceJobs:update_push}});
            }
            return Promise.resolve("ok");
          })
        await Promise.all(promises);
        if(req.body.flag==="Full-time"){
            await Job.insertMany(batch_jobs);
            // {session:session}
            await savedJob.insertMany(batch_savedjobs);
        }
        else{
            await Freelance.insertMany(batch_jobs);
            await savedFreelance.insertMany(batch_savedjobs);
        }
        //commit transaction
        // await session.commitTransaction();
        // session.endSession();
        res.json({jobs:batch_jobs});
    } catch(err){
        // any 500 error in try block aborts transaction
        // await session.abortTransaction();
        // session.endSession();
        console.log(err);
        res.json({err:err});
    }
});
//get applicants for an employer
router.post("/employer/applicants",async (req,res)=>{
    let jobs = await Job.aggregate([
        {
            $match:{'author.id':mongoose.Types.ObjectId(req.body.id)}
        },
        // {
        //     $sortByCount:"$applicants"
        // }
    ]);
    res.json({jobs:jobs});
})
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