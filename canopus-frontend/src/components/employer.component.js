import React, { Component } from "react";
import { NavLink, Link } from "react-router-dom";
import job from "../images/job.png";
import applicants from "../images/profile.png";
import bg1 from "../images/bg1.jpg";
import bg2 from "../images/bg4.jpg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import JobApplications from "./jobApplications.component";
import MarkdownIt from "markdown-it";
import Overview from "./overview.component";
import MdEditor from "react-markdown-editor-lite";
// import style manually
import "react-markdown-editor-lite/lib/index.css";
import {
    faUser,
    faMapMarkerAlt,
    faEnvelope,
    faBriefcaseMedical,
    faPen,
    faPlus,
    faFileAlt,
    faPenAlt,
} from "@fortawesome/free-solid-svg-icons";
import {
    Button,
    Nav,
    NavItem,
    TabPane,
    TabContent,
    Row,
    Col,
} from "reactstrap";
// Initialize a markdown parser
const mdParser = new MarkdownIt();
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
    // componentDidMount() {
    //     this.setState({
    //         id: this.props.user ? this.props.user._id : null,
    //     });
    //     console.log(this.props);
    // }
    render() {
        return (
            <div>
                <Nav tabs className='justify-content-between '>
                    <div
                        className='row justify-content-start col-12 col-sm-5 col-md-6 col-lg-7'
                        style={{ paddingLeft: "15px" }}>
                        <NavItem className='mx-1 mx-sm-2'>
                            <NavLink
                                className='p-1 p-sm-2 active-tab nav-link'
                                to='/employer'
                                // onClick={() => {
                                //     this.toggleTab("1");
                                // }}
                                // className={`${
                                //     this.state.activeTab === "1" && "active-tab"
                                // } p-1 p-sm-2 tab`}
                            >
                                <h6>Overview</h6>
                            </NavLink>
                        </NavItem>
                        <NavItem className='mx-1 mx-sm-2'>
                            <NavLink
                                className='nav-link p-1 p-sm-2 '
                                to='/applications'
                                // onClick={() => {
                                //     this.toggleTab("2");
                                // }}
                                // className={`${
                                //     this.state.activeTab === "2" && "active-tab"
                                // } p-1 p-sm-2 tab`}
                            >
                                <h6>Jobs</h6>
                            </NavLink>
                        </NavItem>
                    </div>
                    <div className='col-12 col-sm-7 col-md-6 col-lg-5 row px-2 justify-content-end'>
                        <div className='col-6 col-sm-5 col-md-4 px-1'>
                            <Link to='/employer/update'>
                                <Button
                                    className=' mt-2 my-1 px-2 w-100'
                                    size='sm'
                                    style={{ textAlign: "center" }}
                                    color='info'>
                                    Update Profile
                                    <FontAwesomeIcon
                                        icon={faPen}
                                        className='ml-2'
                                    />
                                </Button>
                            </Link>
                        </div>
                        <div className='col-6 col-sm-5 col-md-4 px-1'>
                            <Link to='/post'>
                                <Button
                                    className=' mt-2 my-1 px-2 w-100'
                                    size='sm'
                                    style={{ textAlign: "center" }}
                                    color='primary'>
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
                <Overview />
                {/* <TabContent activeTab={this.state.activeTab}>
                    <TabPane tabId='1'>
                        <Row>
                            <Col sm='12' className='px-0'>
                                <Overview />
                            </Col>
                        </Row>
                    </TabPane>
                    <TabPane tabId='2'>
                        <Row>
                            <JobApplications />
                        </Row>
                    </TabPane>
                </TabContent> */}
                {/* <div
                    className='row align-content-center'
                    style={{ margin: "0" }}>
                    <div
                        className='col-12 col-lg-6 py-5 p-2'
                        style={{
                            backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.6), rgba(255, 255, 255, 0.6)),url(${bg1})`,
                            backgroundAttachment: "contain",
                            backgroundSize: "cover",
                            backgroundRepeat: "no-repeat",
                            backgroundPosition: "center",
                        }}>
                        <div
                            className='col-12 '
                            style={{ textAlign: "center" }}>
                            <img
                                src={job}
                                className='img-fluid'
                                alt=''
                                style={{ maxWidth: "300px" }}
                            />
                        </div>
                        <div
                            className='col-12 mt-3'
                            style={{ textAlign: "center" }}>
                            <h1>Post a job</h1>
                            <Link to='/post'>
                                <Button outline='true' color='info'>
                                    Post
                                </Button>
                            </Link>
                        </div>
                    </div>
                    <div
                        className='col-12 col-lg-6 py-5 p-2'
                        style={{
                            backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.8)),url(${bg2})`,
                            backgroundAttachment: "contain",
                            backgroundSize: "cover",
                            backgroundRepeat: "no-repeat",
                            backgroundPosition: "center",
                        }}>
                        <div
                            className='col-12 '
                            style={{ textAlign: "center" }}>
                            <img
                                src={applicants}
                                className='img-fluid'
                                alt=''
                                style={{ maxWidth: "300px" }}
                            />
                        </div>
                        <div
                            className='col-12 mt-3'
                            style={{ textAlign: "center" }}>
                            <h1>View job applicants</h1>
                            <Link to='/applications'>
                                <Button outline='true' color='primary'>
                                    View
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div> */}
            </div>
        );
    }
}
