import React, { useState, useRef } from "react";
import { NavLink, Link } from "react-router-dom";
import { useHistory } from "react-router";
import "../stylesheets/navbar.css";
import {
    Collapse,
    Navbar,
    NavbarToggler,
    Alert,
    NavbarBrand,
    Nav,
    NavItem,
    Toast,
    ToastBody,
    Modal,
    ModalHeader,
    ModalBody,
    // Button,
    // ModalFooter,
    ButtonDropdown,
    DropdownItem,
    DropdownToggle,
    DropdownMenu,
} from "reactstrap";
import logo from "../images/logo.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ReactGA from "react-ga";

import {
    faUser,
    faLock,
    faSignOutAlt,
    faUserPlus,
} from "@fortawesome/free-solid-svg-icons";
import { faFacebook, faGoogle } from "@fortawesome/free-brands-svg-icons";
import axios from "axios";

const NavbarComponent = (props) => {
    const history = useHistory();
    const [error, setError] = useState("");
    const [showError, setShowError] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [modal, setModal] = useState(false);
    const [modalEmployer, setModalEmployer] = useState(false);
    const [buttonDropdown, setButtonDropdown] = useState(false);

    const toggle = () => setIsOpen(!isOpen);
    const toggleModal = () => setModal(!modal);
    const toggleModalEmployer = () => setModalEmployer(!modalEmployer);
    const toggleButtonDropdown = () => setButtonDropdown(!buttonDropdown);

    const username = useRef(null);
    const password = useRef(null);
    // if (!props.user) {
    //     axios
    //         .get(`/api/user/current`)
    //         .then(({ data }) => {
    //             if (data.user) {
    //                 props.setUser(data.user);
    //             }
    //         })
    //         .catch((err) => {
    //             console.log(err.response.data.name);
    //             setError(err.response.data.name);
    //             // setShowError(true);
    //         });
    // }
    const submit = () => {
        const user = {
            username: username.current.value,
            password: password.current.value,
        };
        toggleModal();
        axios
            .post(`/api/user/login`, user)
            .then((newuser) => {
                console.log(newuser.data.user);
                props.setUser(newuser.data.user);
                // window.location = "/search-jobs";
                ReactGA.event({
                    category: "User",
                    action: "userlogedin",
                });
                history.push("/search-jobs");
            })
            .catch((err) => {
                console.log(err.response);
                setShowError(true);
                if (err.response && err.response.data && err.response.data.err)
                    setError(err.response.data.err.message);
            });
    };
    const submitEmployer = () => {
        const user = {
            username: username.current.value,
            password: password.current.value,
        };
        toggleModalEmployer();
        axios
            .post(`/api/employer/login`, user)
            .then((newuser) => {
                console.log(newuser.data.employer);
                props.setUser(newuser.data.employer);
                // window.location = "/employer";
                // ReactGA.initialize("UA-176987444-1");
                // ReactGA.set({
                //     userId: newuser.data.employer._id,
                //     dimension2: "employer",
                // });
                ReactGA.event({
                    category: "Employer",
                    action: "loggedin",
                    id: `${newuser.data.employer._id}`,
                });
                history.push("/employer");
            })
            .catch((err) => {
                console.log(err.response);
                setShowError(true);
                if (err.response && err.response.data && err.response.data.err)
                    setError(err.response.data.err.message);
            });
    };
    // if (props.user) {
    //     return <Redirect to='/search-jobs' />;
    // }
    return (
        <div>
            <Alert
                color='danger'
                isOpen={showError}
                toggle={() => {
                    setShowError(false);
                }}>
                {error}
            </Alert>
            <Navbar color='light' light expand='lg'>
                <NavbarBrand href='/' className='text-align-center'>
                    <img src={logo} alt='logo' width='160px' />
                </NavbarBrand>
                <NavbarToggler
                    onClick={toggle}
                    className={`position-relative ${
                        !isOpen ? "collapsed" : ""
                    }`}>
                    <span></span>
                    <span></span>
                    <span></span>
                </NavbarToggler>
                <Collapse isOpen={isOpen} navbar>
                    <Nav className='row justify-content-center px-4' navbar>
                        <NavItem className='m-1'>
                            <NavLink to='/'>Home</NavLink>
                        </NavItem>
                        <NavItem className='m-1'>
                            <NavLink to='/search-jobs'>Job Search</NavLink>
                        </NavItem>
                        {/* <NavItem className='m-1'>
                            <NavLink to='/'>Career Resources</NavLink>
                        </NavItem>
                        <NavItem className='m-1'>
                            <NavLink to='/'>About US</NavLink>
                        </NavItem> */}
                    </Nav>
                    {!props.user ? (
                        <Nav
                            className='row ml-auto align-content-center justify-content-center mt-3 mt-lg-0'
                            style={{ minWidth: "33%" }}>
                            <Toast
                                className='my-auto mx-1'
                                style={{
                                    border: "1px solid #F04C63",
                                }}>
                                <div className='toast-header '>
                                    <strong className='mx-auto'>
                                        Job Seekers
                                    </strong>
                                </div>
                                <ToastBody className='row justify-content-around mx-1 font-18px'>
                                    <div>
                                        <Link
                                            to='/user/login'
                                            className='text-js-primary'
                                            // onClick={toggleModal}
                                        >
                                            Login
                                        </Link>
                                    </div>
                                    <div className=''>
                                        <Link
                                            to='/user/signup'
                                            className='badge badge-lg badge-js-primary p-2 ml-1'>
                                            Sign Up
                                        </Link>
                                    </div>
                                </ToastBody>
                            </Toast>
                            <Toast
                                className=' my-auto mx-1'
                                style={{
                                    border: "1px solid #0A4F70",
                                }}>
                                <div className='toast-header px-auto'>
                                    <strong className='mx-auto'>
                                        Employers
                                    </strong>
                                </div>
                                <ToastBody className='row justify-content-around mx-1 font-18px'>
                                    <div>
                                        <Link
                                            to='/employer/login'
                                            className='text-emp-primary'
                                            // onClick={toggleModalEmployer}
                                        >
                                            Login
                                        </Link>
                                    </div>
                                    <div className=''>
                                        <a
                                            href='/employer/signup'
                                            className='badge badge-lg badge-emp-primary p-2 ml-1'>
                                            Sign Up
                                        </a>
                                    </div>
                                </ToastBody>
                            </Toast>
                        </Nav>
                    ) : (
                        <Nav className='mt-3 mt-lg-0 ml-auto mx-0 row justify-content-center'>
                            <ButtonDropdown
                                isOpen={buttonDropdown}
                                toggle={toggleButtonDropdown}>
                                <Link
                                    id='caret'
                                    to={`${
                                        props.user.role === "Employer"
                                            ? "/employer"
                                            : "/profile"
                                    }`}
                                    className={`btn btn-emp-primary`}
                                    style={{ width: "max-content" }}>
                                    <FontAwesomeIcon
                                        icon={
                                            props.user.role === "Employer"
                                                ? faUserPlus
                                                : faUser
                                        }
                                        className='mr-2'
                                    />
                                    {props.user.firstName}
                                </Link>
                                <DropdownToggle caret color={"emp-primary"} />
                                <DropdownMenu
                                    right
                                    // direction='right'
                                    // nav={true}
                                    // style={{ zIndex: 1001 }}
                                >
                                    {props.user.role === "Employer" ? (
                                        <Link
                                            to='/employer'
                                            className='dropdown-item'>
                                            Dashboard
                                        </Link>
                                    ) : (
                                        <Link
                                            to='/profile/'
                                            className='dropdown-item'>
                                            View Profile
                                        </Link>
                                    )}
                                    <DropdownItem divider />
                                    <DropdownItem
                                        onClick={() => {
                                            axios
                                                .get(`/api/user/logout`)
                                                .then((user) => {
                                                    console.log(
                                                        `logout${user}`,
                                                    );
                                                    props.setUser(null);
                                                    history.push("/");
                                                })
                                                .catch((err) => {
                                                    console.log(err.response);
                                                });
                                        }}>
                                        Log Out
                                        <FontAwesomeIcon
                                            icon={faSignOutAlt}
                                            className='ml-3'
                                        />
                                    </DropdownItem>
                                </DropdownMenu>
                            </ButtonDropdown>
                        </Nav>
                    )}
                </Collapse>
            </Navbar>
            <div>
                <Modal isOpen={modal} toggle={toggleModal}>
                    <ModalHeader toggle={toggleModal}>
                        Jobseeker Login
                    </ModalHeader>
                    <ModalBody>
                        <div className='login-form'>
                            <div className='form-group'>
                                <div className='input-group'>
                                    <div className='input-group-prepend'>
                                        <span className='input-group-text'>
                                            <FontAwesomeIcon icon={faUser} />
                                        </span>
                                    </div>
                                    <input
                                        type='text'
                                        className='form-control'
                                        name='username'
                                        placeholder='Username'
                                        ref={username}
                                        required
                                    />
                                </div>
                            </div>
                            <div className='form-group'>
                                <div className='input-group'>
                                    <div className='input-group-prepend'>
                                        <span className='input-group-text'>
                                            {" "}
                                            <FontAwesomeIcon icon={faLock} />
                                        </span>
                                    </div>
                                    <input
                                        type='password'
                                        className='form-control'
                                        name='password'
                                        placeholder='Password'
                                        ref={password}
                                        required
                                    />
                                </div>
                            </div>
                            <div className='form-group'>
                                <button
                                    type='submit'
                                    onClick={submit}
                                    className='btn btn-primary login-btn btn-block'>
                                    Log in
                                </button>
                            </div>
                            <div className='clearfix'>
                                <Link
                                    className='text-info float-right'
                                    // to='/employer/forgot'
                                >
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
                                    href={`${process.env.REACT_APP_API_URL}auth/facebook`}
                                    className='btn btn-primary mx-2'>
                                    <FontAwesomeIcon icon={faFacebook} />
                                    &nbsp; Facebook
                                </a>
                                <a
                                    href={`${process.env.REACT_APP_API_URL}auth/google`}
                                    className='btn btn-danger mx-2'>
                                    <FontAwesomeIcon icon={faGoogle} />
                                    &nbsp; Google
                                </a>
                            </div>
                            <p className='text-center text-muted small'>
                                Don't have an account?{" "}
                                <Link to='/user/signup' className='text-info'>
                                    Sign up here!
                                </Link>
                            </p>
                        </div>
                    </ModalBody>
                </Modal>
            </div>
            <div>
                <Modal isOpen={modalEmployer} toggle={toggleModalEmployer}>
                    <ModalHeader toggle={toggleModalEmployer}>
                        Employer Login
                    </ModalHeader>
                    <ModalBody>
                        <div className='login-form'>
                            <div className='form-group'>
                                <div className='input-group'>
                                    <div className='input-group-prepend'>
                                        <span className='input-group-text'>
                                            <FontAwesomeIcon icon={faUser} />
                                        </span>
                                    </div>
                                    <input
                                        type='text'
                                        className='form-control'
                                        name='username'
                                        placeholder='Username'
                                        ref={username}
                                        required
                                    />
                                </div>
                            </div>
                            <div className='form-group'>
                                <div className='input-group'>
                                    <div className='input-group-prepend'>
                                        <span className='input-group-text'>
                                            {" "}
                                            <FontAwesomeIcon icon={faLock} />
                                        </span>
                                    </div>
                                    <input
                                        type='password'
                                        className='form-control'
                                        name='password'
                                        placeholder='Password'
                                        ref={password}
                                        required
                                    />
                                </div>
                            </div>
                            <div className='form-group'>
                                <button
                                    type='submit'
                                    onClick={submitEmployer}
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
                                <a href='/' className='btn btn-primary mx-2'>
                                    <FontAwesomeIcon icon={faFacebook} />
                                    &nbsp; Facebook
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
                        </div>
                    </ModalBody>
                </Modal>
            </div>
        </div>
    );
};
export default NavbarComponent;
