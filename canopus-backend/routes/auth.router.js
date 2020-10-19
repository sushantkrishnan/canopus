const router = require("express").Router(),
  passport = require("passport"),
  middleware = require('../middleware/index');
const User= require('../models/user.model');
  //google analytics auth

router.get("/analytics",middleware.isLoggedIn,(req,res)=>{
  let updated=true;
  let d = new Date(req.user.lastUpdated).toString();
  let o = new Date(0).toString();
  let mail = true;
  console.log(d);
  console.log(o);
  if(d===o){
  updated=false;
  }
  if(req.user.role==="Employer" && req.user.emailVerified===false){
  mail=false;
  res.redirect('https://www.curoid.co/employer/verify');
  }
  if(!req.session.analytics){
  req.session.analytics=true;
  res.json({role:req.user.role,updated:updated});
  }
  else{
  res.status(400).json({role:req.user.role,status:"already logged",updated:updated,mail:mail});
  }
});

//Google auth
router.get(
  "/google/user",
  passport.authenticate("google", { 
    scope: ["email", "profile"],
  })
);
//Google auth
router.get(
  "/google/employer",
  passport.authenticate("google_employer", {
    scope: ["email", "profile"],
  })
);
router.get(
  "/google/user/callback",
  (req, res, next) => {
    passport.authenticate("google", (err, user, info) => {
      console.log(info);
      if (err) {
        console.log(err);
        res.redirect(`http://www.curoid.co/user/login?err=${err.name}`);
      }
      if (!user) {
        res.redirect(`http://www.curoid.co/user/login?err=${err.name}`);
      }
      req.logIn(user, function (err) {
        if (err) {
          res.redirect(`http://www.curoid.co/user/login?err=${err.name}`);
        }
        res.redirect(`http://www.curoid.co/analytics?role=user`);
      });
    })(req, res, next);
  }
);
router.get(
  "/google/employer/callback",
  (req, res, next) => {
    passport.authenticate("google_employer", (err, user, info) => {
      console.log(info);
      if (err) {
        console.log(err);
        res.redirect(`http://www.curoid.co/employer/login?err=${err.name}`);
      }
      if (!user) {
        res.redirect(`http://www.curoid.co/employer/login?err=${err.name}`);
      }
      req.logIn(user, function (err) {
        if (err) {
          res.redirect(`http://www.curoid.co/employer/login?err=${err.name}`);
        }
        res.redirect(`http://www.curoid.co/analytics?role=employer`);
      });
    })(req, res, next);
  }
);

router.get('/linkedin/user',
  passport.authenticate('linkedin_user'),
  function(req, res){
    // The request will be redirected to LinkedIn for authentication, so this
    // function will not be called.
  });
router.get('/linkedin/employer',
  passport.authenticate('linkedin_employer'),
  function(req, res){
    // The request will be redirected to LinkedIn for authentication, so this
    // function will not be called.
  });
  router.get(
    "/linkedin/user/callback",
    (req, res, next) => {
      passport.authenticate("linkedin_user", (err, user, info) => {
        console.log(err);
        if (err) {
          console.log(err);
          res.redirect(`http://www.curoid.co/user/login?err=${err.name}`);
        }
        if (!user) {
          res.redirect(`http://www.curoid.co/user/login?err=${err.name}`);
        }
        req.logIn(user, function (err) {
          if (err) {
            res.redirect(`http://www.curoid.co/user/login?err=${err.name}`);
          }
          res.redirect(`http://www.curoid.co/analytics?role=user`);
        });
      })(req, res, next);
    }
  );
  router.get(
    "/linkedin/employer/callback",
    (req, res, next) => {
      passport.authenticate("linkedin_employer", (err, user, info) => {
        console.log(info);
        if (err) {
          console.log(err);
          res.redirect(`http://www.curoid.co/employer/login?err=${err.name}`);
        }
        if (!user) {
          res.redirect(`http://www.curoid.co/employer/login?err=${err.name}`);
        }
        req.logIn(user, function (err) {
          if (err) {
            res.redirect(`http://www.curoid.co/employer/login?err=${err.name}`);
          }
          res.redirect(`http://www.curoid.co/analytics?role=employer`);
        });
      })(req, res, next);
    }
  );

module.exports = router;
