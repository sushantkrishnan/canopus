import React, { Component } from "react";
import {
    Label,
    Input,
    FormGroup,
    Button,
    Progress,
    Modal,
    InputGroup,
    ModalHeader,
    ModalBody,
    ModalFooter,
    ButtonGroup,
    CustomInput,
    Alert,
    InputGroupAddon,
    InputGroupText,
} from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "../stylesheets/updateUser.css";
// import data from "../data";

import {
    faPen,
    faPlus,
    faFileAlt,
    faTrash,
    faTimes,
} from "@fortawesome/free-solid-svg-icons";
import Axios from "axios";
import { BlobServiceClient } from "@azure/storage-blob";
import imageCompression from "browser-image-compression";
import Select from "react-select";
var weekdays = new Array(
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
);

export default class UpdateUser extends Component {
    constructor(props) {
        super(props);
        this.state = {
            title: "",
            logo: "",
            salutation: "",
            firstName: "",
            lastName: "",
            gender: "Male",
            dob: "",
            email: "",
            phone: null,
            username: "",

            city: "",
            state: "",
            country: "",

            profession: "",
            specialization: "",
            superSpecialization: [],
            education: [
                {
                    degree: "",
                    speciality: "",
                },
            ],
            locum: false,
            startTime: "",
            endTime: "",
            resume: "",
            days: [],
            availability: [{ startTime: "", endTime: "", days: [] }],
            progress: 0,
            prevResume: "",
            //===============
            line: "",
            pin: "",
            speciality: "",
            organization: "",
            type: "",
            links: [""],
            youtube: [""],
            image: [],
            about: "",
            about2: "",
            employeeCount: 0,
            noLinks: 1,
            noYoutube: 1,
            lat: null,
            lng: null,
            id: null,
            progress: 0,
            loading: false,
            uploadingLogo: false,
            uploadingImage: false,
            beds: 0,
            OTs: 0,
            ICUs: 0,
            modalError: false,
            modalMess: "",
            showError: false,
            resumeError: "",
            showError2: false,
            logoError: "",
            valid: {
                organization: true,
                type: true,
                speciality: true,
                city: true,
                state: true,
                specialization: true,
                firstName: true,
                lastName: true,
                phone: true,
                salutation: true,
                title: true,
                gender: true,
                dob: true,
            },
        };
        this.resume = React.createRef();
        this.logo = React.createRef();
        this.handleChange = this.handleChange.bind(this);
        this.update = this.update.bind(this);
        this.setCoordinates = this.setCoordinates.bind(this);

        this.uploadLogo = this.uploadLogo.bind(this);
        this.toggleModalError = this.toggleModalError.bind(this);
        this.uploadResume = this.uploadResume.bind(this);
    }
    toggleModalError() {
        this.setState({
            modalError: !this.state.modalError,
        });
    }
    setCoordinates(coords) {
        this.setState({
            lat: coords.lat,
            lng: coords.lng,
        });
    }
    handleChangeSelect(name, value, type, i) {
        if (i !== undefined) {
            let links = this.state[type];
            if (name === "days" && value && value.length > 0) {
                value = value.map((e) => e.value);
            }
            let obj = links[i];
            obj = { ...obj, [name]: value };
            links[i] = obj;
            console.log(links);
            this.setState({
                [type]: links,
            });
        }
        console.log(value, name);
        if (
            (name === "days" || name === "superSpecialization") &&
            value &&
            value.length > 0
        ) {
            value = value.map((e) => e.value);
        } else if (
            (name === "days" || name === "superSpecialization") &&
            value === null
        )
            value = [];
        this.setState({
            [name]: value,
            valid: {
                ...this.state.valid,
                [name]: value !== "",
            },
        });
    }

    handleChange(e, index, name, type) {
        // e.preventDefault();
        if (index !== undefined) {
            let links = this.state[type];
            let obj = links[index];

            obj = { ...obj, [name]: e.target.value };
            if (type === "education") {
                if (obj.startYear === "") obj.startYear = "1975";
                if (obj.endYear === "") obj.endYear = "2020";
            }
            links[index] = obj;
            console.log(links);
            this.setState({
                [e.target.name]: links,
            });
        } else if (e.target.name === "phone") {
            console.log(e.target.value);
            // newValid[x] = Number(e.target.value) < 1000000000;
            this.setState({
                [e.target.name]: e.target.value,

                valid: {
                    ...this.state.valid,
                    [e.target.name]: e.target.value.length === 10,
                },
            });
        } else
            this.setState({
                [e.target.name]: e.target.value,
                valid: {
                    ...this.state.valid,
                    [e.target.name]: e.target.value !== "",
                },
            });
        // e.preventDefault();
    }

