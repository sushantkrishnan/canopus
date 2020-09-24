import React, { Component, createRef } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter, Route, Switch } from "react-router-dom";
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
import SignupEmployer from "./components/signupEmployer.component";
import UpdateEmployer from "./components/updateEmployer.component";
import data from "./data/data.json";
import Test from "./components/test.component";
import axios from "axios";
import EmployerProfile from "./components/employerProfile.component";
class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            user: null,
            data: null,
        };
        this.setUser = this.setUser.bind(this);
        this.getUser = this.getUser.bind(this);
    }
    setUser(user) {
        this.setState({ user: user });
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
        console.log(data);
        console.log(this.state.user);
        if (!this.state.user) {
            this.getUser();
        }
        const node = this.wrapper.current;
        console.log(node);
        axios.get("/data.json").then((data) => {
            this.setState({ data: data.data });
        });
    }
    wrapper = createRef();
    render() {
        return (
            <BrowserRouter
                className='flex flex-column justify-content-between'
                ref={this.wrapper}>
                <NavbarComponent
                    user={this.state.user}
                    setUser={this.setUser}
                    getUser={this.getUser}
                />
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
                            />
                        )}
                    />
                    <Route
                        exact
                        path='/user/signup'
                        component={() => <SignupUser />}
                    />
                    <Route exact path='/test' component={() => <Test />} />
                    <Route
                        exact
                        path='/employer/signup'
                        component={() => <SignupEmployer />}
                    />
                    <Route
                        exact
                        path='/profile'
                        // render={(props) => <Profile {...props} />}
                        component={() => <Profile />}
                    />
                    <Route
                        exact
                        path='/profile/update'
                        // render={(props) => <Profile {...props} />}
                        render={(props) => (
                            <UpdateUser {...props} setUser={this.setUser} />
                        )}
                    />
                    <Route
                        exact
                        path='/profile/:id'
                        // render={(props) => <Profile {...props} />}
                        render={(props) => <Profile {...props} />}
                    />
                    <Route
                        exact
                        path='/job/:id'
                        // render={(props) => <Profile {...props} />}
                        render={(props) => <Job {...props} />}
                    />
                    {this.state.user && this.state.user.role === "Employer" && (
                        <Route
                            path='/employer/job/update/:id'
                            render={(props) => <UpdateJob {...props} />}
                        />
                    )}
                    <Route
                        exact
                        path='/employer/update'
                        // render={(props) => <Profile {...props} />}
                        render={(props) => (
                            <UpdateEmployer {...props} setUser={this.setUser} />
                        )}
                    />
                    <Route
                        exact
                        path='/employer/profile/:id'
                        // render={(props) => <Profile {...props} />}
                        render={(props) => <EmployerProfile {...props} />}
                    />
                    <Route
                        exact
                        path='/employer'
                        // render={(props) => <Profile {...props} />}
                        render={(props) => (
                            <Employer
                                {...props}
                                // user={this.state.user}
                                setUser={this.setUser}
                            />
                        )}
                    />

                    <Route
                        exact
                        path='/post'
                        // render={(props) => <Profile {...props} />}
                        render={(props) => <PostJob {...props} />}
                    />
                    <Route
                        exact
                        path='/applications'
                        // render={(props) => <Profile {...props} />}
                        component={() => <JobApplications />}
                    />
                    <Route component={() => <ErrorPage />} />
                </Switch>
                <FooterComponent />
            </BrowserRouter>
        );
    }
}

export default App;
