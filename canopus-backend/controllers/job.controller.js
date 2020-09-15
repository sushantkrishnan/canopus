
const router = require("express").Router(),
  passport = require("passport"),
  middleware = require("../middleware/index"),
  User = require("../models/user.model"),
  Job = require("../models/job.model"),
  Freelance = require("../models/freelance.model"),
  Employer = require("../models/employer.model"),
  savedJob = require("../models/savedJobs.model"),
  savedFreelance = require("../models/savedFreelance.model");


  async function assignTier(req,employer,type){
    //checking tier on basis of job category
    var subscription;
    if(req.body.category === "Job") subscription="jobtier";
    else if(req.body.category === "Day Job") subscription="freelancetier";
    else if(req.body.category === "Locum") subscription = "locumtier";
    else return false;

    // // checking if employer is validated and limiting jobs
    // if (type=== "posted" && employer.validated == false && (employer[subscription][type] > 0) )
    //   return false;

    //updating job tier
    if (employer[subscription].allowed - employer[subscription][type] <= 0)
      return false;
    else employer[subscription][type] += 1;

     //checking sponsorship status
    if(req.body.sponsored === "true" && employer.sponsors.posted >= employer.sponsors.allowed)
     return false;
    else if(req.body.sponsored === "true") 
     employer.sponsors.posted += 1;
     
    return employer;
    
  }
//create job
async function createJob(req,employer){
    let author = {};
    author.username = req.user.username;
    author.id = req.user._id;
    //different author options for employer and user
    if(req.user.role === "Employer"){
    author.instituteName = req.user.instituteName;
    author.photo = req.user.logo;
    }
    else{
      author.name = `${employer.salutation} ${employer.firstName} ${employer.lastName}`;
    }
    if(req.body.category === "Job"){
    //set expiry date
    var expiry = new Date();
    expiry.setDate(expiry.getDate() + 45);

    let job = new Job({
        author:author,
        title: req.body.title,
        profession: req.body.profession,
        specialization: req.body.specialization,
        superSpecialization: req.body.superSpecialization,
        tag:req.body.tag,
        description: req.body.description,
        address: req.body.address,
        createdAt: new Date(),
        createdBy: req.user.role,
        expireAt: expiry,
        validated: employer.validated,
        sponsored: req.body.sponsored || false,
        extension: 1,
      });
    return job;
    }
    else if(req.body.category === "Day Job" || req.body.category === "Locum"){

        let freelance = new Freelance({
            author : author,
            title : req.body.title,
            profession : req.body.profession,
            specialization : req.body.specialization,
            superSpecialization : req.body.superSpecialization,
            tag : req.body.tag,
            description : req.body.description,
            address : req.body.address,
            startDate : req.body.startDate,
            endDate : req.body.endDate,
            attachedApplicants : req.body.attachedApplicants,
            category : req.body.category,
            createdAt : new Date(),
            createdBy : req.user.role,
            expireAt : req.body.endDate,
            validated : employer.validated,
            sponsored : req.body.sponsored || false ,
        });
        return freelance;
    }
    else return false;
    //  return freelance;
   
}
//create saved job
async function createSavedJob(req,job,status){
  let author = {};
    author.username = req.user.username;
    author.id = req.user._id;
    //different author options for employer and user
    if(req.user.role === "Employer"){
    author.instituteName = req.user.instituteName;
    author.photo = req.user.logo;
    }
    else{
      author.name = `${req.user.salutation} ${req.user.firstName} ${req.user.lastName}`;
    }
    if(req.body.category === "Job"){
      let sjob = new savedJob({
          jobRef: job._id,
          status: status,
          author: author,
          title: job.title,
          profession: job.profession,
          specialization: job.specialization,
          superSpecialization: job.superSpecialization,
          tag : req.body.tag,
          description: job.description,
          address: job.address,
          createdAt: new Date(),
          createdBy: req.user.role,
          extension: 1,
        });
        return sjob;
    }
    else{
      let freelance = new savedFreelance({
        jobRef: job._id,
        status: status,
        author: author,
        title: req.body.title,
        profession: req.body.profession,
        specialization: req.body.specialization,
        superSpecialization: req.body.superSpecialization,
        tag : req.body.tag,
        description: req.body.description,
        address: req.body.address,
        startDate: req.body.startDate,
        endDate: req.body.endDate,
        attachedApplicants: req.body.attachedApplicants,
        createdAt: new Date(),
        createdBy: req.user.role,
        category: req.body.category,
      });
      return freelance;
    }
}

async function updateQueryBuilder(req){
  var query={};
  query.update={};
  if(req.body.title) query.update["title"]=req.body.title;
  if(req.body.profession) query.update["profession"]=req.body.profession;
  if(req.body.specialization) query.update["specialization"]=req.body.specialization
  if(req.body.superSpecialization) query.update["superSpecialization"]=req.body.superSpecialization;
  if(req.body.tag)query.update["tag"]=req.body.tag;
  if(req.body.address) query.update["address"]=req.body.address;
  if(req.body.description) query.update["description"]=req.body.description;
  if(req.body.tag) query.update["tag"]=req.body.tag;
  //console.log(query.update);
  return query;
}
exports.jobController = { createJob, createSavedJob,assignTier };