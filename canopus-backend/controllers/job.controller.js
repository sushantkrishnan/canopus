
const router = require("express").Router(),
  passport = require("passport"),
  middleware = require("../middleware/index"),
  User = require("../models/user.model"),
  Job = require("../models/job.model"),
  Freelance = require("../models/freelance.model"),
  Employer = require("../models/employer.model"),
  savedJob = require("../models/savedJobs.model"),
  savedFreelance = require("../models/savedFreelance.model");
const fs = require("fs"),
  path = require('path'),    
  filePath = path.join(__dirname, '../canopus-frontend/build/data.json');
  

  async function assignTier(req,employer,type){
    //checking tier on basis of job category
    var subscription;
    if(req.body.category === "Full-time" || req.body.category === "Part-time") subscription="jobtier";
    else if(req.body.category === "Day Job") subscription="freelancetier";
    else if(req.body.category === "Locum") subscription = "locumtier";
    else throw "Incorrect Job Category";
    // //check email validity
    // if(!employer.emailVerified)
    //   throw "Email verification pending. Please verify your email.";
    //checking if employer is validated and limiting jobs
    if (type=== "posted" && employer.validated === false)
      throw "Jobs can be posted once your account is verified. Please save the job details to post later.";

    //updating job tier
    if(type==="posted"){
    if (employer[subscription].allowed - employer[subscription].posted <= 0)
    {   
      if(req.body.category === "Full-time")
        throw "You have reached the limit for the number of jobs you can post. Please contact us to post more jobs.";
      if(req.body.category === "Day Job")
        throw "You have reached the limit for the number of Day Jobs you can post. Please contact us to post more jobs.";
      if(req.body.category === "Locum")
        throw "You have reached the limit for the number of Locum Jobs you can post. Please contact us to post more jobs.";
      
    }
    else employer[subscription][type] += 1;
      //checking sponsorship status
    if(req.body.sponsored === "true" || req.body.sponsored===true){
      if(employer.sponsors.allowed - employer.sponsors.posted <= 0)
        throw "You have reached the limit for the number of jobs you can promote. Please contact us to allocate more slots.";
      else employer.sponsors.posted+=1;
      // if(employer.sponsors.posted === employer.sponsors.allowed || employer.sponsors.posted > employer.sponsors.allowed)  
      // else employer.sponsors.posted += 1;
     }
    }
    else if(type==="saved"){
      if(employer[subscription].saved >= 20)
      throw "Maximum Jobs Saved";
      else employer[subscription].saved+=1;
    }

   
    return employer;
    
  }
//create job
async function createJob(req,data,employer,extension){
   let valid = await validateRequest(req);
  if(!valid)return false; 
    let author = {};
    author.username = req.user.username;
    author.id = req.user._id;
    author.instituteName = req.user.description.organization;
    //different author options for employer and user
    if(req.user.role === "Employer"){
    author.photo = req.user.logo;
    }
    if(req.body.category === "Full-time" || req.body.category === "Part-time" || data.category==="Full-time"){
    //set expiry date
    var expiry = new Date();
    expiry.setDate(expiry.getDate() + 45);

    let job = new Job({
        author:author,
        title: data.title,
        profession: data.profession,
        specialization: data.specialization,
        superSpecialization: data.superSpecialization,
        tag:data.tag,
        description: data.description,
        address: data.address,
        createdAt: new Date(),
        createdBy: req.user.role,
        expireAt: expiry,
        validated: employer.validated,
        sponsored: data.sponsored || false,
        extension: extension || 1,
        category:data.category,
      });
    return job;
    }
    else if(req.body.category === "Day Job" || req.body.category === "Locum"){

        let freelance = new Freelance({
            author : author,
            title : data.title,
            profession : data.profession,
            specialization : data.specialization,
            superSpecialization : data.superSpecialization,
            tag : data.tag,
            description : data.description,
            address : data.address,
            startDate : data.startDate,
            endDate : data.endDate,
            attachedApplicants : data.attachedApplicants,
            category : data.category,
            createdAt : new Date(),
            createdBy : req.user.role,
            expireAt : data.endDate,
            validated : employer.validated,
            sponsored : data.sponsored || false ,
        });
        return freelance;
    }
    else return false;
    //  return freelance;
   
}
//create saved job
async function createSavedJob(req,data,status){
  let valid = await validateRequest(req);
  if(!valid)return false; 
  let author = {};
    author.username = req.user.username;
    author.id = req.user._id;
    //different author options for employer and user
    if(req.user.role === "Employer"){
    author.instituteName = req.user.description.organization;
    author.photo = req.user.logo;
    }
    else{
      author.name = `${req.user.salutation} ${req.user.firstName} ${req.user.lastName}`;
    }
    if(req.body.category === "Full-time" || req.body.category === "Part-time"){
      let sjob = new savedJob({
          jobRef: data._id,
          status: status,
          author: author,
          title: data.title,
          profession: data.profession,
          specialization: data.specialization,
          superSpecialization: data.superSpecialization,
          tag : data.tag,
          description: data.description,
          address: data.address,
          createdAt: new Date(),
          createdBy: req.user.role,
          extension: 1,
          category:data.category,
        });
        return sjob;
    }
    else{
      let freelance = new savedFreelance({
        jobRef: data._id,
        status: status,
        author: author,
        title: data.title,
        profession: data.profession,
        specialization: data.specialization,
        superSpecialization: data.superSpecialization,
        tag : data.tag,
        description: data.description,
        address: data.address,
        startDate: data.startDate,
        endDate: data.endDate,
        attachedApplicants: data.attachedApplicants,
        createdAt: new Date(),
        createdBy: req.user.role,
        category: data.category,
      });
      return freelance;
    }
}

