const { mailController } = require("../controllers/mail.controller");
const { validationController } = require("../controllers/validation.controller");
const { jobController } = require("../controllers/job.controller");

const mongoose = require("mongoose");
  crypto = require("crypto"),
  { promisify } = require("util"),
  router = require("express").Router(),
  passport = require("passport"),
  middleware = require("../middleware/index");
//initalize models
const User           = require("../models/user.model"),
      Job            = require("../models/job.model"),
      Freelance      = require("../models/freelance.model"), 
      savedJob       = require("../models/savedJobs.model"),
      savedFreelance = require("../models/savedFreelance.model");


//===========================================================================
//Sign up route
router.post("/", async (req, res) => {
 //captcha validation
 let captcha = true;
  try{
       captcha = await validationController.verifyInvisibleCaptcha(req);
    } catch(err){return res.status(400).json({err:"Invalid Captcha"});}
  if(!captcha)
  return res.status(400).json({err:"Invalid Captcha"});
 const token = (await promisify(crypto.randomBytes)(20)).toString("hex");
  const user = new User({
    username: req.body.username,
    emailVerifiedToken:token,
    emailVerified:false,
    createdAt: Date.now(),
    validated: false,
    jobtier: {
      allowed: 0,
      posted: 0,
      saved: 0,
      closed: 0,
    },
    freelancetier: {
      allowed: 0,
      posted: 0,
      saved: 0,
      closed: 0,
    },
    locumtier: {
      allowed: 0,
      posted: 0,
      saved: 0,
      closed: 0,
    },
    sponsors: {
      posted:0,
      allowed:0,
      closed:0,
    },
    role: "User",
    lastUpdated:new Date(0),
  });
  if(req.body.password.length > 20) 
    return res.status(400).json({err :{message:"Password should be maximum 20 characters"}});
  User.register(user, req.body.password)
    .then((user) => {
     // mailController.validateMailUser(req,user,token);
      passport.authenticate("user")(req, res, () => {
        res.json({ user: user });
      });
    })
    .catch((err) => res.status(400).json({ err:{message: "User already exists" }}));
});
//===========================================================================

router.post("/login", async function (req, res, next) {
  //captcha validation
  let captcha = true;
  try{
       captcha = await validationController.verifyInvisibleCaptcha(req);
    } catch(err){return res.status(400).json({err:"Invalid Captcha"});}
  if(!captcha)
  return res.status(400).json({err:"Invalid Captcha"});
  passport.authenticate("user", (err, user, info) => {
    if (err) {
      return res.status(400).json({ err: err });
    }
    if (!user) {
      if(info.name==="NoSaltValueStoredError"){
        info.message="Please login with your social media account";
        return res.status(400).json({err:info})
      }
      else{
        info.message="Login Failed - Incorrect Email/Password Combination";
        return res.status(400).json({ err:info });
      }
    }
    req.logIn(user, function (err) {
      if (err) {
        return res.status(400).json({ err: err });
      }
      return res.json({
        user: req.user,
        message: `${req.user.username} Logged in`,
      });
    });
  })(req, res, next);
});
//===========================================================================
router.post("/forgot", async (req, res) => {
  //captcha validation
  let captcha = true;
  try{
       captcha = await validationController.verifyInvisibleCaptcha(req);
    } catch(err){return res.status(400).json({err:"Invalid Captcha"});}
  if(!captcha)
  return res.status(400).json({err:"Invalid Captcha"});
  const token = (await promisify(crypto.randomBytes)(20)).toString("hex");
  if(req.body.username=='' || !req.body.username)
  return res.status(400).json({err:"Bad request"});
  User.findOneAndUpdate(
    { username: req.body.username },
    {
      $set: {
        resetPasswordToken: token,
        resetPasswordExpires: Date.now() + 3600000,
      },
    }
  )
    .then((user) => {
      if(user===null)
            return res.status(400).json({err:{message:"Email not found, please register your account or contact support@curoid.co'"}});
     // console.log(token);
      mailController.forgotMail(req, user, token,"user");
      res.json({ status: "Email has been sent" });
    })
    .catch((err) => {
      res.status(400).json({ err: "Wrong email " });
    });
});

