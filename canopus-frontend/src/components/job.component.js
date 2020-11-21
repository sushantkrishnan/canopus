import React, { Component, createRef } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import Loader from "react-loader-spinner";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { CopyToClipboard } from "react-copy-to-clipboard";
import {
    faMapMarkerAlt,
    faEnvelope,
    faUser,
    faFileAlt,
    faBriefcaseMedical,
    faPhone,
    faArrowLeft,
    faCheckCircle,
    // faCommentsDollar,
    // faDice,
} from "@fortawesome/free-solid-svg-icons";
import {
    Badge,
    UncontrolledTooltip,
    Alert,
    Button,
    Modal,
    ModalHeader,
    ModalBody,
    Media,
    UncontrolledPopover,
    // PopoverBody,
    ModalFooter,
    Input,
} from "reactstrap";
import hospital from "../images/hospital.svg";
// import error from "../images/404.svg";

import "../stylesheets/job.css";
import { slideInRight } from "react-animations";
import styled, { keyframes } from "styled-components";

const formatter = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumSignificantDigits: 9,
});
const BounceIn = styled.div`
    animation: 0.3s ${keyframes`${slideInRight}`} 0s;
`;

const Badges = ({ desc, superSpecialization, sponsored }) => {
    const superSp = superSpecialization ? superSpecialization : "";
    let badges = [...superSp];
    if (desc) {
        const type = desc.type ? desc.type : [];
        const incentives = desc.incentives ? desc.incentives : [];

        badges = [desc.experience, ...incentives, superSp];
    }
    const number = badges.length - 5;
    badges = badges.slice(0, 3);
    console.log(badges);

    return (
        <div>
            {sponsored === "true" && (
                <Badge className='mr-1' color='js-secondary'>
                    Promoted
                </Badge>
            )}

            {badges.map((badge, i) => {
                return (
                    <Badge className='mr-1' color='info'>
                        {badge}
                    </Badge>
                );
            })}
            {number > 0 && (
                <Badge
                    className='mr-1'
                    color='info'
                    key={120}>{`+ ${number} more`}</Badge>
            )}
        </div>
    );
};

