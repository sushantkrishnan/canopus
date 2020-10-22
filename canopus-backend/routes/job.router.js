//controllers
const { searchController }     = require("../controllers/search.controller"),
      { mailController }       = require("../controllers/mail.controller"),
      { validationController } = require("../controllers/validation.controller"),
      { jobController }        = require ( "../controllers/job.controller");
//dependencies
const mongoose   = require("mongoose"),
      router     = require("express").Router(),
      middleware = require("../middleware/index");
//initalize models
const User           = require("../models/user.model"),
      Employer       = require("../models/employer.model"),
      Job            = require("../models/job.model"),
      Freelance      = require("../models/freelance.model"), 
      savedJob       = require("../models/savedJobs.model"),
      savedFreelance = require("../models/savedFreelance.model");
//initialize analytics
require("dotenv").config();
const GOOGLE_ANALYTICS = process.env.GOOGLE_ANALYTICS;
var ua = require("universal-analytics");
var visitor = ua(GOOGLE_ANALYTICS);

//post a job
router.post("/post", middleware.isLoggedIn, async (req, res) => {
  //start transaction
  const session = await mongoose.startSession();
  session.startTransaction();
  const server_error = new Error("500");
  const client_error = new Error("400");
  //try block
  try {
    //check user role
    if ( req.user.role === "Employer" )
      var employer = await Employer.findById(req.user._id).session(session);
    else if ( req.user.role === "User" )
      var employer = await User.findById(req.user._id).session(session);
      //mail check
    if(employer.emailVerified===false)
      return res.status(400).json({mail:false});
    //check tier and sponsorship status
    employer = await jobController.assignTier(req,employer,"posted");
    //error if invalid tier 
    if(!employer) throw client_error;

    //DB operations start here
    //create job
    let job = await jobController.createJob(req,req.body,employer);
    if(!job) throw client_error;

    //check attached applicants validity
    if(job.category==="Locum" || job.category==="Day Job"){
      if(!(await jobController.attachedApplicantValidator(req,employer)))
        throw client_error;
      else if(req.body.attachedApplicants && req.body.attachedApplicants.length>0){
        if(job.category==="Day Job")
          req.body.attachedApplicants.every(applicant=>mailController.attachDay(applicant,employer,job));
        else if(job.category==="Locum")
          req.body.attachedApplicants.every(applicant=>mailController.attachLocum(applicant,employer,job));
      }
    }
    //insert job
    if(req.body.category === "Full-time" || req.body.category === "Part-time")
      job = await Job.create([job], { session: session });
    else
      job = await Freelance.create([job],{ session: session });
    //only arrays can be used in transactions so casting is necessary
    job = job[0];

    //create saved job
    let sjob = await jobController.createSavedJob(req,job,"Active");
    if(!sjob) throw client_error;

    var type;
    if(req.body.category === "Full-time" || req.body.category === "Part-time"){
      sjob = await savedJob.create([sjob], { session: session });
      type = "jobs";
    }
    else {
      sjob = await savedFreelance.create([sjob],{ session: session });
      type = "freelanceJobs";
    }
    sjob = sjob[0];

    //update employer add job and saved job ref
    employer[type].push(
      {
        title: job.title,
        id: job._id,
        sid: sjob._id,
      });
    //save changes to employer
    await employer.save({ session });
    //send mail
    mailController.jobPost(req,employer,job);
    //commit transaction
    await session.commitTransaction();
    session.endSession();
    // if(job.attachedApplicants)
    // mailController.welcomeMail(req,job,employer);
    req.logIn(employer,function(err){
      if(err)return res.status(500).json({err:"Error logging in"});
      res.json({status:"200"});
    });

  } catch (err) {
    // any 500 error in try block aborts transaction
    await session.abortTransaction();
    session.endSession();
    console.log(err);
    res.status(400).json({err:err});
  } 
});

