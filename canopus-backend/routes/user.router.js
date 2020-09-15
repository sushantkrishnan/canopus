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
  Tag = require("../models/tag.model"),
  Job = require("../models/job.model"),
  Freelance = require("../models/freelance.model"),
  savedJob = require("../models/savedJobs.model"),
  savedFreelance = require("../models/savedFreelance.model");

//===========================================================================
//get all users
router.route("/").get((req, res) => {
  User.find()
    .then((users) => {
      res.json({
        users: users.map((user) => {
          return { username: user };
        }),
      });
    })
    .catch((err) => res.status(400).json({ err: err }));
});
//===========================================================================
//Sign up route
router.post("/", (req, res) => {
  const user = new User({
    username: req.body.username,
    salutation: req.body.salutation,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    address: req.body.address,
    description: req.body.description,
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
    },
    // address: {
    //     pin: req.body.pin,
    //     city: req.body.city,
    //     state: req.body.state,
    // },
    experience: req.body.experience,
    role: "User",
  });
  User.register(user, req.body.password)
    .then((user) => {
      passport.authenticate("user")(req, res, () => {
        res.json({ user: user });
      });
    })
    .catch((err) => res.status(400).json({ err: err }));
});
//===========================================================================
//Login route
// router.post("/login", passport.authenticate("user"), (req, res) => {
//     res.json({ user: req.user, message: `${req.user.username} Logged in` });
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
      visitor.event("User", "Login").send();
      return res.json({
        user: req.user,
        message: `${req.user.username} Logged in`,
      });
    });
  })(req, res, next);
});
//===========================================================================
//Logout route
router.get("/logout", (req, res) => {
  req.logout();
  res.json({ message: "Logged Out" });
});
router.get("/current", (req, res) => {
  res.json({ user: req.user });
});
//===========================================================================
//Forgot password route

router.post("/forgot", async (req, res, next) => {
  const token = (await promisify(crypto.randomBytes)(20)).toString("hex");
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
      console.log(token);
      mailController
        .forgotMail(req, user, token)
        .then((response) => {
          res.json({ status: "Email has been sent" });
          //res.redirect('/forgot');
        })
        .catch((err) => {
          res.json({ err: "Mail not sent" });
        });
    })
    .catch((err) => {
      res.json({ err: "User not found" });
    });
});

router.post("/reset/:token", async (req, res) => {
  User.findOne({ resetPasswordToken: req.params.token })
    .then((user) => {
      if (
        user.resetPasswordExpires > Date.now() &&
        crypto.timingSafeEqual(
          Buffer.from(user.resetPasswordToken),
          Buffer.from(req.params.token)
        )
      )
        // console.log(user);
        // if (!user) {
        //   req.flash('error', 'Password reset token is invalid or has expired.');
        //   return res.redirect('/forgot');
        // }
        user
          .setPassword(req.body.password)
          .then((user) => {
            //user.save();
            user
              .save()
              .then((user) => {
                User.findOneAndUpdate(
                  { resetPasswordToken: req.params.token },
                  { $unset: { resetPasswordToken: 1, resetPasswordExpires: 1 } }
                )
                  .then((user) => {
                    const resetEmail = {
                      to: user.username,
                      from:
                        "postmaster@sandboxa6c1b3d7a13a4122aaa846d7cd3f96a2.mailgun.org",
                      subject: "Your password has been changed",
                      text: `
              This is a confirmation that the password for your account "${user.username}" has just been changed.
            `,
                    };
                    mailController.transport.sendMail(resetEmail);
                    res.json({ status: "Updated" });
                  })
                  .catch((err) => {
                    res.status(400).json({ err: "Fields not unset" });
                  });
              })
              .catch((err) => {
                res.status(400).json({ err: "Password not saved" });
              });
          })
          .catch((err) => {
            res.status(400).json({ err: "Password not set" });
          });
      //req.flash('success', `Success! Your password has been changed.`);
    })
    .catch((err) => {
      res.json({ err: "User not found" });
    });
});

//verify email

