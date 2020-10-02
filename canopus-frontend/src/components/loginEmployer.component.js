import React, { Component } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import { faLock, faUser } from "@fortawesome/free-solid-svg-icons";
import {
    faFacebook,
    faGoogle,
    faLinkedin,
} from "@fortawesome/free-brands-svg-icons";
import { Link, NavLink } from "react-router-dom";
import { Modal, ModalHeader, ModalBody, NavItem, Nav } from "reactstrap";
import ReCAPTCHA from "react-google-recaptcha";
import ReactGA from "react-ga";

const block = {
    borderRadius: " 0.25rem",
    border: "0.05rem solid #eeeeee",
    /* background-color: rgba(0, 0, 0, 0.15); */
    boxShadow: " 2px 2px 3px rgba(0, 0, 0, 0.1)",
    transition: "0.3s ease-in-out",
};

export default class LoginEmployer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            username: "",
            password: "",
            recaptcha: "",
            modal: false,
            message: "",
        };
        this.handleChange = this.handleChange.bind(this);
        this.submitEmployer = this.submitEmployer.bind(this);
        this.handleChangeRecaptcha = this.handleChangeRecaptcha.bind(this);
        this.toggle = this.toggle.bind(this);
        this.recaptcha = React.createRef(null);
    }
    toggle() {
        this.setState({ modal: !this.state.modal });
    }
    handleChange(e) {
        this.setState({
            [e.target.name]: e.target.value,
        });
    }
    handleChangeRecaptcha(e) {
        this.setState({
            recaptcha: e,
        });
    }
    async submitEmployer(e) {
        e.preventDefault();
        let token;
        try {
            token = await this.recaptcha.current.executeAsync();
            const employer = {
                username: this.state.username,
                password: this.state.password,
                captcha: token,
            };
            console.log(employer);
            axios
                .post(`/api/employer/login`, employer)
                .then((newuser) => {
                    console.log(newuser.data.employer);
                    this.props.setUser(newuser.data.employer);
                    ReactGA.event({
                        category: "Employer",
                        action: "loggedin",
                        id: `${newuser.data.employer._id}`,
                    });
                    this.props.history.push("/employer");
                })
                .catch((err) => {
                    console.log(err);
                    console.log(err.response);

                    if (
                        err.response &&
                        err.response.data &&
                        err.response.data.err
                    )
                        this.setState({
                            modal: true,
                            message:
                                err.response.data.err === ""
                                    ? "Invalid login"
                                    : err.response.data.err,
                        });
                });
        } catch (e) {
            console.log(e);
            this.setState({
                modal: true,
                message: "Captcha problem",
            });
            const employer = {
                username: this.state.username,
                password: this.state.password,
                captcha: token,
            };
            console.log(employer);
            axios
                .post(`/api/employer/login`, employer)
                .then((newuser) => {
                    console.log(newuser.data.employer);
                    this.props.setUser(newuser.data.employer);
                    this.props.history.push("/analytics");
                })
                .catch((err) => {
                    console.log(err);
                    console.log(err.response);

                    if (
                        err.response &&
                        err.response.data &&
                        err.response.data.err
                    )
                        this.setState({
                            modal: true,
                            message:
                                err.response.data.err === ""
                                    ? "Invalid login"
                                    : err.response.data.err,
                        });
                });
        }
    }
    componentDidMount() {
        if (this.props.location.search !== "") {
            console.log(this.props.location.search.split("=")[1]);
            const err = this.props.location.search.split("=")[1];
            this.setState({
                modal: true,
                message: err === "" ? "Unable to login" : err,
            });
        }
    }
    render() {
        return (
            <div>
                <Nav tabs className='justify-content-between '>
                    <div className='row justify-content-start'>
                        <NavItem className='mx-1 mx-sm-2 '>
                            <NavLink
                                to='/employer/login'
                                // onClick={() => {
                                //     this.toggleTab("1");
                                // }}
                                className={`active-tab nav-link p-1 p-sm-2`}>
                                <h6>Login</h6>
                            </NavLink>
                        </NavItem>
                        <NavItem className='mx-1 mx-sm-2'>
                            <NavLink
                                to='/employer/signup'
                                className={`nav-link p-1 p-sm-2`}>
                                <h6>Signup</h6>
                            </NavLink>
                        </NavItem>
                        <NavItem className='mx-1 mx-sm-2'>
                            <NavLink
                                to='/employer/forgot'
                                className={`nav-link p-1 p-sm-2`}>
                                <h6>Forgot password</h6>
                            </NavLink>
                        </NavItem>
                    </div>
                </Nav>

                <div className='row m-1 m-sm-2'>
                    <div
                        className='col-11 col-sm-7 col-md-6 col-lg-5 mx-auto p-4'
                        style={block}>
                        <h4 className='mb-5'>Employer Login</h4>
                        <form
                            className='login-form'
                            onSubmit={this.submitEmployer}>
                            <div className='form-group'>
                                <div className='input-group'>
                                    <div className='input-group-prepend'>
                                        <span className='input-group-text'>
                                            <FontAwesomeIcon icon={faUser} />
                                        </span>
                                    </div>
                                    <input
                                        type='email'
                                        className='form-control'
                                        name='username'
                                        placeholder='Username'
                                        onChange={this.handleChange}
                                        required
                                    />
                                </div>
                            </div>
                            <div className='form-group'>
                                <div className='input-group'>
                                    <div className='input-group-prepend'>
                                        <span className='input-group-text'>
                                            <FontAwesomeIcon icon={faLock} />
                                        </span>
                                    </div>
                                    <input
                                        type='password'
                                        className='form-control'
                                        name='password'
                                        placeholder='Password'
                                        onChange={this.handleChange}
                                        required
                                    />
                                </div>
                            </div>
                            <ReCAPTCHA
                                sitekey={`${process.env.REACT_APP_CAPTCHA_INVISIBLE}`}
                                name='recaptcha'
                                size='invisible'
                                // onChange={this.handleChangeRecaptcha}
                                badge='bottomleft'
                                ref={this.recaptcha}
                            />
                            <div className='form-group'>
                                <button
                                    type='submit'
                                    className='btn btn-primary login-btn btn-block'>
                                    Log in
                                </button>
                            </div>
                            <div className='clearfix'>
                                <Link
                                    className='text-info float-right'
                                    to='/employer/forgot'>
                                    Forgot Password?
                                </Link>
                            </div>
                            <div className='or-seperator'>
                                <i>or</i>
                            </div>
                            <p className='text-center'>
                                Login with your social media account
                            </p>
                            <div className='text-center social-btn'>
                                <a
                                    href='/auth/linkedin/user'
                                    className='btn btn-linkedin mx-2'>
                                    <FontAwesomeIcon icon={faLinkedin} />
                                    &nbsp; Linkedin
                                </a>
                                <a href='/' className='btn btn-danger mx-2'>
                                    <FontAwesomeIcon icon={faGoogle} />
                                    &nbsp; Google
                                </a>
                            </div>

                            <p className='text-center text-muted small'>
                                Don't have an account?{" "}
                                <Link
                                    to='/employer/signup'
                                    className='text-info'>
                                    Sign up here!
                                </Link>
                            </p>
                        </form>
                    </div>
                    <Modal
                        isOpen={this.state.modal}
                        toggle={this.toggle}
                        style={{ marginTop: "20vh" }}>
                        <ModalHeader toggle={this.toggle} className='py-1'>
                            Error !
                        </ModalHeader>

                        <ModalBody>{this.state.message}</ModalBody>
                    </Modal>
                </div>
            </div>
        );
    }
}
