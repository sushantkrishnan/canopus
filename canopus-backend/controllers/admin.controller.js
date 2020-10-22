//create job
async function createJob(data,employer,category,extension){
     let author = {};
     author.username = employer.username;
     author.id = employer._id;
     author.instituteName = employer.description.organization;
     author.photo = employer.logo;
     
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
         category:category,
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