class SimilarJobs extends Component {
    constructor(props) {
        super(props);
        this.state = {
            jobs: null,
            message: "",
        };
    }
    componentDidMount() {
        console.log("mounted");
        const job = this.props.job;
        const query = {
            _id: job._id,
            location: job.description.location,
            specialization: job.specialization,
            profession: job.profession,
            superSpecialization: job.superSpecialization,
            category: job.category,
        };
        console.log(query);
        if (job)
            axios
                .post(`/api/search/similar-jobs`, query)
                .then(({ data }) => {
                    console.log(data);
                    this.setState({ jobs: data.jobs, message: "" });
                })
                .catch(({ response }) => {
                    console.log({ response });
                    this.setState({ message: "No Similar Jobs found" });
                });
    }
    render() {
        const options = {
            hour: "numeric",
            minute: "numeric",
        };
        const optionsDate = {
            year: "numeric",
            month: "short",
            day: "numeric",
        };
        return (
            <div>
                {this.state.message === "" &&
                    (this.state.jobs ? (
                        <div className='row justify-content-between'>
                            <h4
                                className='col-12'
                                style={{ textAlign: "center" }}>
                                {this.state.jobs.length >= 2
                                    ? "2"
                                    : this.state.jobs.length}{" "}
                                similar jobs found
                            </h4>
                            {this.state.jobs.splice(0, 2).map((job) => (
                                <BounceIn className='col-12 col-sm-6 mx-auto'>
                                    <a
                                        href={`/job/${job._id}?${
                                            job.category === "Locum" ||
                                            job.category === "Day Job"
                                                ? "freelance"
                                                : "job"
                                        }&employer`}
                                        className='row  block justify-content-center m-1 '
                                        style={{ cursor: "pointer" }}
                                        // onClick={() =>
                                        //     history.push(`/job/${job._id}`)
                                        // }
                                    >
                                        <Media body className='col-12 my-1 p-2'>
                                            <h5 className='mb-5px Merri24px'>
                                                {job.title}
                                            </h5>

                                            <h6 className='text-emp-primary mb-2px'>
                                                {/* <FontAwesomeIcon icon={faMapMarkerAlt} />{" "} */}
                                                {job.author &&
                                                job.author.instituteName
                                                    ? job.author.instituteName
                                                    : job.instituteName
                                                    ? job.instituteName
                                                    : job.description &&
                                                      job.description.company
                                                    ? job.description.company
                                                    : "Company"}
                                            </h6>

                                            <h6 className='mb-5px'>
                                                {job.description &&
                                                    job.description.location}
                                            </h6>

                                            {/* ?     <hr className='my-2' /> */}
                                            <div className='row m-0 '>
                                                <div className='col-12 descr'>
                                                    {job.description &&
                                                        job.description.line}
                                                </div>
                                            </div>

                                            {job.startDate && (
                                                <div className='row mt-1'>
                                                    {new Intl.DateTimeFormat(
                                                        "en-US",
                                                        optionsDate,
                                                    ).format(
                                                        new Date(job.startDate),
                                                    )}

                                                    {job.category === "Locum" &&
                                                        ` - ${new Intl.DateTimeFormat(
                                                            "en-US",
                                                            optionsDate,
                                                        ).format(
                                                            new Date(
                                                                job.endDate,
                                                            ),
                                                        )}`}

                                                    {job.category ===
                                                        "Day Job" && (
                                                        <span className='row'>
                                                            {"|"}
                                                            {job.startDate && (
                                                                <div className=''>
                                                                    {new Intl.DateTimeFormat(
                                                                        "en-US",
                                                                        options,
                                                                    ).format(
                                                                        new Date(
                                                                            job.startDate,
                                                                        ),
                                                                    )}
                                                                </div>
                                                            )}

                                                            {job.endDate && (
                                                                <div className=''>
                                                                    {" - "}
                                                                    {new Intl.DateTimeFormat(
                                                                        "en-US",
                                                                        options,
                                                                    ).format(
                                                                        new Date(
                                                                            job.endDate,
                                                                        ),
                                                                    )}
                                                                </div>
                                                            )}
                                                        </span>
                                                    )}
                                                </div>
                                            )}

                                            <div className='col-12 mt-8px px-0 row justify-content-between'>
                                                <Badges
                                                    desc={job.description}
                                                    superSpecialization={
                                                        job.superSpecialization
                                                    }
                                                    sponsored={job.sponsored}
                                                />
                                                {job.applied === 1 && (
                                                    <Badge
                                                        color='warning my-auto mr-2'
                                                        style={{
                                                            float: "right",
                                                            height:
                                                                "max-content",
                                                        }}>
                                                        Applied
                                                    </Badge>
                                                )}
                                            </div>
                                        </Media>
                                    </a>
                                </BounceIn>
                            ))}
                        </div>
                    ) : (
                        <div
                            className='mx-auto my-auto'
                            style={{ textAlign: "center" }}>
                            <Loader
                                type='Bars'
                                color='#17a2b8'
                                height={300}
                                width={220}
                            />
                        </div>
                    ))}
            </div>
        );
    }
}
const BannerLogin = () => {
    return (
        <div>
            <a href='/user/login' className='text-info'>
                Login
            </a>
            {" / "}
            <a href='/user/signup' className='text-info'>
                Signup
            </a>{" "}
            to apply
        </div>
    );
};
const BannerVerify = () => {
    return (
        <div>
            Email verification pending.{" "}
            <a href='/user/verify' className='text-info'>
                Click here
            </a>{" "}
            to resend verification email.
        </div>
    );
};
const BannerUpdate = ({ mess, checkProf, checkSpec, checkResume }) => {
    const message = !checkResume
        ? "Please upload a resume to apply."
        : !checkProf
        ? "Your Profession must match Job Profession."
        : !checkSpec
        ? "Your Profession/Speciality must match Job Profession/Speciality."
        : "";
    return (
        <div>
            {!checkResume ? (
                <div>
                    Please{" "}
                    <a href='/profile/update' className='text-info'>
                        upload resume
                    </a>{" "}
                    to apply.
                </div>
            ) : (
                <div>
                    {`${message} Click here to `}
                    <a href='/profile/update' className='text-info'>
                        update profile
                    </a>
                </div>
            )}
        </div>
    );
};
export default class Job extends Component {
    static contextTypes = {
        router: () => true, // replace with PropTypes.object if you use them
    };
    constructor(props) {
        super(props);
        this.state = {
            job: null,
            user: null,
            modal: false,
            err: "",
            tooltipOpen: false,
            isFreelance: false,
            modalError: false,
            modalMess: "",
            checkProfession: false,
            checkSpecialization: true,
            checkUpdated: false,
            checkResume: false,
            bannerMessage: "",
        };
        if (props.location.search === "?type=freelance")
            this.setState({ isFreelance: true });
        this.applyJob = this.applyJob.bind(this);
        this.toggle = this.toggle.bind(this);
        this.showDetail = this.showDetail.bind(this);
        this.toggleModalError = this.toggleModalError.bind(this);
        this.toggleTooltip = this.toggleTooltip.bind(this);
        this.checkEligibility = this.checkEligibility.bind(this);
    }
    toggleModalError() {
        this.setState({ modalError: !this.state.modalError });
    }
    toggleTooltip() {
        this.setState({ tooltipOpen: !this.state.tooltipOpen });
    }
    showDetail() {
        if (this.props.user) {
            this.setState({
                user: this.props.user,
                modal: this.props.user.emailVerified && this.checkEligibility(),
            });
        }
        console.log("oitsode");

        // if (!this.props.user) {
        //     console.log("insode");
        //     this.setState({
        //         modalError: true,
        //         modalMess: "NOT",
        //     });
        // }
        // if (!this.state.user) {
        //     axios
        //         .get(`/api/user/current`)
        //         .then(({ data }) => {
        //             console.log(data);
        //             this.setState({
        //                 user: data.user,
        //                 modal: !this.state.modal,
        //             });
        //             // this.toggle();
        //         })
        //         .catch((err) => {
        //             console.log(err);
        //             // this.setState({ err: response.data.err });
        //         });
        // } else this.toggle();
    }
    applyJob() {
        // this.toggle();

        console.log(this.state.job);
        const type = this.state.job.startDate ? "freelance" : "job";
        axios
            .put(`/api/search/apply/${type}/${this.state.job._id}`)
            .then(({ data }) => {
                console.log(data);
                // setApplied(true);
                window.location = "/search-jobs";
            })
            .catch(({ response }) => {
                console.log(response);
                if (response && response !== undefined)
                    this.setState({
                        err:
                            response.data.err !== undefined &&
                            response.data.err !== ""
                                ? response.data.err
                                : "Something went wrong, Please try again.",
                    });
                this.toggle();
            });
    }
    toggle() {
        this.setState({ modal: !this.state.modal });
    }
    checkEligibility() {
        // console.log(this.state.job);
        // console.log(this.props.user);
        let checkProfession = false,
            checkSpecialization = true,
            checkUpdated = false,
            checkResume = false;
        if (this.props.user && this.props.user.emailVerified) {
            checkProfession =
                this.props.user.profession === this.state.job.profession;
            if (
                checkProfession &&
                this.state.job.profession === "Physician/Surgeon"
            )
                checkSpecialization =
                    this.props.user.specialization ===
                    this.state.job.specialization;
            checkResume =
                this.props.user.resume !== undefined &&
                this.props.user.resume !== "";
            checkUpdated =
                new Date(this.props.user.lastUpdated).toString() !==
                new Date(0).toString();
        }
        console.log(
            checkProfession,
            checkResume,
            checkUpdated,
            checkSpecialization,
        );
        return (
            checkProfession &&
            checkResume &&
            checkUpdated &&
            checkSpecialization
        );
    }
    componentDidMount() {
        // this.setState({ user: this.props.user });
        const id = this.props.match.params.id;
        const [jobType, author] = this.props.location.search
            .substring(1)
            .split("&");
        console.log(jobType);
        console.log(author);
        // console.log(this.props);
        // if (this.props.user)
        axios
            .get(`/api/search/view/${jobType}/${id}`)
            .then((data) => {
                console.log(data);
                if (data.data.job) {
                    this.setState({
                        job: data.data.job,
                    });
                } else {
                    this.setState({
                        err: "Invalid job",
                    });
                }
                console.log(this.state.job);
            })
            .catch((err) => {
                console.log(err);
                const response = err.response;
                this.setState({
                    err:
                        response && response.data.err
                            ? response.data.err.kind
                                ? "Invalid Job Id"
                                : response.data.err
                            : "Invalid job",
                });
            });
    }

