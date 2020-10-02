import React, { useRef, useState, useEffect } from "react";
import {
    Form,
    Label,
    FormGroup,
    Button,
    Input,
    InputGroup,
    InputGroupAddon,
    InputGroupText,
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Nav,
    NavItem,
} from "reactstrap";
import { NavLink, Link } from "react-router-dom";
import axios from "axios";
import Select from "react-select";
import data from "../data";
import "../stylesheets/postJob.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faMapMarkerAlt,
    faUser,
    faPen,
    faEnvelope,
    faArrowAltCircleDown,
    faArrowAltCircleUp,
    faChevronUp,
    faChevronDown,
    faExternalLinkAlt,
    // faShareAlt,
} from "@fortawesome/free-solid-svg-icons";
const block = {
    borderRadius: " 0.25rem",
    border: "0.05rem solid #eeeeee",
    /* background-color: rgba(0, 0, 0, 0.15); */
    boxShadow: " 2px 2px 3px rgba(0, 0, 0, 0.1)",
    transition: "0.3s ease-in-out",
};

const PostJob = (props) => {
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
    const categoryRef = useRef(null);

    const currentDate = new Date();
    const date60 = new Date(currentDate.setDate(currentDate.getDate() + 60));
    const date90 = new Date(currentDate.setDate(currentDate.getDate() + 30));
    const time2 = new Date(currentDate.setHours(currentDate.getHours() + 2));
    const [showDetail, setShowDetail] = useState(false);
    const [showSkill, setShowSkill] = useState(false);
    const [showOtherDetail, setShowOtherDetail] = useState(false);

    const [currentEmployer, setCurrentEmployer] = useState(null);

    const [title, setTitle] = useState("");
    const [company, setCompany] = useState("");
    const [numberApp, setNumberApp] = useState(0);
    const [endDate, setEndDate] = useState("");

    const [profession, setProfession] = useState("");
    const [specialization, setSpecialization] = useState("");
    const [superSpecialization, setSuperSpecialization] = useState("");
    const [skills, setSkills] = useState("");

    const [location, setLocation] = useState("");
    const [experience, setExperience] = useState("");
    const [incentives, setIncentives] = useState([]);
    const [type, setType] = useState("Full-time");
    const [salary, setSalary] = useState(0);
    const [line, setLine] = useState("");

    const [freelance, setFreelance] = useState(false);
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [startDate, setStartDate] = useState("");
    const [category, setCategory] = useState("");
    const [employer, setEmployer] = useState("");
    const [contact, setContact] = useState("");
    const [procedure, setProcedure] = useState("");
    const [sponsored, setSponsored] = useState(false);
    const [attachApplicants, setAttachAppilcants] = useState([]);
    const [tempArr, setTempArr] = useState([]);

    const [modal, setModal] = useState(false);
    const [mess, setMess] = useState("");

    const [modalError, setModalError] = useState(false);
    const [messError, setMessError] = useState("");
    const [valid, setValid] = useState({});
    let incentivesArray = [],
        experienceArray = [],
        specializationArray = [],
        professionArray = [],
        locationArray = [],
        typeArray = [];
    let specializationObj = {},
        superSpecializationObj = {};
    if (props.data) {
        incentivesArray = props.data.incentive.map((opt) => ({
            label: opt,
            value: opt,
        }));
        experienceArray = data.experience.map((opt) => ({
            label: opt,
            value: opt,
        }));
        typeArray = props.data.type.map((opt) => ({ label: opt, value: opt }));
        professionArray = props.data.specializations.map((obj) => {
            specializationObj[obj.profession] = obj.specialization.map((e) => {
                return { label: e, value: e };
            });
            specializationArray = [
                ...specializationArray,
                ...obj.specialization,
            ];
            return {
                value: obj.profession,
                label: obj.profession,
            };
        });
        specializationArray = [...new Set(specializationArray)];
        specializationArray = specializationArray.map((e) => {
            return { label: e, value: e };
        });

        props.data.superSpecializations.forEach((obj) => {
            const key = `${obj.profession}+${obj.specialization}`;
            superSpecializationObj[key] = obj.superSpecialization.map((e) => {
                return { label: e, value: e };
            });
        });
    }
    if (props.locationData) {
        locationArray = data.location.map((opt) => ({
            label: `${opt.name}, ${opt.state}`,
            value: `${opt.name}`,
        }));
    }
    const toggleError = () => setModalError(!modalError);

    const toggle = () => {
        let newValid = {
            title: title !== "",
            type: type !== "",
            profession: profession !== "",
            specialization: specialization !== "",
            location: location !== "",
            experience: experience !== "",
            line: line !== "",
            contact: contact !== "",
        };
        if (type === "Locum Position") {
            newValid.startDate = startDate !== "";
            newValid.endDate = endDate !== "";
        }
        if (type === "Day Job") {
            newValid.startDate = startDate !== "";
            // newValid.startTime = startTime !== "";
            // newValid.endTime = endTime !== "";
        }
        console.log(newValid);
        setValid(newValid);
        const isValid = Object.values(newValid).every((item) => item === true);
        if (isValid) {
            setModal(!modal);
        } else {
            setModalError(true);
            setMessError("Please fill all the fields !");
        }
    };
    const toggleDetail = () => setShowDetail((prevState) => !prevState);
    const toggleSkill = () => setShowSkill((prevState) => !prevState);
    const toggleOtherDetail = () =>
        setShowOtherDetail((prevState) => !prevState);
    const handleChange = (e) => {
        const x =
            e.target.name.charAt(0).toLowerCase() + e.target.name.slice(1);
        eval(`set${e.target.name}`)(e.target.value);
        let newValid = { ...valid };
        newValid[x] = e.target.value !== "";
        console.log(newValid);
        setValid(newValid);
    };
    const handleChangeSelect = (name, value) => {
        eval(`set${name}`)(value);
        const x = name.charAt(0).toLowerCase() + name.slice(1);
        let newValid = { ...valid };
        newValid[x] = value !== "";
        console.log(newValid);
        setValid(newValid);
    };
    const save = () => {
        let newValid = {
            title: title !== "",
            type: type !== "",
            profession: profession !== "",
            specialization: specialization !== "",
            location: location !== "",
            experience: experience !== "",
            line: line !== "",
            contact: contact !== "",
        };
        if (type === "Locum Position") {
            newValid.startDate = startDate !== "";
            newValid.endDate = endDate !== "";
        }
        if (type === "Day Job") {
            newValid.startDate = startDate !== "";
            // newValid.startTime = startTime !== "";
            // newValid.endTime = endTime !== "";
        }
        console.log(newValid);
        setValid(newValid);
        const isValid = Object.values(newValid).every((item) => item === true);
        if (!isValid) {
            setModalError(true);
            setMessError("Please fill all the fields !");
        } else {
            const jobType = "save";
            let type2;

            let job = {
                title: title,
                profession: profession,
                specialization: specialization,
                superSpecialization: superSpecialization,
                sponsored: sponsored,

                description: {
                    line: line.trim(),
                    about: skills.trim(),
                    experience: experience,
                    incentives: incentives && incentives.map((x) => x.value),
                    type: type,
                    location: location,
                    // skills: skills.trim(),
                    salary: salary,
                    count: numberApp,
                    company:
                        employer === ""
                            ? currentEmployer.description
                                ? currentEmployer.description.organization
                                : employer
                            : "",
                    employer:
                        employer === ""
                            ? currentEmployer.description
                                ? currentEmployer.description.organization
                                : employer
                            : "",
                    contact: contact,
                    procedure: procedure,
                },
            };
            if (type === "Day Job") {
                type2 = "freelance";
                if (startDate !== "")
                    job.endDate = new Date(
                        `${startDate} ${endTime}`,
                    ).toISOString();
                if (startDate !== "")
                    job.startDate = new Date(
                        `${startDate} ${startTime}`,
                    ).toISOString();
                job.category = type;
            } else if (type === "Locum Position") {
                type2 = "freelance";
                if (endDate !== "")
                    job.endDate = new Date(`${endDate}`).toISOString();
                if (startDate !== "")
                    job.startDate = new Date(`${startDate}`).toISOString();
                job.category = "Locum";
            } else {
                type2 = "job";
                job.category = "Full-time";
                // job.expireAt =
                //     endDate !== ""
                //         ? new Date(endDate).toISOString()
                //         : new Date(
                //               new Date() + 45 * 24 * 60 * 60 * 1000,
                //           ).toISOString();
            }
            axios
                .post(`/api/job/save`, job)
                .then((data) => {
                    console.log(data);
                    if (data.status === 200) {
                        // alert("job Saved");
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
                    // alert("Unable to post job");
                    err.response.data
                        ? setMessError(err.response.data.err)
                        : setMessError("Error saving job");

                    toggleError();
                });
            console.log(job);
        }
    };
    const submit = () => {
        const jobType = "post";
        let type2;
        let attArr = attachApplicants.filter((obj) => obj !== undefined);
        let job = {
            title: title,
            profession: profession,
            specialization: specialization,
            superSpecialization: superSpecialization,
            sponsored: sponsored,
            // attachedApplicants: attArr,
            // instituteName: employer,

            description: {
                line: line.trim(),
                about: skills.trim(),
                experience: experience,
                incentives: incentives && incentives.map((x) => x.value),
                type: type,
                location: location,
                // skills: skills.trim(),
                salary: salary,
                count: numberApp,
                company:
                    employer === ""
                        ? currentEmployer.description
                            ? currentEmployer.description.organization
                            : employer
                        : "",
                employer:
                    employer === ""
                        ? currentEmployer.description
                            ? currentEmployer.description.organization
                            : employer
                        : "",
                contact: contact,
                procedure: procedure,
            },
        };
        if (attArr.length > 0) job.attachedApplicants = attArr;
        if (type === "Day Job") {
            type2 = "freelance";
            if (endDate !== "")
                job.endDate = new Date(`${startDate} ${endTime}`).toISOString();
            if (startDate !== "")
                job.startDate = new Date(
                    `${startDate} ${startTime}`,
                ).toISOString();
            job.category = type;
        } else if (type === "Locum Position") {
            type2 = "freelance";
            if (endDate !== "")
                job.endDate = new Date(`${endDate}`).toISOString();
            if (startDate !== "")
                job.startDate = new Date(`${startDate}`).toISOString();
            job.category = "Locum";
        } else {
            type2 = "job";
            job.category = "Full-time";
            // job.expireAt =
            //     endDate !== ""
            //         ? new Date(endDate).toISOString()
            //         : new Date(
            //               new Date() + 45 * 24 * 60 * 60 * 1000,
            //           ).toISOString();
        }
        axios
            .post(`/api/job/post`, job)
            .then((data) => {
                console.log(data);
                if (data.status === 200) {
                    // alert("job Posted");
                    window.location = "/applications";
                }
            })
            .catch((err) => {
                console.log(err);
                console.log(err.response);
                const error =
                    err.response && err.response.data
                        ? err.response.data.err
                        : "";

                // alert("Unable to post job : " + error);
                err.response && err.response.data
                    ? setMessError(err.response.data.err)
                    : setMessError("Error posting job");

                toggleError();
            });
        console.log(job);
    };
    useEffect(() => {
        console.log(valid.title);
        axios
            .get(`/api/employer/current`)
            .then(({ data }) => {
                console.log(data.user);
                setCurrentEmployer(data.user);
                if (data.user && data.user.acceptedApplicants)
                    setTempArr(data.user.acceptedApplicants);
            })
            .catch((err) => console.log(err));
        console.log("====================================");
        //TODO:
        console.log(props.location.state);
        if (props.location.state !== undefined) {
            // const [type2t, jobTypet] = props.location.search
            //     .substring(1)
            //     .split("&");
            // setType2(type2t);
            // setJobType(jobTypet);
            const type2t = props.location.state.type2;
            const jobTypet = props.location.state.jobType;
            if (type2t === "freelance") {
                setFreelance(true);
                console.log(data.startDate);
                axios
                    .get(
                        `/api/employer/${
                            jobTypet === "close" ? "save" : jobTypet
                        }/${type2t}/${props.location.state.id}`,
                    )
                    .then(({ data }) => {
                        // setId(data._id);
                        setTitle(data.title);
                        setCompany(
                            data.description.company
                                ? data.description.company
                                : "",
                        );
                        setEmployer(
                            data.description.employer
                                ? data.description.employer
                                : "",
                        );
                        setSponsored(data.sponsored ? data.sponsored : false);
                        setContact(
                            data.description.contact
                                ? data.description.contact
                                : "",
                        );

                        setProcedure(
                            data.description.procedure
                                ? data.description.procedure
                                : "",
                        );
                        setNumberApp(
                            data.description.count ? data.description.count : 0,
                        );
                        data.startDate &&
                            setStartDate(
                                `${new Date(data.startDate).getFullYear()}-${(
                                    "0" +
                                    (new Date(data.startDate).getMonth() + 1)
                                ).slice(-2)}-${(
                                    "0" + new Date(data.startDate).getDate()
                                ).slice(-2)}`,
                            );
                        data.startDate &&
                            setStartTime(
                                new Date(data.startDate).toLocaleTimeString(
                                    [],
                                    {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                        hour12: false,
                                    },
                                ),
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
                            data.description.about
                                ? data.description.about
                                : "",
                        );
                        setLine(
                            data.description.line ? data.description.line : "",
                        );

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
                            data.description.salary
                                ? data.description.salary
                                : 0,
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
                                ? Array.isArray(data.description.type)
                                    ? data.description.type[0]
                                    : data.description.type
                                : "",
                        );
                        setSuperSpecialization(data.superSpecialization);
                        setShowDetail(true);
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
                        }/${type2t}/${props.location.state.id}`,
                    )
                    .then(({ data }) => {
                        // setId(data._id);

                        setTitle(data.title);
                        setCompany(
                            data.description.company
                                ? data.description.company
                                : "",
                        );
                        setEmployer(
                            data.description.employer
                                ? data.description.employer
                                : "",
                        );
                        setSponsored(data.sponsored ? data.sponsored : false);

                        setContact(
                            data.description.contact
                                ? data.description.contact
                                : "",
                        );
                        setProcedure(
                            data.description.procedure
                                ? data.description.procedure
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
                            data.description.about
                                ? data.description.about
                                : "",
                        );
                        setLine(
                            data.description.line ? data.description.line : "",
                        );
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
                            data.description.salary
                                ? data.description.salary
                                : 0,
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
                                ? Array.isArray(data.description.type)
                                    ? data.description.type[0]
                                    : data.description.type
                                : "",
                        );
                        setSuperSpecialization(data.superSpecialization);

                        console.log(endDate);
                        setShowDetail(true);

                        // setTitle(data.title);
                    })
                    .catch((err) => {
                        console.log(err);
                        err.response && err.response.data
                            ? setMessError(err.response.data.err)
                            : setMessError("Error getting job");

                        toggleError();
                    });
        } else setShowDetail(true);
    }, []);
    return (
        <div>
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
                            className={`p-1 p-sm-2 nav-link`}>
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
                    {/* <div className='col-12 col-sm-5 px-0 pl-0 pl-sm-1'>
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
                    </div> */}
                </div>
            </Nav>
            <Form className='border-block p-1 p-md-5 mx-2 mx-md-auto m-1 m-md-3 box'>
                <h3>Post a Job</h3>
                <div className=' p-2 p-sm-3 mt-4' style={block}>
                    <div className='row justify-content-between'>
                        <h4 className='col-9 col-sm-10 pl-2'>Job Details</h4>
                        {/* <Button
                            onClick={toggleDetail}
                            className='col-3 col-sm-1'
                            style={{
                                background: "rgba(0,0,0,0)",
                                border: "0px solid transparent",
                            }}> */}

                        <FontAwesomeIcon
                            icon={showDetail ? faChevronUp : faChevronDown}
                            className='text-info'
                            size='md'
                            onClick={toggleDetail}
                            className='col-3 col-sm-1 my-auto'
                        />

                        {/* </Button> */}
                    </div>
                    {showDetail && (
                        <div className='row p-2'>
                            <div className='col-12 my-1 w-100'>
                                <Label className='m-1'>
                                    <h6>
                                        Title{" "}
                                        <span className='text-danger'>*</span>
                                    </h6>
                                </Label>
                                <Input
                                    placeholder='Title'
                                    className='form-control'
                                    ref={titleRef}
                                    name='Title'
                                    defaultValue={title}
                                    onChange={handleChange}
                                    required
                                    invalid={
                                        valid.title === undefined
                                            ? false
                                            : !valid.title
                                    }
                                />
                            </div>
                            {/* <div className='col-12 col-md-6 pr-md-2 my-1 w-100'>
                                <Label className='m-1'>
                                    <h6>Institute Name</h6>
                                </Label>
                                <Input
                                    placeholder='Company'
                                    name='Company'
                                    defaultValue={company}
                                    className='form-control'
                                    ref={companyRef}
                                    onChange={handleChange}
                                    required
                                />
                            </div> */}
                            <InputGroup className='col-12 col-sm-6 px-0 pr-md-2 my-1'>
                                <Label className='m-1'>
                                    <h6>
                                        Type{" "}
                                        <span className='text-danger'>*</span>
                                    </h6>
                                </Label>
                                <div style={{ width: "100%" }}>
                                    <Select
                                        // isMulti

                                        autosize={true}
                                        placeholder='Type'
                                        options={typeArray}
                                        // className='basic-multi-select'
                                        // classNamePrefix='select'
                                        className={
                                            valid.type !== undefined &&
                                            !valid.type
                                                ? "border-invalid"
                                                : ""
                                        }
                                        ref={typeRef}
                                        name='Type'
                                        defaultValue={
                                            type !== ""
                                                ? {
                                                      value: type,
                                                      label: type,
                                                  }
                                                : {
                                                      value: "Full-time",
                                                      label: "Full-time",
                                                  }
                                        }
                                        onChange={(e) => {
                                            console.log(e);
                                            handleChangeSelect(
                                                "Type",
                                                e ? e.value : "",
                                            );
                                        }}
                                    />
                                </div>
                            </InputGroup>
                            {/* <div className='col-12 col-md-6 pl-md-2 my-1 w-100'>
                                <Label className='m-1'>
                                    <h6>Number of Applicants</h6>
                                </Label>
                                <Input
                                    type='number'
                                    placeholder='Number of applicants'
                                    className='form-control'
                                    ref={numberAppRef}
                                    defaultValue={Number(numberApp)}
                                    name='NumberApp'
                                    onChange={handleChange}
                                    required
                                />
                            </div> */}
                            <InputGroup className='col-12 col-sm-6 pl-md-2 my-1'>
                                <Label className='m-1'>
                                    <h6>
                                        Location{" "}
                                        <span className='text-danger'>*</span>
                                    </h6>
                                </Label>
                                <div style={{ width: `100%` }} className=''>
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
                                        onChange={(e) => {
                                            console.log(e);
                                            handleChangeSelect(
                                                "Location",
                                                e ? e.value : "",
                                            );
                                        }}
                                        className={
                                            valid.location !== undefined &&
                                            !valid.location
                                                ? "border-invalid"
                                                : ""
                                        }
                                    />
                                </div>
                            </InputGroup>
                            <div className='col-12 col-md-6 pr-md-2 my-1'>
                                <Label className='m-1'>
                                    <h6>
                                        Profession{" "}
                                        <span className='text-danger'>*</span>
                                    </h6>
                                </Label>
                                <Select
                                    autosize={true}
                                    isClearable={true}
                                    placeholder='Profession'
                                    defaultValue={
                                        profession !== "" && {
                                            value: profession,
                                            label: profession,
                                        }
                                    }
                                    options={professionArray}
                                    ref={professionRef}
                                    onChange={(e) => {
                                        console.log(e);
                                        setSpecialization("");
                                        setSuperSpecialization("");
                                        handleChangeSelect(
                                            "Profession",
                                            e ? e.value : "",
                                        );
                                    }}
                                    className={
                                        valid.profession !== undefined &&
                                        !valid.profession
                                            ? "border-invalid"
                                            : ""
                                    }
                                />
                            </div>
                            <div className='col-12 col-md-6 pl-md-2 my-1'>
                                <Label className='m-1'>
                                    <h6>
                                        Specialization{" "}
                                        <span className='text-danger'>*</span>
                                    </h6>
                                </Label>
                                <Select
                                    autosize={true}
                                    isClearable={true}
                                    placeholder='Specialization'
                                    value={
                                        specialization !== ""
                                            ? {
                                                  value: specialization,
                                                  label: specialization,
                                              }
                                            : null
                                    }
                                    options={
                                        profession === ""
                                            ? []
                                            : specializationObj[profession]
                                    }
                                    ref={specializationRef}
                                    onChange={(e) => {
                                        console.log(e);

                                        setSuperSpecialization("");
                                        handleChangeSelect(
                                            "Specialization",
                                            e ? e.value : "",
                                        );
                                    }}
                                    className={
                                        valid.specialization !== undefined &&
                                        !valid.specialization
                                            ? "border-invalid"
                                            : ""
                                    }
                                />
                            </div>
                            <InputGroup className='col-12 my-1'>
                                <Label className='m-1'>
                                    <h6>Super-Specialization</h6>
                                </Label>
                                <div style={{ width: `100%` }}>
                                    <Select
                                        autosize={true}
                                        isClearable={true}
                                        placeholder='Super specialization'
                                        options={
                                            superSpecializationObj[
                                                `${profession}+${specialization}`
                                            ]
                                        }
                                        ref={superSpecializationRef}
                                        name='SuperSpecialization'
                                        value={
                                            superSpecialization === ""
                                                ? null
                                                : {
                                                      label: superSpecialization,
                                                      value: superSpecialization,
                                                  }
                                        }
                                        onChange={(e) => {
                                            console.log(e);
                                            handleChangeSelect(
                                                "SuperSpecialization",
                                                e ? e.value : "",
                                            );
                                        }}
                                    />
                                </div>
                            </InputGroup>
                            <InputGroup className='col-12 col-sm-6 pr-md-2 my-1'>
                                <Label className='m-1'>
                                    <h6>
                                        Experience{" "}
                                        <span className='text-danger'>*</span>
                                    </h6>
                                </Label>
                                <div style={{ width: `100%` }} className=''>
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
                                        className={
                                            valid.experience !== undefined &&
                                            !valid.experience
                                                ? "border-invalid"
                                                : ""
                                        }
                                    />
                                </div>
                            </InputGroup>

                            <InputGroup className='col-12 col-sm-6 pl-md-1 my-1'>
                                <Label className='m-1'>
                                    <h6>Salary/Fees</h6>
                                </Label>
                                <InputGroup className=''>
                                    <Input
                                        placeholder='salary'
                                        type='number'
                                        className='form-control '
                                        ref={salaryRef}
                                        defaultValue={Number(salary)}
                                        name='Salary'
                                        onChange={handleChange}
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
                                <Label className='m-1'>
                                    <h6>Incentives</h6>
                                </Label>
                                <div style={{ width: `100%` }} className=''>
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
                                        onChange={(e) => {
                                            console.log(e);
                                            handleChangeSelect("Incentives", e);
                                        }}
                                    />
                                </div>
                            </InputGroup>
                            {/* {!freelance && (
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
                                        ref={endDateRef}
                                        onChange={handleChange}
                                    />
                                </div>
                            )} */}
                        </div>
                    )}
                </div>

                <div className=' p-2 p-sm-3 my-2' style={block}>
                    <div className='row justify-content-between'>
                        <h4 className='col-9 col-sm-10 pl-2'>Description</h4>
                        <FontAwesomeIcon
                            icon={showSkill ? faChevronUp : faChevronDown}
                            className='text-info'
                            size='md'
                            onClick={toggleSkill}
                            className='col-3 col-sm-1 my-auto'
                        />
                    </div>
                    {showSkill && (
                        <FormGroup className='row p-2'>
                            <InputGroup className='col-12 my-1'>
                                <Label className='m-1'>
                                    <h6>
                                        Short Description{" "}
                                        <span className='text-danger'>*</span>
                                    </h6>
                                </Label>
                                <InputGroup className='w-100'>
                                    <Input
                                        type='textarea'
                                        placeholder='Short Description ..'
                                        ref={lineRef}
                                        className='form-control m-1'
                                        rows='4'
                                        name='Line'
                                        onChange={handleChange}
                                        defaultValue={line}
                                        invalid={
                                            valid.line === undefined
                                                ? false
                                                : !valid.line
                                        }
                                    />
                                </InputGroup>
                            </InputGroup>
                            {/* {  !(type === "Day Job" ||
                                            type === "Locum Position" )&& ( */}
                            <InputGroup className='col-12 my-1'>
                                <Label className='m-1'>
                                    <h6>Description</h6>
                                </Label>
                                <InputGroup className='w-100 '>
                                    <Input
                                        type='textarea'
                                        placeholder='Description ..'
                                        ref={skillsRef}
                                        className='form-control m-1'
                                        rows='3'
                                        name='Skills'
                                        onChange={handleChange}
                                        defaultValue={skills}
                                        disabled={
                                            type === "Day Job" ||
                                            type === "Locum Position"
                                        }
                                    />
                                </InputGroup>
                            </InputGroup>
                            {/* )} */}
                        </FormGroup>
                    )}
                </div>

                <div className=' p-2 p-sm-3 my-2' style={block}>
                    <div className='row justify-content-between'>
                        <h4 className='col-9 col-sm-10 pl-2'>Other Details</h4>
                        <FontAwesomeIcon
                            icon={showOtherDetail ? faChevronUp : faChevronDown}
                            className='text-info'
                            size='md'
                            onClick={toggleOtherDetail}
                            className='col-3 col-sm-1 my-auto'
                        />
                    </div>
                    {showOtherDetail && (
                        <FormGroup className='row p-2'>
                            <div className='col-12 col-md-6 my-1 pr-md-2'>
                                <Label className='m-1'>
                                    <h6>Employer Name</h6>
                                </Label>
                                <Input
                                    placeholder='Employer'
                                    className='form-control'
                                    name='Employer'
                                    defaultValue={
                                        employer === ""
                                            ? currentEmployer &&
                                              currentEmployer.description
                                                ? currentEmployer.description
                                                      .organization
                                                : employer
                                            : employer
                                    }
                                    onChange={handleChange}
                                    disabled
                                    required
                                />
                            </div>
                            <div className='col-12 col-md-6 pl-md-2 my-1'>
                                <Label className='m-1'>
                                    <h6>Posted Day</h6>
                                </Label>
                                <Input
                                    type='date'
                                    // name='date'
                                    // id='exampleDate'
                                    placeholder='date placeholder'
                                    // name='EndDate'
                                    defaultValue={new Date()
                                        .toISOString()
                                        .substring(0, 10)}
                                    // ref={endDateRef}
                                    // onChange={handleChange}
                                    disabled
                                />
                            </div>
                            <div className='col-12 my-1 w-100'>
                                <Label className='m-1'>
                                    <h6>
                                        Contact{" "}
                                        <span className='text-danger'>*</span>
                                    </h6>
                                </Label>
                                <InputGroup className='w-100'>
                                    <Input
                                        type='textarea'
                                        placeholder='Contact'
                                        className='form-control'
                                        name='Contact'
                                        defaultValue={
                                            contact === ""
                                                ? currentEmployer &&
                                                  currentEmployer.phone
                                                    ? currentEmployer.phone
                                                    : contact
                                                : contact
                                        }
                                        maxLength={50}
                                        onChange={handleChange}
                                        required
                                        invalid={
                                            valid.contact === undefined
                                                ? false
                                                : !valid.contact
                                        }
                                    />
                                </InputGroup>
                            </div>
                            <div className='col-12 row justify-content-start'>
                                {/* <InputGroup className='col-1 position-relative my-2 ml-2 pl-2 pr-0'>
                                    <Input
                                        type='checkbox'
                                        name=''
                                        defaultValue={sponsored}
                                        className='  position-absolute'
                                        style={{
                                            height: "1.2rem",
                                            width: "1.2rem",
                                        }}
                                        onChange={(e) =>
                                            // console.log(e.target.checked)
                                            setSponsored(e.target.checked)
                                        }
                                    />
                                </InputGroup> */}
                                <Label className='my-2 col-9 text-align-left m-1'>
                                    <Input
                                        type='checkbox'
                                        name=''
                                        defaultValue={sponsored}
                                        className='  position-absolute'
                                        style={{
                                            height: "1.1rem",
                                            width: "1.1rem",
                                        }}
                                        onChange={(e) =>
                                            // console.log(e.target.checked)
                                            setSponsored(e.target.checked)
                                        }
                                    />
                                    <span>
                                        <h5 className='ml-2 my-1'>Promote</h5>
                                    </span>
                                </Label>
                            </div>
                        </FormGroup>
                    )}
                </div>

                {(type === "Day Job" || type === "Locum Position") && (
                    <div>
                        <div
                            className='  p-2 p-sm-3 my-2'
                            style={{
                                height: "max-content",
                            }}
                            style={block}>
                            <h4 className='pl-2'>Day/Locum Jobs</h4>
                            {/* <div className='row justify-content-between'>
                        <div className='col-9 col-sm-10'>
                            <h4>Day/Locum</h4>
                        </div>
                        <div className='col-3 col-sm-1'>
                            <Input
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
                        </div>
                    </div> */}
                            {(type === "Day Job" ||
                                type === "Locum Position") && (
                                <FormGroup className='row p-2'>
                                    <InputGroup className='col-12  my-1 '>
                                        <Label className='my-1'>
                                            <h6>Procedure</h6>
                                        </Label>
                                        <InputGroup className='w-100'>
                                            <textarea
                                                placeholder='Procedure'
                                                // ref={lineRef}
                                                maxLength={140}
                                                className='form-control'
                                                rows='4'
                                                name='Procedure'
                                                onChange={handleChange}
                                                defaultValue={procedure}
                                            />
                                        </InputGroup>
                                    </InputGroup>
                                    <div className='col-12 row px-0'>
                                        <InputGroup className='col-12 col-md-6 my-1 pr-md-1'>
                                            <Label
                                                className='my-1 col-12'
                                                for='exampleDate'>
                                                <h6>Start-Date</h6>
                                            </Label>
                                            <Input
                                                type='date'
                                                name='StartDate'
                                                id='exampleDate'
                                                placeholder='date placeholder'
                                                min={`${new Date().getFullYear()}-${(
                                                    "0" +
                                                    (new Date().getMonth() + 1)
                                                ).slice(-2)}-${(
                                                    "0" + new Date().getDate()
                                                ).slice(-2)}`}
                                                max={`${date60.getFullYear()}-${(
                                                    "0" +
                                                    (date60.getMonth() + 1)
                                                ).slice(-2)}-${(
                                                    "0" + date60.getDate()
                                                ).slice(-2)}`}
                                                className=''
                                                onChange={handleChange}
                                                invalid={
                                                    valid.startDate ===
                                                    undefined
                                                        ? false
                                                        : !valid.startDate
                                                }

                                                // defaultValue={
                                                //     new Date(
                                                //         new Date().getTime() +
                                                //             60 *
                                                //                 24 *
                                                //                 60 *
                                                //                 60 *
                                                //                 1000,
                                                //     )
                                                // }
                                                // ref={endDateRef}
                                                // onChange={handleChange}
                                            />
                                        </InputGroup>
                                        {type === "Locum Position" && (
                                            <InputGroup className='col-12 col-md-6 my-1 pl-md-1'>
                                                <Label
                                                    className='my-1 col-12'
                                                    for='exampleDate'>
                                                    <h6>End-Date</h6>
                                                </Label>
                                                <Input
                                                    type='date'
                                                    name='EndDate'
                                                    id='exampleDate'
                                                    placeholder='date placeholder'
                                                    className=''
                                                    min={`${new Date().getFullYear()}-${(
                                                        "0" +
                                                        (new Date().getMonth() +
                                                            1)
                                                    ).slice(-2)}-${(
                                                        "0" +
                                                        new Date().getDate()
                                                    ).slice(-2)}`}
                                                    max={`${date90.getFullYear()}-${(
                                                        "0" +
                                                        (date90.getMonth() + 1)
                                                    ).slice(-2)}-${(
                                                        "0" + date90.getDate()
                                                    ).slice(-2)}`}
                                                    onChange={handleChange}
                                                    invalid={
                                                        valid.endDate ===
                                                        undefined
                                                            ? false
                                                            : !valid.endDate
                                                    }
                                                />
                                            </InputGroup>
                                        )}
                                    </div>
                                    {type === "Day Job" && (
                                        <div className='col-12 row px-0'>
                                            <InputGroup className='col-12 col-sm-6 my-1 pr-md-1'>
                                                <Label
                                                    className='pr-2 col-12'
                                                    for='exampleDate'>
                                                    <h6>Start Time</h6>
                                                </Label>
                                                {/* <Label for='exampleTime'>Time</Label> */}

                                                <Input
                                                    type='time'
                                                    name='StartTime'
                                                    id='exampleTime'
                                                    placeholder='time placeholder'
                                                    className=''
                                                    ref={startTimeRef}
                                                    min={`${time2.getHours()}:${time2.getMinutes()}`}
                                                    onChange={handleChange}
                                                    invalid={
                                                        valid.startTime ===
                                                        undefined
                                                            ? false
                                                            : !valid.startTime
                                                    }
                                                />
                                            </InputGroup>
                                            <InputGroup className='col-12 col-sm-6 my-1 pl-md-1 '>
                                                <Label
                                                    className='pr-2 col-12'
                                                    for='exampleDate'>
                                                    <h6>End Time</h6>
                                                </Label>
                                                {/* <Label for='exampleTime'>Time</Label> */}
                                                <Input
                                                    type='time'
                                                    name='EndTime'
                                                    id='exampleTime'
                                                    placeholder='time placeholder'
                                                    className=''
                                                    min={`${time2.getHours()}:${time2.getMinutes()}`}
                                                    // ref={endTimeRef}
                                                    onChange={handleChange}
                                                    invalid={
                                                        valid.endTime ===
                                                        undefined
                                                            ? false
                                                            : !valid.endTime
                                                    }
                                                />
                                            </InputGroup>
                                        </div>
                                    )}
                                </FormGroup>
                            )}
                        </div>
                        <div
                            className='  p-2 p-sm-3 my-2'
                            style={{
                                height: "max-content",
                            }}
                            style={block}>
                            <h4 className='pl-2'>Notify Applicants</h4>

                            <FormGroup>
                                {tempArr.filter(
                                    (obj) => obj.profession === profession,
                                ).length === 0 && (
                                    <h6 className='text-align-center'>
                                        No applicants
                                    </h6>
                                )}
                                {tempArr
                                    .filter(
                                        (obj) => obj.profession === profession,
                                    )
                                    .reverse()
                                    .slice(0, 10)
                                    .map(
                                        (x, index) =>
                                            x.profession === profession && (
                                                <div className='row my-1'>
                                                    <div className='col-1 position-relative'>
                                                        <Input
                                                            type='checkbox'
                                                            name=''
                                                            className='ml-0'
                                                            style={{
                                                                height:
                                                                    "1.1rem",
                                                                width: "1.1rem",
                                                            }}
                                                            onChange={(e) => {
                                                                console.log(
                                                                    e.target
                                                                        .checked,
                                                                );
                                                                let arr = attachApplicants;
                                                                if (
                                                                    e.target
                                                                        .checked
                                                                ) {
                                                                    arr[
                                                                        index
                                                                    ] = x;
                                                                } else {
                                                                    arr[
                                                                        index
                                                                    ] = undefined;
                                                                }
                                                                setAttachAppilcants(
                                                                    arr,
                                                                );
                                                                console.log(
                                                                    arr,
                                                                );
                                                            }}
                                                        />
                                                    </div>
                                                    <div className='col-8'>
                                                        {`${x.name}; ${
                                                            x.specialization
                                                        }, ${x.superSpecialization.join(
                                                            ", ",
                                                        )}`}
                                                    </div>
                                                    <div className='col-3'>
                                                        <a
                                                            href={`/profile/${x.id}`}
                                                            target='_blank'
                                                            className='link'>
                                                            View Profile
                                                            <FontAwesomeIcon
                                                                icon={
                                                                    faExternalLinkAlt
                                                                }
                                                                size='xs'
                                                                className='ml-2'
                                                            />
                                                        </a>
                                                    </div>
                                                </div>
                                            ),
                                    )}
                            </FormGroup>
                        </div>
                    </div>
                )}

                <FormGroup className='ml-auto mr-1 mt-3 w-100 text-align-end row justify-content-end'>
                    <div className='col-3 col-md-2 px-1'>
                        <Button
                            onClick={(e) => {
                                setMess("post");
                                toggle();
                            }}
                            className='w-100'
                            color='primary'>
                            Post
                        </Button>
                    </div>
                    <div className='col-3 col-md-2 px-1'>
                        <Button
                            onClick={(e) => {
                                save();
                            }}
                            className='w-100'
                            color='info'>
                            Save
                        </Button>
                    </div>
                </FormGroup>
            </Form>
            <Modal isOpen={modal} toggle={toggle} style={{ marginTop: "20vh" }}>
                <ModalHeader toggle={toggle} className='py-1'>
                    {mess === "save" && "Confirm Save"}
                    {mess === "post" && "Confirm Publish"}
                    {/* {mess.split("_")[0] === "accept" && "Confirm Accept"} */}
                </ModalHeader>
                <ModalBody className='py-3'>
                    {mess === "post" &&
                        "Are you sure you want to post this job ?"}
                    {mess === "save" &&
                        "Are you sure you want to save the job?"}
                </ModalBody>
                <ModalFooter className='py-1'>
                    {mess === "post" && (
                        <Button
                            size='sm'
                            color='primary'
                            onClick={(e) => {
                                toggle();
                                submit();
                            }}>
                            Post
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
                            Save
                        </Button>
                    )}
                    <Button color='secondary' size='sm' onClick={toggle}>
                        Cancel
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
export default PostJob;