router.put("/forgot/:token", async (req, res) => {
   //start transaction
   const session = await mongoose.startSession();
   session.startTransaction();
   const server_error = new Error("500");
   const client_error = new Error("400");
   //try block
   try {
  var employer = await User.findOne({ resetPasswordToken: req.params.token }).session(session);
    if (
      employer.resetPasswordExpires > Date.now() &&
      crypto.timingSafeEqual(
        Buffer.from(employer.resetPasswordToken),
        Buffer.from(req.params.token)
      )
    )
    await employer.setPassword(req.body.password);
    await employer.save({session});
    employer = await User.findOneAndUpdate(
        { resetPasswordToken: req.params.token },
        { $unset: { resetPasswordToken: 1, resetPasswordExpires: 1 } },
        { new:true,session:session}
      );
        //commit transaction
    await session.commitTransaction();
    session.endSession();
      req.logIn(employer, function (err) {
        if (err) {
          return res.status(400).json({ err: err });
        }
        return res.json({
          employer: req.user,
          message: `${req.user.username} Logged in`,
        });
      });
      } catch (err) {

        console.log(err);
        // any 500 error in try block aborts transaction
        await session.abortTransaction();
        session.endSession();
        res.status(500).json({status:"501"});
      } 
});

router.post("/validate", middleware.isUser,async (req, res) => {
  const token = (await promisify(crypto.randomBytes)(20)).toString("hex");
  if(req.body.username=='' || !req.body.username || req.user.emailVerified)
  return res.status(400).json({err:"Bad request"});
  User.findOneAndUpdate(
    { username: req.body.username },
    {
      $set: {
        emailVerifiedToken: token
      },
    }
  )
    .then((user) => {
      console.log(token);
     mailController.validateMail(req, user, token,"user");
      res.json({ status: "Email has been sent" });
    })
    .catch((err) => {
      res.status(400).json({ err: "User not found" });
    });
});