//save a job
router.post("/save", middleware.isLoggedIn, async (req, res) => {
  //start transaction
  const session = await mongoose.startSession();
  session.startTransaction();
  const error = new Error("500");
  //try block
  try {
    //check user role
    if ( req.user.role === "Employer" )
      var employer = await Employer.findById(req.user._id).session(session);
    else if ( req.user.role === "User" )
      var employer = await User.findById(req.user._id).session(session);
    //check tier and sponsorship status
    employer = await jobController.assignTier(req,employer,"saved");
    //error if invalid tier 
    if(!employer) throw error;

    //DB operations start here
    //create saved job
    let sjob = await jobController.createSavedJob(req,req.body,"Saved");
    if(!sjob) throw error;

    var type;
    if(req.body.category === "Full-time" || req.body.category === "Part-time"){
      sjob = await savedJob.create([sjob], { session: session });
      type = "savedJobs";
    }
    else {
      sjob = await savedFreelance.create([sjob],{ session: session });
      type = "savedFreelance";
    }
    sjob = sjob[0];

    //update employer add job and saved job ref
    employer[type].push(sjob._id);
    //save changes to employer
    await employer.save({ session });

    //commit transaction
    await session.commitTransaction();
    session.endSession();
    req.logIn(employer,function(err){
      if(err)return res.status(500).json({err:"Error logging in"});
      res.json({status:"200"});
    });
   // res.json({status:"200"});

  } catch (err) {
    // any 500 error in try block aborts transaction
    await session.abortTransaction();
    session.endSession();
    console.log(err);
    res.status(400).json({err:err});
  } 
});


//updated a posted job
router.put("/post/:id",middleware.isLoggedIn,middleware.checkPostOwnership, async (req,res) => {
  //start transaction
  const session = await mongoose.startSession();
  session.startTransaction();
  const server_error = new Error("500");
  const client_error = new Error("400");
  //try block
  try {
    let query = await jobController.updateQueryBuilder(req);
    if(!query) throw client_error;
    
    //DB operations start here
    // if(req.body.sponsored=="true"){
    //   if ( req.user.role === "Employer" )
    //   var employer = await Employer.findById(req.user._id).session(session);
    // else if ( req.user.role === "User" )
    //   var employer = await User.findById(req.user._id).session(session);
    //  if(employer.sponsors.allowed>employer.posted)
    //  {employer.sponsors.posted+=1
    //   query["sponsored"]="true";
    //  }
    //  else throw client_error;
    // }
    if(req.body.category === "Full-time" || req.body.category === "Part-time"){
    //update job
      const job = await Job.findOneAndUpdate(
        { _id: req.params.id },
        { $set: query },
        { new: true, session: session }
      );
      //reflect changes on saved job
      await savedJob.findOneAndUpdate({ jobRef: req.params.id }, { $set: query },{ session: session });
    } 
    else {
      // if(req.body.endDate || req.body.startDate){
      //   let job = await Freelance.findById(req.params.id).session(session);
      //   const expiry = new Date(req.body.endDate);
      //   var days = (expiry - job.createdAt) / (1000 * 60 * 60 * 24);
      //   if (days < 0 || days > 30)
      //     throw client_error;
      // }
        //update job
        if(req.body.attachedApplicants){
          if ( req.user.role === "Employer" )
            var employer = await Employer.findById(req.user._id).session(session);
          else if ( req.user.role === "User" )
            var employer = await User.findById(req.user._id).session(session);
          let job = await Freelance.findById(req.params.id).session(session);
         if(!await jobController.attachedApplicantUpdateValidator(req,job,employer))
          throw client_error;
         else{
           req.body.attachedApplicants.every(applicant=>job.attachedApplicants.push(applicant));
           if(job.category==="Day Job")
           req.body.attachedApplicants.every(applicant=>mailController.attachDay(applicant,employer,job));
           else if(job.category==="Locum")
            req.body.attachedApplicants.every(applicant=>mailController.attachLocum(applicant,employer,job));
           //notify applicants
           console.log("ok");
            await job.save({session});
         }
          
        }
        await Freelance.findOneAndUpdate(
          { _id: req.params.id },
          { $set: query },
          { new: true, session: session }
        );
        //reflect changes on saved job
        await savedFreelance.findOneAndUpdate({ jobRef: req.params.id }, { $set: query },{ session: session }); 
    }
    
    //commit transaction
    await session.commitTransaction();
    session.endSession();
    //req.logIn(employer,function(err){
    //  if(err)return res.status(500).json({err:"Error logging in"});
      res.json({status:"200"});
   // });
   // res.json({status:"200"});

  } catch (err) {
    // any 500 error in try block aborts transaction
    await session.abortTransaction();
    session.endSession();
    console.log(err);
    res.status(500).json({status:"500"});
  } 
});