//regenerate mail verify token
router.post("/forgot", async (req, res, next) => {
  const token = (await promisify(crypto.randomBytes)(20)).toString("hex");
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
      console.log(token);
      mailController
        .forgotMail(req, user, token)
        .then((response) => {
          res.json({ status: "Email has been sent" });
          //res.redirect('/forgot');
        })
        .catch((err) => {
          res.json({ err: "Mail not sent" });
        });
    })
    .catch((err) => {
      res.json({ err: "User not found" });
    });
});
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
      console.log(todo);
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
router.post("/request", middleware.isUser, (req, res) => {
  if (
    req.user.jobtier.allowed +
      req.user.freelancetier.allowed +
      req.user.locumtier.allowed !=
    0
  )
    return res.status(400).json({ err: "Already Applied for jobs" });
  if (req.body.endDate) {
    const expiry = new Date(req.body.endDate);
    var days = (expiry - Date.now()) / (1000 * 60 * 60 * 24);
    if (days < 0 || days > 90)
      return res.status(400).send("Invalid time format");
  }
  if (req.body.category == "Job")
    update = {
      jobtier: {
        allowed: 1,
        posted: 1,
        saved: 0,
        closed: 0,
      },
    };
  else if (req.body.category == "Day Job")
    update = {
      freelancetier: {
        allowed: 1,
        posted: 1,
        saved: 0,
        closed: 0,
      },
    };
  else if (req.body.category == "Locum")
    update = {
      locumtier: {
        allowed: 1,
        posted: 1,
        saved: 0,
        closed: 0,
      },
    };
  else return res.status(400).json({ err: "Invalid job type" });
  User.findByIdAndUpdate(req.user._id, { $set: update })
    .then((user) => {
      if (req.body.category == "Job") {
        let job = new Job({
          title: req.body.title,
          profession: req.body.profession,
          specialization: req.body.specialization,
          superSpecialization: req.body.superSpecialization,
          description: req.body.description,
          address: req.body.address,
          createdAt: new Date(),
          createdBy: "User",
          expireAt: expiry,
          validated: user.validated,
          extension: 1,
        });
        Job.create(job)
          .then((job) => {
            job.author.username = req.user.username;
            job.author.id = req.user._id;
            job.author.instituteName = req.user.instituteName;
            job.author.photo = req.user.logo;
            // job.author.about = req.user.description.about;
            console.log(job);
            job
              .save()
              .then((job) => {
                //let sJob= new savedJob()
                let sjob = new savedJob({
                  jobRef: job._id,
                  status: "Active",
                  title: req.body.title,
                  profession: req.body.profession,
                  specialization: req.body.specialization,
                  superSpecialization: req.body.superSpecialization,
                  description: req.body.description,
                  address: req.body.address,
                  createdAt: new Date(),
                  createdBy: "User",
                  expireAt: expiry,
                  validated: user.validated,
                  extension: 1,
                });
                savedJob
                  .create(sjob)
                  .then((sjob) => {
                    User.findById(req.user._id)
                      .then((user) => {
                        (user.jobs = [
                          ...user.jobs,
                          {
                            title: job.title,
                            id: job._id,
                            sid: sjob._id,
                          },
                        ]),
                          //console.log(job);
                          //user.savedJobs[job._id]=job;
                          //  user.savedJobs=[
                          // ...user.savedJobs,sjob._id

                          // ];
                          user
                            .save()
                            .then((updatedUser) => {
                              // try{
                              // 	mailController.jobPostMail(user,job);}
                              // 	catch(err){console.log(err);}
                              res.json({
                                job: job,
                                user: req.user,
                                updatedUser: updatedUser,
                              });
                            })
                            .catch((err) =>
                              res.status(400).json({
                                err: err,
                              })
                            );
                      })
                      .catch((err) => {
                        res.status(400).json({ err: "User not found" });
                      });
                  })
                  .catch((err) =>
                    res.status(400).json({
                      err: err,
                      user: req.user,
                    })
                  );
              })
              .catch((err) => {
                res.status(400).json({ err: "Job not created" });
              });
          })
          .catch((err) =>
            res.status(400).json({
              err: err,
              user: req.user,
            })
          );
      } else {
        let freelance = new Freelance({
          title: req.body.title,
          profession: req.body.profession,
          specialization: req.body.specialization,
          superSpecialization: req.body.superSpecialization,
          description: req.body.description,
          address: req.body.address,
          startDate: req.body.startDate,
          endDate: req.body.endDate,
          attachedApplicants: req.body.attachedApplicants,
          createdAt: new Date(),
          createdBy: "User",
          expireAt: expiry,
          validated: user.validated,
          extension: 1,
        });
        Freelance.create(freelance)
          .then((job) => {
            job.author.username = req.user.username;
            job.author.id = req.user._id;
            job.author.instituteName = req.user.instituteName;
            job.author.photo = req.user.logo;
            // job.author.about = req.user.description.about;
            //console.log(job);
            job.save().then((job) => {
              console.log(job._id);
              let sfreelance = new savedFreelance({
                jobRef: job._id,
                status: "Active",
                title: req.body.title,
                profession: req.body.profession,
                specialization: req.body.specialization,
                superSpecialization: req.body.superSpecialization,
                description: req.body.description,
                address: req.body.address,
                startDate: req.body.startDate,
                endDate: req.body.endDate,
                attachedApplicants: req.body.attachedApplicants,
                createdAt: new Date(),
                createdBy: "User",
                expireAt: expiry,
                validated: user.validated,
                extension: 1,
              });
              savedFreelance
                .create(sfreelance)
                .then((sjob) => {
                  User.findById(req.user._id)
                    .then((user) => {
                      (user.freelanceJobs = [
                        ...user.freelanceJobs,
                        {
                          title: job.title,
                          id: job._id,
                          sid: sjob._id,
                        },
                      ]),
                        // user.savedFreelance=[
                        // 	...user.savedFreelance,sjob._id
                        // 	];
                        user
                          .save()
                          .then((updatedUser) =>
                            res.json({
                              job: job,
                              user: req.user,
                              updatedUser: updatedUser,
                            })
                          )
                          .catch((err) =>
                            res.status(400).json({
                              err: err,
                            })
                          );
                    })
                    .catch((err) => {
                      res.status(400).json({ err: "User not found" });
                    });
                })
                .catch((err) =>
                  res.status(400).json({
                    err: err,
                    user: req.user,
                  })
                );
            });
          })
          .catch((err) => {
            res.status(400).json({ err: "Job not saved" });
          });
      }
    })
    .catch((err) => {
      res.status(400).json({ err: "User not found" });
    }); //  }).catch((err)=>{res.status(400).json({err:"User not found"})});
});

router.put("/apply/job/:id", middleware.checkJobOwnership, (req, res) => {
  User.findById(req.body.id)
    .then((user) => {
      Job.findById(req.params.id)
        .then((job) => {
          if (job.description.count - job.acceptedApplicants.length == 0)
            return res.status(400).json({ err: "Wrong User" });
          const ids = job.acceptedApplicants.map((item) => {
            return moongose.Types.ObjectId(item.id);
          });
          if (ids.includes(req.body.id))
            return res.status(400).json({ err: "Candidate already accepted" });
          let name = `${user.salutation} ${user.firstName} ${user.lastName}`;
          (job.acceptedApplicants = [
            ...job.acceptedApplicants,
            {
              id: user._id,
              name: name,
              image: user.image,
              username: user.username,
              phone: user.phone,
            },
          ]),
            job
              .save()
              .then((updatedJob) => {
                savedJob
                  .findOne({ jobRef: req.params.id })
                  .then((sjob) => {
                    (sjob.acceptedApplicants = [
                      ...sjob.acceptedApplicants,
                      {
                        id: user._id,
                        name: name,
                        image: user.image,
                        username: user.username,
                        phone: user.phone,
                      },
                    ]),
                      sjob
                        .save()
                        .then((updatedsjob) => {
                          if (
                            updatedJob.description.number -
                              updatedJob.acceptedApplicants.length ==
                            0
                          ) {
                            Job.deleteOne({ _id: req.params.id });
                            res.json({
                              status: "Candidate Accepted and Job closed",
                            });
                          } else res.json({ status: "Candidate Accepted" });
                        })
                        .catch((err) => {
                          res.status(400).json({ err: "Job not saved" });
                        });
                  })
                  .catch((err) => {
                    res.status(400).json({ err: "Saved Job not found" });
                  });
              })
              .catch((err) => {
                res.status(400).json({ err: "Wrong User" });
              });
        })
        .catch((err) => {
          res.status(400).json({ err: "Wrong Job Id" });
        });
    })
    .catch((err) => {
      res.status(400).json({ err: "Wrong user" });
    });
});

