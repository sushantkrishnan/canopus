
require("dotenv").config();
const checkbox_secret_key=process.env.CAPTCHA_BACKEND;
const invisible_secret_key = process.env.CAPTCHA_INVISIBLE_BACKEND;
const request = require('request');

async function verifyCheckBoxCaptcha(req){
    //&remoteip=${req.connection.remoteAddress}
    let token = req.body.captcha;
    let flag = false
    const url = `https://www.google.com/recaptcha/api/siteverify?secret=${checkbox_secret_key}&response=${token}`;
    if(token === null || token === undefined)
    return false;
    return new Promise((resolve, reject)=>{
        request(url,function(err,response,body){
            body = JSON.parse(body);
            if(body.success!==true)
            reject(false);
        resolve(true);
        });
});
}

async function verifyInvisibleCaptcha(req){
    let token = req.body.captcha;
    let flag = false
    const url = `https://www.google.com/recaptcha/api/siteverify?secret=${invisible_secret_key}&response=${token}`;
    if(token === null || token === undefined)
    return false;
    return new Promise((resolve, reject)=>{
        request(url,function(err,response,body){
            if(err)reject(false);
            body = JSON.parse(body);
            if(body.success!==true)
            reject(false);
        resolve(true);
        });
});
}
async function EmployerProfileUpdateBuilder(req) {
    var query = {};
    query.update = {};
    query.jobUpdate = {};
    if (req.body.firstName) query.update["firstName"] = req.body.firstName;
    if (req.body.lastName) query.update["lastName"] = req.body.lastName;
    if (req.body.phone) query.update["phone"] = req.body.phone;
    if (req.body.logo) {
        query.update["logo"] = req.body.logo;
        query.jobUpdate["author.photo"] = req.body.logo;
    } 
    if (req.body.specialty) query.update["specialty"] = req.body.specialty;
    if (req.body.specialty==="")query.update["specialty"]="";
    if (req.body.links) query.update["links"] = req.body.links;
    if (req.body.image) query.update["image"] = req.body.image;
    if (req.body.address) query.update["address"] = req.body.address;
    if (req.body.description){
        if (req.body.description.organization) {
            // query.update["instituteName"] = req.body.institutename;
             query.jobUpdate["author.instituteName"] = req.body.description.organization;
             //console.log(req.body.description.organization);
         }
         query.update["description"] = req.body.description;
    }
        
    if (req.body.youtube) query.update["youtube"] = req.body.youtube;
    query.update["lastUpdated"] = Date.now();
    //console.log(query.update);

    return query;
}

async function UserProfileUpdateBuilder(req) {
    var query = {};
    query.update = {};
    if (req.body.salutation) query.update["salutation"] = req.body.salutation;
    if (req.body.firstName) query.update["firstName"] = req.body.firstName;
    if (req.body.lastName) query.update["lastName"] = req.body.lastName;
    if (req.body.title) query.update["title"] = req.body.title;
    if (req.body.dob) query.update["dob"] = req.body.dob;
    if (req.body.phone) query.update["phone"] = req.body.phone;
    if (req.body.profession) query.update["profession"] = req.body.profession;
    if (req.body.availability) query.update["availability"] = req.body.availability;
    if (req.body.specialization) query.update["specialization"] = req.body.specialization;
    if (req.body.superSpecialization) query.update["superSpecialization"] = req.body.superSpecialization;
    if (req.body.experience) query.update["experience"] = req.body.experience;
    if (req.body.resume) query.update["resume"] = req.body.resume;
    if (req.body.image) query.update["image"] = req.body.image;
    if (req.body.address) query.update["address"] = req.body.address;
    if (req.body.description) query.update["description"] = req.body.description;
    if (req.body.gender) query.update["gender"] = req.body.gender;
    if (req.body.availability) query.update["availability"] = req.body.availability;
    if (req.body.education) query.update["education"] = req.body.education;
    query.update["lastUpdated"] = Date.now();
    //console.log(query.update);

    return query;
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
  

async function updateRequestValidator(req){
    let data = await readFileAsync();
    var flag = false;
    // perform validation
}
function initTier(user){
    user.jobtier= {
        allowed: 1,
        posted: 0,
        saved: 0,
        closed: 0,
    };
    user.freelancetier= {
        allowed: 1,
        posted: 0,
        saved: 0,
        closed: 0,
    };
    user.locumtier={
        allowed: 1,
        posted: 0,
        saved: 0,
        closed: 0,
    };
    user.sponsors={
        allowed: 0,
        posted: 0,
        closed:0,
    };
    user.validated=false;
    user.createdAt= Date.now();
    user.lastUpdated = new Date(0);
    user.emailVerified = true;
    return user;
}
function initUserTier(user){
    user.jobtier= {
        allowed: 0,
        posted: 0,
        saved: 0,
        closed: 0,
    };
    user.freelancetier= {
        allowed: 0,
        posted: 0,
        saved: 0,
        closed: 0,
    };
    user.locumtier={
        allowed: 0,
        posted: 0,
        saved: 0,
        closed: 0,
    };
    user.sponsors={
        allowed: 0,
        posted: 0,
        closed:0,
    };
    user.validated=false;
    user.createdAt= Date.now();
    user.lastUpdated = new Date(0);
    user.emailVerified = true;
    return user;
}
const validationController = {};
exports.validationController = {
    EmployerProfileUpdateBuilder,
    UserProfileUpdateBuilder,
    verifyCheckBoxCaptcha,
    verifyInvisibleCaptcha,
    initTier,
    initUserTier
};