//updated a saved job
router.put("/save/:id",middleware.isLoggedIn,middleware.checkSavedOwnership, async (req,res) => {
  //start transaction
  const session = await mongoose.startSession();
  session.startTransaction();
  const server_error = new Error("500");
  const client_error = new Error("400");
  //try block
  try {

    const query = await jobController.updateQueryBuilder(req);
    if(!query) throw client_error;

    //DB operations start here
    if(req.body.category === "Full-time" || req.body.category === "Part-time"){
      //update job
      await savedJob.findOneAndUpdate({ _id: req.params.id}, { $set: query },{ session: session });
    } 
    else {
        //update job
        //inefficient
        let sjob = savedFreelance.findOne({_id:req.params.id}).session(session);
        if(sjob.category===req.body.category)
        await savedFreelance.findOneAndUpdate({ _id:req.params.id }, { $set: query },{ session: session }); 
        else{
          let employer = await Employer.findOne({_id:req.user._id}).session(session);
          if(req.body.category==="Locum"){
            employer.freelancetier.saved+=-1;
            employer.locumtier.saved+=1;
          }
          else if(req.body.category==="Day Job"){
            employer.freelancetier.saved+=1;
            employer.locumtier.saved+=-1;
          }
          await employer.save({session});
          query["category"]=req.body.category;
          await savedFreelance.findOneAndUpdate({ _id:req.params.id }, { $set: query },{ session: session }); 
        }
    }
    
    //commit transaction
    await session.commitTransaction();
    session.endSession();
    res.json({status:"200"});

  } catch (err) {
    // any 500 error in try block aborts transaction
    await session.abortTransaction();
    session.endSession();
    console.log(err);
    res.status(500).json({status:"500"});
  } 
});

//sponsor a job
router.put("/sponsor/:id", middleware.checkPostOwnership, async (req, res) => {
    //start transaction
  const session = await mongoose.startSession();
  session.startTransaction();
  const server_error = new Error("500");
  const client_error = new Error("400");
  try{
    //check user role
  if ( req.user.role === "Employer" )
    var employer = await Employer.findById(req.user._id).session(session);
  else if ( req.user.role === "User" )
    var employer = await User.findById(req.user._id).session(session);
  // check sponsor tier
  if(employer.sponsors.allowed - employer.sponsors.posted <= 0)
    return res.status(400).json({status:"400"})
  else employer.sponsors.posted+=1;
  // check category and update
  if(req.body.category === "Full-time" || req.body.category === "Part-time"){
    var job = await Job.findById(req.params.id).session(session);
    if(job.sponsored === "true")
      return res.status(400).json({status : "400"});
    //await Job.findOneAndUpdate(req.params.id, {$set : {sponsored:"true"}},{ session: session});
  }
  else if(req.body.category === "Day Job" || req.body.category === "Locum"){
    var job = await Freelance.findById(req.params.id).session(session);
    if(job.sponsored === "true")
      return res.status(400).json({status : "400"});
    //await Freelance.findOneAndUpdate(req.params.id , {$set : {sponsored:"true"}},{ session: session});
  }
  job.sponsored = "true";
  //save changes to employer
  await job.save({ session });
  await employer.save({ session });
  //commit transaction
  await session.commitTransaction();
  session.endSession();
  req.logIn(employer,function(err){
    if(err)return res.status(500).json({err:"Error logging in"});
    res.json({status:"200"});
  });
  //res.json({status:"200"});
  } catch(err) {
    // any 500 error in try block aborts transaction
  await session.abortTransaction();
  session.endSession();
  console.log(err);
  res.status(500).json({status:"500"});  
  }
});