// Accept an day job applicant
router.put(
  "/apply/freelance/:id",
  middleware.checkFreelanceJobOwnership,
  (req, res) => {
    User.findById(req.body.id)
      .then((user) => {
        Freelance.findById(req.params.id)
          .then((freelance) => {
            if (
              freelance.description.count -
                freelance.acceptedApplicants.length ==
              0
            )
              return res.status(400).json({ err: "Wrong User" });
            const ids = freelance.acceptedApplicants.map((item) => {
              return mongoose.Types.ObjectId(item.id);
            });
            if (ids.includes(req.body.id))
              return res
                .status(400)
                .json({ err: "Candidate already accepted" });
            (freelance.acceptedApplicants = [
              ...freelance.acceptedApplicants,
              {
                id: user._id,
                name: `${user.salutation} ${user.firstName} ${user.lastName}`,
                image: user.image,
                username: user.username,
                phone: user.phone,
              },
            ]),
              freelance
                .save()
                .then((freelance) => {
                  savedFreelance
                    .findOne({ jobRef: req.params.id })
                    .then((sjob) => {
                      (sjob.acceptedApplicants = [
                        ...sjob.acceptedApplicants,
                        {
                          id: user._id,
                          name: `${user.salutation} ${user.firstName} ${user.lastName}`,
                          image: user.image,
                          username: user.username,
                          phone: user.phone,
                        },
                      ]),
                        sjob
                          .save()
                          .then((updatedsjob) => {
                            User.findById(req.user._id)
                              .then((user) => {
                                (user.acceptedApplicants = [
                                  ...user.acceptedApplicants,
                                  {
                                    id: user._id,
                                    name: `${user.salutation} ${user.firstName} ${user.lastName}`,
                                    image: user.image,
                                    username: user.username,
                                    phone: user.phone,
                                  },
                                ]),
                                  user
                                    .save()
                                    .then((user) => {
                                      if (
                                        freelance.description.number -
                                          freelance.acceptedApplicants.length ==
                                        0
                                      ) {
                                        Freelance.deleteOne({
                                          _id: req.params.id,
                                        });
                                        res.json({
                                          status:
                                            "Candidate Accepted and Job closed",
                                        });
                                      } else
                                        res.json({
                                          status: "Candidate Accepted",
                                        });
                                    })
                                    .catch((err) => {
                                      res
                                        .status(400)
                                        .json({ err: "User not updated" });
                                    });
                              })
                              .catch((err) => {
                                res.status(400).json({ err: "Job not saved" });
                              });
                          })
                          .catch((err) => {
                            res
                              .status(400)
                              .json({ err: "Saved Job not found" });
                          });
                    })
                    .catch((err) => {
                      res.status(400).json({ err: "Job not updated" });
                    });
                })
                .catch((err) => {
                  res.status(400).json({ err: "Wrong User" });
                });
          })
          .catch((err) => {
            res.status(400).json({ err: "Wrong Job Id" });
          });
      })
      .catch((err) => {
        res.status(400).json({ err: "Wrong user" });
      });
  }
);

//extend a job
router.put("/extend/job/:id", middleware.checkJobOwnership, (req, res) => {
  if (!req.body.expireAt)
    return res.status(400).json({ err: "Date parameter required" });
});
//sponsor a job
router.put("/sponsor/job/:id", middleware.checkJobOwnership, (req, res) => {
  User.findById(req.user._id)
    .then((user) => {
      const Id = user.jobs.map((item) => {
        return mongoose.Types.ObjectId(item.id);
      });
      if (!Id.includes(req.params.id))
        return res.status(400).json({ err: "Incorrect job ID" });
      if (user.sponsors.allowed - user.sponsors.posted <= 0)
        return res.status(400).json({ err: "No sponsors remaining" });
      User.findByIdAndUpdate(req.user._id, { $inc: { "sponsors.posted": 1 } })
        .then((user) => {
          Job.findByIdAndUpdate(req.params.id, { $set: { sponsored: true } })
            .then((job) => {
              res.json({ job: job });
            })
            .catch((err) => {
              res.status(400).json({ err: "Job not updated" });
            });
        })
        .catch((err) => {
          res.status(400).json({ err: "User not found" });
        });
    })
    .catch((err) => {
      res.status(400).json({ err: "User not found" });
    });
});

