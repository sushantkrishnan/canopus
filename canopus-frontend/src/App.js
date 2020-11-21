import React, { Component, createRef } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter, Route, Switch, Redirect } from "react-router-dom";
import NavbarComponent from "./components/navbar.component";
import FooterComponent from "./components/footer.component";
import Home from "./components/home.component";
import Profile from "./components/profile.component";
import SignupUser from "./components/signupuser.component";
// import doctor from "./images/doctor.png";
import JobSearch from "./components/jobSeach.component";
import Job from "./components/job.component";
import PostJob from "./components/postJob.component";
import Employer from "./components/employer.component";
import JobApplications from "./components/jobApplications.component";
import UpdateJob from "./components/updateJob.component";
import UpdateUser from "./components/updateUser.component";
import ErrorPage from "./components/error.component";
import EnterUsername from "./components/enterUsername.component";
import EnterPassword from "./components/enterPassword.component";
import SignupEmployer from "./components/signupEmployer.component";
import UpdateEmployer from "./components/updateEmployer.component";
import VerifyEmployer from "./components/verifyEmployer.component";
import VerifyEmail from "./components/verifyEmail.component";
import LoginEmployer from "./components/loginEmployer.component";
import data from "./data/data.json";
import Test from "./components/test.component";
import axios from "axios";
import EmployerProfile from "./components/employerProfile.component";
import LoginUser from "./components/loginUser.component";
import Analytics from "./components/analytic.component";
import Iframe from "react-iframe";
class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            user: null,
            data: null,
            html: "",
            loaded: false,
        };
        this.setUser = this.setUser.bind(this);
        this.getUser = this.getUser.bind(this);
    }
    setUser(user) {
        this.setState({ user: user, loaded: true });
        // console.log(this.state.user);
    }
    async getUser() {
        axios
            .get(`/api/user/current`)
            .then((data) => {
                this.setUser(data.data.user);
            })
            .catch((err) => {
                console.log(err.response);
            });
    }
    componentDidMount() {
        console.log("UPDATED V4");
        if (!this.state.user) {
            this.getUser();
        }
        const node = this.wrapper.current;
        console.log(node);
        // axios
        //     .get(
        //         "https://canopus.blob.core.windows.net/mail-image/privacy_temp.html",
        //     )
        //     .then((data) => {
        //         console.log(data);
        //         this.setState({ html: data });
        //     })
        //     .catch((err) => console.log(err));
        axios.get("/data.json").then((data) => {
            this.setState({ data: data.data });
        });
        axios.get("/location.json").then((data) => {
            this.setState({ location: data.data });
        });
    }
    wrapper = createRef();
    render() {
        return (
            <BrowserRouter
                className='d-flex flex-column justify-content-between'
                ref={this.wrapper}>
                <NavbarComponent
                    user={this.state.user}
                    setUser={this.setUser}
                    getUser={this.getUser}
                />
                {this.state.loaded ? (
                    <Switch>
                        <Route
                            exact
                            path='/'
                            render={(props) => (
                                <Home {...props} data={this.state.data} />
                            )}
                        />
                        <Route
                            exact
                            path='/search-jobs'
                            render={(props) => (
                                <JobSearch
                                    {...props}
                                    user={this.state.user}
                                    data={this.state.data}
                                    locData={this.state.location}
                                />
                            )}
                        />
                        <Route
                            exact
                            path='/user/signup'
                            component={() => <SignupUser />}
                        />
                        <Route
                            exact
                            path='/user/forgot'
                            component={() => <EnterUsername />}
                        />
                        <Route
                            exact
                            path='/user/login'
                            // render={(props) => <Profile {...props} />}
                            render={(props) => (
                                <LoginUser
                                    {...props}
                                    user={this.state.user}
                                    setUser={this.setUser}
                                    getUser={this.getUser}
                                />
                            )}
                        />
                        <Route exact path='/test' component={() => <Test />} />
                        <Route
                            exact
                            path='/employer/signup'
                            component={() => <SignupEmployer />}
                        />
                        <Route
                            exact
                            path='/employer/forgot'
                            component={() => <EnterUsername />}
                        />
                        {/* {this.state.user &&
                            this.state.user.role === "Employer" && ( */}
                        <Route
                            exact
                            path='/employer/verify'
                            render={(props) =>
                                this.state.user &&
                                this.state.user.role === "Employer" ? (
                                    <VerifyEmployer
                                        {...props}
                                        user={this.state.user}
                                    />
                                ) : (
                                    <Redirect to='/' />
                                )
                            }
                        />
                        {/* )} */}
                        {/* {this.state.user && this.state.user.role === "User" && ( */}
                        <Route
                            exact
                            path='/user/verify'
                            render={(props) =>
                                this.state.user &&
                                this.state.user.role === "User" ? (
                                    <VerifyEmployer
                                        {...props}
                                        user={this.state.user}
                                    />
                                ) : (
                                    <Redirect to='/' />
                                )
                            }
                        />
                        {/* )} */}
                        <Route
                            exact
                            path='/user/validate/:token'
                            render={(props) => (
                                <VerifyEmail
                                    {...props}
                                    user={this.state.user}
                                />
                            )}
                        />
                        {/* {this.state.html !== "" && (
                        <Route
                            exact
                            path='/privacy'
                            render={(props) => renderHTML(this.state.html)}
                        />
                    )} */}
                        <Route
                            exact
                            path='/employer/validate/:token'
                            render={(props) => (
                                <VerifyEmail
                                    {...props}
                                    user={this.state.user}
                                />
                            )}
                        />
                        <Route
                            exact
                            path='/employer/forgot/:token'
                            component={() => <EnterPassword />}
                        />
                        <Route
                            exact
                            path='/user/forgot/:token'
                            component={() => <EnterPassword />}
                        />
                        {/* {this.state.user && this.state.user.role === "User" && ( */}
                        <Route
                            exact
                            path='/profile'
                            // render={(props) => <Profile {...props} />}

                            component={() =>
                                this.state.user &&
                                this.state.user.role === "User" ? (
                                    <Profile />
                                ) : (
                                    <Redirect to='/' />
                                )
                            }
                        />
                        {/* )} */}
                        {/* {this.state.user && this.state.user.role === "User" && ( */}
                        <Route
                            exact
                            path='/profile/update'
                            // render={(props) => <Profile {...props} />}
                            render={(props) =>
                                this.state.user &&
                                this.state.user.role === "User" ? (
                                    <UpdateUser
                                        {...props}
                                        setUser={this.setUser}
                                        data={this.state.data}
                                    />
                                ) : (
                                    <Redirect to='/' />
                                )
                            }
                        />
                        {/* )} */}
                        <Route
                            exact
                            path='/profile/:id'
                            // render={(props) => <Profile {...props} />}
                            render={(props) =>
                                this.state.user ? (
                                    <Profile {...props} />
                                ) : (
                                    <Redirect to='/' />
                                )
                            }
                        />
                        <Route
                            exact
                            path='/job/:id'
                            // render={(props) => <Profile {...props} />}
                            render={(props) => (
                                <Job {...props} user={this.state.user} />
                            )}
                        />
                        {/* {this.state.user &&
                            this.state.user.role === "Employer" && ( */}
                        <Route
                            path='/employer/job/update/:id'
                            render={(props) =>
                                this.state.user &&
                                this.state.user.role === "Employer" ? (
                                    <UpdateJob
                                        {...props}
                                        data={this.state.data}
                                        locationData={this.state.location}
                                    />
                                ) : (
                                    <Redirect to='/' />
                                )
                            }
                        />
                        {/* )} */}
                        {/* {this.state.user &&
                            this.state.user.role === "Employer" && ( */}
                        <Route
                            exact
                            path='/employer/update'
                            // render={(props) => <Profile {...props} />}

                            render={(props) =>
                                this.state.user &&
                                this.state.user.role === "Employer" ? (
                                    <UpdateEmployer
                                        {...props}
                                        setUser={this.setUser}
                                        data={this.state.data}
                                        locationData={this.state.location}
                                    />
                                ) : (
                                    <Redirect to='/' />
                                )
                            }
                        />
                        {/* )} */}
                        <Route
                            exact
                            path='/employer/profile/:id'
                            // render={(props) => <Profile {...props} />}
                            render={(props) => <EmployerProfile {...props} />}
                        />
                        <Route
                            exact
                            path='/employer/login'
                            // render={(props) => <Profile {...props} />}
                            render={(props) => (
                                <LoginEmployer
                                    {...props}
                                    user={this.state.user}
                                    setUser={this.setUser}
                                    getUser={this.getUser}
                                />
                            )}
                        />
                        {/* {this.state.user &&
                            this.state.user.role === "Employer" && ( */}
                        <Route
                            exact
                            path='/employer'
                            // render={(props) => <Profile {...props} />}
                            render={(props) =>
                                this.state.user &&
                                this.state.user.role === "Employer" ? (
                                    this.state.user.emailVerified === true ? (
                                        <Employer
                                            {...props}
                                            // user={this.state.user}
                                            setUser={this.setUser}
                                            data={this.state.data}
                                        />
                                    ) : (
                                        <Redirect to='/employer/verify' />
                                    )
                                ) : (
                                    <Redirect to='/' />
                                )
                            }
                        />
                        {/* )} */}
                        {/* {this.state.user && ( */}
                        <Route
                            exact
                            path='/post'
                            // render={(props) => <Profile {...props} />}
                            render={(props) =>
                                this.state.user &&
                                this.state.user.role === "Employer" ? (
                                    this.state.user.emailVerified === true ? (
                                        <PostJob
                                            {...props}
                                            data={this.state.data}
                                            locationData={this.state.location}
                                        />
                                    ) : (
                                        <Redirect to='/employer/verify' />
                                    )
                                ) : (
                                    <Redirect to='/' />
                                )
                            }
                        />

                        {/* {this.state.user && ( */}
                        <Route
                            exact
                            path='/applications'
                            // render={(props) => <Profile {...props} />}

                            render={(props) =>
                                this.state.user &&
                                this.state.user.role === "Employer" ? (
                                    this.state.user.emailVerified === true ? (
                                        <JobApplications
                                            {...props}
                                            user={this.state.user}
                                            data={this.state.data}
                                        />
                                    ) : (
                                        <Redirect to='/employer/verify' />
                                    )
                                ) : (
                                    <Redirect to='/' />
                                )
                            }
                        />
                        {/* )} */}
                        <Route
                            exact
                            path='/analytics'
                            render={(props) => (
                                <Analytics
                                    {...props}
                                    user={this.state.user}
                                    setUser={this.setUser}
                                    getUser={this.getUser}
                                />
                            )}
                        />
                        <Route
                            exact
                            path='/privacy'
                            component={() => (
                                <Iframe
                                    url='https://curoidprod.blob.core.windows.net/curoid/privacy.html'
                                    id='myId'
                                    className='iframe'
                                    display='initial'
                                    position='relative'
                                />
                            )}
                        />
                        <Route
                            exact
                            path='/terms-and-conditions'
                            component={() => (
                                <Iframe
                                    url='https://curoidprod.blob.core.windows.net/curoid/toc.html'
                                    id='myId'
                                    className='iframe'
                                    display='initial'
                                    position='relative'
                                />
                            )}
                        />

                        <Route
                            render={(props) => (
                                <ErrorPage {...props} user={this.state.user} />
                            )}
                        />
                    </Switch>
                ) : (
                    <div></div>
                )}
                <FooterComponent />
            </BrowserRouter>
        );
    }
}

export default App;