//activate a saved Job
router.put("/activate/:id", middleware.checkSavedOwnership, async (req,res) => {
  //start transaction
  const session = await mongoose.startSession();
  session.startTransaction();
  const server_error = new Error("500");
  const client_error = new Error("400");
  //try block
  try {
    //check user role
    if ( req.user.role === "Employer" )
      var employer = await Employer.findById(req.user._id).session(session);
    else if ( req.user.role === "User" )
      var employer = await User.findById(req.user._id).session(session);
      //mail check
    if(employer.emailVerified===false)
      return res.status(400).json({mail:false});
    if(req.body.category === "Full-time" || req.body.category === "Part-time")
      var sjob = await savedJob.findById(req.params.id).session(session);
    else 
      var sjob = await savedFreelance.findById(req.params.id).session(session);
    // check if job is not active or closed
    if(sjob.status != "Saved")
      return res.status(400).json({status:"400"});
    //check tier and sponsorship status
    employer = await jobController.assignTier(req,employer,"posted");

    //error if invalid tier 
    if(!employer) throw client_error;

    //DB operations start here
    //create job
    let job = await jobController.createJob(req,req.body,employer);
    if(!job) throw error;
    //insert job
    var type;
    if(req.body.category === "Full-time" || req.body.category === "Part-time"){
      job = await Job.create([job], { session: session });
      employer.savedJobs.splice(employer.savedJobs.indexOf(sjob._id), 1);
      employer.jobtier.saved += -1;
      type = "jobs";
    }
    else{
      //check attached applicants validity
    if(req.body.category === "Locum" || req.body.category === "Day Job"){
      if(!(await jobController.attachedApplicantValidator(req,employer)))
        throw client_error;
      else if(req.body.attachedApplicants && req.body.attachedApplicants.length!=0){
        if(job.category==="Day Job")
        req.body.attachedApplicants.every(applicant=>mailController.attachDay(applicant,employer,job));
        else if(job.category==="Locum")
        req.body.attachedApplicants.every(applicant=>mailController.attachLocum(applicant,employer,job));
        //send mail
      }
    }
      job = await Freelance.create([job],{ session: session });
      employer.savedFreelance.splice(employer.savedFreelance.indexOf(sjob._id), 1);
      if(req.body.category === "Locum") employer.locumtier.saved += -1;
      else employer.freelancetier.saved += -1;
      type = "freelanceJobs";
      
    }
    //only arrays can be used in transactions so casting is necessary
    job = job[0];
    //update employer add job and saved job ref
    employer[type].push(
      {
        title: job.title,
        id: job._id,
        sid: sjob._id,
      });
    if(req.body.attachedApplicants)
    sjob.attachedApplicants=req.body.attachedApplicants;
    sjob.extension = 1;
    sjob.jobRef = job._id;
    sjob.status = "Active";
    sjob.expireAt = job.expireAt;
    //save changes to employer
    await employer.save({ session });
    await sjob.save( {session });
    //commit transaction
    await session.commitTransaction();
    session.endSession();
    req.logIn(employer,function(err){
      if(err)return res.status(500).json({err:"Error logging in"});
      res.json({status:"200"});
    });
    //res.json({status:"200"});

  } catch(err) {
    // any 500 error in try block aborts transaction
    await session.abortTransaction();
    session.endSession();
    console.log(err);
    res.status(400).json({err:err});
  } 
});


router.put("/extend/:id",middleware.checkJobOwnership, async(req, res) => {
  //start transaction
  const session = await mongoose.startSession();
  session.startTransaction();
  const server_error = new Error("500");
  const client_error = new Error("400");
  try{
  
  // find active job
  let job = await Job.findById(req.params.id).session(session);
  if(job.extension==0)
    return res.status(400).json({status:"400"});
  //closed jobs cannot be extended
  let sjob = await savedJob.findOne({jobRef:job._id}).session(session); 
  if(sjob.status === "Closed")
    return res.status(400).json({status:"400"});
  // set new expiry
  var expiry = new Date();
  expiry.setDate(expiry.getDate() + 45);
  // extend job
  job.expireAt = sjob.expireAt = expiry;
  job.extension = sjob.extension = 0;
  // reflect changes
  await job.save({ session });
  await sjob.save({ session });
  // commit transaction
  await session.commitTransaction();
  session.endSession();
  req.logIn(employer,function(err){
    if(err)return res.status(500).json({err:"Error logging in"});
    res.json({status:"200"});
  });
  //res.json({status:"200"});

  } catch(err) {
    // any 500 error in try block aborts transaction
   await session.abortTransaction();
   session.endSession();
   console.log(err);
   res.status(500).json({status:"500"});  
  }
});