router.put(
  "/sponsor/freelance/:id",
  middleware.checkFreelanceJobOwnership,
  (req, res) => {
    User.findById(req.user._id)
      .then((user) => {
        const Id = user.freelanceJobs.map((item) => {
          return mongoose.Types.ObjectId(item.id);
        });
        if (!Id.includes(req.params.id))
          return res.status(400).json({ err: "Incorrect job ID" });
        if (user.sponsors.allowed - user.sponsors.posted <= 0)
          return res.status(400).json({ err: "No sponsors remaining" });
        User.findByIdAndUpdate(req.user._id, { $inc: { "sponsors.posted": 1 } })
          .then((user) => {
            Freelance.findByIdAndUpdate(req.params.id, {
              $set: { sponsored: true },
            })
              .then((job) => {
                res.json({ job: job });
              })
              .catch((err) => {
                res.status(400).json({ err: "Job not updated" });
              });
          })
          .catch((err) => {
            res.status(400).json({ err: "User not found" });
          });
      })
      .catch((err) => {
        res.status(400).json({ err: "User not found" });
      });
  }
);
//Job related stuff starts here
//post a job
router.post("/post/job", middleware.isUser, (req, res) => {
  const expiry = new Date(req.body.expireAt);
  var days = (expiry - Date.now()) / (1000 * 60 * 60 * 24);
  if (days < 0 || days > 90)
    return res.status(400).json({ err: "Invalid time format" });
  else
    User.findById(req.user._id)
      .then((user) => {
        //validation
        if (user.validated == false && user.jobtier.posted > 0)
          return res
            .status(400)
            .json({ err: "You can only post one Job until you are validated" });
        if (user.jobtier.allowed - user.jobtier.posted <= 0)
          return res.status(400).json({ err: "Max Jobs Posted" });
        else
          User.findByIdAndUpdate(req.user._id, {
            $inc: { "jobtier.posted": 1 },
          })
            .then((user2) => {
              let job = new Job({
                title: req.body.title,
                profession: req.body.profession,
                specialization: req.body.specialization,
                superSpecialization: req.body.superSpecialization,
                description: req.body.description,
                address: req.body.address,
                createdAt: new Date(),
                createdBy: "User",
                expireAt: expiry,
                validated: user.validated,
              });
              Job.create(job).then((job) => {
                job.author.username = req.user.username;
                job.author.id = req.user._id;
                job.author.instituteName = req.user.instituteName;
                job.author.photo = req.user.logo;
                // job.author.about = req.user.description.about;
                console.log(job);
                job
                  .save()
                  .then((job) => {
                    //let sJob= new savedJob()
                    let sjob = new savedJob({
                      jobRef: job._id,
                      status: "Active",
                      title: req.body.title,
                      profession: req.body.profession,
                      specialization: req.body.specialization,
                      superSpecialization: req.body.superSpecialization,
                      description: req.body.description,
                      address: req.body.address,
                      createdAt: new Date(),
                      createdBy: "User",
                      expireAt: expiry,
                      validated: user.validated,
                    });
                    savedJob
                      .create(sjob)
                      .then((sjob) => {
                        User.findById(req.user._id)
                          .then((user) => {
                            (user.jobs = [
                              ...user.jobs,
                              {
                                title: job.title,
                                id: job._id,
                                sid: sjob._id,
                              },
                            ]),
                              //console.log(job);
                              //user.savedJobs[job._id]=job;
                              //  user.savedJobs=[
                              // ...user.savedJobs,sjob._id

                              // ];
                              user
                                .save()
                                .then((updatedUser) => {
                                  // try{
                                  // 	mailController.jobPostMail(user,job);}
                                  // 	catch(err){console.log(err);}
                                  res.json({
                                    job: job,
                                    user: req.user,
                                    updatedUser: updatedUser,
                                  });
                                })
                                .catch((err) =>
                                  res.status(400).json({
                                    err: err,
                                  })
                                );
                          })
                          .catch((err) => {
                            res.status(400).json({ err: "User not found" });
                          });
                      })
                      .catch((err) =>
                        res.status(400).json({
                          err: err,
                          user: req.user,
                        })
                      );
                  })
                  .catch((err) => {
                    res.status(400).json({ err: "Job not created" });
                  });
              });
            })
            .catch((err) =>
              res.status(400).json({
                err: err,
                user: req.user,
              })
            )
            .catch((err) =>
              res.status(400).json({
                err: err,
                user: req.user,
              })
            );
      })
      .catch((err) => {
        res.status(400).json({ err: err });
      });
});

// Post freelance job
router.post("/post/freelance", middleware.isUser, (req, res) => {
  const expiry = new Date(req.body.endDate);
  var days = (expiry - Date.now()) / (1000 * 60 * 60 * 24);
  if (days < 0 || days > 30)
    return res.status(400).json({ err: "Invalid time format" });
  else
    User.findById(req.user._id)
      .then((user) => {
        var update = {};
        if (user.validated == false && user.freelancetier.posted > 0)
          return res
            .status(400)
            .json({ err: "You can only post one Job until you are validated" });
        if (req.body.category == "Day Job") {
          if (user.freelancetier.allowed - user.freelancetier.posted <= 0)
            return res.status(400).json({ err: "Max Jobs Posted" });
          update = { "freelancetier.posted": 1 };
        } else if (req.body.category == "Locum") {
          if (user.locumtier.allowed - user.locumtier.posted <= 0)
            return res.status(400).json({ err: "Max Jobs Posted" });
          update = { "locumtier.posted": 1 };
        } else return res.status(400).json({ err: "Invalid job type" });
        User.findByIdAndUpdate(req.user._id, { $inc: update })
          .then((user2) => {
            let freelance = new Freelance({
              title: req.body.title,
              profession: req.body.profession,
              specialization: req.body.specialization,
              superSpecialization: req.body.superSpecialization,
              description: req.body.description,
              address: req.body.address,
              startDate: req.body.startDate,
              endDate: req.body.endDate,
              attachedApplicants: req.body.attachedApplicants,
              createdAt: new Date(),
              createdBy: "User",
              expireAt: expiry,
              validated: user.validated,
            });
            Freelance.create(freelance)
              .then((job) => {
                job.author.username = req.user.username;
                job.author.id = req.user._id;
                job.author.instituteName = req.user.instituteName;
                job.author.photo = req.user.logo;
                // job.author.about = req.user.description.about;
                //console.log(job);
                job.save().then((job) => {
                  console.log(job._id);
                  let sfreelance = new savedFreelance({
                    jobRef: job._id,
                    status: "Active",
                    title: req.body.title,
                    profession: req.body.profession,
                    specialization: req.body.specialization,
                    superSpecialization: req.body.superSpecialization,
                    description: req.body.description,
                    address: req.body.address,
                    startDate: req.body.startDate,
                    endDate: req.body.endDate,
                    attachedApplicants: req.body.attachedApplicants,
                    createdAt: new Date(),
                    createdBy: "User",
                    expireAt: expiry,
                    validated: user.validated,
                  });
                  savedFreelance
                    .create(sfreelance)
                    .then((sjob) => {
                      User.findById(req.user._id)
                        .then((user) => {
                          (user.freelanceJobs = [
                            ...user.freelanceJobs,
                            {
                              title: job.title,
                              id: job._id,
                              sid: sjob._id,
                            },
                          ]),
                            // user.savedFreelance=[
                            // 	...user.savedFreelance,sjob._id
                            // 	];
                            user
                              .save()
                              .then((updatedUser) =>
                                res.json({
                                  job: job,
                                  user: req.user,
                                  updatedUser: updatedUser,
                                })
                              )
                              .catch((err) =>
                                res.status(400).json({
                                  err: err,
                                })
                              );
                        })
                        .catch((err) => {
                          res.status(400).json({ err: "User not found" });
                        });
                    })
                    .catch((err) =>
                      res.status(400).json({
                        err: err,
                        user: req.user,
                      })
                    );
                });
              })
              .catch((err) => {
                res.status(400).json({ err: "Job not saved" });
              });
          })
          .catch((err) =>
            res.status(400).json({
              err: err,
              user: req.user,
            })
          )
          .catch((err) =>
            res.status(400).json({
              err: err,
              user: req.user,
            })
          );
      })
      .catch((err) => res.status(400).json({ err: err }));
});

