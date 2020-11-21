import React, { Component } from "react";
import { NavLink, Link } from "react-router-dom";
// import job from "../images/job.png";
// import applicants from "../images/profile.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import axios from "axios";
// import JobApplications from "./jobApplications.component";
// import MarkdownIt from "markdown-it";
import Overview from "./overview.component";
// import MdEditor from "react-markdown-editor-lite";
// import style manually
import "react-markdown-editor-lite/lib/index.css";
import {
    // faUser,
    // faMapMarkerAlt,
    // faEnvelope,
    // faBriefcaseMedical,
    faPen,
    // faPlus,
    // faFileAlt,
    // faPenAlt,
} from "@fortawesome/free-solid-svg-icons";
import {
    Button,
    Nav,
    NavItem,
    // TabPane,
    // TabContent,
    // Row,
    // Col,
} from "reactstrap";
// Initialize a markdown parser
// const mdParser = new MarkdownIt();
export default class Employer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            activeTab: "1",
            text: "",

            // id: null,
        };
        this.toggleTab = this.toggleTab.bind(this);
    }
    toggleTab(tab) {
        if (this.state.activeTab !== tab) this.setState({ activeTab: tab });
    }

    render() {
        let banner;
        if (this.props.data) banner = this.props.data.subscription_banner;
        return (
            <div className='col-12 col-xl-10 px-0 mx-auto'>
                <Nav tabs className='justify-content-between '>
                    <div className='row justify-content-start col-12 col-sm-5 col-md-6 col-lg-7'>
                        <NavItem className='mx-1 mx-sm-2'>
                            <NavLink
                                className='p-1 p-sm-2 active-tab nav-link'
                                to='/employer'>
                                <h6>Overview</h6>
                            </NavLink>
                        </NavItem>
                        <NavItem className='mx-1 mx-sm-2'>
                            <NavLink
                                className='nav-link p-1 p-sm-2 '
                                to='/applications'>
                                <h6>Jobs</h6>
                            </NavLink>
                        </NavItem>
                    </div>
                    <div className='col-12 col-sm-7 col-md-6 col-lg-5 row px-2 justify-content-around justify-content-sm-end'>
                        <div className='px-0 pr-0 pr-sm-1'>
                            <Link to='/employer/update'>
                                <Button
                                    className=' mt-2 my-1 px-4 w-100'
                                    size='sm'
                                    style={{ textAlign: "center" }}
                                    color='emp-secondary'>
                                    Update Profile
                                    <FontAwesomeIcon
                                        icon={faPen}
                                        className='ml-2'
                                    />
                                </Button>
                            </Link>
                        </div>
                        <div className='px-0 pl-0 pl-sm-1'>
                            <Link to='/post'>
                                <Button
                                    className=' mt-2 my-1 px-4 w-100'
                                    size='sm'
                                    style={{ textAlign: "center" }}
                                    color='emp-primary'>
                                    Post a Job{" "}
                                    <FontAwesomeIcon
                                        icon={faPen}
                                        className='ml-2'
                                    />
                                </Button>
                            </Link>
                        </div>
                    </div>
                </Nav>
                <Overview banner={banner} />
            </div>
        );
    }
}
