const express = require("express"),
    app = express(),
    cors = require("cors"),
    User = require("./models/user.model"),
    Employer = require("./models/employer.model"),
    mongoose = require("mongoose"),
    passport = require("passport"),
    LocalStratergy = require("passport-local"),
    jobRouter = require("./routes/job.router"),
    searchRouter = require("./routes/search.router"),
    userRouter = require("./routes/user.router"),
    authRouter = require("./routes/auth.router"),
    uploadRouter = require("./routes/blob.router"),
    employerRouter = require("./routes/employer.router"),
    adminRouter = require("./routes/admin.router"),
    GoogleStrategy = require("passport-google-oauth").OAuth2Strategy,
    bodyParser = require("body-parser"),
    path = require('path');
var session = require('express-session')
var MemoryStore = require('memorystore')(session)
var LinkedInStrategy = require('@smpincode/passport-linkedin-oauth2v2').Strategy;
 
const { validationController}=require("./controllers/validation.controller")
require("dotenv").config();
const GOOGLE_ANALYTICS=process.env.GOOGLE_ANALYTICS;
var ua = require("universal-analytics");
var visitor = ua(GOOGLE_ANALYTICS);
//test
//==========================================================================
app.use(bodyParser.json({ limit: "5mb" }));
app.use(cors());
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Credentials", true);
    res.header("Access-Control-Allow-Origin", req.headers.origin);
    res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
    res.header(
        "Access-Control-Allow-Headers",
        "X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept",
    );
    next();
});
// app.use(ua.middleware(GOOGLE_ANALYTICS, {cookieName: '_ga'}));
app.use(session(
    {
        secret: process.env.SECRET,
        cookie: { maxAge: 1000*60*30 },
        store: new MemoryStore({
          checkPeriod: 86400000 // prune expired entries every 24h
        }),
        rolling:true,
        resave: false,
        saveUninitialized: false,
    })
);
app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    next();
});
app.use(passport.initialize());
app.use(passport.session());
//app.set('views', __dirname + '/views');
// const rateLimit = require("express-rate-limit");
 
// // Enable if you're behind a reverse proxy (Heroku, Bluemix, AWS ELB, Nginx, etc)
// // see https://expressjs.com/en/guide/behind-proxies.html
//  app.set('trust proxy', 1);
 
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100 // limit each IP to 100 requests per windowMs
// });
 
//  apply to all requests
//app.use(limiter);
passport.use(
    "employer",
    new LocalStratergy({ usernameField: "username" }, Employer.authenticate()),
);
passport.use(
    "user",
    new LocalStratergy({ usernameField: "username" }, User.authenticate()),
);
passport.use(
    "google",
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: "https://www.curoid.co/auth/google/user/callback",
        },
        function (accessToken, refreshToken, profile, done) {
            User.findOne({ "username":profile.emails[0].value }, function (err, user) {
                if (err) return done(err);
                if (user) {
                    user.google = {
                        id: profile.id,
                        token: accessToken,
                        name: profile.displayName,
                        email: profile.emails[0].value,
                    };
                    user.save().then((user)=>{
                        return done(null, user);});
                    //return done(null, user);
                }
                else {
                    var user = new User();
                    user.username = profile.emails[0].value;
                    user.role = "User";
                    user.emailVerified = true;
                    user.image = profile.photos[0].value;
                    user = validationController.initUserTier(user);
                    user.google = {
                        id: profile.id,
                        token: accessToken,
                        name: profile.displayName,
                        email: profile.emails[0].value,
                    };
                    user.salutation = "Dr";
                    user.firstName = profile.name.givenName;
                    user.lastName = profile.name.familyName;
                    user.lastUpdated = new Date(0);
                    user.save((err, user) => {
                        if (!err) return done(err, user);
                    });
                    // done(null, userData);
                }
            });
        },
        // User.authenticate(),
    ),
);
passport.use(
    "google_employer",
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: "https://www.curoid.co/auth/google/employer/callback",
        },
        function (accessToken, refreshToken, profile, done) {
            Employer.findOne({ "username":profile.emails[0].value }, function (err, user) {
                if (err) return done(err);
                if (user) {
                    user.google = {
                        id: profile.id,
                        token: accessToken,
                        name: profile.displayName,
                        email: profile.emails[0].value,
                    };
                    user.save().then((user)=>{
                    return done(null, user);});
                }
                else {
                    var user = new Employer();
                    user.username = profile.emails[0].value;
                    user.role = "Employer";
                    user.emailVerified = true;
                    //user.image = profile.photos[0].value;

                    user = validationController.initTier(user);
                    user.google = {
                        id: profile.id,
                        token: accessToken,
                        name: profile.displayName,
                        email: profile.emails[0].value,
                    };
                    user.firstName = profile.name.givenName;
                    user.lastName = profile.name.familyName;
                    user.lastUpdated = new Date(0);
                    user.save((err, user) => {
                        if (!err) return done(err, user);
                    });
                    // done(null, userData);
                }
            });
        },
        // User.authenticate(),
    ),
);

