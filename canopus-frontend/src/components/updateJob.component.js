import React, { useRef, useState, useEffect } from "react";
import { useLocation, Link, useHistory } from "react-router-dom";
import {
    Form,
    Label,
    FormGroup,
    Nav,
    NavItem,
    NavLink,
    Button,
    Input,
    InputGroup,
    InputGroupAddon,
    InputGroupText,
    Modal,
    ModalBody,
    ModalFooter,
    ModalHeader,
} from "reactstrap";
import axios from "axios";
import Select from "react-select";
import data from "../data";
import "../stylesheets/postJob.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faMapMarkerAlt,
    faUser,
    faEnvelope,
    faArrowAltCircleDown,
    faPen,
    faArrowAltCircleUp,
    // faShareAlt,
} from "@fortawesome/free-solid-svg-icons";
const incentivesArray = data.incentive.map((opt) => ({
    label: opt,
    value: opt,
}));
const typeArray = data.type.map((opt) => ({ label: opt, value: opt }));
const superSpecializationArray = data.superSpecialization.map((opt) => ({
    label: opt,
    value: opt,
}));
const locationArray = data.location.map((opt) => ({
    label: `${opt.name}, ${opt.state}`,
    value: `${opt.name}`,
}));
const experienceArray = data.experience.map((opt) => ({
    label: opt,
    value: opt,
}));