router.get("/validate/:token", async (req, res) => {
     //start transaction
   const session = await mongoose.startSession();
   session.startTransaction();
   const server_error = new Error("500");
   const client_error = new Error("400");
   //try block
   try {
  var user = await User.findOne({ emailVerifiedToken: req.params.token }).session(session);
    if (
      crypto.timingSafeEqual(
        Buffer.from(user.emailVerifiedToken),
        Buffer.from(req.params.token)
      )
    )
    user.emailVerified=true;
    await user.save({session});
    await User.findOneAndUpdate(
        { emailVerifiedToken: req.params.token },
        { $unset: { emailVerifiedToken: 1 } },
        { session:session}
      );
    //commit transaction
        try{
            req.logIn(user, function (err) {
                if (err) res.json({status:"200"});
                res.json({status:"200"});
        });
        } catch(err){
            res.json({status:"200"})
        }
    await session.commitTransaction();
    session.endSession();
   // res.json({status:"200"});
      } catch (err) {
        // any 500 error in try block aborts transaction
        await session.abortTransaction();
        session.endSession();
        console.log(err);
        res.status(500).json({status:"501"});
      } 
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
//===========================================================================

//Get user profile details

router.get("/profile", middleware.isUser, (req, res) => {
  User.findById(req.user._id)
    .then((user) => res.json(user))
    .catch((err) => res.status(400).json({ err: err }));
});
//===========================================================================
//get user profile by id
router.get("/profile/:id", (req, res) => {
  User.findById(req.params.id)
    .then((user) => res.json(user))
    .catch((err) => res.status(400).json({ err: err }));
});

// User profile update

router.put("/profile/update/", middleware.isUser, async (req, res) => {
  query = await validationController.UserProfileUpdateBuilder(req);
  User.findByIdAndUpdate(
    { _id: req.user._id },
    { $set: query.update },
    { new: true },
    // the callback function
    (err, todo) => {
     // console.log(todo);
      // Handle any possible database errors
      if (err) return res.status(500).send(err);
      req.login(todo, (err) => {
        if (err) return res.status(500).send(err);
        return res.send(todo);
      });
      // return res.send(todo);
    }
  );
});

// get user applied jobs
router.get("/applied/jobs",middleware.isUser,(req ,res) =>{
  let job_id=req.user.applied.map(item=>{
    return item.id;
  });
  Job.find({_id:{$in:job_id}},{applicants:0,acceptedApplicants:0,'author.username':0}).then((jobs) =>{
      res.json({jobs:jobs});
  }).catch((err)=>{res.status(400).json({err:"No applied Jobs"})});
});

//get user applied freelance jobs
router.get("/applied/freelance",middleware.isUser,(req ,res) =>{
  let job_id=req.user.appliedFreelance.map(item=>{
    return item.id;
  });
  Freelance.find({_id:{$in:job_id}},{applicants:0,acceptedApplicants:0,'author.username':0}).then((jobs) =>{
      res.json({jobs:jobs});
  }).catch((err)=>{res.status(400).json({err:"No applied Jobs"})});
});

// request to post jobs
// router.post("/request", middleware.isUser,async  (req, res) => {
//     //start transaction
//     const session = await mongoose.startSession();
//     session.startTransaction();
//     const server_error = new Error("500");
//     const client_error = new Error("400");
//     try{
//     var user = await User.findById(req.user._id).session(session);
//     if (user.jobtier.allowed + user.freelancetier.allowed + user.locumtier.allowed != 0 )
//       return res.status(400).json({ err: "Already Applied for jobs" });
//     if (req.body.endDate) {
//       const expiry = new Date(req.body.endDate);
//       var days = (expiry - Date.now()) / (1000 * 60 * 60 * 24);
//       if (days < 0 || days > 90)
//         return res.status(400).send("Invalid time format");
//     }
//     var type
//     if(req.body.category === "Full-time" || req.body.category === "Part-time")
//       type = "jobtier";
//     else if(req.body.category === "Day Job")
//       type = "freelancetier";
//     else if(req.body.category === "Locum")
//       type = "locumtier";
//     else return res.status(400).json({status:"400"});
//     user[type] = {
//         allowed: 1,
//         posted: 1,
//         saved: 0,
//         closed: 0,
//     };
//     //DB operations start here
//     //create job
//     let job = await jobController.createJob(req,req.body,user);
//     if(!job) throw client_error;

//     //insert job
//     if(req.body.category === "Full-time" || req.body.category === "Part-time")
//       job = await Job.create([job], { session: session });
//     else
//       job = await Freelance.create([job],{ session: session });
//     //only arrays can be used in transactions so casting is necessary
//     job = job[0];

//     //create saved job
//     let sjob = await jobController.createSavedJob(req,job,"Active");
//     if(!sjob) throw client_error;

//     var type;
//     if(req.body.category === "Full-time" || req.body.category === "Part-time"){
//       sjob = await savedJob.create([sjob], { session: session });
//       type = "jobs";
//     }
//     else {
//       sjob = await savedFreelance.create([sjob],{ session: session });
//       type = "freelanceJobs";
//     }
//     sjob = sjob[0];

//     //update employer add job and saved job ref
//     user[type].push(
//       {
//         title: job.title,
//         id: job._id,
//         sid: sjob._id,
//       });
//     //save changes to employer
//     await job.save({ session });
//     await user.save({ session });
//     //commit transaction
//     await session.commitTransaction();
//     session.endSession();
//     res.json({status:"200"});
//     } catch(err) {
//       // any 500 error in try block aborts transaction
//     await session.abortTransaction();
//     session.endSession();
//     console.log(err);
//     res.status(500).json({status:"500"});  
//     }
// });


// //get multiple jobs
// router.get("/all/jobs", middleware.isUser, (req, res) => {
//   User.findById(req.user._id)
//     .then((user) => {
//       const id = user.jobs.map((job) => {
//         return job.id;
//       });
//       console.log(id);
//       Job.find({ _id: { $in: id } })
//         .then((jobs) => {
//           res.json({ jobs: jobs });
//         })
//         .catch((err) => {
//           res.json({ err: "Jobs not found" });
//         });
//     })
//     .catch((err) => {
//       res.json({ err: "User not found" });
//     });
// });

// //get multiple freelance jobs
// router.get("/all/freelance", middleware.isUser, (req, res) => {
//   User.findById(req.user._id)
//     .then((user) => {
//       const id = user.freelanceJobs.map((job) => {
//         return job.id;
//       });
//       console.log(id);
//       Freelance.find({ _id: { $in: id } })
//         .then((jobs) => {
//           res.json({ jobs: jobs });
//         })
//         .catch((err) => {
//           res.json({ err: "Jobs not found" });
//         });
//     })
//     .catch((err) => {
//       res.json({ err: "User not found" });
//     });
// });

// // get multiple saved jobs
// router.get("/all/savedJobs", middleware.isUser, (req, res) => {
//   User.findById(req.user._id)
//     .then((user) => {
//       const ID = user.savedJobs.map((item) => {
//         return mongoose.Types.ObjectId(item.id);
//       });
//       savedJob
//         .find({ _id: { $in: ID } })
//         .then((jobs) => {
//           res.json({ jobs: jobs });
//         })
//         .catch((err) => {
//           res.json({ err: "Jobs not found" });
//         });
//     })
//     .catch((err) => {
//       res.json({ err: "User not found" });
//     });
// });

// //  get multiple saved freelance jobs
// router.get("/all/savedFreelance", middleware.isUser, (req, res) => {
//   User.findById(req.user._id)
//     .then((user) => {
//       const ID = user.savedFreelance.map((item) => {
//         return mongoose.Types.ObjectId(item.id);
//       });
//       console.log(ID);
//       savedFreelance
//         .find({ _id: { $in: ID } })
//         .then((jobs) => {
//           res.json({ jobs: jobs });
//         })
//         .catch((err) => {
//           res.json({ err: "Jobs not found" });
//         });
//     })
//     .catch((err) => {
//       res.json({ err: "User not found" });
//     });
// });
// // get expired jobs
// router.get("/all/expiredJobs", middleware.isUser, (req, res) => {
//   User.findById(req.user._id)
//     .then((user) => {
//       const ID = user.jobs.map((item) => {
//         return mongoose.Types.ObjectId(item.id);
//       });
//       console.log(ID);
//       var active = [];
//       var inactive = [];
//       let promises = [];
//       for (let i = 0; i < ID.length; i++) {
//         promises.push(
//           new Promise((resolve, reject) => {
//             const id = ID[i];
//             Job.findById(id)
//               .then((job) => {
//                 if (job == null) inactive.push(id);
//                 else active.push(id);
//                 resolve("Done");
//               })
//               .catch((err) => {
//                 inactive.push(id);
//                 resolve("Done");
//               });
//           })
//         );
//       }
//       Promise.all(promises)
//         .then((msg) => {
//           console.log(inactive);
//           savedJob
//             .find({ jobRef: { $in: inactive } })
//             .then((jobs) => {
//               res.json({ jobs: jobs });
//             })
//             .catch((err) => {
//               res.json({ err: "Error finding expired jobs" });
//             });
//         })
//         .catch((err) => res.json({ err: "Couldn't find expired jobs" }));
//     })
//     .catch((err) => res.json({ err: "Couldn't find User" }));
// });
// // get expired freelance jobs
// router.get("/all/expiredFreelance", middleware.isUser, (req, res) => {
//   console.log(req.user._id);
//   User.findById(req.user._id)
//     .then((user) => {
//       const ID = user.freelanceJobs.map((item) => {
//         return mongoose.Types.ObjectId(item.id);
//       });
//       var active = [];
//       var inactive = [];
//       let promises = [];
//       for (let i = 0; i < ID.length; i++) {
//         promises.push(
//           new Promise((resolve, reject) => {
//             const id = ID[i];
//             Freelance.findById(id)
//               .then((job) => {
//                 if (job == null) inactive.push(id);
//                 else active.push(id);
//                 resolve("Done");
//               })
//               .catch((err) => {
//                 inactive.push(id);
//                 resolve("Done");
//               });
//           })
//         );
//       }
//       Promise.all(promises)
//         .then((msg) => {
//           console.log(inactive);
//           savedFreelance
//             .find({ jobRef: { $in: inactive } })
//             .then((jobs) => {
//               res.json({ jobs: jobs });
//             })
//             .catch((err) => {
//               res.json({ err: "Error finding expired jobs" });
//             });
//         })
//         .catch((err) => res.json({ err: "Couldn't find expired jobs" }));
//     })
//     .catch((err) => res.json({ err: "Couldn't find user" }));
// });
// //get saved job
// router.get("/save/job/:id", middleware.isUser, (req, res) => {
//   savedJob
//     .findById(req.params.id)
//     .then((job) => {
//       res.json(job);
//     })
//     .catch((err) => res.status(400).json({ err: "Job not found" }));
// });
// //get saved freelance job
// router.get("/save/freelance/:id", middleware.isUser, (req, res) => {
//   savedFreelance
//     .findById(req.params.id)
//     .then((job) => {
//       res.json(job);
//     })
//     .catch((err) => res.status(400).json({ err: "Job not found" }));
// });
// //get a job by id
// router.get("/post/job/:id", (req, res) => {
//   Job.findById(req.params.id)
//     .then((job) => {
//       res.json(job);
//     })
//     .catch((err) => res.status(400).json({ err: err }));
// });
// //get a freelance job by id
// router.get("/post/freelance/:id", (req, res) => {
//   Freelance.findById(req.params.id)
//     .then((job) => {
//       res.json(job);
//     })
//     .catch((err) => res.status(400).json({ err: err }));
// });

// //delete a job

// router.delete("/post/job/:id", middleware.checkJobOwnership, (req, res) => {
//   Job.findByIdAndDelete(req.params.id)
//     .then(() => res.json("Job deleted successfully !"))
//     .catch((err) =>
//       res.status(400).json({
//         err: err,
//       })
//     );
// });
// //delete a job

// router.delete("/save/job/:id", middleware.isUser, (req, res) => {
//   User.findById(req.user._id)
//     .then((user) => {
//       if (user.savedJobs.includes(req.params.id))
//         savedJob
//           .findByIdAndDelete(req.params.id)
//           .then(() => res.json("Saved Job deleted successfully !"))
//           .catch((err) =>
//             res.status(400).json({
//               err: err,
//             })
//           );
//     })
//     .catch((err) => {
//       res.json({ err: "Job doesn't belong to you" });
//     });
// });
// //delete a job

// router.delete(
//   "/post/freelance/:id",
//   middleware.checkFreelanceJobOwnership,
//   (req, res) => {
//     Freelance.findByIdAndDelete(req.params.id)
//       .then(() => res.json("Freelance Job deleted successfully !"))
//       .catch((err) =>
//         res.status(400).json({
//           err: err,
//         })
//       );
//   }
// );
// //delete a job

// router.delete("/save/freelance/:id", middleware.isUser, (req, res) => {
//   User.findById(req.user._id)
//     .then((user) => {
//       if (user.savedJobs.includes(req.params.id))
//         savedFreelance
//           .findByIdAndDelete(req.params.id)
//           .then(() => res.json("Saved Freelance Job deleted successfully !"))
//           .catch((err) =>
//             res.status(400).json({
//               err: err,
//             })
//           );
//     })
//     .catch((err) => {
//       res.json({ err: "Job doesn't belong to you" });
//     });
// });
module.exports = router;