    uploadResume(e) {
        this.setState({ loading: true });
        const files = Array.from(e.target.files);
        if (files.length !== 0) {
            this.setState({ uploaded: false });

            const file = files[0];
            console.log("------------------------------");
            console.log(file.size);
            // console.log(file);
            // console.log(file.type.split("."));
            if (
                !["pdf", "doc", "docx", "rtf"].includes(file.name.split(".")[1])
            ) {
                this.setState({
                    loading: false,
                    showError: true,
                    resumeError:
                        "Invalid File - Please ensure the file size is less than 5MB and file type is doc, docx, rtf or pdf.",
                });
                this.resume.current.value = "";
                return;
            } else if (file.size >= 5000000) {
                this.setState({
                    // modalError: true,
                    // modalMess: "File size should be less than 5MB",
                    loading: false,
                    showError: true,
                    resumeError:
                        "Invalid File - Please ensure the file size is less than 5MB and file type is doc, docx, rtf or pdf.",
                });
                return;
            } else {
                this.setState({
                    showError: false,
                });
            }
            console.log("chal rha h");
            let reader = new FileReader();
            reader.readAsArrayBuffer(file);
            reader.onload = () => {
                console.log(reader);
                // var matches = reader.result.match(
                //     /^data:([A-Za-z-+\/]+);base64,(.+)$/,
                // );
                // console.log(matches);
                // var buffer = new Buffer(matches[2], "base64");
                const resume = {
                    name: `${this.state.id}_${file.name}`,
                    data: reader.result,
                    mimeType: file.type,
                    size: file.size,
                };
                console.log(resume);
                if (resume.size <= 5000000)
                    Axios.post(`/api/upload`, {
                        context: `${this.state.id}_${file.name}`,
                    })
                        .then(({ data }) => {
                            const sas = data.token;
                            this.uploadToStorage(
                                "curoidprod",
                                sas,
                                resume,
                            ).then((res) => {
                                console.log(res);
                                const url = `https://curoidprod.blob.core.windows.net/user-image/${this.state.id}_${file.name}`;
                                console.log(url);
                                this.setState({
                                    resume: url,
                                    prevResume: "",
                                    loading: false,
                                    uploadingLogo: false,
                                    showError: false,
                                    progress: 0,
                                });
                                // this.update();
                                this.setState({ uploaded: true });
                            });
                        })
                        .catch((e) => console.log(e));
                else {
                    this.setState({
                        showError: true,
                        resumeError:
                            "Invalid File - Please ensure the file size is less than 5MB and file type is doc, docx, rtf or pdf.",
                        uploading: false,
                        loading: false,
                        progress: 0,
                    });
                    this.resume.current.value = "";
                }
            };
        }
    }
    update() {
        const isValid = Object.values(this.state.valid).every(
            (item) => item === true,
        );
        const emp =
            this.state.firstName === "" ||
            this.state.lastName === "" ||
            this.state.gender === "" ||
            this.state.city === "" ||
            this.state.state === "" ||
            this.state.phone === "" ||
            this.state.profession === "" ||
            this.state.specialization === "" ||
            this.state.title === "";

        console.log(isValid);
        console.log(emp);
        if (!isValid || emp) {
            this.setState({
                modalError: true,
                modalMess: "Please fill the required fields !",
            });
        } else {
            let user = {
                image: this.state.logo,
                title: this.state.title,
                salutation:
                    this.state.salutation === "" ? "Dr" : this.state.salutation,
                firstName: this.state.firstName,
                lastName: this.state.lastName,
                gender:
                    this.state.gender === undefined || this.state.gender === ""
                        ? "male"
                        : this.state.gender,
                dob: this.state.dob === undefined ? "" : this.state.dob,
                address: {
                    city: this.state.city,
                    state: this.state.state,
                    country: "India",
                },

                email: this.state.email,
                phone: this.state.phone === undefined ? "" : this.state.phone,
                profession: this.state.profession,
                specialization: this.state.specialization,
                superSpecialization: this.state.superSpecialization,
                education: this.state.education.filter((e) => e.degree !== ""),
                resume:
                    this.state.resume === ""
                        ? this.state.prevResume
                        : this.state.resume,
            };
            if (this.state.locum) {
                // const locum = {
                //     startTime:
                //         this.state.startTime === ""
                //             ? "08:00"
                //             : this.state.startTime,
                //     endTime:
                //         this.state.endTime === ""
                //             ? "18:00"
                //             : this.state.endTime,
                //     days: this.state.days,
                // };
                user = {
                    ...user,
                    availability: this.state.availability.filter(
                        (e) => e.startTime !== "" && e.endTime !== "",
                    ),
                };
            }
            Object.keys(user).forEach(
                (key) =>
                    (user[key] === undefined ||
                        user[key] === null ||
                        user[key] === "" ||
                        user[key].length === 0) &&
                    delete user[key],
            );
            console.log(user);
            Axios.put(`/api/user/profile/update`, user)
                .then((data) => {
                    console.log(data);
                    if (data.status === 200) {
                        // alert("Update successful");
                        console.log("RED");
                        this.props.setUser(data.data);
                        this.props.history.push({ pathname: "/profile" });
                        // window.location = "/employer";
                    }
                })
                .catch((err) => {
                    console.log(err);
                    const response = err.response;
                    console.log(response);
                    alert(response ? response.err : "");
                });
        }
    }
    componentDidMount() {
        Axios.get("/api/user/profile")
            .then(({ data }) => {
                const user = data;
                console.log(user._id);
                console.log(user);
                if (user) {
                    this.setState({
                        id: user._id,
                        username: user.username,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        logo:
                            !user.image ||
                            user.image === undefined ||
                            user.image === ""
                                ? "https://curoidprod.blob.core.windows.net/curoid/AdobeStock_292703400.jpeg"
                                : user.image,
                    });
                    this.setState({
                        id: user._id,
                        username: user.username,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        title:
                            user.title && user.title !== undefined
                                ? user.title
                                : "",
                        gender: user.gender,
                        salutation: user.salutation,
                        logo:
                            !user.image ||
                            user.image === undefined ||
                            user.image === ""
                                ? "https://curoidprod.blob.core.windows.net/curoid/AdobeStock_292703400.jpeg"
                                : user.image,

                        dob: user.dob,
                        profession:
                            user.profession === undefined
                                ? ""
                                : user.profession,
                        specialization:
                            user.specialization === undefined
                                ? ""
                                : user.specialization,
                        superSpecialization: user.superSpecialization,
                        city: user.address.city,
                        state: user.address.state,
                        education: user.education,

                        email:
                            user.email && user.email !== ""
                                ? user.email
                                : user.username,
                        phone: user.phone,
                        resume: user.resume,
                    });
                    if (user.availability && user.availability.length !== 0)
                        this.setState({
                            availability: user.availability,
                            locum: true,
                        });
                }
            })
            .catch((err) => console.log(err));
    }
    async uploadToStorage(storageAccountName, sas, file) {
        // console.log(file);
        try {
            const account = storageAccountName;
            // const sharedKeyCredential = new Credential(account, accountKey);
            const blobServiceClient = new BlobServiceClient(
                `https://${account}.blob.core.windows.net?${sas}`,
            );
            const containerClient = blobServiceClient.getContainerClient(
                "user-image",
            );
            const blobClient = containerClient.getBlobClient(file.name);
            const blockBlobClient = blobClient.getBlockBlobClient();
            const uploadBlobResponse = await blockBlobClient.uploadBrowserData(
                file.data,

                {
                    onProgress: (state) => {
                        this.setState({
                            progress:
                                parseInt(state.loadedBytes) /
                                parseInt(file.size),
                        });
                    },
                },

                {
                    maxSingleShotSize: 4 * 1024 * 1024,
                },
                {
                    blobHTTPHeaders: {
                        contentSettings: {
                            contentType: file.mimeType,
                            //contentEncoding: 'base64'
                            blobContentType: file.mimeType,
                        },
                        // blobContentType: file.mimeType,
                    },
                },
            );
            console.log(uploadBlobResponse);
            return `https://curoidprod.blob.core.windows.net/user-image/profile`;
        } catch (error) {
            console.error(error);
        }
    }