//save a job
router.post("/save/job", middleware.isUser, (req, res) => {
  const expiry = new Date(req.body.expireAt);
  var days = (expiry - Date.now()) / (1000 * 60 * 60 * 24);
  if (days < 0 || days > 90)
    return res.status(400).json({ err: "Invalid time format" });
  User.findById(req.user._id)
    .then((user) => {
      //validation
      if (user.jobtier.allowed - user.jobtier.saved <= 0)
        return res.status(400).send("Max Jobs Saved");
      else
        User.findByIdAndUpdate(req.user._id, { $inc: { "jobtier.saved": 1 } })
          .then((user2) => {
            let job = new savedJob({
              status: "Saved",
              title: req.body.title,
              profession: req.body.profession,
              specialization: req.body.specialization,
              superSpecialization: req.body.superSpecialization,
              description: req.body.description,
              address: req.body.address,
              createdAt: new Date(),
              createdBy: "User",
              expireAt: expiry,
              validated: user.validated,
            });
            savedJob.create(job).then((job) => {
              job.author.username = req.user.username;
              job.author.id = req.user._id;
              job.author.instituteName = req.user.instituteName;
              job.author.photo = req.user.logo;
              // job.author.about = req.user.description.about;
              console.log(job);
              job
                .save()
                .then((job) => {
                  console.log(job);
                  User.findById(req.user._id)
                    .then((user) => {
                      //console.log(job);
                      //user.savedJobs[job._id]=job;
                      user.savedJobs = [...user.savedJobs, job._id];
                      user
                        .save()
                        .then((updatedUser) => {
                          res.json({
                            job: job,
                            user: req.user,
                            updatedUser: updatedUser,
                          });
                        })
                        .catch((err) =>
                          res.status(400).json({
                            err: err,
                          })
                        );
                    })
                    .catch((err) => {
                      res.status(400).json({ err: "User not found" });
                    });
                })
                .catch((err) =>
                  res.status(400).json({
                    err: err,
                    user: req.user,
                  })
                );

              //	}).catch((err) => {res.status(400).json({err:"Job not created"})});
            });
          })
          .catch((err) =>
            res.status(400).json({
              err: err,
              user: req.user,
            })
          )
          .catch((err) =>
            res.status(400).json({
              err: err,
              user: req.user,
            })
          );
    })
    .catch((err) => {
      res.status(400).json({ err: err });
    });
});

// Save freelance job
router.post("/save/freelance", middleware.isUser, (req, res) => {
  const expiry = new Date(req.body.endDate);
  var days = (expiry - Date.now()) / (1000 * 60 * 60 * 24);
  if (days < 0 || days > 30)
    return res.status(400).json({ err: "Invalid time format" });
  User.findById(req.user._id)
    .then((user) => {
      var update = {};
      if (req.body.category == "Day Job") {
        if (user.freelancetier.allowed - user.freelancetier.posted <= 0)
          return res.status(400).json({ err: "Max Jobs Posted" });
        update = { "freelancetier.saved": 1 };
      } else if (req.body.category == "Locum") {
        if (user.locumtier.allowed - user.locumtier.posted <= 0)
          return res.status(400).json({ err: "Max Jobs Posted" });
        update = { "locumtier.saved": 1 };
      } else return res.status(400).json({ err: "Invalid job type" });
      User.findByIdAndUpdate(req.user._id, { $inc: update })
        .then((user2) => {
          let freelance = new savedFreelance({
            status: "Saved",
            title: req.body.title,
            profession: req.body.profession,
            specialization: req.body.specialization,
            superSpecialization: req.body.superSpecialization,
            description: req.body.description,
            address: req.body.address,
            startDate: req.body.startDate,
            endDate: expiry,
            attachedApplicants: req.body.attachedApplicants,
            createdAt: new Date(),
            createdBy: "User",
            expireAt: expiry,
            validated: user.validated,
          });
          savedFreelance
            .create(freelance)
            .then((job) => {
              job.author.username = req.user.username;
              job.author.id = req.user._id;
              job.author.instituteName = req.user.instituteName;
              job.author.photo = req.user.logo;
              // job.author.about = req.user.description.about;
              console.log(job);
              job.save().then((job) => {
                User.findById(req.user._id)
                  .then((user) => {
                    user.savedFreelance = [...user.savedFreelance, job._id];
                    user
                      .save()
                      .then((updatedUser) =>
                        res.json({
                          job: job,
                          user: req.user,
                          updatedUser: updatedUser,
                        })
                      )
                      .catch((err) =>
                        res.status(400).json({
                          err: err,
                        })
                      );
                  })
                  .catch((err) => {
                    res.status(400).json({ err: "User not found" });
                  });
              });
            })
            .catch((err) => {
              res.status(400).json({ err: "Job not saved" });
            });
        })
        .catch((err) =>
          res.status(400).json({
            err: err,
            user: req.user,
          })
        )
        .catch((err) =>
          res.status(400).json({
            err: err,
            user: req.user,
          })
        );
    })
    .catch((err) => res.status(400).json({ err: err }));
});