    render() {
        const optionsDate = {
            year: "numeric",
            month: "short",
            day: "numeric",
        };
        const job = this.state.job;
        return (
            <div>
                <Alert
                    color='danger'
                    isOpen={this.state.err !== ""}
                    toggle={() => {
                        this.setState({ err: "" });
                    }}>
                    {this.state.err}
                </Alert>
                {this.state.job ? (
                    <div className='row'>
                        <div className='col-11 col-sm-9 col-md-8 px-0 mx-auto py-2'>
                            <a
                                className='text-info'
                                style={{ cursor: "pointer" }}
                                onClick={() => {
                                    this.props.history.goBack();
                                }}>
                                <FontAwesomeIcon
                                    icon={faArrowLeft}
                                    className='mr-2'
                                />{" "}
                                Back to Search Results
                            </a>
                        </div>
                        <div className='col-11 col-sm-9 col-md-8 main-job mx-auto my-3 p-2 p-sm-3'>
                            <div className='row '>
                                <div className='col-12 col-md-10 my-auto '>
                                    <h5 className='Merri24px'>{job.title}</h5>
                                    <Link
                                        to={`/employer/profile/${job.author.id}`}>
                                        <h6 className='text-info'>
                                            {job.author &&
                                            job.author.instituteName
                                                ? job.author.instituteName
                                                : job.instituteName
                                                ? job.instituteName
                                                : job.description &&
                                                  job.description.company
                                                ? job.description.company
                                                : "Company"}
                                        </h6>
                                    </Link>

                                    <h6>
                                        <FontAwesomeIcon
                                            icon={faMapMarkerAlt}
                                        />{" "}
                                        {job.description.location}
                                    </h6>
                                </div>
                                <div className='col-5 col-md-2 d-none d-md-block'>
                                    <img
                                        object
                                        src={
                                            job.author && job.author.photo
                                                ? job.author.photo
                                                : hospital
                                        }
                                        alt='Generic placeholder image'
                                        className='img-fluid'
                                        // style={{ maxWidth: "50%" }}
                                    />
                                </div>
                            </div>
                            {/* <hr /> */}
                            <div className=' row justify-content-around'>
                                <div className='col-6 col-sm-3 my-1 px-0'>
                                    <h6>
                                        <b>Profession</b>
                                    </h6>
                                    {job.profession}
                                </div>

                                <div className='col-6 col-sm-3 my-1 px-0'>
                                    <h6>
                                        <b>Specialization </b>
                                    </h6>
                                    {job.specialization}
                                </div>

                                <div className='col-6 col-sm-3 my-1 px-0'>
                                    <h6>
                                        <b>Super - Specialization </b>
                                    </h6>
                                    {Array.isArray(job.superSpecialization)
                                        ? job.superSpecialization.join(", ")
                                        : job.superSpecialization}
                                </div>
                                <div className='col-6 col-sm-3 my-1 px-0'>
                                    <h6>
                                        <b>Posted On</b>
                                    </h6>
                                    {job.createdAt &&
                                        new Intl.DateTimeFormat(
                                            "en-US",
                                            optionsDate,
                                        ).format(new Date(job.createdAt))}
                                </div>
                            </div>
                            <hr />
                            <div className='row justify-content-around'>
                                <div className='col-6 col-sm-3 my-1 px-0'>
                                    <h6>
                                        <b>Incentives</b>
                                        {/* <FontAwesomeIcon
                                        icon={faMoneyBill}
                                        className='ml-1'
                                    /> */}
                                    </h6>

                                    {job.description.incentives &&
                                        job.description.incentives.map(
                                            (tag) => (
                                                <Badge
                                                    color='info'
                                                    className='mx-1 p-1 incentive my-1'>
                                                    {tag}
                                                </Badge>
                                            ),
                                        )}
                                </div>
                                <div className='col-6 col-sm-3 my-1 px-0'>
                                    <h6>
                                        <b>Experience level</b>
                                        {/* <FontAwesomeIcon
                                        icon={faMoneyBillWaveAlt}
                                        className='ml-1'
                                    /> */}
                                    </h6>
                                    {job.description.experience}
                                </div>
                                <div className='col-6 col-sm-3 my-1 px-0'>
                                    <h6>
                                        <b>Job Type</b>
                                        {/* <FontAwesomeIcon
                                        icon={faMoneyBillWaveAlt}
                                        className='ml-1'
                                    /> */}
                                    </h6>
                                    {Array.isArray(job.description.type)
                                        ? job.description.type[0]
                                        : job.description.type}
                                </div>
                                <div className='col-6 col-sm-3 my-1 px-0'>
                                    <h6>
                                        <b>
                                            {`${
                                                job.category === "Locum" ||
                                                job.category === "Day Job"
                                                    ? "Fees"
                                                    : "Salary"
                                            }`}
                                        </b>
                                        {/* <FontAwesomeIcon
                                        icon={faMoneyBillWaveAlt}
                                        className='ml-1'
                                    /> */}
                                    </h6>
                                    {formatter.format(job.description.salary)}
                                </div>
                            </div>
                            <hr />
                            <div className='row p-1'>
                                <div className='col-12'>
                                    <h4>
                                        <b>Job Description</b>
                                    </h4>
                                    <p>{job.description.line}</p>
                                    {/* </div>
                            </div>
                            <div className='row p-1'>
                                <div className='col-12'>
                                    <h4>
                                        <b>Description</b>
                                    </h4> */}
                                    <p>{job.description.about}</p>
                                </div>
                            </div>
                            <hr />
                            <div className='row col-12 col-sm-10 col-lg-8 mx-auto'>
                                <div className='col-6 px-0 pr-1'>
                                    {this.props.user &&
                                    job.applicants &&
                                    job.applicants
                                        .map((obj) => obj.id)
                                        .includes(this.props.user._id) ? (
                                        <Button
                                            color='secondary'
                                            className='w-100'
                                            id='apply'
                                            disabled>
                                            Applied
                                        </Button>
                                    ) : (
                                        <Button
                                            color='js-primary'
                                            id='apply'
                                            className='w-100'
                                            onClick={this.showDetail}>
                                            Apply
                                        </Button>
                                    )}

                                    {!this.props.user ? (
                                        <UncontrolledTooltip
                                            placement='down'
                                            // isOpen={this.state.tooltipOpen}
                                            trigger='legacy'
                                            target='apply'
                                            style={{
                                                minWidth: "max-content",
                                                backgroundColor:
                                                    "rgba(255,255,255,1)",
                                                color: "black",
                                                padding: "0px",
                                            }}
                                            className='rounded'>
                                            <div
                                                className='p-3 m-0 border rounded'
                                                style={{
                                                    minWidth: "min-content",
                                                }}>
                                                <h6 className='text-align-center p-1'>
                                                    <BannerLogin />
                                                </h6>
                                            </div>
                                        </UncontrolledTooltip>
                                    ) : this.props.user.emailVerified ===
                                      false ? (
                                        <UncontrolledTooltip
                                            placement='down'
                                            // isOpen={this.state.tooltipOpen}
                                            trigger='legacy'
                                            target='apply'
                                            style={{
                                                minWidth: "max-content",
                                                backgroundColor:
                                                    "rgba(255,255,255,1)",
                                                color: "black",
                                                padding: "0px",
                                            }}
                                            className='rounded'>
                                            <div
                                                className='p-3 m-0 border rounded'
                                                style={{
                                                    minWidth: "min-content",
                                                }}>
                                                <h6 className='text-align-center p-1'>
                                                    <BannerVerify />
                                                </h6>
                                            </div>
                                        </UncontrolledTooltip>
                                    ) : (
                                        !this.checkEligibility() && (
                                            <UncontrolledTooltip
                                                placement='down'
                                                // isOpen={this.state.tooltipOpen}
                                                trigger='legacy'
                                                target='apply'
                                                style={{
                                                    minWidth: "max-content",
                                                    backgroundColor:
                                                        "rgba(255,255,255,1)",
                                                    color: "black",
                                                    padding: "0px",
                                                }}
                                                className='rounded'>
                                                <div
                                                    className='p-3 m-0 border rounded'
                                                    style={{
                                                        minWidth: "min-content",
                                                    }}>
                                                    <h6 className='text-align-center p-1'>
                                                        <BannerUpdate
                                                            mess={
                                                                this.state
                                                                    .bannerMessage
                                                            }
                                                            checkProf={
                                                                this.props.user
                                                                    .profession ===
                                                                this.state.job
                                                                    .profession
                                                            }
                                                            checkSpec={
                                                                this.state.job
                                                                    .profession ===
                                                                    this.props
                                                                        .user
                                                                        .profession &&
                                                                this.state.job
                                                                    .profession ===
                                                                    "Physician/Surgeon"
                                                                    ? this.props
                                                                          .user
                                                                          .specialization ===
                                                                      this.state
                                                                          .job
                                                                          .specialization
                                                                    : true
                                                            }
                                                            checkResume={
                                                                this.props.user
                                                                    .resume !==
                                                                    undefined &&
                                                                this.props.user
                                                                    .resume !==
                                                                    ""
                                                            }
                                                        />
                                                    </h6>
                                                </div>
                                            </UncontrolledTooltip>
                                        )
                                    )}
                                </div>
                                <div className='col-6 px-0 pl-1'>
                                    <div>
                                        <CopyToClipboard
                                            text={window.location.href}>
                                            <Button
                                                // size='lg'
                                                color='js-secondary'
                                                className='w-100'
                                                id='copy'>
                                                Share
                                            </Button>
                                        </CopyToClipboard>

                                        <UncontrolledPopover
                                            placement='down'
                                            // isOpen={this.state.tooltipOpen}
                                            trigger='legacy'
                                            target='copy'
                                            style={{
                                                minWidth: "max-content",
                                                backgroundColor:
                                                    "rgba(255,255,255,1)",
                                                color: "black",
                                                padding: "0px",
                                            }}
                                            className='border'>
                                            <div
                                                className='p-3 m-0 border'
                                                style={{
                                                    minWidth: "min-content",
                                                }}>
                                                <h4 className='text-align-center p-1'>
                                                    <FontAwesomeIcon
                                                        icon={faCheckCircle}
                                                        className='text-success'
                                                        size='lg'
                                                    />
                                                </h4>
                                                <h5 className=''>
                                                    Link to '
                                                    {job.title.length > 8
                                                        ? job.title.substr(
                                                              0,
                                                              15 - 1,
                                                          ) + "..."
                                                        : job.title}
                                                    ' copied
                                                </h5>
                                                <div className='row'>
                                                    <div className='col-12 pl-0'>
                                                        <Input
                                                            type='text'
                                                            value={
                                                                window.location
                                                                    .href
                                                            }
                                                            className=''
                                                            disabled
                                                        />
                                                    </div>
                                                    {/* <CopyToClipboard
                                                        text={
                                                            window.location.href
                                                        }> */}
                                                    {/* <Button
                                                        color='success'
                                                        size='xs'
                                                        className='col-3'>
                                                        Copied
                                                    </Button> */}
                                                    {/* </CopyToClipboard> */}
                                                </div>
                                            </div>
                                        </UncontrolledPopover>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className='col-11 col-sm-9 col-md-8 mx-auto my-3 px-0'>
                            <div>
                                <SimilarJobs job={this.state.job} />
                            </div>
                        </div>

                        {this.state.user && (
                            <Modal
                                isOpen={this.state.modal}
                                toggle={this.toggle}
                                // style={{ minWidth: "40vw" }}
                            >
                                <ModalHeader toggle={this.toggle}>
                                    Apply to {job.description.company}
                                </ModalHeader>
                                <ModalBody className='row px-1 px-sm-3'>
                                    <div className='col-12 px-2'>
                                        <div className='m-2 mx-auto'>
                                            <h6 className='row'>
                                                <div className='col-1 px-0'>
                                                    <FontAwesomeIcon
                                                        icon={faUser}
                                                        className='ml-2 mr-3'
                                                    />
                                                </div>
                                                <div className='col-11 pl-3 text-capitalize'>
                                                    {`${this.state.user.salutation}. ${this.state.user.firstName} ${this.state.user.lastName}`}
                                                </div>
                                            </h6>
                                        </div>
                                        <div className='m-2 mx-auto'>
                                            <h6 className='row'>
                                                <div className='col-1 px-0'>
                                                    <FontAwesomeIcon
                                                        icon={
                                                            faBriefcaseMedical
                                                        }
                                                        className='ml-2 mr-3'
                                                    />
                                                </div>
                                                <div className='col-11 pl-3'>
                                                    {this.state.user.title &&
                                                        this.state.user.title}
                                                </div>
                                            </h6>
                                        </div>
                                        {this.state.user.address && (
                                            <div className='m-2 mx-auto'>
                                                <h6 className='row'>
                                                    <div className='col-1 px-0'>
                                                        <FontAwesomeIcon
                                                            icon={
                                                                faMapMarkerAlt
                                                            }
                                                            className='ml-2 mr-3'
                                                        />
                                                    </div>
                                                    <div className='col-11 px-0 pl-3'>
                                                        {this.state.user.address
                                                            .city !== "" &&
                                                        this.state.user.address
                                                            .state.user !==
                                                            "" &&
                                                        this.state.user.address
                                                            .country !== ""
                                                            ? `${this.state.user.address.city}, ${this.state.user.address.state}, ${this.state.user.address.country}`
                                                            : ``}
                                                    </div>
                                                </h6>
                                            </div>
                                        )}
                                        <div className='m-2 mx-auto'>
                                            <h6 className='row'>
                                                <div className='col-1 px-0'>
                                                    <FontAwesomeIcon
                                                        icon={faEnvelope}
                                                        className='ml-2 mr-3'
                                                    />
                                                </div>
                                                <div className='col-11 pl-3'>
                                                    {this.state.user.username}
                                                </div>
                                            </h6>
                                        </div>
                                        {this.state.user.phone !== undefined &&
                                            this.state.user.phone !== "" && (
                                                <div className='m-2 mx-auto'>
                                                    <h6 className='row'>
                                                        <div className='col-1 px-0'>
                                                            <FontAwesomeIcon
                                                                icon={faPhone}
                                                                className='ml-2 mr-3'
                                                                style={{
                                                                    transform:
                                                                        "rotateY(180deg)",
                                                                }}
                                                            />
                                                        </div>
                                                        <div className='col-11 pl-3'>
                                                            {"+91-"}
                                                            {
                                                                this.state.user
                                                                    .phone
                                                            }
                                                        </div>
                                                    </h6>
                                                </div>
                                            )}
                                        <div className='m-2 mt-4 mx-auto pl-2'>
                                            <a
                                                className='text-emp-primary'
                                                href={this.state.user.resume}>
                                                View Resume
                                                <FontAwesomeIcon
                                                    className='ml-2'
                                                    icon={faFileAlt}
                                                />
                                            </a>
                                        </div>
                                        <hr />
                                        <span>
                                            {`On applying, we will share your profile and contact details with ${job.description.company}.`}
                                        </span>
                                    </div>
                                </ModalBody>
                                <ModalFooter>
                                    <Button
                                        color='js-primary'
                                        onClick={this.applyJob}>
                                        Submit Application
                                    </Button>
                                </ModalFooter>
                            </Modal>
                        )}
                        <Modal
                            isOpen={this.state.modalError}
                            toggle={this.toggleModalError}
                            style={{ marginTop: "20vh" }}>
                            <ModalHeader
                                toggle={this.toggleModalError}
                                className='py-1'>
                                Message
                            </ModalHeader>
                            {/* <ModalHeader toggle={toggle}>
                    {mess === "promote" && "Promote"}
                </ModalHeader> */}
                            <ModalBody>
                                {this.state.modalMess === "NOT" ? (
                                    <BannerLogin />
                                ) : (
                                    this.state.modalMess
                                )}
                            </ModalBody>
                        </Modal>
                    </div>
                ) : (
                    this.state.err === "" && (
                        <div
                            className='mx-auto my-auto'
                            style={{ textAlign: "center" }}>
                            <Loader
                                type='Bars'
                                color='#17a2b8'
                                height={300}
                                width={170}
                            />
                        </div>
                    )
                )}
            </div>
        );
    }
}
//  <span style={{ float: "right", zIndex: 10 }}>
//      <FontAwesomeIcon
//          icon={faShareAlt}
//          style={{ fontSize: ".8rem" }}
//          className='ml-2 mr-3'
//      />
//      <a
//          href='#'
//          id='t'
//          style={{ fontSize: ".8rem" }}
//          onClick={() => console.log("clicked")}>
//          Share
//      </a>
//  <UncontrolledTooltip
//      placement='top'
//      isOpen={tooltipOpen}
//      target='t'
//      // trigger='click'
//      toggle={toggleTooltip}>
//      UncontrolledTooltip  Content!
//  </UncontrolledTooltip >
//  </span>;