async function updateQueryBuilder(req){
  let valid = await validateUpdateRequest(req);
  if(!valid)return false; 
  var query={};
  if(req.body.title) query["title"]=req.body.title;
  if(req.body.profession) query["profession"]=req.body.profession;
  if(req.body.specialization) query["specialization"]=req.body.specialization
  if(req.body.superSpecialization) query["superSpecialization"]=req.body.superSpecialization;
  if(req.body.tag) query["tag"]=req.body.tag;
  if(req.body.address) query["address"]=req.body.address;
  if(req.body.description) query["description"]=req.body.description;
  if(req.body.startDate) query["startDate"]=req.body.startDate;
  if(req.body.endDate){query["endDate"]=req.body.endDate;query["expireAt"]=req.body.endDate;}
  return query;
}
//date validator

// async function locumDateValidator(req,job,context){
//   if(context==="post"){
//     if((req.body.startDate  - Date.now())/ (1000 * 60 * 60 * 24)>60)
//       return false;
//     let days =(req.body.endDate - req.body.startDate)/ (1000 * 60 * 60 * 24);
//     if (days < 0 || days > 30)
//       return false;
//     return true;
//   }
//   else if(context==="update"){
//     if(req.body.endDate && req.body.startDate){
//       if((req.body.startDate  - job.createdAt)/ (1000 * 60 * 60 * 24)>60)
//         return false;
//       let days =(req.body.endDate - req.body.startDate)/ (1000 * 60 * 60 * 24);
//       if (days < 0 || days > 30)
//         return false;
//       return true;
//     }
//     else if(req.body.endDate){
//       let days =(req.body.endDate - job.startDate)/ (1000 * 60 * 60 * 24);
//       if (days < 0 || days > 30)
//         return false;
//       else return true;
//     }
//     else if(req.body.startDate){
//       if((req.body.startDate  - job.createdAt)/ (1000 * 60 * 60 * 24)>60)
//         return false;
//       else return true;
//     }
//     else return true;
//   }
//   else return false;
// }
async function attachedApplicantValidator(req,employer){
  if(req.body.attachedApplicants){
    const acceptedMail = employer.acceptedApplicants.map(applicant=>{
      return applicant.username;
    });
    const attachedMail = req.body.attachedApplicants.map(applicant => {
      return applicant.username;
    });

    if(!attachedMail.every(mail=> acceptedMail.includes(mail)))
      return false;
    else{
      console.log(attachedMail);
      return true;
      //mail notify
    }
  }
  else return true;
}