//validate a saved job
router.put("/save/job/activate/:id", middleware.isUser, (req, res) => {
  User.findById(req.user._id)
    .then((user) => {
      if (!user.savedJobs.includes(req.params.id))
        return res.status(400).json({ err: "Wrong job ID" });
      if (user.validated == false && user.jobtier.posted > 1)
        return res
          .status(400)
          .json({ err: "Can only post one job until you are validated" });
      savedJob
        .findById(req.params.id)
        .then((sjob) => {
          const expiry = sjob.expireAt;
          var days = (expiry - Date.now()) / (1000 * 60 * 60 * 24);
          if (days < 0 || days > 90)
            return res.status(400).send("Invalid time range spcified");
          if (user.jobtier.allowed - user.jobtier.saved <= 0)
            return res.status(400).send("Max Jobs Saved");
          else
            User.findByIdAndUpdate(req.user._id, {
              $inc: { "jobtier.posted": 1 },
              $inc: { "jobtier.saved": -1 },
            })
              .then((user2) => {
                let job = new Job({
                  author: sjob.author,
                  title: sjob.title,
                  profession: sjob.profession,
                  specialization: sjob.specialization,
                  superSpecialization: sjob.superSpecialization,
                  description: sjob.description,
                  address: sjob.address,
                  createdAt: new Date(),
                  expireAt: sjob.expiry,
                  validated: user.validated,
                });
                //console.log(job);
                job
                  .save()
                  .then((job) => {
                    //console.log(job._id);
                    user.jobs = [
                      ...user.jobs,
                      {
                        title: job.title,
                        id: job._id,
                        sid: sjob._id,
                      },
                    ];
                    user.savedJobs.splice(user.savedJobs.indexOf(sjob._id), 1);
                    user
                      .save()
                      .then((user) => {
                        sjob.jobRef = job._id;
                        sjob.status = "Active";
                        sjob.createdAt = new Date();
                        sjob.expireAt = expiry;
                        sjob
                          .save()
                          .then((sjob) => {
                            res.status(200).json({ updated: "true" });
                          })
                          .catch((err) => {
                            res
                              .status(400)
                              .json({ err: "Saved job not saved" });
                          });
                      })
                      .catch((err) => {
                        res.status(400).json({ err: "User not updated" });
                      });
                  })
                  .catch((err) => {
                    res.status(400).json({ err: "job not saved" });
                  });
                // User.findOne({_id:req.user._id}).then((user)=>{
              })
              .catch((err) => {
                res.status(400).json({ err: "User not updated" });
              });
        })
        .catch((err) => {
          res.status(400).json({ err: "Saved Job not found" });
        });
      // })
    })
    .catch((err) => {
      res.status(400).json({ err: "User not found" });
    });
});

//validate a saved freelance job
router.put("/save/freelance/activate/:id", middleware.isUser, (req, res) => {
  User.findById(req.user._id)
    .then((user) => {
      if (!user.savedFreelance.includes(req.params.id))
        return res.status(400).json({ err: "Wrong job ID" });
      if (user.validated == false && user.freelancetier.posted > 1)
        return res
          .status(400)
          .json({ err: "Can only post one job until you are validated" });
      savedFreelance
        .findById(req.params.id)
        .then((sjob) => {
          const expiry = new Date(sjob.endDate);
          var days = (expiry - Date.now()) / (1000 * 60 * 60 * 24);
          if (days < 0 || days > 30)
            return res.status(400).send("Invalid time range spcified");
          if (user.freelancetier.allowed - user.freelancetier.saved <= 0)
            return res.status(400).send("Max Jobs Saved");
          else
            User.findByIdAndUpdate(req.user._id, {
              $inc: { "freelancetier.posted": 1 },
              $inc: { "freelancetier.saved": -1 },
            })
              .then((user2) => {
                let job = new Freelance({
                  author: sjob.author,
                  title: sjob.title,
                  profession: sjob.profession,
                  specialization: sjob.specialization,
                  superSpecialization: sjob.superSpecialization,
                  description: sjob.description,
                  address: sjob.address,
                  createdAt: new Date(),
                  startDate: sjob.startDate,
                  attachedApplicants: req.body.attachedApplicants,
                  createdBy: "User",
                  expireAt: expiry,
                  endDate: expiry,
                  validated: user.validated,
                });
                //console.log(job);
                job
                  .save()
                  .then((job) => {
                    //console.log(job._id);
                    user.freelanceJobs = [
                      ...user.freelanceJobs,
                      {
                        title: job.title,
                        id: job._id,
                        sid: sjob._id,
                      },
                    ];
                    user.savedFreelance.splice(
                      user.savedFreelance.indexOf(sjob._id),
                      1
                    );
                    user
                      .save()
                      .then((user) => {
                        sjob.jobRef = job._id;
                        sjob.status = "Active";
                        sjob.createdAt = new Date();
                        sjob.expireAt = expiry;
                        sjob
                          .save()
                          .then((sjob) => {
                            res.status(200).json({ updated: "true" });
                          })
                          .catch((err) => {
                            res
                              .status(400)
                              .json({ err: "Saved job not saved" });
                          });
                      })
                      .catch((err) => {
                        res.status(400).json({ err: "User not updated" });
                      });
                  })
                  .catch((err) => {
                    res.status(400).json({ err: "job not saved" });
                  });
                // User.findOne({_id:req.user._id}).then((user)=>{
              })
              .catch((err) => {
                res.status(400).json({ err: "User tier not updated" });
              });
        })
        .catch((err) => {
          res.status(400).json({ err: "Saved Job not found" });
        });
      // })
    })
    .catch((err) => {
      res.status(400).json({ err: "User not found" });
    });
});
//===========================================================================

