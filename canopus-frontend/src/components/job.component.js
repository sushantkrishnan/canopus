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
} from "@fortawesome/free-solid-svg-icons";
import {
    Badge,
    Tooltip,
    Alert,
    Button,
    Modal,
    ModalHeader,
    ModalBody,
    Media,
    ModalFooter,
} from "reactstrap";
import hospital from "../images/hospital.svg";
import error from "../images/404.svg";

import "../stylesheets/job.css";
import { slideInRight } from "react-animations";
import styled, { keyframes } from "styled-components";

const formatter = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumSignificantDigits: 7,
});
const BounceIn = styled.div`
    animation: 0.3s ${keyframes`${slideInRight}`} 0s;
`;

const Badges = ({ desc, superSpecialization }) => {
    const superSp = superSpecialization ? superSpecialization : [];
    let badges = [...superSp];
    if (desc) {
        const type = desc.type ? desc.type : [];
        const incentives = desc.incentives ? desc.incentives : [];

        badges = [desc.experience, ...type, ...incentives, ...superSp];
    }
    const number = badges.length - 5;
    badges = badges.slice(0, 3);
    console.log(badges);

    return (
        <div>
            {badges.map((badge, i) => {
                return (
                    <Badge className='mx-1' color='info'>
                        {badge}
                    </Badge>
                );
            })}
            {number > 0 && `+ ${number} more`}
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
        const job = this.props.job;
        const query = {
            location: job.description.location,
            // pin: job.pin,
            specialization: job.specialization,
            profession: job.profession,
            superSpecialization: job.superSpecialization,
        };
        console.log(query);
        if (job)
            axios
                .post(`/api/job/similar`, query)
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
        return (
            <div>
                {this.state.message === "" &&
                    (this.state.jobs ? (
                        <div>
                            <h4 style={{ textAlign: "center" }}>
                                {this.state.jobs.length} similar jobs found
                            </h4>
                            {this.state.jobs.map((job) => (
                                <BounceIn>
                                    <Link
                                        to={`/job/${job._id}`}
                                        className='row  block justify-content-center my-3 mx-auto p-2 px-md-3 '
                                        style={{ cursor: "pointer" }}
                                        // onClick={() =>
                                        //     history.push(`/job/${job._id}`)
                                        // }
                                    >
                                        <Media body className='col-12 my-1 p-1'>
                                            <Media heading>
                                                <h5>{job.title}</h5>
                                            </Media>

                                            <Media heading>
                                                <h6 className='text-info'>
                                                    {/* <FontAwesomeIcon icon={faMapMarkerAlt} />{" "} */}
                                                    {job.description.company
                                                        ? job.description
                                                              .company
                                                        : "Company"}
                                                </h6>
                                            </Media>
                                            <Media heading>
                                                <h6>
                                                    <FontAwesomeIcon
                                                        icon={faMapMarkerAlt}
                                                    />{" "}
                                                    {job.description.location}
                                                </h6>
                                            </Media>

                                            {/* ?     <hr className='my-2' /> */}
                                            <div className='row m-0'>
                                                <div className='col-12 desc'>
                                                    <em
                                                        style={{
                                                            fontSize: ".9rem",
                                                        }}>
                                                        {job.description.line}
                                                    </em>
                                                </div>
                                            </div>
                                            <hr />

                                            <div className='col-12  px-0 '>
                                                <Badges
                                                    desc={job.description}
                                                    superSpecialization={
                                                        job.superSpecialization
                                                    }
                                                />
                                            </div>
                                        </Media>
                                        <Media
                                            left
                                            href='#'
                                            className='d-none d-md-block col-12 col-md-3 my-auto mx-auto '>
                                            <Media
                                                object
                                                src={hospital}
                                                style={{ maxHeight: "200px" }}
                                                alt='Generic placeholder image'
                                                className='img-fluid float-right pr-2 pr-lg-3'
                                            />
                                        </Media>
                                    </Link>
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
export default class Job extends Component {
    constructor(props) {
        super(props);
        this.state = {
            job: null,
            user: null,
            modal: false,
            err: "",
            tooltipOpen: false,
            isFreelance: false,
        };
        if (props.location.search === "?type=freelance")
            this.setState({ isFreelance: true });
        this.applyJob = this.applyJob.bind(this);
        this.toggle = this.toggle.bind(this);
        this.showDetail = this.showDetail.bind(this);
        this.toggleTooltip = this.toggleTooltip.bind(this);
    }
    toggleTooltip() {
        this.setState({ tooltipOpen: !this.state.tooltipOpen });
    }
    showDetail() {
        if (!this.state.user) {
            axios
                .get(`/api/user/current`)
                .then(({ data }) => {
                    console.log(data);
                    this.setState({
                        user: data.user,
                        modal: !this.state.modal,
                    });
                    // this.toggle();
                })
                .catch((err) => {
                    console.log(err);
                    // this.setState({ err: response.data.err });
                });
        } else this.toggle();
    }
    applyJob() {
        // this.toggle();
        console.log(this.state.job);
        const type = this.state.job.startDate ? "freelance" : "job";
        axios
            .post(`/api/job/apply/${type}/${this.state.job._id}`)
            .then(({ data }) => {
                console.log(data);
                // setApplied(true);
                window.location = "/search-jobs";
            })
            .catch(({ response }) => {
                console.log(response);
                this.setState({ err: response.data.err });
                this.toggle();
            });
    }
    toggle() {
        this.setState({ modal: !this.state.modal });
    }
    componentDidMount() {
        const id = this.props.match.params.id;
        const [jobType, author] = this.props.location.search
            .substring(1)
            .split("&");
        // console.log(arr);
        console.log(jobType);
        console.log(author);
        axios
            .get(`/api/job/view/${jobType}/${id}`)
            .then((data) => {
                console.log(data);
                this.setState({
                    job: data.data.job,
                });
                console.log(this.state.job);
            })
            .catch(({ response }) => {
                console.log(response);
                this.setState({
                    err: response.data.err
                        ? response.data.err.kind
                            ? "Invalid Job Id"
                            : response.data.err
                        : "Invalid job",
                });
            });
    }

    render() {
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
                    <div>
                        <div className='main-job mx-2 mx-md-5 my-3 p-2 p-sm-3'>
                            <div className='row '>
                                <div className='col-7 col-md-10 my-auto'>
                                    <h5>{job.title}</h5>
                                    <Link
                                        to={`/employer/profile/${job.author.id}`}>
                                        <h6 className='text-info'>
                                            {job.description.company
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
                                <div className='col-5 col-md-2'>
                                    <img
                                        object
                                        src={hospital}
                                        alt='Generic placeholder image'
                                        className='img-fluid'
                                        // style={{ maxWidth: "50%" }}
                                    />
                                </div>
                            </div>
                            {/* <hr /> */}
                            <div className=' row justify-content-center'>
                                <div
                                    className='col-6 col-sm-3 my-1'
                                    style={{ textAlign: "center" }}>
                                    <h6>
                                        <b>Profession</b>
                                    </h6>
                                    {job.profession}
                                </div>

                                <div
                                    className='col-6 col-sm-3 my-1'
                                    style={{ textAlign: "center" }}>
                                    <h6>
                                        <b>Specialization </b>
                                    </h6>
                                    {job.specialization}
                                </div>

                                <div
                                    className='col-6 col-sm-3 my-1'
                                    style={{ textAlign: "center" }}>
                                    <h6>
                                        <b>Experience level</b>
                                        {/* <FontAwesomeIcon
                                        icon={faMoneyBillWaveAlt}
                                        className='ml-1'
                                    /> */}
                                    </h6>
                                    {job.description.experience}
                                </div>
                                <div
                                    className='col-6 col-sm-3 my-1'
                                    style={{ textAlign: "center" }}>
                                    <h6>
                                        <b>Apply By </b>
                                    </h6>
                                    {job.expireAt &&
                                        new Date(
                                            job.expireAt,
                                        ).toLocaleDateString()}
                                </div>
                            </div>
                            <hr />
                            <div className='row justify-content-center'>
                                <div
                                    className='col-6 col-md-2 my-1'
                                    style={{ textAlign: "center" }}>
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
                                <div
                                    className='col-6 col-md-2 my-1'
                                    style={{ textAlign: "center" }}>
                                    <h6>
                                        <b>Super - Specialization </b>
                                    </h6>
                                    {job.superSpecialization.join(", ")}
                                </div>
                                <div
                                    className='col-6 col-md-2 my-1'
                                    style={{ textAlign: "center" }}>
                                    <h6>
                                        <b>Job Type</b>
                                        {/* <FontAwesomeIcon
                                        icon={faMoneyBillWaveAlt}
                                        className='ml-1'
                                    /> */}
                                    </h6>
                                    {job.description.type &&
                                        job.description.type.map((tag) => (
                                            <Badge
                                                color='info'
                                                className='mx-1 p-1 my-1'>
                                                {tag}
                                            </Badge>
                                        ))}
                                </div>
                                <div
                                    className='col-6 col-md-2 my-1'
                                    style={{ textAlign: "center" }}>
                                    <h6>
                                        <b> Salary</b>
                                        {/* <FontAwesomeIcon
                                        icon={faMoneyBillWaveAlt}
                                        className='ml-1'
                                    /> */}
                                    </h6>
                                    {formatter.format(job.description.salary)}
                                </div>
                                <div
                                    className='col-6 col-md-2 my-1'
                                    style={{ textAlign: "center" }}>
                                    <h6>
                                        <b>Number of Applicants</b>
                                        {/* <FontAwesomeIcon
                                        icon={faMoneyBillWaveAlt}
                                        className='ml-1'
                                    /> */}
                                    </h6>
                                    {job.description.count}
                                </div>
                            </div>
                            <hr />
                            <div className='row p-1'>
                                <div className='col-12'>
                                    <h4>
                                        <b>Job responsibilities</b>
                                    </h4>
                                    <p>{job.description.line}</p>
                                </div>
                            </div>
                            <div className='row p-1'>
                                <div className='col-12'>
                                    <h4>
                                        <b>Who can apply</b>
                                    </h4>
                                    <p>{job.description.skills}</p>
                                </div>
                            </div>
                            <hr />
                            <div className='row'>
                                <div className='col-6'>
                                    <Button
                                        size='lg'
                                        color='info'
                                        className='w-100'
                                        onClick={this.showDetail}>
                                        Apply
                                    </Button>
                                </div>
                                <div className='col-6'>
                                    <CopyToClipboard
                                        text={window.location.href}>
                                        <Button
                                            size='lg'
                                            color='primary'
                                            className='w-100'
                                            id='t'
                                            onClick={() => {
                                                this.setState({
                                                    tooltipOpen: true,
                                                });
                                            }}>
                                            Share
                                        </Button>
                                    </CopyToClipboard>

                                    <Tooltip
                                        placement='top'
                                        isOpen={this.state.tooltipOpen}
                                        target='t'
                                        // trigger='click'
                                        // toggle={this.toggleTooltip}
                                    >
                                        URL copied!
                                    </Tooltip>
                                </div>
                            </div>
                        </div>
                        <div className='mx-2 mx-md-4'>
                            <SimilarJobs job={this.state.job} />
                        </div>

                        {this.state.user && (
                            <Modal
                                isOpen={this.state.modal}
                                toggle={this.toggle}
                                style={{ minWidth: "70vw" }}>
                                <ModalHeader toggle={this.toggle}>
                                    Your Info
                                </ModalHeader>
                                <ModalBody className='row'>
                                    <div className='col-12 col-md-7 px-2'>
                                        <h6>
                                            <FontAwesomeIcon
                                                icon={faEnvelope}
                                                className='ml-2 mr-3'
                                            />
                                            {`${this.state.user.username}`}
                                        </h6>
                                        <h6>
                                            <FontAwesomeIcon
                                                icon={faUser}
                                                className='ml-2 mr-3'
                                            />
                                            {`${this.state.user.firstName} ${this.state.user.lastName}`}
                                        </h6>
                                        {this.state.user.address && (
                                            <h6>
                                                <FontAwesomeIcon
                                                    icon={faMapMarkerAlt}
                                                    className='ml-2 mr-3'
                                                />
                                                {`${this.state.user.address.city}, ${this.state.user.address.state}, ${this.state.user.address.pin}`}
                                            </h6>
                                        )}
                                        <hr />
                                        <em>
                                            {this.state.user.description
                                                ? this.state.user.description
                                                      .about
                                                    ? this.state.user
                                                          .description.about
                                                    : this.state.user
                                                          .description
                                                : ""}
                                            Lorem ipsum dolor sit amet
                                            consectetur adipisicing elit. Saepe,
                                            repudiandae vitae, earum maerat
                                            doloribus acc
                                        </em>
                                    </div>
                                    <div className='col-12 col-md-5 px-2'>
                                        <h5>Experience</h5>
                                        <hr />
                                        {this.state.user.experience &&
                                            this.state.user.experience.map(
                                                (exp) => (
                                                    <div>
                                                        <h6>{exp.title}</h6>

                                                        <p>
                                                            {exp.line}
                                                            <br />
                                                            {exp.time}
                                                        </p>
                                                        <hr />
                                                    </div>
                                                ),
                                            )}
                                    </div>
                                </ModalBody>
                                <ModalFooter>
                                    <Button
                                        color='primary'
                                        onClick={this.applyJob}>
                                        Apply
                                    </Button>
                                    <Button
                                        color='secondary'
                                        onClick={this.toggle}>
                                        Cancel
                                    </Button>
                                </ModalFooter>
                            </Modal>
                        )}
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
//  <Tooltip
//      placement='top'
//      isOpen={tooltipOpen}
//      target='t'
//      // trigger='click'
//      toggle={toggleTooltip}>
//      Tooltip Content!
//  </Tooltip>
//  </span>;