const UpdateJob = (props) => {
    const history = useHistory();
    const titleRef = useRef(null);
    const professionRef = useRef(null);
    const specializationRef = useRef(null);
    const superSpecializationRef = useRef(null);
    const lineRef = useRef(null);
    const experienceRef = useRef(null);
    const incentivesRef = useRef(null);
    const typeRef = useRef(null);
    const locationRef = useRef(null);
    const salaryRef = useRef(null);
    const companyRef = useRef(null);
    const skillsRef = useRef(null);
    const numberAppRef = useRef(null);
    const endDateRef = useRef(null);
    const freelanceRef = useRef(null);
    const dateRef = useRef(null);
    const endTimeRef = useRef(null);
    const startTimeRef = useRef(null);
    const [showDetail, setShowDetail] = useState(true);
    const [showSkill, setShowSkill] = useState(false);
    const [showOtherDetail, setShowOtherDetail] = useState(false);

    const [title, setTitle] = useState("");
    const [company, setCompany] = useState("");
    const [numberApp, setNumberApp] = useState(0);
    const [endDate, setEndDate] = useState("");

    const [profession, setProfession] = useState("");
    const [specialization, setSpecialization] = useState("");
    const [superSpecialization, setSuperSpecialization] = useState([]);
    const [skills, setSkills] = useState("");

    const [location, setLocation] = useState("");
    const [experience, setExperience] = useState("");
    const [incentives, setIncentives] = useState([]);
    const [type, setType] = useState([]);
    const [salary, setSalary] = useState(0);
    const [line, setLine] = useState("");

    const [freelance, setFreelance] = useState(false);
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [date, setDate] = useState("");
    const [type2, setType2] = useState("");
    const [jobType, setJobType] = useState("");
    const [modal, setModal] = useState(false);
    const [mess, setMess] = useState("");
    const [id, setId] = useState("");

    const [modalError, setModalError] = useState(false);
    const [messError, setMessError] = useState("");

    const toggle = () => setModal(!modal);
    const toggleError = () => setModalError(!modalError);

    const toggleDetail = () => setShowDetail((prevState) => !prevState);
    const toggleSkill = () => setShowSkill((prevState) => !prevState);
    const toggleOtherDetail = () =>
        setShowOtherDetail((prevState) => !prevState);
    const handleChange = (e) => {
        eval(`set${e.target.name}`)(e.target.value);
    };
    const handleChangeSelect = (name, value) => {
        eval(`set${name}`)(value);
    };
    const loc = useLocation();
    useEffect(() => {
        const [type2t, jobTypet] = props.location.search
            .substring(1)
            .split("&");
        setType2(type2t);
        setJobType(jobTypet);

        if (type2t === "freelance") {
            setFreelance(true);
            console.log(data.startDate);
            axios
                .get(
                    `/api/employer/${
                        jobTypet === "close" ? "save" : jobTypet
                    }/${type2t}/${props.match.params.id}`,
                )
                .then(({ data }) => {
                    setId(data._id);
                    setTitle(data.title);
                    setCompany(
                        data.description.company
                            ? data.description.company
                            : "",
                    );

                    setNumberApp(
                        data.description.count ? data.description.count : 0,
                    );
                    data.startDate &&
                        setDate(
                            `${new Date(data.startDate).getFullYear()}-${(
                                "0" +
                                (new Date(data.startDate).getMonth() + 1)
                            ).slice(-2)}-${(
                                "0" + new Date(data.startDate).getDate()
                            ).slice(-2)}`,
                        );
                    data.startDate &&
                        setStartTime(
                            new Date(data.startDate).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: false,
                            }),
                        );
                    data.endDate &&
                        setEndTime(
                            new Date(data.endDate).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: false,
                            }),
                        );
                    setSkills(
                        data.description.skills ? data.description.skills : "",
                    );
                    setLine(data.description.line ? data.description.line : "");
                    setProfession(data.profession);
                    setSpecialization(data.specialization);
                    setExperience(
                        data.description.experience
                            ? data.description.experience
                            : "",
                    );
                    setLocation(
                        data.description.location
                            ? data.description.location
                            : "",
                    );
                    setSalary(
                        data.description.salary ? data.description.salary : 0,
                    );
                    setIncentives(
                        data.description.incentives
                            ? data.description.incentives.map((x) => {
                                  return { value: x, label: x };
                              })
                            : [],
                    );
                    setType(
                        data.description.type
                            ? data.description.type.map((x) => {
                                  return { value: x, label: x };
                              })
                            : [],
                    );
                    setSuperSpecialization(
                        data.superSpecialization
                            ? data.superSpecialization.map((x) => {
                                  return { value: x, label: x };
                              })
                            : [],
                    );

                    // console.log(endDate);
                    // setTitle(data.title);
                })
                .catch((err) => {
                    console.log(err.response);
                    // alert(err.response);
                    err.response.data
                        ? setMessError(err.response.data.err)
                        : setMessError("Error getting job");

                    toggleError();
                });
        } else
            axios
                .get(
                    `/api/employer/${
                        jobTypet === "close" ? "save" : jobTypet
                    }/${type2t}/${props.match.params.id}`,
                )
                .then(({ data }) => {
                    setId(data._id);

                    setTitle(data.title);
                    setCompany(
                        data.description.company
                            ? data.description.company
                            : "",
                    );

                    setNumberApp(
                        data.description.count ? data.description.count : 0,
                    );
                    data.expireAt &&
                        setEndDate(
                            `${new Date(data.expireAt).getFullYear()}-${(
                                "0" +
                                (new Date(data.expireAt).getMonth() + 1)
                            ).slice(-2)}-${(
                                "0" + new Date(data.expireAt).getDate()
                            ).slice(-2)}`,
                        );

                    setSkills(
                        data.description.skills ? data.description.skills : "",
                    );
                    setLine(data.description.line ? data.description.line : "");
                    setProfession(data.profession);
                    setSpecialization(data.specialization);
                    setExperience(
                        data.description.experience
                            ? data.description.experience
                            : "",
                    );
                    setLocation(
                        data.description.location
                            ? data.description.location
                            : "",
                    );
                    setSalary(
                        data.description.salary ? data.description.salary : 0,
                    );
                    setIncentives(
                        data.description.incentives
                            ? data.description.incentives.map((x) => {
                                  return { value: x, label: x };
                              })
                            : [],
                    );
                    setType(
                        data.description.type
                            ? data.description.type.map((x) => {
                                  return { value: x, label: x };
                              })
                            : [],
                    );
                    setSuperSpecialization(
                        data.superSpecialization
                            ? data.superSpecialization.map((x) => {
                                  return { value: x, label: x };
                              })
                            : [],
                    );

                    console.log(endDate);
                    // setTitle(data.title);
                })
                .catch((err) => {
                    // alert(err.response);
                    err.response.data
                        ? setMessError(err.response.data.err)
                        : setMessError("Error getting job");

                    toggleError();
                });
    }, []);
    const save = () => {
        // const jobType = "save";
        // let type2;
        // setJobType("save");
        let job = {
            title: title,
            profession: profession,
            specialization: specialization,
            superSpecialization: superSpecialization.map((x) => x.value),

            description: {
                line: line.trim(),
                about: line.trim(),
                experience: experience,
                incentives: incentives.map((x) => x.value),
                type: type.map((x) => x.value),
                location: location,
                skills: skills.trim(),
                salary: salary,
                count: numberApp,
                company: company,
            },
        };
        if (freelance) {
            job.endDate = new Date(`${date} ${endTime}`).toISOString();
            job.startDate = new Date(`${date} ${startTime}`).toISOString();
        } else {
            job.expireAt =
                endDate !== ""
                    ? new Date(endDate).toISOString()
                    : new Date(
                          new Date() + 45 * 24 * 60 * 60 * 1000,
                      ).toISOString();
        }
        axios
            .put(
                `/api/employer/${jobType}/${type2}/${props.match.params.id}`,
                job,
            )
            .then((data) => {
                console.log(data);
                if (data.data.updated) {
                    setMessError("Updated Successfully !");
                    toggleError();
                    window.location = "/applications";
                }

                //  window.location = "/search-jobs";
            })
            .catch((err) => {
                console.log(err.response);
                const error = err.response.data ? err.response.data.err : "";
                // alert("Unable to save job : " + error);
                err.response.data
                    ? setMessError(err.response.data.err)
                    : setMessError("Error updating job");

                toggleError();
            });
        console.log(job);
    };
    const submit = () => {
        // setjobType
        // let type2;
        setModal(false);
        let job = {
            title: title,
            profession: profession,
            specialization: specialization,
            superSpecialization: superSpecialization.map((x) => x.value),

            description: {
                line: line.trim(),
                about: line.trim(),
                experience: experience,
                incentives: incentives.map((x) => x.value),
                type: type.map((x) => x.value),
                location: location,
                skills: skills.trim(),
                salary: salary,
                count: numberApp,
                company: company,
            },
        };
        if (freelance) {
            // type2 = "freelance";
            job.endDate = new Date(`${date} ${endTime}`).toISOString();
            job.startDate = new Date(`${date} ${startTime}`).toISOString();
        } else {
            // type2 = "job";

            job.expireAt =
                endDate !== ""
                    ? new Date(endDate).toISOString()
                    : new Date(
                          new Date() + 45 * 24 * 60 * 60 * 1000,
                      ).toISOString();
        }
        if (jobType === "save")
            axios
                .put(
                    `/api/employer/${jobType}/${type2}/activate/${props.match.params.id}`,
                    job,
                )
                .then((data) => {
                    console.log(data);
                    if (data.data.updated) {
                        setMessError("Posted Successfully !");
                        toggleError();
                        window.location = "/applications";
                    }

                    //  window.location = "/search-jobs";
                })
                .catch((err) => {
                    console.log(err.response);
                    const error = err.response.data
                        ? err.response.data.err
                        : "";
                    // alert("Unable to post job : " + error);
                    err.response.data
                        ? setMessError(err.response.data.err)
                        : setMessError("Error posting job");

                    toggleError();
                });
        // console.log(job);
        else
            axios
                .put(
                    `/api/employer/${jobType}/${type2}/${props.match.params.id}`,
                    job,
                )
                .then((data) => {
                    console.log(data);
                    if (data.data.updated) {
                        setMessError("Posted Successfully !");
                        toggleError();
                        window.location = "/applications";
                    }

                    //  window.location = "/search-jobs";
                })
                .catch((err) => {
                    console.log(err.response);
                    const error = err.response.data
                        ? err.response.data.err
                        : "";
                    // alert("Unable to post job : " + error);
                    err.response.data
                        ? setMessError(err.response.data.err)
                        : setMessError("Error posting job");

                    toggleError();
                });
    };
    const discard = () => {
        axios
            .delete(
                `/api/employer/${jobType}/${type2}/${props.match.params.id}`,
            )
            .then((data) => {
                console.log(data);
                setMessError(
                    `Job ${jobType === "post" ? "closed" : "discarded"}`,
                );
                toggleError();
                window.location = "/applications";
            })
            .catch((err) => {
                console.log(err.response);
                const error = err.response.data ? err.response.data.err : "";
                // alert("Unable to post job : " + error);
                err.response.data
                    ? setMessError(err.response.data.err)
                    : setMessError("Error posting job");

                toggleError();
            });
    };
    return (
        <div>
            <Nav tabs className='justify-content-between '>
                <div className='row justify-content-start col-6 col-sm-7'>
                    <NavItem className='mx-1 mx-sm-2'>
                        <NavLink
                            href='/employer'
                            // onClick={() => {
                            //     this.toggleTab("1");
                            // }}
                            className={`p-1 p-sm-2`}>
                            <h6>Overview</h6>
                        </NavLink>
                    </NavItem>
                    <NavItem className='mx-1 mx-sm-2'>
                        <NavLink href='/applications' className={`p-1 p-sm-2`}>
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
            <Form className='border-block p-3 p-md-4 mx-2 mx-sm-4 m-3'>
                <h2>Edit a Job</h2>
                <div className='block-card p-2 p-sm-3 mt-4'>
                    <div className='row justify-content-between'>
                        <h4 className='col-9 col-sm-10'>Job Details</h4>
                        <Button
                            onClick={toggleDetail}
                            className='col-3 col-sm-1'
                            style={{
                                background: "rgba(0,0,0,0)",
                                border: "0px solid transparent",
                            }}>
                            {showDetail ? (
                                <FontAwesomeIcon
                                    icon={faArrowAltCircleUp}
                                    className='text-info'
                                    size='lg'
                                />
                            ) : (
                                <FontAwesomeIcon
                                    icon={faArrowAltCircleDown}
                                    className='text-info'
                                    size='lg'
                                />
                            )}
                        </Button>
                    </div>
                    {showDetail && (
                        <div className='row p-2'>
                            <div className='col-12 col-md-6 pr-md-2 my-1 w-100'>
                                <Label className='m-1'>
                                    <h6>Title</h6>
                                </Label>
                                <input
                                    placeholder='Title'
                                    className='form-control'
                                    ref={titleRef}
                                    name='Title'
                                    defaultValue={title}
                                    onChange={handleChange}
                                    disabled={jobType === "close"}
                                    required
                                />
                            </div>
                            <div className='col-12 col-md-6 pl-md-2 my-1 w-100'>
                                <Label className='m-1'>
                                    <h6>Company</h6>
                                </Label>
                                <input
                                    placeholder='Company'
                                    name='Company'
                                    defaultValue={company}
                                    className='form-control'
                                    ref={companyRef}
                                    disabled={jobType === "close"}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className='col-12 col-md-6 pr-md-2 my-1 w-100'>
                                <Label className='m-1'>
                                    <h6>Number of Applicants</h6>
                                </Label>
                                <input
                                    type='number'
                                    placeholder='Number of applicants'
                                    className='form-control'
                                    ref={numberAppRef}
                                    defaultValue={Number(numberApp)}
                                    name='NumberApp'
                                    onChange={handleChange}
                                    disabled={jobType === "close"}
                                    required
                                />
                            </div>
                            {!freelance && (
                                <div className='col-12 col-md-6 pl-md-2 my-1 w-100'>
                                    <Label className='pl-2' for='exampleDate'>
                                        <h6>End -Date</h6>
                                    </Label>
                                    <Input
                                        type='date'
                                        name='date'
                                        id='exampleDate'
                                        placeholder='date placeholder'
                                        name='EndDate'
                                        defaultValue={endDate}
                                        disabled={jobType === "close"}
                                        ref={endDateRef}
                                        disabled={jobType === "close"}
                                        onChange={handleChange}
                                    />
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <hr />
                <div className='block-card p-2 p-sm-3'>
                    <div className='row justify-content-between'>
                        <h4 className='col-9 col-sm-10'>Requried Skills</h4>
                        <Button
                            onClick={toggleSkill}
                            className='col-3 col-sm-1'
                            style={{
                                background: "rgba(0,0,0,0)",
                                border: "0px solid transparent",
                            }}>
                            {showSkill ? (
                                <FontAwesomeIcon
                                    icon={faArrowAltCircleUp}
                                    className='text-info'
                                    size='lg'
                                />
                            ) : (
                                <FontAwesomeIcon
                                    icon={faArrowAltCircleDown}
                                    className='text-info'
                                    size='lg'
                                />
                            )}
                        </Button>
                    </div>
                    {showSkill && (
                        <FormGroup className='row p-2'>
                            <div className='col-12 col-md-6 pr-md-2 my-1'>
                                {/* <Label>Profession</Label> */}
                                <Select
                                    autosize={true}
                                    isClearable={true}
                                    placeholder='Profession'
                                    isDisabled={
                                        jobType === "post" ||
                                        jobType === "close"
                                    }
                                    defaultValue={
                                        profession !== "" && {
                                            value: profession,
                                            label: profession,
                                        }
                                    }
                                    options={data.professions.map(
                                        (profession) => {
                                            return {
                                                value: profession,
                                                label: profession,
                                            };
                                        },
                                    )}
                                    ref={professionRef}
                                    onChange={(e) => {
                                        console.log(e);
                                        handleChangeSelect(
                                            "Profession",
                                            e ? e.value : "",
                                        );
                                    }}
                                />
                            </div>
                            <div className='col-12 col-md-6 pl-md-2 my-1'>
                                <Select
                                    autosize={true}
                                    isClearable={true}
                                    placeholder='Specialization'
                                    isDisabled={
                                        jobType === "post" ||
                                        jobType === "close"
                                    }
                                    defaultValue={
                                        specialization !== "" && {
                                            value: specialization,
                                            label: specialization,
                                        }
                                    }
                                    options={data.specializations.map(
                                        (specialization) => {
                                            return {
                                                value: specialization,
                                                label: specialization,
                                            };
                                        },
                                    )}
                                    ref={specializationRef}
                                    onChange={(e) => {
                                        console.log(e);
                                        handleChangeSelect(
                                            "Specialization",
                                            e ? e.value : "",
                                        );
                                    }}
                                />
                            </div>
                            <InputGroup className='col-12 my-1'>
                                <div style={{ width: `100%` }}>
                                    <Select
                                        isMulti
                                        autosize={true}
                                        placeholder='Super specialization'
                                        options={superSpecializationArray}
                                        ref={superSpecializationRef}
                                        name='SuperSpecialization'
                                        defaultValue={superSpecialization}
                                        isDisabled={jobType === "close"}
                                        onChange={(e) => {
                                            console.log(e);
                                            handleChangeSelect(
                                                "SuperSpecialization",
                                                e,
                                            );
                                        }}
                                    />
                                </div>
                            </InputGroup>
                            <InputGroup className='col-12 my-1'>
                                <textarea
                                    placeholder='Other Skills ..'
                                    ref={skillsRef}
                                    className='form-control'
                                    rows='3'
                                    disabled={jobType === "close"}
                                    name='Skills'
                                    onChange={handleChange}
                                    defaultValue={skills}
                                />
                            </InputGroup>
                        </FormGroup>
                    )}
                </div>

                <hr />
                <div className='block-card p-2 p-sm-3'>
                    <div className='row justify-content-between'>
                        <h4 className='col-9 col-sm-10'>Other Details</h4>
                        <Button
                            onClick={toggleOtherDetail}
                            className='col-3 col-sm-1'
                            style={{
                                background: "rgba(0,0,0,0)",
                                border: "0px solid transparent",
                            }}>
                            {showOtherDetail ? (
                                <FontAwesomeIcon
                                    icon={faArrowAltCircleUp}
                                    className='text-info'
                                    size='lg'
                                />
                            ) : (
                                <FontAwesomeIcon
                                    icon={faArrowAltCircleDown}
                                    className='text-info'
                                    size='lg'
                                />
                            )}
                        </Button>
                    </div>
                    {showOtherDetail && (
                        <FormGroup className='row p-2'>
                            <InputGroup className='col-12 col-sm-6'>
                                <div style={{ width: `100%` }} className='m-1'>
                                    <Select
                                        autosize={true}
                                        placeholder='Experience'
                                        options={experienceArray}
                                        isClearable={true}
                                        defaultValue={
                                            experience !== "" && {
                                                value: experience,
                                                label: experience,
                                            }
                                        }
                                        isDisabled={jobType === "close"}
                                        // className='basic-multi-select'
                                        // classNamePrefix='select'
                                        ref={experienceRef}
                                        onChange={(e) => {
                                            console.log(e);
                                            handleChangeSelect(
                                                "Experience",
                                                e ? e.value : "",
                                            );
                                        }}
                                    />
                                </div>
                            </InputGroup>

                            <InputGroup className='col-12 col-sm-6'>
                                <div style={{ width: `100%` }} className='m-1'>
                                    <Select
                                        isMulti
                                        autosize={true}
                                        placeholder='Type'
                                        options={typeArray}
                                        isDisabled={jobType === "close"}
                                        // className='basic-multi-select'
                                        // classNamePrefix='select'
                                        ref={typeRef}
                                        name='Type'
                                        defaultValue={type}
                                        onChange={(e) => {
                                            console.log(e);
                                            handleChangeSelect("Type", e);
                                        }}
                                    />
                                </div>
                            </InputGroup>
                            <InputGroup className='col-12 col-sm-6'>
                                <div style={{ width: `100%` }} className='m-1'>
                                    <Select
                                        autosize={true}
                                        isClearable={true}
                                        placeholder='Location'
                                        options={locationArray}
                                        // className='basic-multi-select'
                                        // classNamePrefix='select'
                                        ref={locationRef}
                                        defaultValue={
                                            location !== "" && {
                                                value: location,
                                                label: location,
                                            }
                                        }
                                        isDisabled={jobType === "close"}
                                        onChange={(e) => {
                                            console.log(e);
                                            handleChangeSelect(
                                                "Location",
                                                e ? e.value : "",
                                            );
                                        }}
                                    />
                                </div>
                            </InputGroup>
                            <InputGroup className='col-12 col-sm-6'>
                                <InputGroup className='m-1'>
                                    <input
                                        placeholder='salary'
                                        type='number'
                                        className='form-control '
                                        ref={salaryRef}
                                        defaultValue={Number(salary)}
                                        name='Salary'
                                        onChange={handleChange}
                                        disabled={jobType === "close"}
                                        required
                                    />
                                    <InputGroupAddon addonType='append'>
                                        <InputGroupText>
                                            per annum
                                        </InputGroupText>
                                    </InputGroupAddon>
                                </InputGroup>
                            </InputGroup>
                            <InputGroup className='col-12'>
                                <div style={{ width: `100%` }} className='m-1'>
                                    <Select
                                        onChange={(opt) => console.log(opt)}
                                        isMulti
                                        autosize={true}
                                        placeholder='Incentives'
                                        options={incentivesArray}
                                        // className='basic-multi-select'
                                        // classNamePrefix='select'
                                        ref={incentivesRef}
                                        name='Incentives'
                                        defaultValue={incentives}
                                        isDisabled={jobType === "close"}
                                        onChange={(e) => {
                                            console.log(e);
                                            handleChangeSelect("Incentives", e);
                                        }}
                                    />
                                </div>
                            </InputGroup>
                            <InputGroup className='col-12'>
                                <textarea
                                    placeholder='Job Responsibilities ..'
                                    ref={lineRef}
                                    className='form-control m-1'
                                    rows='4'
                                    name='Line'
                                    onChange={handleChange}
                                    defaultValue={line}
                                    disabled={jobType === "close"}
                                />
                            </InputGroup>
                        </FormGroup>
                    )}
                </div>
                <hr />
                {freelance && (
                    <div
                        className=' block-card p-2 p-sm-3'
                        style={{
                            height: "max-content",
                        }}>
                        <div className='row justify-content-between'>
                            <div className='col-9 col-sm-10'>
                                <h4>Freelance</h4>
                            </div>
                            {/* <div className='col-3 col-sm-1'>
                            <input
                                className='react-switch-checkbox'
                                id={`react-switch-new`}
                                type='checkbox'
                                ref={freelanceRef}
                                //   checked={this.state.freelance}
                            />

                            <label
                                className='react-switch-label float-right'
                                htmlFor={`react-switch-new`}
                                onClick={() => {
                                    console.log(freelanceRef.current.checked);
                                    setFreelance(!freelanceRef.current.checked);
                                }}>
                                <span className={`react-switch-button`} />
                            </label>
                        </div> */}
                        </div>
                        {freelance && (
                            <FormGroup className='row p-2'>
                                <InputGroup className='col-12 col-sm-6 my-1 pr-1 row justify-content-between'>
                                    <Label
                                        className='pr-2 col-12 col-md-3'
                                        for='exampleDate'
                                        style={{ fontSize: "1.3rem" }}>
                                        Start Time
                                    </Label>
                                    {/* <Label for='exampleTime'>Time</Label> */}
                                    <Input
                                        type='time'
                                        name='StartTime'
                                        id='exampleTime'
                                        placeholder='time placeholder'
                                        className='col-12 col-md-8 px-2'
                                        ref={startTimeRef}
                                        defaultValue={startTime}
                                        onChange={handleChange}
                                    />
                                </InputGroup>
                                <InputGroup className='col-12 col-sm-6 my-1 pl-1 row justify-content-between'>
                                    <Label
                                        className='pr-2 col-12 col-md-3'
                                        for='exampleDate'
                                        style={{ fontSize: "1.3rem" }}>
                                        End Time
                                    </Label>
                                    {/* <Label for='exampleTime'>Time</Label> */}
                                    <Input
                                        type='time'
                                        name='EndTime'
                                        id='exampleTime'
                                        placeholder='time placeholder'
                                        className='col-12 col-md-8 px-2'
                                        defaultValue={endTime}
                                        ref={endTimeRef}
                                        onChange={handleChange}
                                    />
                                </InputGroup>
                                <FormGroup className='col-12 row my-1 my-md-2'>
                                    <Label
                                        className='pr-2 col-12 col-md-1'
                                        for='exampleDate'
                                        style={{ fontSize: "1.3rem" }}>
                                        Date
                                    </Label>
                                    <Input
                                        type='date'
                                        name='Date'
                                        id='exampleDate'
                                        placeholder='date placeholder'
                                        ref={dateRef}
                                        className='col-12 px-3 col-md-11'
                                        defaultValue={date}
                                        onChange={handleChange}
                                        // defaultValue={endDate}
                                        // ref={endDateRef}
                                        // onChange={handleChange}
                                    />
                                </FormGroup>
                            </FormGroup>
                        )}
                    </div>
                )}
                <FormGroup className='ml-auto mr-1 mt-3 w-100 text-align-end row justify-content-end'>
                    {jobType === "post" && (
                        <div className='col-3 col-md-2 px-1'>
                            <Button
                                onClick={(e) => {
                                    setMess("discard");
                                    // history.push({
                                    //     pathname: "/post",
                                    //     state: { id, type2, jobType },
                                    // });
                                    toggle();
                                }}
                                className='w-100'
                                color='danger'>
                                Close
                            </Button>
                        </div>
                    )}
                    {jobType === "save" && (
                        <div className='col-3 col-md-2 px-1'>
                            <Button
                                onClick={(e) => {
                                    setMess("save");
                                    toggle();
                                }}
                                className='w-100'
                                color='info'>
                                Save
                            </Button>
                        </div>
                    )}
                    {jobType === "save" && (
                        <div className='col-3 col-md-2 px-1'>
                            <Button
                                onClick={(e) => {
                                    setMess("discard");
                                    toggle();
                                }}
                                className='w-100'
                                color='danger'>
                                Discard
                            </Button>
                        </div>
                    )}
                    {(jobType === "close" || jobType === "post") && (
                        <div className='col-3 col-md-2 px-1'>
                            <Link
                                to={{
                                    pathname: "/post",
                                    state: { id, type2, jobType },
                                }}>
                                <Button className='w-100' color='info'>
                                    Copy
                                </Button>
                            </Link>
                        </div>
                    )}
                    {(jobType === "post" || jobType === "save") && (
                        <div className='col-3 col-md-2 px-1'>
                            <Button
                                onClick={(e) => {
                                    setMess("post");
                                    toggle();
                                }}
                                className='w-100'
                                color='primary'>
                                {jobType === "post" ? "Update" : "Post"}
                            </Button>
                        </div>
                    )}
                </FormGroup>
            </Form>
            <Modal isOpen={modal} toggle={toggle} style={{ marginTop: "20vh" }}>
                <ModalHeader toggle={toggle} className='py-1'>
                    {mess === "save" && "Confirm Save"}
                    {mess === "post" && "Confirm Publish"}
                    {mess === "discard" && "Confirm Discard"}

                    {/* {mess.split("_")[0] === "accept" && "Confirm Accept"} */}
                </ModalHeader>
                {/* <ModalHeader toggle={toggle}>
                    {mess === "promote" && "Promote"}
                </ModalHeader> */}
                <ModalBody>
                    {mess === "post" &&
                        "Are you sure you want to publish this job ?"}

                    {mess === "save" &&
                        "Are you sure you want to save the job?"}
                    {mess === "discard" &&
                        "Are you sure you want to discard the job?"}
                </ModalBody>
                <ModalFooter>
                    {mess === "post" && (
                        <Button
                            size='sm'
                            color='primary'
                            onClick={(e) => {
                                toggle();
                                submit();
                            }}>
                            Yes
                        </Button>
                    )}
                    {mess === "save" && (
                        <Button
                            size='sm'
                            color='primary'
                            onClick={(e) => {
                                toggle();
                                save();
                            }}>
                            Yes
                        </Button>
                    )}
                    {mess === "discard" && (
                        <Button
                            size='sm'
                            color='primary'
                            onClick={(e) => {
                                toggle();
                                discard();
                            }}>
                            Yes
                        </Button>
                    )}

                    <Button color='secondary' size='sm' onClick={toggle}>
                        No
                    </Button>
                </ModalFooter>
            </Modal>
            <Modal
                isOpen={modalError}
                toggle={toggleError}
                style={{ marginTop: "20vh" }}>
                <ModalHeader toggle={toggleError} className='py-1'>
                    Error !
                </ModalHeader>
                {/* <ModalHeader toggle={toggle}>
                    {mess === "promote" && "Promote"}
                </ModalHeader> */}
                <ModalBody>{messError}</ModalBody>
            </Modal>
        </div>
    );
};
export default UpdateJob;