//Update a job
router.put("/post/job/:id", middleware.checkJobOwnership, async (req, res) => {
  var query;
  if (req.body.status == "Active")
    res.status(400).json({ err: "Invalid status" });
  query = await searchController.updateQueryBuilder(req);
  //console.log(query.updateQuery);
  Job.findById(req.params.id)
    .then((job) => {
      if (req.body.expireAt) {
        const expiry = new Date(req.body.expireAt);
        var days = (expiry - job.createdAt) / (1000 * 60 * 60 * 24);
        //console.log(days);
        if (days < 0 || days > 90)
          res.status(400).json({ err: "Invalid time format" });
        else query.update["expireAt"] = expiry;
      }
      Job.findOneAndUpdate(
        { _id: req.params.id },
        { $set: query.update },
        { new: true }
      )
        .then((job) => {
          console.log(job);
          savedJob
            .findOneAndUpdate({ jobRef: job._id }, { $set: query.update })
            .then((user) => {
              res.status(200).json({ updated: "true" });
              // user.save().then((updatedUser)=>{
              // res.status(200).json({updated:"true"});
              // }).catch((err)=>{res.status(400).json({err:"Failed to save job"})});
            })
            .catch((error) => {
              res.status(400).json({ err: "Job not updated" });
            });
        })
        .catch((error) => {
          res.status(400).json({ updated: "false" });
        });
    })
    .catch((err) => {
      res.status(400).json({ err: "Couldn't find user" });
    });
});
//Update a freelance job
router.put(
  "/post/freelance/:id",
  middleware.checkFreelanceJobOwnership,
  async (req, res) => {
    var query;
    if (req.body.status == "Active")
      return res.status(400).json({ err: "Invalid status" });
    query = await searchController.updateQueryBuilder(req);
    //console.log(query.updateQuery);
    Freelance.findById(req.params.id)
      .then((job) => {
        if (req.body.startDate) query.update["startDate"] = req.body.startDate;
        if (req.body.endDate) query.update["endDate"] = req.body.endDate;
        if (req.body.attachedApplicants)
          query.update["attachedApplicants"] = req.body.attachedApplicants;
        const expiry = new Date(req.body.endDate);
        var days = (expiry - job.createdAt) / (1000 * 60 * 60 * 24);
        if (days < 0 || days > 90)
          return res.status(400).json({ err: "Invalid time format" });
        else query.update["expireAt"] = expiry;
        // if(req.body.sponsored) {
        // 	query.update["sponsored"]=true;
        // }
        Freelance.findByIdAndUpdate(req.params.id, { $set: query.update })
          .then((job) => {
            savedFreelance
              .findOneAndUpdate({ jobRef: job._id }, { $set: query.update })
              .then((user) => {
                res.status(200).json({ updated: "true" });
              })
              .catch((err) => res.status(400).json({ err: "Job not saved" }));
          })
          .catch((err) => {
            res.status(400).json({ updated: "false" });
          });
      })
      .catch((err) => {
        res.status(400).json({ err: "Couldn't find user" });
      });
  }
);

//Update a saved job
router.put("/save/job/:id", middleware.isUser, async (req, res) => {
  var query;
  if (req.body.status == "Active")
    return res.status(400).json({ err: "Invalid status" });
  query = await searchController.updateQueryBuilder(req);
  //console.log(query.updateQuery);
  User.findById(req.user._id)
    .then((user) => {
      if (!user.savedJobs.includes(req.params.id))
        return res.status(400).json({ err: "Invalid Job" });
      savedJob
        .findById(req.params.id)
        .then((job) => {
          if (req.body.expireAt) {
            const expiry = new Date(req.body.expireAt);
            var days = (expiry - Date.now()) / (1000 * 60 * 60 * 24);
            //console.log(days);
            if (days < 0 || days > 90)
              return res.status(400).json({ err: "Invalid time format" });
            else query.update["expireAt"] = expiry;
          }

          savedJob
            .findOneAndUpdate(
              { _id: req.params.id },
              { $set: query.update },
              { new: true }
            )
            .then((job) => {
              //console.log(job);
              //savedJob.findOneAndUpdate({jobRef:job._id},{$set:query.update}).then((user)=>{
              res.status(200).json({ updated: "true" });
              // user.save().then((updatedUser)=>{
              // res.status(200).json({updated:"true"});
              // }).catch((err)=>{res.status(400).json({err:"Failed to save job"})});
            })
            .catch((error) => {
              res.status(400).json({ err: "Job not updated" });
            });
        })
        .catch((error) => {
          res.status(400).json({ err: "Couldn't find job" });
        });
    })
    .catch((err) => {
      res.status(400).json({ err: "Couldn't find user" });
    });
});

//Update a saved freelance job
router.put("/save/freelance/:id", middleware.isUser, async (req, res) => {
  var query;
  if (req.body.status == "Active")
    return res.status(400).json({ err: "Invalid status" });
  query = await searchController.updateQueryBuilder(req);
  //console.log(query.updateQuery);
  User.findById(req.user._id)
    .then((user) => {
      if (!user.savedFreelance.includes(req.params.id))
        return res.status(400).json({ err: "Invalid Job" });
      savedFreelance
        .findById(req.params.id)
        .then((job) => {
          if (req.body.attachedApplicants)
            query.update["attachedApplicants"] = req.body.attachedApplicants;
          if (req.body.endDate) {
            const expiry = new Date(req.body.endDate);
            var days = (expiry - Date.now()) / (1000 * 60 * 60 * 24);
            //console.log(days);
            if (days < 0 || days > 90)
              return res.status(400).json({ err: "Invalid time format" });
            else query.update["expireAt"] = expiry;
          }

          savedFreelance
            .findOneAndUpdate(
              { _id: req.params.id },
              { $set: query.update },
              { new: true }
            )
            .then((job) => {
              //console.log(job);
              //savedJob.findOneAndUpdate({jobRef:job._id},{$set:query.update}).then((user)=>{
              res.status(200).json({ updated: "true" });
              // user.save().then((updatedUser)=>{
              // res.status(200).json({updated:"true"});
              // }).catch((err)=>{res.status(400).json({err:"Failed to save job"})});
            })
            .catch((error) => {
              res.status(400).json({ err: "Job not updated" });
            });
        })
        .catch((error) => {
          res.status(400).json({ err: "Couldn't find job" });
        });
    })
    .catch((err) => {
      res.status(400).json({ err: "Couldn't find user" });
    });
});