async function attachedApplicantUpdateValidator(req,job,employer){
  if(req.body.attachedApplicants){
    const acceptedMail = employer.acceptedApplicants.map(applicant=>{
      return applicant.username;
    });
    const notifiedMail = job.attachedApplicants.map(applicant=>{
      return applicant.username;
    });
    const attachedMail = req.body.attachedApplicants.map(applicant => {
      return applicant.username;
    });

    if(!attachedMail.every(mail=> acceptedMail.includes(mail) && !notifiedMail.includes(mail)))
      return false;
    else{
      console.log(attachedMail);
      return true;
      //mail notify
    }
  }
  else return true;
}
async function createApplicant(user){
  return {
    id: user._id,
    name: `${user.salutation} ${user.firstName} ${user.lastName}`,
    image: user.image,
    username: user.username,
    phone: user.phone,
    profession:user.profession,
    specialization:user.specialization,
    superSpecialization:user.superSpecialization
  };
}

async function readFileAsync(){
  var data=null;
  return new Promise((resolve, reject)=>{
      fs.readFile(filePath, function(err, rawdata) {
              if (err) throw err;
              data=JSON.parse(rawdata);
              //console.log(data);
              resolve(data);
         });
      })
}

async function validateRequest(req){
  return true;
  let data = await readFileAsync();
  var flag = false;
  // perform validation
  // incentives validation
  if(req.body.description.incentives){
    if(req.body.description.incentives.every(incentive=>data.incentive.includes(incentive)))
    flag = true;
    else  return false;
  }
  // experience validation
  if(req.body.description.experience){
    if(data.experience.some(experience=>experience===req.body.description.experience))
    flag = true;
    else  return false;
  }
  //type validation
  if(req.body.description.type){
    if(data.type.some(type=>type===req.body.description.type))
    flag = true;
    else  return false;
  }
  //tag validation
  if(req.body.tag){
    if(data.tags.includes(req.body.tag))
    flag = true;
    else return false;
  }
  // profession specialization superspecialization validation
  if(req.body.superSpecialization){
    if(data.superSpecializations.some(data=>
      data.superSpecialization.includes(req.body.superSpecialization) &&
      data.specialization===req.body.specialization && 
      data.profession===req.body.profession
    ))
    flag = true;
  }
  else if(req.body.specialization){
    if(data.specializations.some(data=>
      data.specialization.includes(req.body.specialization) && 
      data.profession===req.body.profession
    ))
    flag = true;
  }
  else if(req.body.profession){
    if(data.professions.some(profession=>
      profession===req.body.profession
    ))
    flag = true;
  }
  else flag = false;
  return flag;

}
async function validateUpdateRequest(req){
  return true;
  let data = await readFileAsync();
  var flag = true;
  // perform validation
  // incentives validation
  if(req.body.description.incentives){
    if(req.body.description.incentives.every(incentive=>data.incentive.includes(incentive)))
    flag = true;
    else return false;
  }
  // experience validation
  if(req.body.description.experience){
    if(data.experience.some(experience=>experience===req.body.description.experience))
    flag = true;
    else return false;
  }
  //type validation
  if(req.body.description.type){
    if(data.type.some(type=>type===req.body.description.type))
    flag = true;
    else return false;
  }
  //tag validation
  if(req.body.tag){
    if(data.tags.includes(req.body.tag))
    flag = true;
    else return false;
  }
  //else return false;
  // profession specialization superspecialization validation
  if(req.body.superSpecialization){
    if(data.superSpecializations.some(data=>
      data.superSpecialization.includes(req.body.superSpecialization) &&
      data.specialization===req.body.specialization && 
      data.profession===req.body.profession
    ))
    flag = true;
  }
  else if(req.body.specialization){
    if(data.specializations.some(data=>
      data.specialization.includes(req.body.specialization) && 
      data.profession===req.body.profession
    ))
    flag = true;
  }
  else if(req.body.profession){
    if(data.professions.some(profession=>
      profession===req.body.profession
    ))
    flag = true;
  }
  return flag;

}
exports.jobController = { createJob, createSavedJob, assignTier, updateQueryBuilder ,createApplicant, attachedApplicantValidator,attachedApplicantUpdateValidator};