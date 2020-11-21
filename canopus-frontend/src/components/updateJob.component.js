import React, { useRef, useState, useEffect } from "react";
import { NavLink, useLocation, Link, useHistory } from "react-router-dom";

// import { useHistory } from "react-router";
import {
    Form,
    Label,
    FormGroup,
    Nav,
    NavItem,
    Button,
    Input,
    InputGroup,
    // InputGroupAddon,
    // InputGroupText,
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
    // faMapMarkerAlt,
    // faUser,
    // faEnvelope,
    // faArrowAltCircleDown,
    faPen,
    // faArrowAltCircleUp,
    faExternalLinkAlt,
    faChevronDown,
    faChevronUp,
} from "@fortawesome/free-solid-svg-icons";
const block = {
    borderRadius: " 0.25rem",
    border: "0.05rem solid #eeeeee",
    boxShadow: " 2px 2px 3px rgba(0, 0, 0, 0.1)",
    transition: "0.3s ease-in-out",
};
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
    // const companyRef = useRef(null);
    const skillsRef = useRef(null);
    // const numberAppRef = useRef(null);
    // const endDateRef = useRef(null);
    // const freelanceRef = useRef(null);
    // const dateRef = useRef(null);
    // const endTimeRef = useRef(null);
    const startTimeRef = useRef(null);

    const currentDate = new Date();
    const date60 = new Date(currentDate.setDate(currentDate.getDate() + 60));
    const date90 = new Date(currentDate.setDate(currentDate.getDate() + 30));
    const [job, setJob] = useState({});
    const [currentEmployer, setCurrentEmployer] = useState(null);

    const [showDetail, setShowDetail] = useState(false);
    const [showSkill, setShowSkill] = useState(false);
    const [showOtherDetail, setShowOtherDetail] = useState(false);

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
    const [type, setType] = useState("");

    const [salary, setSalary] = useState(0);
    const [line, setLine] = useState("");

    const [freelance, setFreelance] = useState(false);
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [startDate, setStartDate] = useState("");

    const [date, setDate] = useState("");
    const [type2, setType2] = useState("");
    const [jobType, setJobType] = useState("");
    const [modal, setModal] = useState(false);
    const [mess, setMess] = useState("");
    const [id, setId] = useState("");
    const [category, setCategory] = useState("");
    const [employer, setEmployer] = useState("");
    const [contact, setContact] = useState("");
    const [instituteName, setInstituteName] = useState("");
    const [procedure, setProcedure] = useState("");
    const [sponsored, setSponsored] = useState(false);
    const [applicants, setAppilcants] = useState([]);
    const [attachedApplicants2, setAttachedAppilcants2] = useState([]);

    const [modalError, setModalError] = useState(false);
    const [messError, setMessError] = useState("");
    const [valid, setValid] = useState({});
    const [tempArr, setTempArr] = useState([]);
    // const tempArr = [
    //     {
    //         id: "5f622665b56b692428d82f61",
    //         username: "Sparsh@jain",
    //         profession: "Physician/Surgeon",
    //         name: "Dr. sparsh",
    //         specialization: "General Medicine",
    //         superSpecialization: ["sp1", "sp2"],
    //     },

    //     {
    //         id: "2",
    //         username: "Kamal@gmal",
    //         profession: "Dentist",
    //         name: "Dr. Kamal ",
    //         specialization: "xyz",
    //         superSpecialization: ["sp1", "sp2"],
    //     },
    //     {
    //         id: "3",
    //         username: "Sushant@gmal",
    //         profession: "Physician/Surgeon",
    //         name: "Dr. sushi",
    //         specialization: "General Medicine",
    //         superSpecialization: ["sp1", "sp2"],
    //     },
    //     {
    //         id: "4",
    //         username: "Sushant@gmal",
    //         profession: "Physician/Surgeon",
    //         name: "Dr. sushi new",
    //         specialization: "General Medicine",
    //         superSpecialization: ["sp1", "sp2"],
    //     },
    // ];
    // let attachedApplicants = [];
    let incentivesArray = [],
        experienceArray = [],
        specializationArray = [],
        professionArray = [],
        locationArray = [],
        jobTypeArray = [],
        locumTypeArray = [],
        typeArray = [];
    let specializationObj = {},
        superSpecializationObj = {};
    if (props.data) {
        incentivesArray = props.data.incentive.map((opt) => ({
            label: opt,
            value: opt,
        }));
        experienceArray = props.data.experience.map((opt) => ({
            label: opt,
            value: opt,
        }));
        jobTypeArray = props.data.jobtype.map((opt) => ({
            label: opt,
            value: opt,
        }));
        locumTypeArray = props.data.locumtype.map((opt) => ({
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
    const toggle = (e) => {
        if (e === "discard" || e === "close") setModal(!modal);
        else {
            let newValid = {
                title: title !== "",
                type: type !== "",
                profession: profession !== "",
                specialization: specialization !== "",
                location: location !== "",
                experience: experience !== "",
                line: line !== "",
                salary: Number(salary) < 1000000000,
                contact: contact !== "",
            };

            if (type === "Locum Position") {
                newValid.startDate = startDate !== "";
                newValid.endDate = endDate !== "";
            }
            if (type === "Day Job") {
                newValid.startDate = startDate !== "";
                newValid.startTime = startTime !== "";
                newValid.endTime = endTime !== "";
            }

            console.log(newValid);
            setValid(newValid);
            const isValid = Object.values(newValid).every(
                (item) => item === true,
            );
            if (isValid) {
                if (e === "save") save();
                else setModal(!modal);
            } else {
                setModalError(true);
                setMessError("Please fill all the fields correctly!");
            }
        }
    };
    const toggleError = () => setModalError(!modalError);

    const toggleDetail = () => setShowDetail((prevState) => !prevState);
    const toggleSkill = () => setShowSkill((prevState) => !prevState);
    const toggleOtherDetail = () =>
        setShowOtherDetail((prevState) => !prevState);
    const handleChange = (e) => {
        // eval(`set${e.target.name}`)(e.target.value);
        const x = e.target.name.toLowerCase();
        eval(`set${e.target.name}`)(e.target.value);
        let newValid = { ...valid };
        newValid[x] = e.target.value !== "";
        if (x === "salary") {
            console.log(e.target.value);
            newValid[x] = Number(e.target.value) < 1000000000;
        }
        console.log(newValid);
        setValid(newValid);
    };
    const handleChangeSelect = (name, value) => {
        // eval(`set${name}`)(value);
        eval(`set${name}`)(value);
        const x = name.toLowerCase();
        let newValid = { ...valid };
        newValid[x] = value !== "";
        console.log(newValid);
        setValid(newValid);
    };
    const loc = useLocation();
    useEffect(() => {
        const [type2t, jobTypet] = props.location.search
            .substring(1)
            .split("&");
        setType2(type2t);
        setJobType(jobTypet);
        axios
            .get(`/api/employer/current`)
            .then(({ data }) => {
                console.log(data.user);
                setCurrentEmployer(data.user);

                if (data.user && data.user.acceptedApplicants)
                    setTempArr(data.user.acceptedApplicants);
            })
            .catch((err) => console.log(err));
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
                    console.log(data);
                    setJob(data);
                    setId(data._id);
                    setTitle(data.title);
                    setInstituteName(data.author.instituteName);
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
                    // data.attachedApplicants &&
                    //     setAppilcants(data.attachedApplicants);

                    // if (data.attachedApplicants)
                    //     setAttachedAppilcants2(data.attachedApplicants);
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
                    setType(
                        data.description.type
                            ? Array.isArray(data.description.type)
                                ? data.description.type[0]
                                : data.description.type
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
                    data.endDate &&
                        setEndDate(
                            `${new Date(data.endDate).getFullYear()}-${(
                                "0" +
                                (new Date(data.endDate).getMonth() + 1)
                            ).slice(-2)}-${(
                                "0" + new Date(data.endDate).getDate()
                            ).slice(-2)}`,
                        );
                    setSkills(
                        data.description.about ? data.description.about : "",
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
                            ? Array.isArray(data.description.type)
                                ? data.description.type[0]
                                : data.description.type
                            : "",
                    );
                    setSuperSpecialization(data.superSpecialization);

                    // console.log(endDate);
                    // setTitle(data.title);
                    setShowDetail(true);
                    console.log(data);
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
                    setJob(data);
                    setTitle(data.title);
                    setCompany(
                        data.description.company
                            ? data.description.company
                            : "",
                    );
                    setInstituteName(data.author.instituteName);

                    setEmployer(
                        data.description.employer
                            ? data.description.employer
                            : "",
                    );
                    // data.attachedApplicants &&
                    //     setAppilcants(data.attachedApplicants);
                    // if (data.attachedApplicants)
                    //     setAttachedAppilcants2(data.attachedApplicants);
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
                    if (data.description.type === "Day Job") {
                        setStartDate(
                            `${new Date(data.startDate).getFullYear()}-${(
                                "0" +
                                (new Date(data.startDate).getMonth() + 1)
                            ).slice(-2)}-${(
                                "0" + new Date(data.startDate).getDate()
                            ).slice(-2)}`,
                        );
                    }
                    data.endDate &&
                        setEndDate(
                            `${new Date(data.endDate).getFullYear()}-${(
                                "0" +
                                (new Date(data.endDate).getMonth() + 1)
                            ).slice(-2)}-${(
                                "0" + new Date(data.endDate).getDate()
                            ).slice(-2)}`,
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
                        data.description.about ? data.description.about : "",
                    );
                    setLine(data.description.line ? data.description.line : "");
                    // setAbout(
                    //     data.description.about ? data.description.about : "",
                    // );
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
                            ? Array.isArray(data.description.type)
                                ? data.description.type[0]
                                : data.description.type
                            : "",
                    );
                    setSuperSpecialization(data.superSpecialization);

                    setShowDetail(true);
                    console.log(data);

                    // setShowDetail(true);

                    // setTitle(data.title);
                })
                .catch((err) => {
                    console.log(err);
                    err.response && err.response.data
                        ? setMessError(err.response.data.err)
                        : setMessError("Error getting job");

                    toggleError();
                });
    }, []);
    const save = () => {
        // const jobType = "save";
        let type2;
        // setJobType("save");
        let job = {
            title: title,
            profession: profession,
            specialization: specialization,
            superSpecialization: superSpecialization,
            // instituteName: employer,

            description: {
                line: line.trim(),
                about: skills.trim(),
                experience: experience,
                incentives: incentives && incentives.map((x) => x.value),
                // type: type.map((x) => x.value),
                type: type,
                location: location,
                salary: salary,
                count: numberApp,
                company: company,
                employer: employer,
                contact: contact,
                procedure: procedure,
            },
        };
        if (type === "Day Job") {
            console.log("day");
            type2 = "freelance";
            if (startDate !== "")
                job.endDate = new Date(`${startDate} ${endTime}`).toISOString();
            if (startDate !== "")
                job.startDate = new Date(
                    `${startDate} ${startTime}`,
                ).toISOString();
            job.category = type;
        } else if (type === "Locum Position") {
            type2 = "freelance";
            if (startDate !== "")
                job.startDate = new Date(`${startDate}`).toISOString();
            if (endDate !== "")
                job.endDate = new Date(`${endDate}`).toISOString();
            job.category = "Locum";
        } else {
            job.category = "Full-time";
            type2 = "job";
        }
        console.log(job);

        axios
            .put(`/api/job/save/${props.match.params.id}`, job)
            .then((data) => {
                console.log(data);
                if (data.status === 200) {
                    setMessError("Saved Successfully !");
                    toggleError();
                    window.location = "/applications";
                }

                //  window.location = "/search-jobs";
            })
            .catch((err) => {
                console.log(err);
                console.log(err.response);
                const error =
                    err.response && err.response.data
                        ? err.response.data.err
                        : "";
                if (
                    err.response &&
                    err.response.data &&
                    err.response.data.err &&
                    typeof err.response.data.err === "object"
                )
                    setMessError("Something went wrong !");
                else
                    err.response && err.response.data
                        ? setMessError(err.response.data.err)
                        : setMessError("Error saving job");
                toggleError();
            });
        console.log(job);
    };
    const submit = () => {
        // setjobType
        let type2;
        setModal(false);
        let attArr = tempArr.filter((obj) =>
            attachedApplicants2.includes(obj.id),
        );

        let myJob = {
            title: title,
            profession: profession,
            specialization: specialization,
            superSpecialization: superSpecialization,
            // sponsored: sponsored,
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
                company: company,
                employer: employer,
                contact: contact,
                procedure: procedure,
            },
        };
        if (attArr.length > 0) myJob.attachedApplicants = attArr;

        if (type === "Day Job") {
            type2 = "freelance";
            if (startDate !== "")
                myJob.endDate = new Date(
                    `${startDate} ${endTime}`,
                ).toISOString();
            if (startDate !== "")
                myJob.startDate = new Date(
                    `${startDate} ${startTime}`,
                ).toISOString();
            myJob.category = type;
        } else if (type === "Locum Position") {
            type2 = "freelance";
            if (endDate !== "")
                myJob.endDate = new Date(`${endDate}`).toISOString();
            if (startDate !== "")
                myJob.startDate = new Date(`${startDate}`).toISOString();
            myJob.category = "Locum";
        } else {
            type2 = "job";
            myJob.category = "Full-time";
            //   job.expireAt =
            //       endDate !== ""
            //           ? new Date(endDate).toISOString()
            //           : new Date(
            //                 new Date() + 45 * 24 * 60 * 60 * 1000,
            //             ).toISOString();
        }
        console.log(myJob);
        if (jobType === "save")
            axios
                .put(`/api/job/activate/${props.match.params.id}`, myJob)
                .then((data) => {
                    console.log(data);
                    if (data.status === 200) {
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
                .put(`/api/job/post/${props.match.params.id}`, myJob)
                .then((data) => {
                    console.log(data);
                    if (data.status === 200) {
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
    const extend = () => {
        if (jobType === "post")
            axios
                .put(`/api/job/extend/${props.match.params.id}`)
                .then((data) => {
                    console.log(data);
                    setMessError(`Job extended`);
                    toggleError();
                    window.location = "/applications";
                })
                .catch((err) => {
                    console.log(err.response);
                    const error = err.response.data
                        ? err.response.data.err
                        : "";
                    // alert("Unable to post job : " + error);
                    err.response.data
                        ? setMessError(err.response.data.err)
                        : setMessError("Error extending job");

                    toggleError();
                });
        if (jobType === "close")
            axios
                .put(`/api/job/extend/expired/${props.match.params.id}`)
                .then((data) => {
                    console.log(data);
                    setMessError(`Job extended`);
                    toggleError();
                    window.location = "/applications";
                })
                .catch((err) => {
                    console.log(err.response);
                    const error = err.response.data
                        ? err.response.data.err
                        : "";
                    // alert("Unable to post job : " + error);
                    err.response.data
                        ? setMessError(err.response.data.err)
                        : setMessError("Error extending job");

                    toggleError();
                });
    };
    return (
        <div className='p-2 p-md-0 mx-sm-auto col-12 col-md-10 col-xl-8'>
            <Nav tabs className='justify-content-between '>
                <div className='row justify-content-start px-0 col-12 col-sm-7'>
                    <NavItem className='mx-1 mx-sm-2'>
                        <NavLink
                            to='/employer'
                            // onClick={() => {
                            //     this.toggleTab("1");
                            // }}
                            style={{ borderColor: "transparent" }}
                            className={`p-1 p-sm-2 nav-link`}>
                            <h6>Overview</h6>
                        </NavLink>
                    </NavItem>
                    <NavItem className='mx-1 mx-sm-2'>
                        <NavLink
                            to='/applications'
                            className={`p-1 p-sm-2 nav-link active-tab`}>
                            <h6>Jobs</h6>
                        </NavLink>
                    </NavItem>
                </div>
                <div className='col-12 col-sm-5 row px-0 justify-content-around justify-content-sm-end'>
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
            <Form className='border-block'>
                <h3 className='p-2 px-md-0'>Edit a Job</h3>

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
                                    maxLength={100}
                                    defaultValue={title}
                                    onChange={handleChange}
                                    invalid={
                                        valid.title === undefined
                                            ? false
                                            : !valid.title
                                    }
                                    required
                                />
                            </div>
                            {/* <div className='col-12 col-md-6 pr-md-2 my-1 w-100'>
                                <Label className='m-1'>
                                    <h6>Institute Name</h6>
                                </Label>
                                <input
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
                                        options={
                                            job.category === "Locum" ||
                                            job.category === "Day Job"
                                                ? locumTypeArray
                                                : jobTypeArray
                                        }
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
                                                : null
                                        }
                                        onChange={(e) => {
                                            console.log(e);
                                            handleChangeSelect(
                                                "Type",
                                                e ? e.value : "",
                                            );
                                        }}
                                        isDisabled={jobType !== "save"}
                                    />
                                </div>
                            </InputGroup>
                            {/* <div className='col-12 col-md-6 pl-md-2 my-1 w-100'>
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
                                        className={
                                            valid.location !== undefined &&
                                            !valid.location
                                                ? "border-invalid"
                                                : ""
                                        }
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
                            <div className='col-12 col-md-6 pr-md-2 my-1'>
                                <Label className='m-1'>
                                    <h6>
                                        Profession{" "}
                                        <span className='text-danger'>*</span>
                                    </h6>
                                </Label>
                                <Select
                                    autosize={true}
                                    isDisabled={jobType === "post"}
                                    isClearable={true}
                                    placeholder='Profession'
                                    value={
                                        profession === ""
                                            ? null
                                            : {
                                                  value: profession,
                                                  label: profession,
                                              }
                                    }
                                    className={
                                        valid.profession !== undefined &&
                                        !valid.profession
                                            ? "border-invalid"
                                            : ""
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
                                    isDisabled={jobType === "post"}
                                    value={
                                        specialization !== ""
                                            ? {
                                                  value: specialization,
                                                  label: specialization,
                                              }
                                            : null
                                    }
                                    className={
                                        valid.specialization !== undefined &&
                                        !valid.specialization
                                            ? "border-invalid"
                                            : ""
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
                                />
                            </div>
                            <InputGroup className='col-12 my-1'>
                                <Label className='m-1'>
                                    <h6>Super/Sub Specialization</h6>
                                </Label>
                                <div style={{ width: `100%` }}>
                                    <Select
                                        autosize={true}
                                        placeholder='Super/Sub Specialization'
                                        options={
                                            superSpecializationObj[
                                                `${profession}+${specialization}`
                                            ]
                                        }
                                        ref={superSpecializationRef}
                                        name='SuperSpecialization'
                                        value={
                                            superSpecialization !== ""
                                                ? {
                                                      value: superSpecialization,
                                                      label: superSpecialization,
                                                  }
                                                : null
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
                                        className={
                                            valid.experience !== undefined &&
                                            !valid.experience
                                                ? "border-invalid"
                                                : ""
                                        }
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

                            <InputGroup className='col-12 col-sm-6 pl-md-1 my-1'>
                                <Label className='m-1'>
                                    <h6>Salary/Fees (for Locum/Day Jobs)</h6>
                                </Label>
                                <InputGroup className=''>
                                    <Input
                                        placeholder='Salary'
                                        type='number'
                                        className='form-control '
                                        ref={salaryRef}
                                        defaultValue={Number(salary)}
                                        name='Salary'
                                        onChange={handleChange}
                                        invalid={
                                            valid.salary === undefined
                                                ? false
                                                : !valid.salary
                                        }
                                    />
                                </InputGroup>
                            </InputGroup>
                            <InputGroup className='col-12'>
                                <Label className='m-1'>
                                    <h6>Incentives</h6>
                                </Label>
                                <div style={{ width: `100%` }} className=''>
                                    <Select
                                        isMulti
                                        autosize={true}
                                        placeholder='Incentives'
                                        options={incentivesArray}
                                        // className='basic-multi-select'
                                        // classNamePrefix='select'

                                        isDisabled={
                                            type === "Day Job" ||
                                            type === "Locum Position"
                                        }
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
                                        defaultValue={line === "" ? null : line}
                                        invalid={
                                            valid.line === undefined
                                                ? false
                                                : !valid.line
                                        }
                                    />
                                </InputGroup>
                            </InputGroup>
                            {!freelance && (
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
                                            onChange={(e) => {
                                                console.log(e.target);
                                                console.log(skills);
                                                setSkills(e.target.value);
                                            }}
                                            defaultValue={skills}
                                        />
                                    </InputGroup>
                                </InputGroup>
                            )}
                        </FormGroup>
                    )}
                </div>

                <div className=' p-2 p-sm-3 my-2' style={block}>
                    <div className='row justify-content-between'>
                        <h4 className='col-9 col-sm-10 pl-2'>Other Details</h4>
                        <FontAwesomeIcon
                            icon={showOtherDetail ? faChevronUp : faChevronDown}
                            // className='text-info'
                            size='md'
                            onClick={toggleOtherDetail}
                            className='col-3 col-sm-1 my-auto'
                        />
                    </div>
                    {showOtherDetail && (
                        <FormGroup className='row p-2'>
                            <div className='col-12 col-md-6 my-1 pr-md-2'>
                                <Label className='m-1'>
                                    <h6>Employer</h6>
                                </Label>
                                <Input
                                    placeholder='Employer'
                                    className='form-control'
                                    name='Employer'
                                    value={instituteName}
                                    // onChange={handleChange}
                                    disabled={true}
                                    // required
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
                                        value={contact}
                                        onChange={handleChange}
                                        invalid={
                                            valid.contact === undefined
                                                ? false
                                                : !valid.contact
                                        }
                                        required
                                    />
                                </InputGroup>
                            </div>
                        </FormGroup>
                    )}
                </div>

                {(type === "Day Job" || type === "Locum Position") && (
                    <div
                        className='  p-2 p-sm-3 my-2'
                        style={{
                            height: "max-content",
                        }}
                        style={block}>
                        <h4 className='pl-2'>Day/Locum Jobs</h4>
                        {(type === "Day Job" || type === "Locum Position") && (
                            <div>
                                <FormGroup className='row p-2'>
                                    <InputGroup className='col-12  my-1 '>
                                        <Label className='my-1'>
                                            <h6>Procedure</h6>
                                        </Label>
                                        <InputGroup className='w-100'>
                                            <textarea
                                                placeholder='Procedure'
                                                // ref={lineRef}
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
                                                <h6>
                                                    Start-Date{" "}
                                                    <span className='text-danger'>
                                                        *
                                                    </span>
                                                </h6>
                                            </Label>
                                            <Input
                                                type='date'
                                                name='StartDate'
                                                id='exampleDate'
                                                placeholder='date placeholder'
                                                defaultValue={startDate}
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
                                                required
                                                invalid={
                                                    valid.startDate ===
                                                    undefined
                                                        ? false
                                                        : !valid.startDate
                                                }
                                            />
                                        </InputGroup>
                                        {type === "Locum Position" && (
                                            <InputGroup className='col-12 col-md-6 my-1 pl-md-1'>
                                                <Label
                                                    className='my-1 col-12'
                                                    for='exampleDate'>
                                                    <h6>
                                                        End-Date{" "}
                                                        <span className='text-danger'>
                                                            *
                                                        </span>
                                                    </h6>
                                                </Label>
                                                <Input
                                                    type='date'
                                                    name='EndDate'
                                                    id='exampleDate'
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
                                                    placeholder='date placeholder'
                                                    className=''
                                                    onChange={handleChange}
                                                    invalid={
                                                        valid.endDate ===
                                                        undefined
                                                            ? false
                                                            : !valid.endDate
                                                    }
                                                    defaultValue={endDate}
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
                                                    <h6>
                                                        Start Time{" "}
                                                        <span className='text-danger'>
                                                            *
                                                        </span>
                                                    </h6>
                                                </Label>
                                                {/* <Label for='exampleTime'>Time</Label> */}
                                                <Input
                                                    type='time'
                                                    name='StartTime'
                                                    id='exampleTime'
                                                    placeholder='time placeholder'
                                                    className=''
                                                    ref={startTimeRef}
                                                    onChange={handleChange}
                                                    defaultValue={startTime}
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
                                                    <h6>
                                                        End Time{" "}
                                                        <span className='text-danger'>
                                                            *
                                                        </span>
                                                    </h6>
                                                </Label>
                                                {/* <Label for='exampleTime'>Time</Label> */}
                                                <Input
                                                    type='time'
                                                    name='EndTime'
                                                    id='exampleTime'
                                                    placeholder='time placeholder'
                                                    className=''
                                                    // ref={endTimeRef}

                                                    onChange={handleChange}
                                                    invalid={
                                                        valid.endTime ===
                                                        undefined
                                                            ? false
                                                            : !valid.endTime
                                                    }
                                                    defaultValue={endTime}
                                                />
                                            </InputGroup>
                                        </div>
                                    )}
                                </FormGroup>
                            </div>
                        )}
                    </div>
                )}
                {(type === "Day Job" || type === "Locum Position") && (
                    <div
                        className='  p-2 p-sm-3 my-2'
                        style={{
                            height: "max-content",
                        }}
                        style={block}>
                        <h4 className='pl-2'>Notify Applicants</h4>

                        <FormGroup>
                            {tempArr.filter(
                                (obj) =>
                                    obj.profession === profession &&
                                    (obj.profession === "Physician/Surgeon"
                                        ? obj.specialization === specialization
                                        : true),
                            ).length === 0 && (
                                <h6 className='text-align-center'>
                                    No applicants
                                </h6>
                            )}
                            {tempArr
                                .filter(
                                    (obj) =>
                                        obj.profession === profession &&
                                        (obj.profession === "Physician/Surgeon"
                                            ? obj.specialization ===
                                              specialization
                                            : true),
                                )
                                .reverse()
                                .slice(0, 10)
                                .map(
                                    (x, index) =>
                                        x.profession === profession && (
                                            <div className='row my-1 col-12 px-0'>
                                                <div className='col-1 position-relative'>
                                                    <Input
                                                        type='checkbox'
                                                        name=''
                                                        className='ml-0'
                                                        style={{
                                                            height: "1.1rem",
                                                            width: "1.1rem",
                                                        }}
                                                        disabled={
                                                            job.attachedApplicants
                                                                ? job.attachedApplicants
                                                                      .map(
                                                                          (a) =>
                                                                              a.id,
                                                                      )
                                                                      .includes(
                                                                          x.id,
                                                                      )
                                                                : false
                                                        }
                                                        defaultChecked={
                                                            job.attachedApplicants
                                                                ? job.attachedApplicants
                                                                      .map(
                                                                          (a) =>
                                                                              a.id,
                                                                      )
                                                                      .includes(
                                                                          x.id,
                                                                      )
                                                                : true
                                                        }
                                                        onChange={(e) => {
                                                            console.log(
                                                                e.target
                                                                    .checked,
                                                            );
                                                            let arr = attachedApplicants2;
                                                            if (
                                                                e.target.checked
                                                            ) {
                                                                arr.push(x.id);
                                                            } else
                                                                arr = arr.filter(
                                                                    (z) =>
                                                                        z !==
                                                                        x.id,
                                                                );

                                                            setAttachedAppilcants2(
                                                                arr,
                                                            );
                                                            console.log(job);
                                                            console.log(arr);
                                                        }}
                                                    />
                                                </div>
                                                <div className='col-10 col-sm-8'>
                                                    {`${x.name}; ${
                                                        x.specialization
                                                    }, ${x.superSpecialization.join(
                                                        ", ",
                                                    )}`}
                                                </div>
                                                <div className='col-12 col-sm-3 text-align-center'>
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
                )}
                {/* {(currentDate - new Date(job.expireAt)) / (1000 * 3600 * 24)} */}
                <FormGroup className='ml-auto mr-1 mt-3 w-100 text-align-end row justify-content-end'>
                    {jobType === "post" &&
                        type !== "Day Job" &&
                        type !== "Locum Position" &&
                        job.extension == 1 &&
                        (new Date() - new Date(job.expireAt)) /
                            (1000 * 3600 * 24) <=
                            10 && (
                            <div className='col-3 col-md-2 px-1'>
                                <Button
                                    onClick={(e) => {
                                        setMess("extend");
                                        // history.push({
                                        //     pathname: "/post",
                                        //     state: { id, type2, jobType },
                                        // });
                                        toggle();
                                    }}
                                    className='w-100'
                                    color='emp-secondary'>
                                    Extend
                                </Button>
                            </div>
                        )}
                    {jobType === "close" &&
                        type !== "Day Job" &&
                        type !== "Locum Position" &&
                        job.status === "Active" &&
                        job.extension === 1 && (
                            <div className='col-3 col-md-2 px-1'>
                                <Button
                                    onClick={(e) => {
                                        setMess("extend");
                                        // history.push({
                                        //     pathname: "/post",
                                        //     state: { id, type2, jobType },
                                        // });
                                        toggle();
                                    }}
                                    className='w-100'
                                    color='emp-secondary'>
                                    Extend
                                </Button>
                            </div>
                        )}
                    {jobType === "post" && (
                        <div className='col-3 col-md-2 px-1'>
                            <Button
                                onClick={(e) => {
                                    setMess("close");
                                    // history.push({
                                    //     pathname: "/post",
                                    //     state: { id, type2, jobType },
                                    // });
                                    toggle("close");
                                }}
                                className='w-100'
                                color='emp-secondary'>
                                Close
                            </Button>
                        </div>
                    )}
                    {jobType === "save" && (
                        <div className='col-3 col-md-2 px-1'>
                            <Button
                                onClick={(e) => {
                                    setMess("save");
                                    toggle("save");
                                }}
                                className='w-100'
                                color='emp-secondary'>
                                Save
                            </Button>
                        </div>
                    )}
                    {jobType === "save" && (
                        <div className='col-3 col-md-2 px-1'>
                            <Button
                                onClick={(e) => {
                                    setMess("discard");
                                    toggle("discard");
                                }}
                                className='w-100'
                                color='emp-secondary'>
                                Discard
                            </Button>
                        </div>
                    )}
                    {(jobType === "close" || jobType === "post") && (
                        <div className='col-3 col-md-2 px-1'>
                            <Button
                                className='w-100'
                                color='emp-secondary'
                                onClick={(e) => {
                                    history.push({
                                        pathname: "/post",
                                        state: { id, type2, jobType },
                                    });
                                }}>
                                Copy
                            </Button>
                        </div>
                    )}
                    {(jobType === "post" || jobType === "save") && (
                        <div className='col-4 col-md-2 px-1'>
                            <Button
                                onClick={(e) => {
                                    jobType === "save"
                                        ? setMess("activate")
                                        : setMess("post");
                                    toggle();
                                }}
                                className='w-100'
                                color='emp-primary'>
                                {jobType === "post" ? "Update" : "Post"}
                            </Button>
                        </div>
                    )}
                </FormGroup>
            </Form>
            <Modal isOpen={modal} toggle={toggle} style={{ marginTop: "20vh" }}>
                <ModalHeader toggle={toggle} className='py-1'>
                    {mess === "save" && "Confirm Save"}
                    {mess === "post" && "Update Job?"}
                    {mess === "activate" && "Post Job?"}
                    {mess === "discard" && "Discard Job?"}
                    {mess === "close" && "Close Job?"}
                    {mess === "extend" && "Extend Job?"}

                    {/* {mess.split("_")[0] === "accept" && "Confirm Accept"} */}
                </ModalHeader>
                {/* <ModalHeader toggle={toggle}>
                    {mess === "promote" && "Promote"}
                </ModalHeader> */}
                <ModalBody>
                    {mess === "promote" &&
                        "Promote this job for prominent placement in the job search. You may have limited slots for promotions."}
                    {mess === "post" &&
                        "Updating the job will make the updates visible to applicants."}
                    {mess === "discard" &&
                        "You will not be able to recover this job."}
                    {mess === "close" &&
                        "Applicants will no longer be able to see or apply for this job."}
                    {mess === "extend" &&
                        "Are you sure you want to extend this job ?"}
                    {mess === "activate" &&
                        " Posting this Job will make it visible to applicants."}
                </ModalBody>
                <ModalFooter className='font-16px'>
                    <Button color='emp-secondary' size='sm' onClick={toggle}>
                        {mess === "discard" && "Keep Job"}
                        {mess === "close" && "Keep it Open"}
                        {(mess === "post" || mess === "activate") && "Wait"}
                        {mess === "promote" && "No"}
                        {mess === "extend" && "No"}
                    </Button>
                    {mess === "post" && (
                        <Button
                            size='sm'
                            color='emp-primary'
                            onClick={(e) => {
                                toggle();
                                submit();
                            }}>
                            Update Job
                        </Button>
                    )}
                    {mess === "save" && (
                        <Button
                            size='sm'
                            color='emp-primary'
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
                            color='emp-primary'
                            onClick={(e) => {
                                toggle();
                                discard();
                            }}>
                            Delete Job
                        </Button>
                    )}
                    {mess === "close" && (
                        <Button
                            size='sm'
                            color='emp-primary'
                            onClick={(e) => {
                                toggle();
                                discard();
                            }}>
                            Close Job
                        </Button>
                    )}
                    {mess === "extend" && (
                        <Button
                            size='sm'
                            color='emp-primary'
                            onClick={(e) => {
                                toggle();
                                extend();
                            }}>
                            Extend Job
                        </Button>
                    )}
                    {mess === "activate" && (
                        <Button
                            size='sm'
                            color='emp-primary'
                            onClick={(e) => {
                                toggle();
                                submit();
                            }}>
                            Post Job
                        </Button>
                    )}
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
                <ModalFooter className='p-1'>
                    <Button size='sm' color='emp-primary' onClick={toggleError}>
                        Ok
                    </Button>
                </ModalFooter>
            </Modal>
        </div>
    );
};
export default UpdateJob;