//get multiple jobs
router.get("/all/jobs", middleware.isUser, (req, res) => {
  User.findById(req.user._id)
    .then((user) => {
      const id = user.jobs.map((job) => {
        return job.id;
      });
      console.log(id);
      Job.find({ _id: { $in: id } })
        .then((jobs) => {
          res.json({ jobs: jobs });
        })
        .catch((err) => {
          res.json({ err: "Jobs not found" });
        });
    })
    .catch((err) => {
      res.json({ err: "User not found" });
    });
});

//get multiple freelance jobs
router.get("/all/freelance", middleware.isUser, (req, res) => {
  User.findById(req.user._id)
    .then((user) => {
      const id = user.freelanceJobs.map((job) => {
        return job.id;
      });
      console.log(id);
      Freelance.find({ _id: { $in: id } })
        .then((jobs) => {
          res.json({ jobs: jobs });
        })
        .catch((err) => {
          res.json({ err: "Jobs not found" });
        });
    })
    .catch((err) => {
      res.json({ err: "User not found" });
    });
});

// get multiple saved jobs
router.get("/all/savedJobs", middleware.isUser, (req, res) => {
  User.findById(req.user._id)
    .then((user) => {
      const ID = user.savedJobs.map((item) => {
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
      res.json({ err: "User not found" });
    });
});

//  get multiple saved freelance jobs
router.get("/all/savedFreelance", middleware.isUser, (req, res) => {
  User.findById(req.user._id)
    .then((user) => {
      const ID = user.savedFreelance.map((item) => {
        return mongoose.Types.ObjectId(item.id);
      });
      console.log(ID);
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
      res.json({ err: "User not found" });
    });
});
// get expired jobs
router.get("/all/expiredJobs", middleware.isUser, (req, res) => {
  User.findById(req.user._id)
    .then((user) => {
      const ID = user.jobs.map((item) => {
        return mongoose.Types.ObjectId(item.id);
      });
      console.log(ID);
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
          })
        );
      }
      Promise.all(promises)
        .then((msg) => {
          console.log(inactive);
          savedJob
            .find({ jobRef: { $in: inactive } })
            .then((jobs) => {
              res.json({ jobs: jobs });
            })
            .catch((err) => {
              res.json({ err: "Error finding expired jobs" });
            });
        })
        .catch((err) => res.json({ err: "Couldn't find expired jobs" }));
    })
    .catch((err) => res.json({ err: "Couldn't find User" }));
});
// get expired freelance jobs
router.get("/all/expiredFreelance", middleware.isUser, (req, res) => {
  console.log(req.user._id);
  User.findById(req.user._id)
    .then((user) => {
      const ID = user.freelanceJobs.map((item) => {
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
          })
        );
      }
      Promise.all(promises)
        .then((msg) => {
          console.log(inactive);
          savedFreelance
            .find({ jobRef: { $in: inactive } })
            .then((jobs) => {
              res.json({ jobs: jobs });
            })
            .catch((err) => {
              res.json({ err: "Error finding expired jobs" });
            });
        })
        .catch((err) => res.json({ err: "Couldn't find expired jobs" }));
    })
    .catch((err) => res.json({ err: "Couldn't find user" }));
});
//get saved job
router.get("/save/job/:id", middleware.isUser, (req, res) => {
  savedJob
    .findById(req.params.id)
    .then((job) => {
      res.json(job);
    })
    .catch((err) => res.status(400).json({ err: "Job not found" }));
});
//get saved freelance job
router.get("/save/freelance/:id", middleware.isUser, (req, res) => {
  savedFreelance
    .findById(req.params.id)
    .then((job) => {
      res.json(job);
    })
    .catch((err) => res.status(400).json({ err: "Job not found" }));
});
//get a job by id
router.get("/post/job/:id", (req, res) => {
  Job.findById(req.params.id)
    .then((job) => {
      res.json(job);
    })
    .catch((err) => res.status(400).json({ err: err }));
});
//get a freelance job by id
router.get("/post/freelance/:id", (req, res) => {
  Freelance.findById(req.params.id)
    .then((job) => {
      res.json(job);
    })
    .catch((err) => res.status(400).json({ err: err }));
});

//delete a job

router.delete("/post/job/:id", middleware.checkJobOwnership, (req, res) => {
  Job.findByIdAndDelete(req.params.id)
    .then(() => res.json("Job deleted successfully !"))
    .catch((err) =>
      res.status(400).json({
        err: err,
      })
    );
});
//delete a job

router.delete("/save/job/:id", middleware.isUser, (req, res) => {
  User.findById(req.user._id)
    .then((user) => {
      if (user.savedJobs.includes(req.params.id))
        savedJob
          .findByIdAndDelete(req.params.id)
          .then(() => res.json("Saved Job deleted successfully !"))
          .catch((err) =>
            res.status(400).json({
              err: err,
            })
          );
    })
    .catch((err) => {
      res.json({ err: "Job doesn't belong to you" });
    });
});
//delete a job

router.delete(
  "/post/freelance/:id",
  middleware.checkFreelanceJobOwnership,
  (req, res) => {
    Freelance.findByIdAndDelete(req.params.id)
      .then(() => res.json("Freelance Job deleted successfully !"))
      .catch((err) =>
        res.status(400).json({
          err: err,
        })
      );
  }
);
//delete a job

router.delete("/save/freelance/:id", middleware.isUser, (req, res) => {
  User.findById(req.user._id)
    .then((user) => {
      if (user.savedJobs.includes(req.params.id))
        savedFreelance
          .findByIdAndDelete(req.params.id)
          .then(() => res.json("Saved Freelance Job deleted successfully !"))
          .catch((err) =>
            res.status(400).json({
              err: err,
            })
          );
    })
    .catch((err) => {
      res.json({ err: "Job doesn't belong to you" });
    });
});
module.exports = router;
/*
    "username":"sparshjain",
    "password":"sparsh@123"

    "title": "Second Blog",
    "image": "",
    "body": "this is second blog"

*/