    uploadLogo(e) {
        // console.log(this.image.current.value);
        this.setState({ uploadingLogo: false });
        console.log(this.state);
        const files = Array.from(e.target.files);
        if (files.length !== 0) {
            this.setState({ uploadingLogo: true });
            console.log(files[0]);
            if (
                files[0].type.split("/")[0] !== "image" ||
                files[0].size > 5000000
            ) {
                console.log("wrong");
                this.setState({
                    loading: false,
                    showError2: true,
                    logoError: "Invalid File Format or Size",
                    loading: false,
                    uploadingLogo: false,
                });
                this.logo.current.value = "";
                return;
            } else {
                this.setState({
                    showError2: false,
                });
            }
            // this.setState({
            //     loading: false,
            //     showError: true,
            //     resumeError:
            //         "Invalid File - Please ensure the file size is less than 5MB and file type is doc, docx, rtf or pdf.",
            // });
            const options = {
                maxSizeMB: 0.256, // (default: Number.POSITIVE_INFINITY)
                maxWidthOrHeight: 1920,
            };
            imageCompression(files[0], options).then((file) => {
                let reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = () => {
                    var matches = reader.result.match(
                        /^data:([A-Za-z-+\/]+);base64,(.+)$/,
                    );
                    var buffer = new Buffer(matches[2], "base64");
                    const image = {
                        name: `${this.state.id}_${file.name}`,
                        data: buffer,
                        mimeType: file.type,
                        size: file.size,
                    };
                    console.log(image);
                    Axios.post(`/api/upload/`, {
                        context: `${this.state.id}_${file.name}`,
                    })
                        .then(({ data }) => {
                            const sas = data.token;
                            console.log(data);
                            this.uploadToStorage("curoidprod", sas, image).then(
                                (res) => {
                                    const url = `https://curoidprod.blob.core.windows.net/user-image/${this.state.id}_${file.name}`;
                                    this.setState({
                                        logo: url,
                                        loading: false,
                                        uploadingLogo: false,
                                        showError2: false,
                                        progress: 0,
                                    });

                                    console.log(res);
                                },
                            );
                        })
                        .catch((e) => {
                            console.log(e.response);
                            this.setState({
                                loading: false,
                                showError2: true,
                                progress: 0,
                                logoError:
                                    "Something went wrong, Please try again.",
                                uploadingLogo: false,
                            });
                        });
                };
            });
        }
    }
    render() {
        let degrees = [],
            professionArray = [],
            suggestionarray = [],
            specializationArray = [];
        let specializationObj = {},
            superSpecializationObj = {};
        if (this.props.data) {
            degrees = this.props.data.degrees.map((degree) => {
                return {
                    value: degree,
                    label: degree,
                };
            });

            professionArray = this.props.data.specializations.map((obj) => {
                specializationObj[obj.profession] = obj.specialization.map(
                    (e) => {
                        return { label: e, value: e };
                    },
                );
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
            suggestionarray = specializationArray;
            this.props.data.superSpecializations.forEach((obj) => {
                const key = `${obj.profession}+${obj.specialization}`;
                superSpecializationObj[key] = obj.superSpecialization.map(
                    (e) => {
                        return { label: e, value: e };
                    },
                );
                suggestionarray = [
                    ...suggestionarray,
                    ...superSpecializationObj[key],
                ];
            });
            suggestionarray = suggestionarray.map((e) => e.value);
            suggestionarray = [...new Set(suggestionarray)];
            // console.log(suggestionarray);
        }
        return (
            <div className='overflow-hidden'>
                <div className='mx-auto col-12 col-sm-10 col-xl-8 px-0'>
                    <div className='p-3 p-sm-4 my-3  mx-lg-auto block-sm'>
                        <FormGroup>
                            <h5>Details</h5>
                        </FormGroup>
                        <FormGroup className='row'>
                            <div className='col-12 col-md-3 text-align-center'>
                                <Alert
                                    color='warning'
                                    isOpen={this.state.showError2}
                                    toggle={() => {
                                        this.setState({ showError2: false });
                                    }}>
                                    {this.state.logoError}
                                </Alert>
                                <div
                                    className='my-auto position-relative mx-auto'
                                    style={{ width: "fit-content" }}>
                                    <img
                                        src={this.state.logo}
                                        className='img-fluid img-thumbnail my-auto'
                                        alt='logo'
                                        style={{ maxHeight: "50vw" }}
                                    />
                                    <div className='position-relative'>
                                        <button
                                            className='btn btn-info btn-sm m-2 btn-float'
                                            disabled={this.state.uploadingLogo}
                                            style={{
                                                borderRadius: "50%",
                                            }}>
                                            <label
                                                htmlFor='image'
                                                style={{
                                                    display:
                                                        "inline-block-noHover",
                                                    margin: 0,
                                                    cursor: "pointer",
                                                    width: "100%",
                                                }}>
                                                <FontAwesomeIcon icon={faPen} />
                                            </label>
                                        </button>

                                        <input
                                            type='file'
                                            style={{
                                                position: "absolute",
                                                zIndex: "-1",
                                                overflow: "hidden",
                                                opacity: 0,
                                            }}
                                            disabled={this.state.uploadingLogo}
                                            id='image'
                                            ref={this.logo}
                                            accept='image/*'
                                            onChange={this.uploadLogo}
                                        />
                                    </div>
                                </div>
                                {/* )} */}

                                <div className='col-12 text-black-50'>
                                    Upto 5 MB
                                </div>
                                <div className='col-12'>
                                    {this.state.uploadingLogo && (
                                        <Progress
                                            animated
                                            color='emp-primary'
                                            value={this.state.progress * 100}>
                                            <h6 className='m-0'>
                                                {Math.round(
                                                    this.state.progress * 100,
                                                )}
                                                {"%"}
                                            </h6>
                                        </Progress>
                                    )}
                                </div>
                                <div className='mx-3 mx-sm-2'>
                                    <div className='my-1 mt-3'></div>
                                </div>
                            </div>
                            <div className='col-md-9 row px-0 pl-sm-3 '>
                                <div className='col-12 my-1 my-sm-0'>
                                    <Label className='mb-1'>
                                        <h6 className='mb-0 small-heading'>
                                            Profile Title{" "}
                                            <span className='text-danger'>
                                                *
                                            </span>
                                        </h6>
                                    </Label>
                                    <Input
                                        placeholder='e.g. Interventional Cardiologist'
                                        name='title'
                                        onChange={this.handleChange}
                                        value={this.state.title}
                                        invalid={!this.state.valid.title}
                                        key={"title"}
                                    />
                                </div>
                                <div className='col-3 col-sm-2 pr-1 pr-sm-0 my-1 my-sm-2 pl-0'>
                                    <Label
                                        className='mb-1'
                                        // style={{
                                        //     display: "flex",
                                        //     flexDirection: "column",
                                        //     justifyContent: "center",
                                        // }}
                                    >
                                        <h6 className='mb-0 small-heading'>
                                            Prefix{" "}
                                            <span className='text-danger'>
                                                *
                                            </span>
                                        </h6>
                                    </Label>
                                    <CustomInput
                                        placeholder='Salutation'
                                        type='select'
                                        // className='pl-1 m-0'
                                        // style={{ height: "auto" }}
                                        onChange={this.handleChange}
                                        name='salutation'
                                        value={this.state.salutation}
                                        invalid={!this.state.valid.salutation}>
                                        <option value='Dr'>Dr</option>
                                        <option value='Mr'>Mr</option>
                                        <option value='Mrs'>Mrs</option>
                                        <option value='Ms'>Ms</option>
                                        <option value='Prof'>Prof</option>
                                    </CustomInput>
                                </div>
                                <div className='col-9 col-sm-5 px-0 px-sm-1 my-1 my-sm-2'>
                                    <Label className='mb-1'>
                                        <h6 className='mb-0 small-heading'>
                                            First Name{" "}
                                            <span className='text-danger'>
                                                *
                                            </span>
                                        </h6>
                                    </Label>
                                    <Input
                                        placeholder='First Name'
                                        name='firstName'
                                        onChange={this.handleChange}
                                        value={this.state.firstName}
                                        invalid={!this.state.valid.firstName}
                                    />
                                </div>
                                <div className='col-12 col-sm-5 pl-0 my-1 my-sm-2'>
                                    <Label className='mb-1'>
                                        <h6 className='mb-0 small-heading'>
                                            Last Name{" "}
                                            <span className='text-danger'>
                                                *
                                            </span>
                                        </h6>
                                    </Label>
                                    <Input
                                        placeholder='Last Name'
                                        name='lastName'
                                        onChange={this.handleChange}
                                        value={this.state.lastName}
                                        invalid={!this.state.valid.lastName}
                                    />
                                </div>

                                <div className='col-12 col-sm-7 pr-0 pr-sm-1 my-1 my-sm-2'>
                                    <Label className='mb-1'>
                                        <h6 className='mb-0 small-heading'>
                                            Date of Birth
                                        </h6>
                                    </Label>
                                    <Input
                                        type='date'
                                        name='dob'
                                        placeholder='date placeholder'
                                        defaultValue={this.state.dob}
                                        onChange={this.handleChange}
                                    />
                                </div>
                                <div className='col-12 col-sm-5 pl-0  my-1 my-sm-2'>
                                    <Label className='mb-1'>
                                        <h6 className='mb-0 small-heading'>
                                            Gender{" "}
                                            <span className='text-danger'>
                                                *
                                            </span>
                                        </h6>
                                    </Label>
                                    <Input
                                        placeholder='Gender'
                                        type='select'
                                        name='gender'
                                        onChange={(e) => {
                                            console.log(e.target.value);
                                            this.handleChange(e);
                                        }}
                                        value={this.state.gender}
                                        invalid={!this.state.valid.gender}>
                                        <option value='male'>Male</option>
                                        <option value='female'>Female</option>
                                        <option value='other'>Other</option>
                                    </Input>
                                </div>

                                <div className='row my-1 my-sm-2 col-12 px-0'>
                                    <Label className='col-12 mb-1'>
                                        <h6 className='mb-0 small-heading'>
                                            Location{" "}
                                            <span className='text-danger'>
                                                *
                                            </span>
                                        </h6>
                                    </Label>
                                    <div className='col-12 col-sm-3 pl-0 my-1 my-sm-0'>
                                        <Input
                                            placeholder='City'
                                            name='city'
                                            onChange={this.handleChange}
                                            value={this.state.city}
                                            invalid={!this.state.valid.city}
                                        />
                                    </div>
                                    <div className='col-12 col-sm-4 px-0 px-sm-1 my-1 my-sm-0'>
                                        <Input
                                            placeholder='State'
                                            name='state'
                                            onChange={this.handleChange}
                                            value={this.state.state}
                                            invalid={!this.state.valid.state}
                                        />
                                    </div>
                                    <div className='col-12 col-sm-5 my-1 my-sm-0'>
                                        <Input
                                            placeholder='Country'
                                            name='country'
                                            onChange={this.handleChange}
                                            defaultValue={"India"}
                                            disabled={true}
                                            // invalid={!this.state.valid.city}
                                        />
                                    </div>
                                </div>
                                <div className='row my-1 my-sm-2 col-12'>
                                    <Label className='col-12 mb-1'>
                                        <h6 className='mb-0 small-heading'>
                                            Contact Info{" "}
                                            <span className='text-danger'>
                                                *
                                            </span>
                                        </h6>
                                    </Label>
                                    <div className='col-12 col-sm-7 pr-0 pr-sm-1 my-1 my-sm-0'>
                                        <Input
                                            placeholder='Email'
                                            name='email'
                                            // onChange={this.handleChange}
                                            value={this.state.username}
                                            disabled={true}
                                        />
                                    </div>
                                    <InputGroup className='col-12 col-sm-5 pl-0 my-1 my-sm-0'>
                                        <InputGroupAddon addonType='prepend'>
                                            <InputGroupText>+91</InputGroupText>
                                        </InputGroupAddon>
                                        <Input
                                            type='number'
                                            placeholder='Phone'
                                            name='phone'
                                            onChange={this.handleChange}
                                            value={this.state.phone}
                                            invalid={!this.state.valid.phone}
                                        />
                                    </InputGroup>
                                </div>
                            </div>
                        </FormGroup>
                    </div>
                    <hr className='d-block d-sm-none' />
                    <div className='p-3 p-sm-4 my-3  mx-lg-auto block-sm'>
                        <FormGroup>
                            <h5>Area of Work</h5>
                        </FormGroup>

                        <FormGroup className='row'>
                            <div className='col-12 col-sm-6 pr-0 pr-sm-1 my-1'>
                                <Label className='mb-0'>
                                    <h6 className='mb-0 small-heading'>
                                        Profession{" "}
                                        <span className='text-danger'>*</span>
                                    </h6>
                                </Label>
                                <Select
                                    autosize={true}
                                    isClearable={true}
                                    placeholder='Profession'
                                    value={
                                        this.state.profession !== "" && {
                                            value: this.state.profession,
                                            label: this.state.profession,
                                        }
                                    }
                                    options={professionArray}
                                    onChange={(e) => {
                                        console.log(e);
                                        this.setState({
                                            specialization: "",
                                            superSpecialization: [],
                                        });
                                        this.handleChangeSelect(
                                            "profession",
                                            e ? e.value : "",
                                        );
                                    }}
                                    className={
                                        this.state.valid.profession !==
                                            undefined &&
                                        !this.state.valid.profession
                                            ? "border-invalid"
                                            : ""
                                    }
                                />
                            </div>
                            <div className='col-12 col-sm-6 pl-0 pl-sm-1 my-1'>
                                <Label className='mb-0'>
                                    <h6 className='mb-0 small-heading'>
                                        Specialization{" "}
                                        <span className='text-danger'>*</span>
                                    </h6>
                                </Label>
                                <Select
                                    autosize={true}
                                    isClearable={true}
                                    placeholder='Specialization'
                                    value={
                                        this.state.specialization !== "" && {
                                            value: this.state.specialization,
                                            label: this.state.specialization,
                                        }
                                    }
                                    options={
                                        this.state.profession === ""
                                            ? specializationArray
                                            : specializationObj[
                                                  this.state.profession
                                              ]
                                    }
                                    onChange={(e) => {
                                        console.log(e);
                                        this.handleChangeSelect(
                                            "specialization",
                                            e ? e.value : "",
                                        );
                                    }}
                                    className={
                                        this.state.valid.specialization !==
                                            undefined &&
                                        !this.state.valid.specialization
                                            ? "border-invalid"
                                            : ""
                                    }
                                />
                            </div>

                            <div className='col-12  px-0 my-1'>
                                <Label className='mb-0'>
                                    <h6 className='mb-0 small-heading'>
                                        Super/Sub Specialization{" "}
                                    </h6>
                                </Label>
                                <Select
                                    isClearable={true}
                                    isMulti
                                    autosize={true}
                                    placeholder='Super/Sub Specialization'
                                    value={this.state.superSpecialization.map(
                                        (e) => {
                                            return { value: e, label: e };
                                        },
                                    )}
                                    options={
                                        superSpecializationObj[
                                            `${this.state.profession}+${this.state.specialization}`
                                        ]
                                    }
                                    onChange={(e) => {
                                        console.log(e);
                                        this.handleChangeSelect(
                                            "superSpecialization",
                                            e,
                                        );
                                    }}
                                />
                            </div>
                        </FormGroup>
                    </div>
                    <hr className='d-block d-sm-none' />

                    <div className='p-3 p-sm-4 my-3  mx-lg-auto block-sm'>
                        <FormGroup className='row'>
                            <h5 className='col-8 col-sm-10 px-0'>Education</h5>
                            <div className='col-4 col-sm-2 row justify-content-end px-0 d-none d-sm-flex'>
                                <Button
                                    color='emp-secondary-2'
                                    size='sm'
                                    disabled={this.state.education.length > 4}
                                    onClick={() => {
                                        if (this.state.education.length <= 4) {
                                            let education = this.state
                                                .education;
                                            education.push({
                                                degree: "",
                                                speciality: "",
                                            });
                                            this.setState({
                                                education: education,
                                            });
                                        } else {
                                            this.setState({
                                                modalError: true,
                                                modalMess:
                                                    "Only 5 education allowed !",
                                            });
                                        }
                                    }}>
                                    <FontAwesomeIcon
                                        className='mr-1'
                                        icon={faPlus}
                                    />
                                    Add Education
                                </Button>
                            </div>
                        </FormGroup>
                        <FormGroup className='row d-none d-sm-flex mb-0'>
                            <div className='col-3 px-0'>
                                <Label className='ml-1 mb-0'>
                                    <h6 className='mb-0 small-heading'>
                                        Degree{" "}
                                    </h6>
                                </Label>
                            </div>
                            <div className='px-0 col-5'>
                                <Label className='ml-1 px-0 mb-0'>
                                    <h6 className='mb-0 small-heading'>
                                        Speciality{" "}
                                    </h6>
                                </Label>
                            </div>
                            <div className='px-0 col-3 row'>
                                <div className='px-0 col-6'>
                                    <Label className='ml-1 px-0 mb-0'>
                                        <h6 className='mb-0 small-heading'>
                                            From{" "}
                                        </h6>
                                    </Label>
                                </div>
                                <div className='px-0 col-6'>
                                    <Label className='ml-1 px-0 mb-0'>
                                        <h6 className='mb-0 small-heading'>
                                            To{" "}
                                        </h6>
                                    </Label>
                                </div>
                            </div>
                        </FormGroup>

                        {this.state.education.map((x, i) => (
                            <div className='row border-sm my-2 p-2 p-sm-1 my-sm-1'>
                                <div className='col-12 row position-relative justify-content-between d-flex d-sm-none'>
                                    <FontAwesomeIcon
                                        icon={faTimes}
                                        className=' mb-1 float-right ml-auto mr-1 mt-1'
                                        size='sm'
                                        style={{
                                            cursor: "pointer",
                                        }}
                                        onClick={() => {
                                            let education = this.state
                                                .education;
                                            education.splice(i, 1);
                                            this.setState({
                                                education: education,
                                            });
                                        }}
                                    />
                                </div>

                                <div className='row col-12'>
                                    <div className='col-12 col-sm-3 pr-0 pr-sm-1 my-1 '>
                                        <Select
                                            autosize={true}
                                            isClearable={true}
                                            placeholder='Degree'
                                            value={
                                                this.state.education[i] &&
                                                this.state.education[i]
                                                    .degree !== "" && {
                                                    value: this.state.education[
                                                        i
                                                    ].degree,
                                                    label: this.state.education[
                                                        i
                                                    ].degree,
                                                }
                                            }
                                            options={degrees}
                                            onChange={(e) => {
                                                e = {
                                                    target: {
                                                        name: "degree",
                                                        value: e ? e.value : "",
                                                    },
                                                };
                                                this.handleChange(
                                                    e,
                                                    i,
                                                    "degree",
                                                    "education",
                                                );
                                            }}
                                            // className={
                                            //     this.state.valid.profession !==
                                            //         undefined &&
                                            //     !this.state.valid.profession
                                            //         ? "border-invalid"
                                            //         : ""
                                            // }
                                        />
                                    </div>
                                    <div className='col-12 col-md-5 col-sm-4 px-0 pr-sm-1 my-1'>
                                        <Input
                                            id={i}
                                            placeholder='Speciality'
                                            name='education'
                                            onChange={(e) =>
                                                this.handleChange(
                                                    e,
                                                    i,
                                                    "speciality",
                                                    "education",
                                                )
                                            }
                                            value={
                                                this.state.education[i]
                                                    ? this.state.education[i]
                                                          .speciality
                                                    : ""
                                            }
                                            list={`specialities${i}`}
                                        />
                                        <datalist id={`specialities${i}`}>
                                            {/* {this.state.superSpecialization
                                                .length === 0 ? (
                                                <option
                                                    value={
                                                        this.state
                                                            .profession !==
                                                            "" &&
                                                        this.state
                                                            .specialization !==
                                                            ""
                                                            ? `${this.state.education[i].degree} with ${this.state.specialization}`
                                                            : ``
                                                    }
                                                />
                                            ) : (
                                                this.state.superSpecialization.map(
                                                    (e) => (
                                                        <option
                                                            value={
                                                                this.state
                                                                    .profession !==
                                                                    "" &&
                                                                this.state
                                                                    .specialization !==
                                                                    "" &&
                                                                `${this.state.education[i].degree} with ${this.state.specialization} in ${e}`
                                                            }
                                                        />
                                                    ),
                                                )
                                            )} */}
                                            {suggestionarray.map((x) => (
                                                <option>{x}</option>
                                            ))}
                                        </datalist>
                                    </div>
                                    <div className='col-12 col-md-3 col-sm-4 px-0 row my-1'>
                                        <div className='col-12 px-0 pl-sm-1 pr-sm-1 row'>
                                            <div className='col-6 pr-1 pl-0'>
                                                <Input
                                                    placeholder='startYear'
                                                    type='select'
                                                    className=''
                                                    onChange={(e) => {
                                                        this.handleChange(
                                                            e,
                                                            i,
                                                            "startYear",
                                                            "education",
                                                        );
                                                    }}
                                                    value={
                                                        this.state.education[
                                                            i
                                                        ] &&
                                                        this.state.education[i]
                                                            .startYear
                                                    }>
                                                    <option
                                                        value='from'
                                                        disabled
                                                        selected>
                                                        From
                                                    </option>
                                                    {Array(
                                                        Number(
                                                            new Date().getFullYear(),
                                                        ) -
                                                            1975 +
                                                            1,
                                                    )
                                                        .fill()
                                                        .map(
                                                            (_, idx) =>
                                                                Number(
                                                                    new Date().getFullYear(),
                                                                ) - idx,
                                                        )
                                                        .map((x) => (
                                                            <option value={x}>
                                                                {x}
                                                            </option>
                                                        ))}
                                                </Input>
                                            </div>
                                            <div className='col-6 pl-1 pr-0'>
                                                {/* <Label className='m-1 d-block d-sm-none'>
                                                    <h6>To </h6>
                                                </Label> */}
                                                <Input
                                                    placeholder='endYear'
                                                    type='select'
                                                    className=''
                                                    onChange={(e) => {
                                                        this.handleChange(
                                                            e,
                                                            i,
                                                            "endYear",
                                                            "education",
                                                        );
                                                    }}
                                                    value={
                                                        this.state.education[i]
                                                            ? this.state
                                                                  .education[i]
                                                                  .endYear
                                                            : "To"
                                                    }>
                                                    <option
                                                        disabled
                                                        selected
                                                        value='to'>
                                                        To
                                                    </option>
                                                    {Array(
                                                        Number(
                                                            new Date().getFullYear(),
                                                        ) -
                                                            1975 +
                                                            1,
                                                    )
                                                        .fill()
                                                        .map(
                                                            (_, idx) =>
                                                                Number(
                                                                    new Date().getFullYear(),
                                                                ) - idx,
                                                        )
                                                        .map((x) => (
                                                            <option value={x}>
                                                                {x}
                                                            </option>
                                                        ))}
                                                </Input>
                                            </div>
                                        </div>
                                    </div>
                                    <div className='col-sm-1 d-flex flex-column justify-content-center text-align-center'>
                                        <FontAwesomeIcon
                                            icon={faTrash}
                                            size='lg'
                                            className='d-none d-sm-flex text-danger my-auto ml-auto'
                                            style={{
                                                cursor: "pointer",
                                            }}
                                            onClick={() => {
                                                let education = this.state
                                                    .education;
                                                education.splice(i, 1);
                                                this.setState({
                                                    education: education,
                                                });
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                        <div className='col-12 d-block d-sm-none'>
                            <Button
                                color='emp-secondary-2'
                                className='w-100'
                                size='sm'
                                disabled={this.state.education.length > 4}
                                onClick={() => {
                                    let education = this.state.education;
                                    education.push({
                                        degree: "",
                                        speciality: "",
                                    });
                                    this.setState({
                                        education: education,
                                    });
                                }}>
                                <FontAwesomeIcon
                                    className='mr-1'
                                    icon={faPlus}
                                />
                                Add Education
                            </Button>
                        </div>
                    </div>
                    <hr className='d-block d-sm-none' />

                    <div className='p-3 p-sm-4 my-3  mx-lg-auto block-sm'>
                        <FormGroup>
                            <h5>Resume</h5>
                        </FormGroup>

                        <div className='row'>
                            {this.state.loading ? (
                                <h6>
                                    <span className='my-auto'>
                                        Uploading File
                                    </span>
                                    <div
                                        class='spinner-border spinner-border-sm ml-2 my-auto'
                                        role='status'>
                                        <span className='sr-only'>
                                            Loading...
                                        </span>
                                    </div>
                                </h6>
                            ) : (
                                <div className='col-12 row justify-content-start'>
                                    <div className='pr-1 pl-0'>
                                        {this.state.resume !== undefined &&
                                            this.state.resume !== "" && (
                                                <a
                                                    href={`${this.state.resume}`}
                                                    className='btn btn-emp-secondary-2'>
                                                    View Resume
                                                    <FontAwesomeIcon
                                                        className='ml-2'
                                                        icon={faFileAlt}
                                                    />
                                                </a>
                                            )}
                                    </div>
                                    <div className=' pr-0 pl-sm-1'>
                                        <div
                                            className='position-relative'
                                            style={{
                                                height: "100%",
                                            }}>
                                            <button className='btn btn-emp-primary'>
                                                <label
                                                    htmlFor='file'
                                                    style={{
                                                        display:
                                                            "inline-block-noHover",
                                                        margin: 0,
                                                        cursor: "pointer",
                                                        width: "100%",
                                                    }}>
                                                    Update Resume
                                                    <FontAwesomeIcon
                                                        className='ml-2'
                                                        icon={faPen}
                                                    />
                                                </label>
                                            </button>

                                            <input
                                                style={{
                                                    position: "absolute",
                                                    zIndex: "-5",
                                                    overflow: "hidden",
                                                    opacity: 0,
                                                    width: "0.1px",
                                                    height: "0.1px",
                                                }}
                                                className='p-0 file'
                                                id='file'
                                                type='file'
                                                accept='.pdf,.doc,.docx,.rtf'
                                                onChange={this.uploadResume}
                                                ref={this.resume}
                                            />
                                        </div>
                                    </div>
                                    <div
                                        className='pl-3 my-auto text-black-50'
                                        style={{ height: "max-content" }}>
                                        Files Allowed: docx, doc, rtf, pdf, upto
                                        5MB in size
                                    </div>
                                </div>
                            )}

                            {this.state.showError && (
                                <div className='my-1 mt-3 col-12 text-danger'>
                                    {this.state.resumeError}
                                </div>
                            )}
                            {/* <Alert
                                color='danger'
                                isOpen={this.state.showError}
                                toggle={() => {
                                    this.setState({ showError: false });
                                }}>
                                {this.state.resumeError}
                            </Alert> */}
                            {this.state.loading && (
                                <div className='my-1 mt-3 col-12'>
                                    <Progress
                                        animated
                                        color='emp-primary'
                                        value={this.state.progress * 100}>
                                        <h6 className='m-0'>
                                            {Math.round(
                                                this.state.progress * 100,
                                            )}
                                            {"%"}
                                        </h6>
                                    </Progress>
                                </div>
                            )}
                        </div>
                        {/* )} */}
                    </div>
                    <hr className='d-block d-sm-none' />

                    <div className='p-3 p-sm-4 my-3  mx-lg-auto block-sm'>
                        <FormGroup>
                            <h5>Availability</h5>
                        </FormGroup>
                        <FormGroup className='row'>
                            <h5 className='position-relative pl-3 pr-0 row col-12 col-sm-10'>
                                <div className='position-relative ml-1 mr-1'>
                                    <Input
                                        type='checkbox'
                                        style={{
                                            height: ".78rem",
                                            width: ".78rem",
                                            position: "absolute",
                                        }}
                                        className='mt-2'
                                        checked={this.state.locum}
                                        onChange={(e) => {
                                            this.setState({
                                                locum: e.target.checked,
                                            });
                                        }}
                                    />
                                    <span className='pl-0 small-checkbox'>
                                        I'm interested in Day Jobs or Locum
                                        Positions
                                    </span>
                                </div>
                            </h5>
                            {this.state.locum && (
                                <div className='col-0 col-sm-2 px-0 d-none d-sm-flex row justify-content-end'>
                                    <Button
                                        color='emp-secondary-2'
                                        size='sm'
                                        disabled={
                                            this.state.availability.length > 4
                                        }
                                        onClick={() => {
                                            let availability = this.state
                                                .availability;
                                            availability.push({
                                                startTime: "",
                                                endTime: "",
                                                days: [],
                                            });
                                            this.setState({
                                                availability: availability,
                                            });
                                        }}>
                                        <FontAwesomeIcon
                                            className='mr-1'
                                            icon={faPlus}
                                        />
                                        Add Time slot
                                    </Button>
                                </div>
                            )}
                        </FormGroup>
                        {this.state.locum && (
                            <div>
                                {this.state.availability.map((x, i) => (
                                    <FormGroup className='row border-sm p-1 p-sm-0'>
                                        <div className='col-12 row position-relative justify-content-between d-flex d-sm-none'>
                                            <FontAwesomeIcon
                                                icon={faTimes}
                                                className=' mb-1 float-right ml-auto mr-1 mt-1'
                                                size='sm'
                                                style={{
                                                    cursor: "pointer",
                                                }}
                                                onClick={() => {
                                                    let availability = this
                                                        .state.availability;
                                                    availability.splice(i, 1);
                                                    this.setState({
                                                        availability: availability,
                                                    });
                                                }}
                                            />
                                        </div>

                                        <div className='col-12 col-sm-4 row px-0'>
                                            <InputGroup className='col-6 px-2 px-sm-0 my-1 pr-sm-1'>
                                                <Label
                                                    className='pr-2 col-12 mb-0'
                                                    for='exampleDate'>
                                                    <h6 className='mb-0 small-heading'>
                                                        Start Time
                                                    </h6>
                                                </Label>
                                                {/* <Label for='exampleTime'>Time</Label> */}
                                                <Input
                                                    type='time'
                                                    name='startTime'
                                                    id='exampleTime'
                                                    step='1800'
                                                    placeholder='time placeholder'
                                                    onChange={(e) => {
                                                        this.handleChange(
                                                            e,
                                                            i,
                                                            "startTime",
                                                            "availability",
                                                        );
                                                    }}
                                                    defaultValue={
                                                        this.state.availability[
                                                            i
                                                        ] &&
                                                        this.state.availability[
                                                            i
                                                        ].startTime
                                                    }
                                                    invalid={
                                                        this.state.valid
                                                            .startTime ===
                                                        undefined
                                                            ? false
                                                            : !this.state.valid
                                                                  .startTime
                                                    }
                                                />
                                            </InputGroup>
                                            <InputGroup className='col-6 my-1 px-2 px-sm-0 pl-1'>
                                                <Label
                                                    className=' col-12 mb-0'
                                                    for='exampleDate'>
                                                    <h6 className='mb-0 small-heading'>
                                                        End Time
                                                    </h6>
                                                </Label>
                                                {/* <Label for='exampleTime'>Time</Label> */}
                                                <Input
                                                    type='time'
                                                    name='endTime'
                                                    id='exampleTime'
                                                    placeholder='time placeholder'
                                                    className=''
                                                    step='1800'
                                                    onChange={(e) => {
                                                        this.handleChange(
                                                            e,
                                                            i,
                                                            "endTime",
                                                            "availability",
                                                        );
                                                    }}
                                                    defaultValue={
                                                        this.state.availability[
                                                            i
                                                        ] &&
                                                        this.state.availability[
                                                            i
                                                        ].endTime
                                                    }
                                                    invalid={
                                                        this.state.valid
                                                            .startTime ===
                                                        undefined
                                                            ? false
                                                            : !this.state.valid
                                                                  .startTime
                                                    }
                                                />
                                            </InputGroup>
                                        </div>

                                        <InputGroup className='col-12 col-sm-7 px-0 my-1 pl-sm-1 pl-sm-1'>
                                            <Label
                                                className='d-none d-sm-block col-12 mb-0 pl-sm-4'
                                                for='exampleDate'>
                                                <h6 className='mb-0 small-heading'>
                                                    Days
                                                </h6>
                                            </Label>
                                            {/* <Select
                                                isClearable={true}
                                                isMulti
                                                className='w-100'
                                                autosize={true}
                                                placeholder='days'
                                                value={
                                                    this.state.availability[i]
                                                        .days &&
                                                    this.state.availability[
                                                        i
                                                    ].days.map((e) => {
                                                        return {
                                                            value: e,
                                                            label: e,
                                                        };
                                                    })
                                                }
                                                options={daysArray}
                                                onChange={(e) => {
                                                    console.log(e);
                                                    this.handleChangeSelect(
                                                        "days",
                                                        e,
                                                        "availability",
                                                        i,
                                                    );
                                                }}
                                            /> */}
                                            <ButtonGroup
                                                className='col-12 row px-0 pl-sm-4 justify-content-center justify-content-sm-start'
                                                size='sm'>
                                                {weekdays.map((day, index) => (
                                                    <div className='pr-1'>
                                                        <Button
                                                            size={"sm"}
                                                            className='px-1 px-sm-2'
                                                            color={
                                                                this.state.availability[
                                                                    i
                                                                ].days.includes(
                                                                    weekdays[
                                                                        index
                                                                    ],
                                                                )
                                                                    ? "success"
                                                                    : "light"
                                                            }
                                                            onClick={() => {
                                                                let links = this
                                                                    .state
                                                                    .availability;
                                                                let obj =
                                                                    links[i];

                                                                if (
                                                                    obj.days.includes(
                                                                        weekdays[
                                                                            index
                                                                        ],
                                                                    )
                                                                ) {
                                                                    obj.days.splice(
                                                                        obj.days.indexOf(
                                                                            weekdays[
                                                                                index
                                                                            ],
                                                                        ),
                                                                        1,
                                                                    );
                                                                } else
                                                                    obj.days = [
                                                                        ...obj.days,
                                                                        weekdays[
                                                                            index
                                                                        ],
                                                                    ];
                                                                links[i] = obj;
                                                                this.setState({
                                                                    availability: links,
                                                                });
                                                            }}>
                                                            {day.substring(
                                                                0,
                                                                3,
                                                            )}
                                                        </Button>
                                                    </div>
                                                ))}
                                            </ButtonGroup>
                                        </InputGroup>
                                        <div className='col-sm-1 d-none d-sm-flex flex-column justify-content-end '>
                                            <FontAwesomeIcon
                                                icon={faTrash}
                                                size='lg'
                                                className='pt-3 text-danger mt-auto mb-0 ml-auto'
                                                style={{
                                                    cursor: "pointer",
                                                    height: "100%",
                                                }}
                                                onClick={() => {
                                                    let availability = this
                                                        .state.availability;
                                                    availability.splice(i, 1);
                                                    this.setState({
                                                        availability: availability,
                                                    });
                                                }}
                                            />
                                        </div>
                                    </FormGroup>
                                ))}
                            </div>
                        )}
                        {this.state.locum && (
                            <Button
                                color='emp-secondary-2'
                                className='w-100 d-block d-sm-none'
                                disabled={this.state.availability.length > 4}
                                onClick={() => {
                                    let availability = this.state.availability;
                                    availability.push({
                                        startTime: "",
                                        endTime: "",
                                        days: [],
                                    });
                                    this.setState({
                                        availability: availability,
                                    });
                                }}>
                                <FontAwesomeIcon
                                    className='mr-1'
                                    icon={faPlus}
                                />
                                Add Time Slot
                            </Button>
                        )}
                    </div>
                    <div className='p-3 p-sm-0 my-3  mx-lg-auto row justify-content-end'>
                        {/* {this.state.loading ? (
                            <Button disabled={true} color='primary'>
                                <span className='my-auto'>Uploading File</span>

                                <div
                                    class='spinner-border spinner-border-sm ml-2 my-auto'
                                    role='status'>
                                    {" "}
                                    <span class='sr-only'>Loading...</span>
                                </div>
                            </Button>
                        ) : ( */}
                        <Button
                            onClick={this.update}
                            // className='w-25'
                            disabled={this.state.loading}
                            color='emp-primary'>
                            Update Profile
                        </Button>
                        {/* )} */}
                    </div>
                </div>
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
                    <ModalBody>{this.state.modalMess}</ModalBody>
                    <ModalFooter className='p-1'>
                        <Button
                            size='sm'
                            color='emp-primary'
                            onClick={this.toggleModalError}>
                            Ok
                        </Button>
                    </ModalFooter>
                </Modal>
            </div>
        );
    }
}