// TODO:
//extend an expired job
router.put("/extend/expired/:id", middleware.isEmployer, async (req, res) => {
    //start transaction
    const session = await mongoose.startSession();
    session.startTransaction();
    try{
      //check user role
    if ( req.user.role === "Employer" )
      var employer = await Employer.findById(req.user._id).session(session);
    else if ( req.user.role === "User" )
      var employer = await User.findById(req.user._id).session(session);
    //check if job is closed or has expired
    let sjob = await savedJob.findById(req.params.id).session(session);
    if(sjob.status === "Closed")
      return res.status(400).json({status:"400"});
    let job = await jobController.createJob(req,sjob,employer,0);
    if(!job) return res.status(400).json({status:"400"});
    job = await Job.create([job], { session: session });
    job = job [0];
    sjob.jobRef = job._id;
    sjob.extension = 0;
    sjob.expireAt = job.expireAt;
    employer.jobs = employer.jobs.filter(
      (job) => job.sid != req.params.id
    );
    employer.jobs = [
      ...employer.jobs,
      {
        title: job.title,
        id: job._id,
        sid: sjob._id,
      },
    ];
    await sjob.save({ session });
    await employer.save({ session });
    //commit transaction
    await session.commitTransaction();
    session.endSession();
    req.logIn(employer,function(err){
      if(err)return res.status(500).json({err:"Error logging in"});
      res.json({status:"200"});
    });
    //res.json({status:"200"});

    } catch(err) {
      // any 500 error in try block aborts transaction
     await session.abortTransaction();
     session.endSession();
     console.log(err);
     res.status(500).json({status:"500"});  
    }
         
});

// Accept an day job applicant
router.put("/apply/freelance/:id",middleware.checkFreelanceJobOwnership, async (req, res) => {
  //start transaction
const session = await mongoose.startSession();
session.startTransaction();
const server_error = new Error("500");
const client_error = new Error("400");
try {
  //check user role
  if ( req.user.role === "Employer" )
    var employer = await Employer.findById(req.user._id).session(session);
  else if ( req.user.role === "User" )
    var employer = await User.findById(req.user._id).session(session);
  //find applicant
  let user = await User.findById(req.body.id).session(session);
  if(!user) throw client_error;
  //check applicants 
  let job = await Freelance.findById(req.params.id).session(session);
  let sjob = await savedFreelance.findOne({jobRef:job._id}).session(session);
  //if user has applied
  const appliedUserId = job.applicants.map((item) => {
    return mongoose.Types.ObjectId(item.id);
  })
  if(!appliedUserId.includes(req.body.id))
    return res.status(400).json({err : "Candidate has not applied to this job"});
  // if user has already been accepted
  const acceptedUserId = job.acceptedApplicants.map((item) => {
    return mongoose.Types.ObjectId(item.id);
    });
  if(acceptedUserId.includes(req.body.id))
    return res.status(400).json({err:"Candidate already accepted"});
  //create applicant 
  let applicant = await jobController.createApplicant(user);
  if(job.category==="Day Job")
    mailController.acceptApplicantDay(applicant,employer,job);
  else if(job.category==="Locum")
    mailController.acceptApplicantLocum(applicant,employer,job);
  //accept applicants
  //if (job.description.count - job.acceptedApplicants.length === 0){
    //delete freelance max applicants
    if(job.sponsored==="true")
      employer.sponsors.closed+=1;
    if(job.category==="Day Job")
      employer.freelancetier.closed+=1;
    if(job.category==="Locum")
      employer.locumtier.closed+=1;
    sjob.status = "Closed";
    await Freelance.deleteOne({_id:req.params.id}).session(session);
  //}
  //else{
    // job.acceptedApplicants.push(applicant);
    // await job.save({ session });
  //}
  //save applicant to saved job
  sjob.acceptedApplicants.push(applicant);
  await sjob.save({ session });
  //save applicant to employer
  if(!employer.acceptedApplicants.some(acc=>acc.username===applicant.username))
  employer.acceptedApplicants.push(applicant);
  await employer.save({ session });
  //commit transaction
  await session.commitTransaction();
  session.endSession();
  req.logIn(employer,function (err){
    if (err) {
      return res.status(400).json({ err: err });
    }
    res.json({status:"200"});
  });

  

  } catch(err){
    // any 500 error in try block aborts transaction
    await session.abortTransaction();
    session.endSession();
    console.log(err);
    res.status(500).json({status:"500"});    
  }
});
module.exports = router;