passport.use("linkedin_user",new LinkedInStrategy({
  clientID: process.env.LINKEDIN_CLIENT_ID,
  clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
  callbackURL: "https://www.curoid.co/auth/linkedin/user/callback",
  scope: ['r_emailaddress', 'r_liteprofile'],
  state:false
}, function(accessToken, refreshToken, profile, done) {
    console.log(profile);
    User.findOne({ "username":profile.emails[0].value }, function (err, user) {
        if (err) return done(err);
        if (user) {
            user.linkedin = {
                id: profile.id,
                token: accessToken
            };
            user.save().then((user)=>{
                return done(null, user);});
        //return done(null, user);
        }
        else {
            var user = new User();
            user.username = profile.emails[0].value;
            user.role = "User";
            user.image = profile.photos[3].value;
            user = validationController.initUserTier(user);
            user.linkedin = {
                id: profile.id,
                token: accessToken
            };
            user.salutation="Dr";
            user.firstName = profile.name.givenName;
            user.lastName = profile.name.familyName;
            user.save((err, user) => {
                if (!err) return done(err, user);
            });
        }
    });
}));
//employer linkedin
passport.use("linkedin_employer",new LinkedInStrategy({
    clientID: process.env.LINKEDIN_CLIENT_ID,
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
    callbackURL: "https://www.curoid.co/auth/linkedin/employer/callback",
    scope: ['r_emailaddress', 'r_liteprofile'],
    state:false
  }, function(accessToken, refreshToken, profile, done) {
      console.log(profile);
      Employer.findOne({ "username":profile.emails[0].value }, function (err, user) {
          if (err) return done(err);
          if (user) {
            user.linkedin = {
                id: profile.id,
                token: accessToken
            };
            user.save().then((user)=>{
                return done(null, user);});
              //return done(null, user);
          }
          else {
              var user = new Employer();
              user.username = profile.emails[0].value;
              user.role = "Employer";
              //user.image = profile.photos;
              //user.image = profile._json.pictureUrl;
              user = validationController.initTier(user);
              user.linkedin = {
                  id: profile.id,
                  token: accessToken
              };
              user.firstName = profile.name.givenName;
              user.lastName = profile.name.familyName;
              user.lastUpdated = new Date(0);
              user.emailVerified = true;
              user.save((err, user) => {
                  if (!err) return done(err, user);
              });
          }
      });
  }));
passport.serializeUser((user, done) => {
    //experimental
    user.salt=undefined;
    user.hash=undefined;
    done(null, user);
});
passport.deserializeUser((user, done) => {
    if (user != null) {
        done(null, user);
    }
});

//===========================================================================
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
});
mongoose.connection.once("open", () => {
    console.log("connected to MONGO");
});
// might be problematic
mongoose.set('useFindAndModify', false);
//===========================================================================
//render static files (deployment)
app.use(express.static("canopus-frontend/build"));

//===========================================================================
app.use("/api/job", jobRouter);
app.use("/api/user", userRouter);
app.use("/api/employer", employerRouter);
app.use("/auth", authRouter);
app.use("/api/upload", uploadRouter);
app.use("/api/admin", adminRouter);
app.use("/api/search",searchRouter);
//===========================================================================
//render frontend file (deployment)
app.use("*", function (req, res) {
    res.sendFile(path.join(__dirname, "canopus-frontend/build/index.html"));
});
//===========================================================================

const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log(`🌎 Listening to ${port}`);
});
