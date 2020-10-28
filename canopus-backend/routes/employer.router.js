// initialize controllers
const { searchController } = require("../controllers/search.controller");
const { mailController } = require("../controllers/mail.controller");
const {
    validationController,
} = require("../controllers/validation.controller");
const { jobController } = require("../controllers/job.controller");
// dependencies
const mongoose = require("mongoose");
const crypto = require("crypto");
const { promisify } = require("util");
const router = require("express").Router(),
    passport = require("passport"),
    middleware = require("../middleware/index");
//initalize models
const User = require("../models/user.model"),
    Employer = require("../models/employer.model"),
    Job = require("../models/job.model"),
    Freelance = require("../models/freelance.model"),
    savedJob = require("../models/savedJobs.model"),
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
    const employer = new Employer({
        username: req.body.username,
        emailVerifiedToken: token,
        emailVerified: false,
        role: "Employer",
        jobtier: {
            allowed: 1,
            posted: 0,
            saved: 0,
            closed: 0,
        },
        freelancetier: {
            allowed: 1,
            posted: 0,
            saved: 0,
            closed: 0,
        },
        locumtier: {
            allowed: 1,
            posted: 0,
            saved: 0,
            closed: 0,
        },
        sponsors: {
            allowed: 0,
            posted: 0,
            closed:0,
        },
        validated: false,
        createdAt: Date.now(),
        lastUpdated:new Date(0),
    });
    if(req.body.password.length > 20) 
        return res.status(400).json({err :{message:"Password should be maximum 20 characters"}});
    Employer.register(employer, req.body.password)
        .then((employer) => {
           // mailController.validateMailEmployer(req, employer, token);
            passport.authenticate("employer")(req, res, () => {
                res.json({ employer: employer });
            });
        })
        .catch((err) => res.status(400).json({ err:{message: "User already exists" }}));
});
//===========================================================================
//Login route
router.post("/login", async function (req, res,next) {
  //captcha validation
//   let captcha = true;
//   try{
//        captcha = await validationController.verifyInvisibleCaptcha(req);
//     } catch(err){return res.status(400).json({err:"Invalid Captcha"});}
//   if(!captcha)
//   return res.status(400).json({err:"Invalid Captcha"});
  passport.authenticate("employer", function (err, employer, info) {
    if (err) {
        console.log(err);
      return res.status(400).json({ err: "Incorrect Email/Password" });
    }
    if (!employer) {
        if(info.name==="NoSaltValueStoredError"){
            info.message="You have signed up using your social media account. Please use the same account to login.";
            return res.status(400).json({err:info})
          }
          else{
            info.message="Login Failed - Incorrect Email/Password combination";
            return res.status(400).json({ err:info });
          }
    }
    req.logIn(employer, function (err) {
      if (err) {
        return res.status(400).json({ err: err });
      }
      return res.json({
        employer: req.user,
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
    if (req.body.username == "" || !req.body.username)
        return res.status(400).json({ err: "Bad request" });
    Employer.findOneAndUpdate(
        { username: req.body.username },
        {
            $set: {
                resetPasswordToken: token,
                resetPasswordExpires: Date.now() + 3600000,
            },
        },
    )
        .then((user) => {
            if(user===null)
                return res.status(400).json({err:{message:"Email not found, please register your account or contact support@curoid.co'"}});
            //console.log(token);
            mailController.forgotMail(req, user, token,"employer");
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
        var employer = await Employer.findOne({
            resetPasswordToken: req.params.token,
        }).session(session);
        if (
            employer.resetPasswordExpires > Date.now() &&
            crypto.timingSafeEqual(
                Buffer.from(employer.resetPasswordToken),
                Buffer.from(req.params.token),
            )
        )
            await employer.setPassword(req.body.password);
        await employer.save({ session });
        employer = await Employer.findOneAndUpdate(
            { resetPasswordToken: req.params.token },
            { $unset: { resetPasswordToken: 1, resetPasswordExpires: 1 } },
            { new: true, session: session },
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
        res.status(500).json({ status: "501" });
    }
});

router.post("/validate", middleware.isEmployer, async (req, res) => {
    const token = (await promisify(crypto.randomBytes)(20)).toString("hex");
    if (req.body.username == "" || !req.body.username || req.user.emailVerified===true)
        return res.status(400).json({ err: "Bad request" });
    Employer.findOneAndUpdate(
        { username: req.body.username },
        {
            $set: {
                emailVerifiedToken: token,
            },
        },
    )
        .then((user) => {
            console.log(token);
            mailController.validateMail(req, user, token,"employer");
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
        var user = await Employer.findOne({
            emailVerifiedToken: req.params.token,
        }).session(session);
        if (
            crypto.timingSafeEqual(
                Buffer.from(user.emailVerifiedToken),
                Buffer.from(req.params.token),
            )
        )
            user.emailVerified = true;
        await user.save({ session });
        await Employer.findOneAndUpdate(
            { emailVerifiedToken: req.params.token },
            { $unset: { emailVerifiedToken: 1 } },
            { session: session },
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
    } catch (err) {
        // any 500 error in try block aborts transaction
        await session.abortTransaction();
        session.endSession();
        console.log(err);
        res.status(500).json({ status: "501" });
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

//===========================================================================
//Get employer details

router.get("/profile", middleware.isEmployer, (req, res) => {
    Employer.findById(req.user._id)
        .then((employer) => res.json(employer))
        .catch((err) => res.status(400).json({ err: err }));
});

//===========================================================================

// public profile get

router.get("/profile/:id", (req, res) => {
    Employer.findOne(
        { _id: req.params.id },
        {
            hash: 0,
            salt: 0,
            jobtier: 0,
            freelancetier: 0,
            locumtier: 0,
            savedJobs: 0,
            savedFreelance: 0,
            username: 0,
            firstName: 0,
            lastName: 0,
            acceptedApplicants:0,
        },
    )
        .then((employer) => {
            res.json(employer);
        })
        .catch((err) => {
            res.status(404).json({ err: "Couldn't find employer" });
        });
});

// public jobs
//get multiple jobs
router.get("/profile/:id/jobs", (req, res) => {
    Employer.findById(req.params.id)
        .then((employer) => {
            const id = employer.jobs.map((job) => {
                return job.id;
            });
             
            Job.find(
                { _id: { $in: id } },
                { applicants: 0, acceptedApplicants: 0 },
            )
                .then((jobs) => {
                    res.json({ jobs: jobs });
                })
                .catch((err) => {
                    res.json({ err: "Jobs not found" });
                });
        })
        .catch((err) => {
            res.json({ err: "Employer not found" });
        });
});

//get multiple freelance jobs
router.get("/profile/:id/freelance", (req, res) => {
    Employer.findById(req.params.id)
        .then((employer) => {
            const id = employer.freelanceJobs.map((job) => {
                return job.id;
            });

            Freelance.find(
                { _id: { $in: id } },
                { applicants: 0, acceptedApplicants: 0 },
            )
                .then((jobs) => {
                    res.json({ jobs: jobs });
                })
                .catch((err) => {
                    res.json({ err: "Jobs not found" });
                });
        })
        .catch((err) => {
            res.json({ err: "Employer not found" });
        });
});
// Employer profile update

router.put("/profile/update/", middleware.isEmployer, async (req, res) => {
    query = await validationController.EmployerProfileUpdateBuilder(req);
    let employer = await Employer.findOneAndUpdate({ _id: req.user._id },{ $set: query.update },{ new: true });
    if (employer.jobs.length > 0 &&(req.body.logo || req.body.description.organization)) {
                const id = employer.jobs.map((item) => {
                    return item.id;
                });
                Job.updateMany({ _id: { $in: id } }, { $set: query.jobUpdate })
                    .then(() => {
                        console.log("Updated");
                        
                    })
                    .catch((err) => {
                        console.log(err);
                    });
            }
    if (employer.freelanceJobs.length > 0 && (req.body.logo || req.body.description.organization)) {
                const id = employer.freelanceJobs.map((item) => {
                    return item.id;
                });
                Freelance.updateMany(
                    { _id: { $in: id } },
                    { $set: query.jobUpdate },
                )
                    .then(() => {
                        
                                console.log("Updated");
                           
                    })
                    .catch((err) => {
                       console.log(err);
                    });
            }
            //if(employer.jobs.length)
            // Handle any possible database errors
           // if (err) return res.status(500).send(err);
           let d = new Date(req.user.lastUpdated).toString();
            let o = new Date(0).toString();
           if(d===o)
            mailController.welcomeMail(req,employer);
            req.logIn(employer, (err) => {
                if (err) return res.status(500).send(err);
                return res.send(employer);
            });
            // return res.send(todo);
       // },
    //);
});

//get multiple jobs
router.get("/all/jobs", middleware.isEmployer, (req, res) => {
    Employer.findById(req.user._id)
        .then((employer) => {
            const id = employer.jobs.map((job) => {
                return job.id;
            });
            Job.find({ _id: { $in: id } })
                .then((jobs) => {
                    res.json({ jobs: jobs });
                })
                .catch((err) => {
                    res.json({ err: "Jobs not found" });
                });
        })
        .catch((err) => {
            res.json({ err: "Employer not found" });
        });
});

//get multiple freelance jobs
router.get("/all/freelance", middleware.isEmployer, (req, res) => {
    Employer.findById(req.user._id)
        .then((employer) => {
            const id = employer.freelanceJobs.map((job) => {
                return job.id;
            });
            Freelance.find({ _id: { $in: id } })
                .then((jobs) => {
                    res.json({ jobs: jobs });
                })
                .catch((err) => {
                    res.json({ err: "Jobs not found" });
                });
        })
        .catch((err) => {
            res.json({ err: "Employer not found" });
        });
});

// get multiple saved jobs
router.get("/all/savedJobs", middleware.isEmployer, (req, res) => {
    Employer.findById(req.user._id)
        .then((employer) => {
            const ID = employer.savedJobs.map((item) => {
                return mongoose.Types.ObjectId(item.id);
            });
            savedJob
                .find({ _id: { $in: ID } })
                .then((jobs) => {
                    res.json({ jobs: jobs });
                })
                .catch((err) => {
                    res.json({ err: "Jobs not found" });
                });
        })
        .catch((err) => {
            res.json({ err: "Employer not found" });
        });
});

//  get multiple saved freelance jobs
router.get("/all/savedFreelance", middleware.isEmployer, (req, res) => {
    Employer.findById(req.user._id)
        .then((employer) => {
            const ID = employer.savedFreelance.map((item) => {
                return mongoose.Types.ObjectId(item.id);
            });

            savedFreelance
                .find({ _id: { $in: ID } })
                .then((jobs) => {
                    res.json({ jobs: jobs });
                })
                .catch((err) => {
                    res.json({ err: "Jobs not found" });
                });
        })
        .catch((err) => {
            res.json({ err: "Employer not found" });
        });
});
// get expired jobs
router.get("/all/expiredJobs", middleware.isEmployer, (req, res) => {
    Employer.findById(req.user._id)
        .then((employer) => {
            const ID = employer.jobs.map((item) => {
                return mongoose.Types.ObjectId(item.id);
            });
            var active = [];
            var inactive = [];
            let promises = [];
            for (let i = 0; i < ID.length; i++) {
                promises.push(
                    new Promise((resolve, reject) => {
                        const id = ID[i];
                        Job.findById(id)
                            .then((job) => {
                                if (job == null) inactive.push(id);
                                else active.push(id);
                                resolve("Done");
                            })
                            .catch((err) => {
                                inactive.push(id);
                                resolve("Done");
                            });
                    }),
                );
            }
            Promise.all(promises)
                .then((msg) => {
                    savedJob
                        .find({ jobRef: { $in: inactive } })
                        .then((jobs) => {
                            res.json({ jobs: jobs });
                        })
                        .catch((err) => {
                            res.json({ err: "Error finding expired jobs" });
                        });
                })
                .catch((err) =>
                    res.json({ err: "Couldn't find expired jobs" }),
                );
        })
        .catch((err) => res.json({ err: "Couldn't find Employer" }));
});
// get expired freelance jobs
router.get("/all/expiredFreelance", middleware.isEmployer, (req, res) => {
    Employer.findById(req.user._id)
        .then((employer) => {
            const ID = employer.freelanceJobs.map((item) => {
                return mongoose.Types.ObjectId(item.id);
            });
            var active = [];
            var inactive = [];
            let promises = [];
            for (let i = 0; i < ID.length; i++) {
                promises.push(
                    new Promise((resolve, reject) => {
                        const id = ID[i];
                        Freelance.findById(id)
                            .then((job) => {
                                if (job == null) inactive.push(id);
                                else active.push(id);
                                resolve("Done");
                            })
                            .catch((err) => {
                                inactive.push(id);
                                resolve("Done");
                            });
                    }),
                );
            }
            Promise.all(promises)
                .then((msg) => {
                    savedFreelance
                        .find({ jobRef: { $in: inactive } })
                        .then((jobs) => {
                            res.json({ jobs: jobs });
                        })
                        .catch((err) => {
                            res.json({ err: "Error finding expired jobs" });
                        });
                })
                .catch((err) =>
                    res.json({ err: "Couldn't find expired jobs" }),
                );
        })
        .catch((err) => res.json({ err: "Couldn't find employer" }));
});
//get saved job
router.get("/save/job/:id", middleware.isEmployer, (req, res) => {
    Employer.findById(req.user._id)
        .then((employer) => {
            const id = employer.jobs.map((item) => {
                //if(item.sid==req.params.id)
                return item.sid;
            });
            if (
                id.includes(req.params.id) ||
                employer.savedJobs.includes(req.params.id)
            )
                savedJob
                    .findById(req.params.id)
                    .then((job) => {
                        res.json(job);
                    })
                    .catch((err) =>
                        res.status(400).json({ err: "Job not found" }),
                    );
            else
                return res
                    .status(400)
                    .json({ err: "Job doesn't belong to you" });
        })
        .catch((err) => res.status(400).json({ err: "Not employer" }));
});
//get saved freelance job
router.get("/save/freelance/:id", middleware.isEmployer, (req, res) => {
    Employer.findById(req.user._id)
        .then((employer) => {
            const id = employer.freelanceJobs.map((item) => {
                //if(item.sid==req.params.id)
                return item.sid;
            });
            if (
                id.includes(req.params.id) ||
                employer.savedFreelance.includes(req.params.id)
            )
                //	return res.status(400).json({err:"Job doesnt belong to you"});
                savedFreelance
                    .findById(req.params.id)
                    .then((job) => {
                        res.json(job);
                    })
                    .catch((err) =>
                        res.status(400).json({ err: "Job not found" }),
                    );
            else
                return res
                    .status(400)
                    .json({ err: "Job doesnt belong to you" });
        })
        .catch((err) => res.status(400).json({ err: "Not employer" }));
});
//get a job by id
router.get("/post/job/:id", middleware.checkJobOwnership, (req, res) => {
    Job.findById(req.params.id)
        .then((job) => {
            res.json(job);
        })
        .catch((err) => res.status(400).json({ err: err }));
});
//get a freelance job by id
router.get(
    "/post/freelance/:id",
    middleware.checkFreelanceJobOwnership,
    (req, res) => {
        Freelance.findById(req.params.id)
            .then((job) => {
                res.json(job);
            })
            .catch((err) => res.status(400).json({ err: err }));
    },
);

//delete a job

router.delete("/post/job/:id", middleware.checkJobOwnership, (req, res) => {
    // Employer.findById(req.user._id).then((employer)=>{
    // 	const id=employer.jobs.map(item=>{
    // 		if(item.id==req.params.id)
    // 		return item.sid;
    // 	});
    savedJob
        .findOne({ jobRef: req.params.id })
        .then((sjob) => {
            sjob.status = "Closed";
            sjob.save()
                .then((sjob) => {
                    // 	console.log(id);
                    // 	savedJob.findByIdAndDelete(id).then((del)=>{
                    Job.findByIdAndDelete(req.params.id) 
                    //.then((del)=>{
                        // employer.jobs = employer.jobs.filter(job => job.id != req.params.id);
                        // 	employer.save()
                        .then((job) => {
                            Employer.findById(req.user._id).then((employer)=>{
                                if(job.sponsored==="true")
                                employer.sponsors.closed+=1;
                                employer.jobtier.closed+=1;
                                employer.save().then(()=>{;
                                req.logIn(employer,(err)=>{
                                res.json("Job deleted successfully !");});
                            });
                        });
                            })
                            
                        .catch((err) =>
                            res.status(400).json({
                                err: err,
                            }),
                        );
                })
                .catch((err) => {
                    res.json({ err: "Job doesn't belong to you" });
                });
        })
        .catch((err) => {
            res.json({ err: "Job doesn't belong to you" });
        });
    // }).catch((err)=>{res.json({err:"Job doesn't belong to you"})});
});
//delete a job

router.delete("/save/job/:id", middleware.isEmployer, (req, res) => {
    Employer.findById(req.user._id)
        .then((employer) => {
            if (!employer.savedJobs.includes(req.params.id))
                return res
                    .status(400)
                    .json({
                        err: "Job doesn't belong to you/ Incorrect job ID",
                    });
            employer.savedJobs.splice(
                employer.savedJobs.indexOf(
                    mongoose.Types.ObjectId(req.params.id),
                ),
                1,
            );
            employer.jobtier.saved += -1;
            employer
                .save()
                .then((semployer) => {
                    savedJob
                        .findByIdAndDelete(req.params.id)
                        .then(() =>
                            res.json("Saved Job deleted successfully !"),
                        )
                        .catch((err) =>
                            res.status(400).json({
                                err: err,
                            }),
                        );
                })
                .catch((err) => {
                    res.status(500).json({ err: "Error Saving Employer" });
                });
        })
        .catch((err) => {
            res.status(500).json({ err: "Job doesn't belong to you" });
        });
});
//delete a job

router.delete(
    "/post/freelance/:id",
    middleware.checkFreelanceJobOwnership,
    (req, res) => {
        //Employer.findById(req.user._id).then((employer)=>{
        // const id=employer.freelanceJobs.map(item=>{
        // 	if(item.id==req.params.id)
        // 	return item.sid;
        // });
        // console.log(id);
        savedFreelance
            .findOne({ jobRef: req.params.id })
            .then((sjob) => {
                sjob.status = "Closed";
                sjob.save()
                    .then((sjob) => {
                        // savedFreelance.findByIdAndDelete(id).then((del)=>{
                        Freelance.findByIdAndDelete(req.params.id) //.then((del)=>{
                            //employer.freelanceJobs = employer.freelanceJobs.filter(job => job.id != req.params.id);
                            //employer.save()
                            .then((job) =>{
                            Employer.findById(req.user._id).then((employer)=>{
                                if(job.sponsored==="true")
                                employer.sponsors.closed+=1;
                                if(job.category ==="Day Job")
                                employer.freelancetier.closed+=1;
                                else if(job.category==="Locum")
                                employer.locumtier.closed+=1;
                                employer.save().then(()=>{;
                                req.logIn(employer,(err)=>{
                                res.json("Job deleted successfully !");});
                            }).catch((err)=>
                                res.status(500).json({err:err})
                            );
                        }).catch((err)=>res.status(400).json({err:err}));
                            })
                            .catch((err) =>
                                res.status(400).json({
                                    err: err,
                                }),
                            );
                    })
                    .catch((err) => {
                        res.json({ err: "Job doesn't belong to you" });
                    });
            })
            .catch((err) => {
                res.json({ err: "Job doesn't belong to you" });
            });
        // }).catch((err)=>{res.json({err:"Job doesn't belong to you"})});
    },
);
//delete a job

router.delete("/save/freelance/:id", middleware.isEmployer, (req, res) => {
    Employer.findById(req.user._id)
        .then((employer) => {
            if (!employer.savedFreelance.includes(req.params.id))
                return res
                    .status(400)
                    .json({
                        err: "Job doesn't belong to you/ Incorrect job ID",
                    });
            employer.savedFreelance.splice(
                employer.savedFreelance.indexOf(
                    mongoose.Types.ObjectId(req.params.id),
                ),
                1,
            );
   
                    savedFreelance
                        .findByIdAndDelete(req.params.id)
                        .then((sjob) =>{
                            if(sjob.category ==="Day Job")
                                employer.freelancetier.saved+=-1;
                                else if(sjob.category==="Locum")
                                employer.locumtier.saved+=-1;
                                employer.save().then((s_employer)=>{
                                    req.logIn(s_employer,(err)=>{
                            res.json(
                                "Saved Freelance Job deleted successfully !");
                            });
                        }).catch((err) =>
                            res.status(400).json({
                                err: err,
                            }),
                        );
                })
                .catch((err) => {
                    res.json({ err: "Error Saving Employer" });
                });
        })
        .catch((err) => {
            res.json({ err: "Job doesn't belong to you" });
        });
});

module.exports = router;
