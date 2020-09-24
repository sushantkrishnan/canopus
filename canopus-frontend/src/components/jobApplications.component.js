import React, { Component, useEffect, useState } from "react";
import axios from "axios";
import Loader from "react-loader-spinner";
import { NavLink, Link, useHistory } from "react-router-dom";
import {
    Media,
    Badge,
    Button,
    Modal,
    ModalHeader,
    ModalFooter,
    ModalBody,
} from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faMapMarkerAlt,
    faUser,
    faPen,
    faArrowRight,
    faArrowDown,
    faArrowUp,
    faCheck,
    faCheckCircle,
    faChartLine,
    faRocket,
} from "@fortawesome/free-solid-svg-icons";
import hospital from "../images/hospital.svg";
import "../stylesheets/jobApplications.css";
import chartIcon from "../images/line-chart.svg";
import {
    ListGroup,
    ListGroupItem,
    Nav,
    NavItem,
    DropdownToggle,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    TabContent,
    TabPane,
    Row,
    Col,
} from "reactstrap";
const chart = {
    prefix: "fas",
    iconName: "chart",
    icon: [
        512,
        512,
        [],
        "f0000",
        "m21.5 23h-19c-1.379 0-2.5-1.122-2.5-2.5v-17c0-1.378 1.121-2.5 2.5-2.5h19c1.379 0 2.5 1.122 2.5 2.5v17c0 1.378-1.121 2.5-2.5 2.5zm-19-21c-.827 0-1.5.673-1.5 1.5v17c0 .827.673 1.5 1.5 1.5h19c.827 0 1.5-.673 1.5-1.5v-17c0-.827-.673-1.5-1.5-1.5z m23.5 6h-23c-.276 0-.5-.224-.5-.5s.224-.5.5-.5h23c.276 0 .5.224.5.5s-.224.5-.5.5z m7.5 17c-.128 0-.256-.049-.354-.146-.195-.195-.195-.512 0-.707l3.5-3.5c.151-.153.385-.19.577-.094l1.678.839 3.245-3.245c.195-.195.512-.195.707 0s.195.512 0 .707l-3.5 3.5c-.152.152-.385.191-.577.094l-1.678-.839-3.245 3.245c-.097.097-.225.146-.353.146z m16.5 14c-.276 0-.5-.224-.5-.5v-2.5h-2.5c-.276 0-.5-.224-.5-.5s.224-.5.5-.5h3c.276 0 .5.224.5.5v3c0 .276-.224.5-.5.5z",
    ],
};
const ApplicantDetails = ({ applicant }) => {
    const [data, setData] = useState(null);
    const [error, setError] = useState(false);
    useEffect(() => {
        axios
            .get(`/api/user/profile/${applicant}`)
            .then(({ data }) => {
                setData(data);
                setError(false);
            })
            .catch((err) => {
                setError(true);
                console.log(err.response);
            });
    }, []);
    return <div>{!error && data && data.username}</div>;
};
const Badges = ({ desc, superSpecialization }) => {
    const superSp = superSpecialization ? superSpecialization : [];
    let badges = [];
    if (desc && desc.type)
        badges = [
            desc.experience,
            // ...desc.type,
            ...desc.incentives,
            ...superSp,
        ];
    const number = badges.length - 5;
    badges = badges.slice(0, 3);
    // console.log(badges);

    return (
        <div>
            {badges.map((badge, i) => {
                return (
                    <Badge className='mx-1' color='info' key={i}>
                        {badge}
                    </Badge>
                );
            })}
            {number > 0 && `+ ${number} more`}
        </div>
    );
};
const Job = ({
    job,
    jobType,
    type2,
    getClosedJobs,
    getOpenJobs,
    getSavedJobs,
}) => {
    // console.log(window.location);
    const history = useHistory();
    const freelance = type2 === "freelance" ? true : false;
    const [show, setShow] = useState(false);
    const [modal, setModal] = useState(false);
    const [mess, setMess] = useState("");

    const [modalError, setModalError] = useState(false);
    const [messError, setMessError] = useState("");

    const toggleError = () => setModalError(!modalError);

    const toggle = () => setModal(!modal);
    const showApplicants = () => {
        setShow(!show);
    };
    const sponsor = () => {
        axios
            .put(`/api/employer/sponsor/${type2}/${job._id}`)
            .then((data) => {
                console.log(data);
                setMessError("Job Promoted Successfully !");
                toggleError();
                getOpenJobs();
            })
            .catch((err) => {
                console.log(err.response);
                if (err.response.data && err.response.data.err) {
                    setMessError(err.response.data.err);
                    toggleError();
                }
            });
    };
    const accept = (id) => {
        console.log(id);
        axios
            .put(`/api/employer/apply/${type2}/${job._id}`, { id })
            .then((data) => {
                console.log(data);
                setMessError(
                    "Thank you for accepting the job, we will get back to you with more details on your registerd mobile no",
                );
                toggleError();
            })
            .catch((err) => {
                console.log(err.response);
                if (err.response.data && err.response.data.err) {
                    setMessError(err.response.data.err);
                    toggleError();
                }
            });
    };
    const post = () => {
        console.log("posted");
        if (type2 === "freelance")
            axios
                .put(`/api/employer/save/freelance/activate/${job._id}`)
                .then((data) => {
                    console.log(data);
                    if (data.status === 200) {
                        setMessError("Posted Successfully !");
                        toggleError();
                        getSavedJobs();
                    }
                })
                .catch((err) => console.log(err.response));
        else
            axios
                .put(`/api/employer/save/job/activate/${job._id}`)
                .then((data) => {
                    if (data.status === 200) {
                        setMessError("Posted Successfully !");
                        toggleError();
                    }
                })
                .catch((err) => console.log(err.response));
    };
    const discard = () => {
        axios
            .delete(
                `/api/employer/${
                    jobType === "Saved" ? "save" : "post"
                }/${type2}/${job._id}`,
            )
            .then((data) => {
                console.log(data);
                setMessError("Discarded Successfully");
                toggleError();
            })
            .catch((err) => {
                console.log(err.response);
                if (err.response.data && err.response.data.err)
                    setMessError(err.response.data.err);
                toggleError();
            });
    };
    return (
        <div className='col-12 col-md-6'>
            <Media
                className={`row  justify-content-center m-2 m-md-3 p-2 px-md-2  ${
                    job.sponsored === "true" ? "block-info" : "block"
                }`}>
                <Media body className='col-12 p-1'>
                    <Media heading className='row'>
                        <div className='col-6 col-sm-8 px-0'>
                            <h5>{job.title}</h5>
                            <h6>
                                <FontAwesomeIcon icon={faMapMarkerAlt} />{" "}
                                {job.description && job.description.location}
                            </h6>
                        </div>
                        <div className='col-6 col-sm-4  mt-0 p-0 '>
                            {jobType === "Saved" && (
                                <div className='row mx-0 px-0 justify-content-end'>
                                    <div className='col-8 px-0 pr-1'>
                                        <Button
                                            size={"sm"}
                                            color='danger'
                                            onClick={(e) => {
                                                setMess("discard");
                                                toggle();
                                            }}
                                            className='w-100'>
                                            Discard
                                        </Button>
                                    </div>
                                    <div className='col-4 px-0 pl-1'>
                                        <Link
                                            to={{
                                                pathname: `/employer/job/update/${job._id}`,
                                                search: freelance
                                                    ? "freelance&save"
                                                    : "job&save",
                                            }}
                                            params={{ freelance: freelance }}>
                                            <Button
                                                size={"sm"}
                                                className='btn btn-primary w-100'>
                                                Edit
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            )}
                            {jobType === "Closed" && (
                                <div className='row mx-0 px-0 justify-content-end'>
                                    <div className='col-5 px-0 pr-1'>
                                        <Button
                                            color='primary'
                                            size={"sm"}
                                            className='w-100'
                                            onClick={(e) => {
                                                history.push({
                                                    pathname: "/post",
                                                    state: {
                                                        id: job._id,
                                                        type2,
                                                        jobType: "close",
                                                    },
                                                });
                                            }}>
                                            Copy
                                        </Button>
                                    </div>
                                    <div className='col-4 px-0 pl-1'>
                                        <Link
                                            to={{
                                                pathname: `/employer/job/update/${job._id}`,
                                                search: freelance
                                                    ? "freelance&close"
                                                    : "job&close",
                                            }}
                                            params={{ freelance: freelance }}>
                                            <Button
                                                size={"sm"}
                                                color='secondary'
                                                className='btn btn-primary w-100'>
                                                View
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            )}
                            {jobType === "Open" && (
                                <div className='row mx-0 px-0 justify-content-end'>
                                    {!(
                                        job.sponsored &&
                                        job.sponsored === "true"
                                    ) ? (
                                        <div className='col-8 col-md-7 px-0 pr-1'>
                                            <Button
                                                className='w-100'
                                                size='sm'
                                                color={"info"}
                                                onClick={(e) => {
                                                    setMess("promote");
                                                    toggle();
                                                }}>
                                                Promote
                                                <FontAwesomeIcon
                                                    icon={chartIcon}
                                                    className='ml-1'
                                                    size='sm'
                                                />
                                                {/* <span>{chartIcon}</span> */}
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className='col-8 col-md-7 px-0 pr-1'>
                                            <Button
                                                className='w-100 px-0'
                                                size='sm'
                                                color={"info"}
                                                disabled>
                                                Promoted
                                                <FontAwesomeIcon
                                                    icon={faCheck}
                                                    size='sm'
                                                    className='ml-1'
                                                />
                                            </Button>
                                        </div>
                                    )}

                                    <div className='col-4 px-0 pl-1'>
                                        <Link
                                            to={{
                                                pathname: `/employer/job/update/${job._id}`,
                                                search: freelance
                                                    ? "freelance&post"
                                                    : "job&post",
                                            }}
                                            params={{ freelance: freelance }}>
                                            <Button
                                                className='btn btn-primary w-100'
                                                size='sm'>
                                                Edit
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>
                    </Media>

                    {/* <Media heading>
                        <h6 className='text-info'>
                            
                            {job.description.company
                                ? job.description.company
                                : "Company"}
                        </h6>
                    </Media> */}
                    <Media heading></Media>
                    <hr className='mt-0 mb-2' />
                    <div className='row m-0'>
                        <div className='col-12 desc'>
                            <em>{job.description && job.description.line}</em>

                            {/* <strong>Type:</strong>
                            {job.description.type.map((type) => `${type} , `)}
                            <br /> */}
                            {/* <strong>Experience: </strong>
                            {job.description.experience} */}
                            {/* <br />
                            <strong>incentives: </strong>
                            {job.description.incentives.map(
                                (inc) => `${inc} ,`,
                            )} */}
                            <br />
                        </div>
                        {/* <div
                        className='col-12 col-sm-2 my-2 my-sm-auto'
                        style={{ textAlign: "center" }}>
                        <Button
                            color='primary w-100'
                            // className='float-right'
                            onClick={applyJob}>
                            Apply
                        </Button>
                    </div> */}
                        <hr />
                        <div className='col-12'>
                            {job.startDate && (
                                <div className='row'>
                                    {new Date(
                                        job.startDate,
                                    ).toLocaleDateString()}
                                </div>
                            )}
                            {job.category === "Day Job" && (
                                <div className='row'>
                                    {job.startDate && (
                                        <div className=''>
                                            {new Date(
                                                job.startDate,
                                            ).toLocaleTimeString()}
                                            {" - "}
                                        </div>
                                    )}

                                    {job.endDate && (
                                        <div className=''>
                                            {new Date(
                                                job.endDate,
                                            ).toLocaleTimeString()}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        {!freelance && (
                            <div className='col-12  px-0 '>
                                <Badges
                                    desc={job.description}
                                    superSpecialization={
                                        job.superSpecialization
                                    }
                                />
                            </div>
                        )}
                    </div>
                    {jobType === "Open" && (
                        <div className='row w-100 justify-content-start mt-3'>
                            {/* <div className='col-12 col-sm-6  my-auto px-1 py-1 py-sm-0'>
                                <Button
                                    className='w-100'
                                    color={"info"}
                                    onClick={sponsor}>
                                    Promote
                                </Button>
                            </div> */}
                            <hr className='col-12 my-1' />
                            <div className='col-12 col-sm-12  my-auto pl-0 pr-1 py-1 py-sm-0'>
                                <div
                                    style={{
                                        backgroundColor: "rgba(0, 0, 0, 0)",
                                        color: "black",
                                        border: "0px solid transparent",
                                    }}
                                    onClick={showApplicants}
                                    className='w-100 text-align-left px-0 btn btn-transparent'>
                                    {`${job.applicants.length} `}Applications
                                    <span className='float-right'>
                                        {show ? (
                                            <FontAwesomeIcon icon={faArrowUp} />
                                        ) : (
                                            <FontAwesomeIcon
                                                icon={faArrowDown}
                                            />
                                        )}
                                    </span>
                                </div>
                            </div>
                            {/* <div className='col-6  my-auto p-0 p-md-2 pl-1'>
                                <Link
                                    to={{
                                        pathname: `/employer/job/update/${job._id}`,
                                        search: freelance
                                            ? "freelance&post"
                                            : "job&post",
                                    }}
                                    params={{ freelance: freelance }}>
                                    <Button className='btn btn-primary w-100'>
                                        Edit JOB
                                    </Button>
                                </Link>
                            </div> */}
                        </div>
                    )}
                    {/* {jobType === "Saved" && (
                        <div className='row w-100 justify-content-start mt-3'>
                            <div className='col-12  my-auto p-0 p-md-2 pr-1'>
                                <Button
                                    color={`info`}
                                    onClick={(e) => {
                                        setMess("post");
                                        toggle();
                                    }}
                                    className='w-100'>
                                    Post
                                </Button>
                            </div>
                            <div className='col-6  my-auto p-0 p-md-2 pl-1'>
                                <Link
                                    to={{
                                        pathname: `/employer/job/update/${job._id}`,
                                        search: freelance
                                            ? "freelance&save"
                                            : "job&save",
                                    }}
                                    params={{ freelance: freelance }}>
                                    <Button className='btn btn-primary w-100'>
                                        Edit JOB
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    )} */}
                </Media>

                <Media
                    left
                    href='#'
                    className='d-none  col-12 col-sm-3 my-auto mx-auto '>
                    <Media
                        object
                        src={hospital}
                        style={{ maxHeight: "200px" }}
                        alt='Generic placeholder image'
                        className='img-fluid float-right pr-2 pr-lg-3'
                    />
                </Media>
                {show &&
                    (job.applicants.length ? (
                        <ListGroup className='mt-2 mx-2 w-100'>
                            {job.applicants.map((applicant) => (
                                <ListGroupItem key={applicant.id}>
                                    {/* <ApplicantDetails
                                            key={applicant.id}
                                            applicant={applicant.id}
                                        /> */}
                                    <FontAwesomeIcon
                                        icon={faUser}
                                        className='mr-2'
                                    />
                                    {applicant.username}
                                    <Link
                                        to={`/profile/${applicant.id}`}
                                        title='View Profile'
                                        className='btn btn-primary btn-sm float-right mx-1'
                                        style={{ borderRadius: "50%" }}>
                                        <FontAwesomeIcon icon={faArrowRight} />
                                    </Link>
                                    {freelance && (
                                        <Button
                                            color='success'
                                            title='Accept'
                                            className='btn btn-primary btn-sm float-right mx-1'
                                            onClick={() => {
                                                setMess(
                                                    `accept_${applicant.id}`,
                                                );
                                                toggle();
                                            }}
                                            style={{ borderRadius: "50%" }}>
                                            <FontAwesomeIcon icon={faCheck} />
                                        </Button>
                                    )}
                                </ListGroupItem>
                            ))}
                        </ListGroup>
                    ) : (
                        <h6 className='w-100' style={{ textAlign: "center" }}>
                            No applicants
                        </h6>
                    ))}
            </Media>
            <Modal isOpen={modal} toggle={toggle} style={{ marginTop: "20vh" }}>
                <ModalHeader toggle={toggle} className='py-1'>
                    {mess === "promote" && "Promote the Job?"}
                    {mess === "post" && "Publish the Job?"}
                    {mess === "discard" && "Discard the Job?"}
                    {mess.split("_")[0] === "accept" && "Accept the Applicant?"}
                </ModalHeader>
                <ModalBody className='py-3'>
                    {mess === "promote" &&
                        "Are you sure you want to promote this job ?"}
                    {mess.split("_")[0] === "accept" &&
                        "Are you sure you want to confirm the applicant. Clicking on “OK” will confirm the applicant and close the job for other applicants"}
                    {mess === "post" &&
                        "Posting the Job will make it visible to applicants."}
                    {mess === "discard" &&
                        "You will not be able to recover this job."}
                </ModalBody>
                <ModalFooter className='py-1'>
                    {mess === "promote" && (
                        <Button
                            size='sm'
                            color='primary'
                            onClick={(e) => {
                                toggle();
                                sponsor();
                            }}>
                            Promote
                        </Button>
                    )}
                    {mess === "post" && (
                        <Button
                            size='sm'
                            color='primary'
                            onClick={(e) => {
                                toggle();
                                post();
                            }}>
                            Post
                        </Button>
                    )}
                    {mess === "discard" && (
                        <Button
                            size='sm'
                            color='danger'
                            onClick={(e) => {
                                toggle();
                                discard();
                            }}>
                            Delete
                        </Button>
                    )}
                    {mess.split("_")[0] === "accept" && (
                        <Button
                            size='sm'
                            color='primary'
                            onClick={(e) => {
                                toggle();
                                accept(mess.split("_")[1]);
                            }}>
                            Yes
                        </Button>
                    )}
                    <Button color='secondary' size='sm' onClick={toggle}>
                        {mess === "discard" && "Keep"}
                        {mess === "post" && "Wait"}
                        {mess === "promote" && "No"}
                    </Button>
                </ModalFooter>
            </Modal>
            <Modal
                isOpen={modalError}
                toggle={toggleError}
                style={{ marginTop: "20vh" }}>
                <ModalHeader toggle={toggleError} className='py-1'>
                    Message
                </ModalHeader>
                {/* <ModalHeader toggle={toggle}>
                    {mess === "promote" && "Promote"}
                </ModalHeader> */}
                <ModalBody>{messError}</ModalBody>
            </Modal>
        </div>
    );
};
export default class JobApplications extends Component {
    constructor(props) {
        super(props);
        this.state = {
            jobs: null,
            freelanceJobs: null,
            activeTab: "1",
            jobType: "Open",
            dropdownOpen: false,
            closedJobs: null,
            savedJobs: null,
        };
        this.toggleTab = this.toggleTab.bind(this);
        this.getSavedJobs = this.getSavedJobs.bind(this);
        this.getOpenJobs = this.getOpenJobs.bind(this);
        this.getClosedJobs = this.getClosedJobs.bind(this);
    }
    toggleTab(tab) {
        if (this.state.activeTab !== tab) this.setState({ activeTab: tab });
    }
    getClosedJobs() {
        axios
            .get("/api/employer/all/expiredJobs")
            .then(({ data }) => {
                console.log(data);
                this.setState({ jobs: data.jobs });
            })
            .catch((err) => console.log(err.response));
        axios
            .get("/api/employer/all/expiredFreelance")
            .then(({ data }) => {
                // console.log(data);
                this.setState({ freelanceJobs: data.jobs });
                console.log(this.state.freelanceJobs);
            })
            .catch((err) => console.log(err.response));
    }
    getOpenJobs() {
        axios
            .get("/api/employer/all/jobs")
            .then(({ data }) => {
                console.log(data.jobs);
                this.setState({ jobs: data.jobs });
            })
            .catch((err) => console.log(err.response));
        axios
            .get("/api/employer/all/freelance")
            .then(({ data }) => {
                console.log(data.jobs);
                this.setState({ freelanceJobs: data.jobs });
            })
            .catch((err) => console.log(err.response));
    }
    getSavedJobs() {
        axios
            .get("/api/employer/all/savedJobs")
            .then(({ data }) => {
                console.log(data.jobs);
                this.setState({ jobs: data.jobs });
            })
            .catch((err) => console.log(err.response));
        axios
            .get("/api/employer/all/savedFreelance")
            .then(({ data }) => {
                console.log(data.jobs);
                this.setState({ freelanceJobs: data.jobs });
            })
            .catch((err) => console.log(err.response));
    }
    componentDidMount() {
        console.log("inside component did mount");
        this[`get${this.state.jobType}Jobs`]();
    }
    render() {
        return (
            <div className='w-100'>
                {window.location.pathname === "/applications" && (
                    <Nav tabs className='justify-content-between '>
                        <div className='row justify-content-start col-6 col-sm-7'>
                            <NavItem className='mx-1 mx-sm-2'>
                                <NavLink
                                    to='/employer'
                                    // onClick={() => {
                                    //     this.toggleTab("1");
                                    // }}
                                    className={`p-1 p-sm-2 nav-link`}>
                                    <h6>Overview</h6>
                                </NavLink>
                            </NavItem>
                            <NavItem className='mx-1 mx-sm-2'>
                                <NavLink
                                    to='/applications'
                                    className={`p-1 p-sm-2  active-tab nav-link`}>
                                    <h6>Jobs</h6>
                                </NavLink>
                            </NavItem>
                        </div>
                        <div className='col-6 col-sm-5 row pr-2 pr-sm-3 justify-content-end'>
                            <div className='col-12 col-sm-5 px-0 pr-0 pr-sm-1'>
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
                            <div className='col-12 col-sm-5 px-0 pl-0 pl-sm-1'>
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
                )}
                <div className='row pt-3 w-100 justify-content-end'>
                    {/* <div className='col-7 px-0 pl-3'>
                        <h3 className='text-align-left   '>
                        {this.state.jobType} Jobs
                    </h3>
                    </div> */}

                    <div
                        className=' px-0 pr-3'
                        style={{ textAlign: "right", width: "max-content" }}>
                        <Dropdown
                            isOpen={this.state.dropdownOpen}
                            toggle={() => {
                                this.setState({
                                    dropdownOpen: !this.state.dropdownOpen,
                                });
                            }}>
                            <DropdownToggle
                                style={{
                                    textTransform: "capitalize",
                                    backgroundColor: "transparent",
                                    color: "black",
                                    border: "0px solid transparent",
                                }}
                                caret>{`${this.state.jobType} jobs`}</DropdownToggle>
                            <DropdownMenu right>
                                <DropdownItem
                                    onClick={() => {
                                        this.setState({
                                            jobType: "Open",
                                            freelanceJobs: null,
                                            jobs: null,
                                        });
                                        this.getOpenJobs();
                                    }}>
                                    Open Jobs
                                </DropdownItem>
                                <DropdownItem
                                    onClick={() => {
                                        this.setState({
                                            jobType: "Closed",
                                            jobs: null,
                                            freelanceJobs: null,
                                        });
                                        this.getClosedJobs();
                                    }}>
                                    Closed Jobs
                                </DropdownItem>
                                <DropdownItem
                                    onClick={() => {
                                        this.setState({
                                            jobType: "Saved",
                                            jobs: null,
                                            freelanceJobs: null,
                                        });
                                        this.getSavedJobs();
                                    }}>
                                    Saved Jobs
                                </DropdownItem>
                            </DropdownMenu>
                        </Dropdown>
                    </div>
                    <div className='row px-2 w-100'>
                        <h3 className='col-12 px-2 px-sm-3'>Regular Jobs</h3>
                        {this.state.jobs !== null &&
                        this.state.jobs !== undefined ? (
                            this.state.jobs.length !== 0 &&
                            this.state.jobs.map(
                                (job) =>
                                    job && (
                                        <Job
                                            key={job._id}
                                            job={job}
                                            jobType={this.state.jobType}
                                            type2='job'
                                            getOpenJobs={this.getOpenJobs}
                                            getClosedJobs={this.getClosedJobs}
                                            getSavedJobs={this.getSavedJobs}
                                        />
                                    ),
                            )
                        ) : (
                            <div
                                className='mx-auto my-auto col-12'
                                style={{ textAlign: "center" }}>
                                <Loader
                                    type='Bars'
                                    color='#17a2b8'
                                    height={300}
                                    width={220}
                                />
                            </div>
                        )}

                        <hr className='w-100' />
                        {/* <h3 className='text-align-center w-100'>Locum Jobs</h3> */}

                        <div className='row w-100'>
                            <h3 className='col-12 px-2 px-sm-3'>
                                Locum/Day Jobs
                            </h3>

                            {this.state.freelanceJobs ? (
                                this.state.freelanceJobs.length !== 0 &&
                                this.state.freelanceJobs.map(
                                    (job) =>
                                        job && (
                                            <Job
                                                key={job._id}
                                                job={job}
                                                jobType={this.state.jobType}
                                                type2='freelance'
                                                getOpenJobs={this.getOpenJobs}
                                                getClosedJobs={
                                                    this.getClosedJobs
                                                }
                                                getSavedJobs={this.getSavedJobs}
                                            />
                                        ),
                                )
                            ) : (
                                <div
                                    className='mx-auto my-auto col-12 '
                                    style={{ textAlign: "center" }}>
                                    <Loader
                                        type='Bars'
                                        color='#17a2b8'
                                        height={300}
                                        width={220}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
