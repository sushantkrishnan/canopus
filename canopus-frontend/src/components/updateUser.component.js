import React, { Component, Fragment } from "react";
import {
    Label,
    Input,
    FormGroup,
    Form,
    Button,
    Progress,
    Modal,
    InputGroup,
    Nav,
    NavItem,
    ModalHeader,
    ModalBody,
    ButtonGroup,
} from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "../stylesheets/updateUser.css";
// import data from "../data";

import { NavLink, Link, Redirect, useHistory } from "react-router-dom";
import {
    faPlusCircle,
    faPen,
    faMinus,
    faMinusCircle,
    faPlus,
    faFileAlt,
    faDumpster,
    faTrash,
    faTimes,
} from "@fortawesome/free-solid-svg-icons";
import InputMap from "./map.component";
import Axios from "axios";
import { BlobServiceClient } from "@azure/storage-blob";
import imageCompression from "browser-image-compression";
import ImageCarousel from "./imageCarousel.component";
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
const daysArray = weekdays.map((day) => {
    return { label: day.toLowerCase(), value: day.toLowerCase() };
});
const block = {
    borderRadius: " 0.25rem",
    border: "0.05rem solid lightgrey",
    /* background-color: rgba(0, 0, 0, 0.15); */
    // boxShadow: " 3px 3px 6px rgba(0, 0, 0, 0.3)",
    transition: "0.3s ease-in-out",
};

export default class UpdateUser extends Component {
    constructor(props) {
        super(props);
        this.state = {
            logo: "",
            salutation: "",
            firstName: "",
            lastName: "",
            gender: "",
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
            education: [],
            locum: false,
            startTime: "",
            endTime: "",
            resume: "",
            days: [],
            availability: [],
            progress: 0,
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
        if (index !== undefined) {
            let links = this.state[type];
            let obj = links[index];
            if (type === "education") {
                obj.startYear = "1975";
                obj.endYear = "2020";
            }
            obj = { ...obj, [name]: e.target.value };
            links[index] = obj;
            console.log(links);
            this.setState({
                [e.target.name]: links,
            });
        } else
            this.setState({
                [e.target.name]: e.target.value,
                valid: {
                    ...this.state.valid,
                    [e.target.name]: e.target.value !== "",
                },
            });
    }

    uploadResume(e) {
        this.setState({ loading: true });
        const files = Array.from(e.target.files);
        if (files.length !== 0) {
            this.setState({ uploaded: false });

            const file = files[0];

            let reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                var matches = reader.result.match(
                    /^data:([A-Za-z-+\/]+);base64,(.+)$/,
                );
                var buffer = new Buffer(matches[2], "base64");
                const resume = {
                    name: `${this.state.id}_${file.name}`,
                    data: buffer,
                    mimeType: file.type,
                    size: file.size,
                };
                console.log(resume);
                Axios.post(`/api/upload`, {
                    context: `${this.state.id}_${file.name}`,
                })
                    .then(({ data }) => {
                        const sas = data.token;
                        this.uploadToStorage("canopus", sas, resume).then(
                            (res) => {
                                console.log(res);
                                const url = `https://canopus.blob.core.windows.net/user-image/${this.state.id}_${file.name}`;
                                console.log(url);
                                this.setState({
                                    resume: url,
                                    loading: false,
                                    uploadingLogo: false,
                                });
                                this.update();
                                this.setState({ uploaded: true });
                            },
                        );
                    })
                    .catch((e) => console.log(e));
            };
        }
    }
    update() {
        const isValid = Object.values(this.state.valid).every(
            (item) => item === true,
        );

        console.log(isValid);
        if (!isValid) {
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
                education: this.state.education,
                resume: this.state.resume,
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
                    availability: this.state.availability,
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
                    });
                    this.setState({
                        id: user._id,
                        title: user.title,
                        firstName: user.firstName,
                        logo: user.image,
                        lastName: user.lastName,
                        gender: user.gender,
                        dob: user.dob,
                        profession: user.profession,
                        specialization: user.specialization,
                        superSpecialization: user.superSpecialization,
                        city: user.address.city,
                        state: user.address.state,
                        education: user.education,
                        username: user.username,

                        email:
                            user.email && user.email !== ""
                                ? user.email
                                : user.username,
                        phone: user.phone,
                        resume: user.resume,
                    });
                    if (user.locum.startTime)
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
            return `https://canopus.blob.core.windows.net/user-image/profile`;
        } catch (error) {
            console.error(error);
        }
    }

    uploadLogo(e) {
        // console.log(this.image.current.value);
        this.setState({ loading: true });
        console.log(this.state);
        const files = Array.from(e.target.files);
        if (files.length !== 0) {
            this.setState({ uploadingLogo: true });
            // let profile = this.state.profile;
            const options = {
                maxSizeMB: 0.256, // (default: Number.POSITIVE_INFINITY)
                maxWidthOrHeight: 1920,
            };
            imageCompression(files[0], options).then((file) => {
                // console.log(
                //     "compressedFile instanceof Blob",
                //     file instanceof Blob,
                // ); // true
                // console.log(`file size ${file.size / 1024 / 1024} MB`); // smaller than maxSizeMB
                // await uploadToServer(file); // write your own logic
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
                            console.log(sas);
                            this.uploadToStorage("canopus", sas, image).then(
                                (res) => {
                                    const url = `https://canopus.blob.core.windows.net/user-image/${this.state.id}_${file.name}`;
                                    this.setState({
                                        logo: url,
                                        loading: false,
                                        uploadingLogo: false,
                                    });

                                    console.log(res);
                                },
                            );
                        })
                        .catch((e) => console.log(e.response));
                };
            });
        }
    }
    render() {
        let degrees = [],
            speciality = [],
            professionArray = [],
            specializationArray = [];
        let specializationObj = {},
            superSpecializationObj = {};
        if (this.props.data) {
            console.log(this.props);
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
            speciality = this.props.data.speciality;

            this.props.data.superSpecializations.forEach((obj) => {
                const key = `${obj.profession}+${obj.specialization}`;
                superSpecializationObj[key] = obj.superSpecialization.map(
                    (e) => {
                        return { label: e, value: e };
                    },
                );
            });
            console.log(superSpecializationObj);
        }
        return (
            <div>
                <div className='my-2 mx-1 mx-lg-5 py-2 px-1 px-lg-5'>
                    <div className=' p-sm-4 my-3 mx-2 mx-lg-5 block-sm'>
                        <FormGroup>
                            <h5>Details</h5>
                        </FormGroup>
                        <FormGroup className='row'>
                            <div className='col-12 col-md-3 text-align-center'>
                                <div
                                    className='my-auto position-relative mx-auto'
                                    style={{ width: "fit-content" }}>
                                    <img
                                        src={
                                            this.state.logo === ""
                                                ? "https://i.pinimg.com/736x/74/73/ba/7473ba244a0ace6d9d301d5fe4478983--sarcasm-meme.jpg"
                                                : this.state.logo
                                        }
                                        className='img-fluid img-thumbnail my-auto'
                                        alt='logo'
                                        style={{ maxHeight: "50vw" }}
                                    />
                                    <div className='position-relative'>
                                        <button
                                            className='btn btn-info btn-sm m-2 btn-float'
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
                                            id='image'
                                            ref={this.image}
                                            onChange={this.uploadLogo}
                                        />
                                    </div>
                                </div>
                                {/* )} */}
                                <div className='col-12'>
                                    {this.state.uploadingLogo &&
                                        this.state.progress !== 1 &&
                                        this.state.progress !== 0 && (
                                            <Progress
                                                animated
                                                color='info'
                                                value={
                                                    this.state.progress * 100
                                                }>
                                                <h6 className='m-0'>
                                                    {Math.round(
                                                        this.state.progress *
                                                            100,
                                                    )}
                                                    {"%"}
                                                </h6>
                                            </Progress>
                                        )}
                                </div>
                                <div className='mx-3 mx-sm-2'>
                                    <div className='my-1 mt-3'>
                                        {/* <div className=''>
                                            <button
                                                className='btn btn-info btn-sm m-2 btn-float'
                                                // style={{
                                                //     borderRadius: "50%",
                                                // }}
                                            >
                                                <label
                                                    htmlFor='image'
                                                    style={{
                                                        display: "inline-block",
                                                        margin: 0,
                                                        cursor: "pointer",
                                                        width: "100%",
                                                    }}>
                                                   
                                                    Upload Logo
                                                </label>
                                            </button>

                                            <input
                                                type='file'
                                                style={{
                                                
                                                    zIndex: "-1",
                                                    overflow: "hidden",
                                                    opacity: 0,
                                                    cursor: "pointer",
                                                }}
                                                id='image'
                                                accept='image/*'
                                                
                                                onChange={this.uploadLogo}
                                            />
                                        </div> */}
                                    </div>
                                </div>
                            </div>
                            <div className='col-md-9 row px-0 pl-sm-3'>
                                <div className='col-12 my-1 my-sm-0'>
                                    <Label className='mb-1'>
                                        <h6 className='mb-0 small-heading'>
                                            Title{" "}
                                            <span className='text-danger'>
                                                *
                                            </span>
                                        </h6>
                                    </Label>
                                    <Input
                                        placeholder='Title'
                                        name='title'
                                        onChange={this.handleChange}
                                        defaultValue={this.state.title}
                                        invalid={!this.state.valid.title}
                                    />
                                </div>
                                <div className='col-12 col-sm-7 pr-0 pr-sm-1 row my-1 my-sm-2'>
                                    <Label className='mb-1 col-12'>
                                        <h6 className='mb-0 small-heading'>
                                            First Name{" "}
                                            <span className='text-danger'>
                                                *
                                            </span>
                                        </h6>
                                    </Label>
                                    <div className='col-3 pl-0 pr-0 '>
                                        <Input
                                            placeholder='Salutation'
                                            type='select'
                                            className='pl-1'
                                            onChange={this.handleChange}
                                            defaultValue={this.state.salutation}
                                            invalid={
                                                !this.state.valid.salutation
                                            }>
                                            <option value='Dr'>Dr</option>
                                            <option value='Mr'>Mr</option>
                                            <option value='Mrs'>Mrs</option>
                                            <option value='Ms'>Ms</option>
                                            <option value='Prof'>Prof</option>
                                        </Input>
                                    </div>
                                    <div className='col-9 pr-0 pr-sm-1 '>
                                        <Input
                                            placeholder='First Name'
                                            name='firstName'
                                            onChange={this.handleChange}
                                            defaultValue={this.state.firstName}
                                            invalid={
                                                !this.state.valid.firstName
                                            }
                                        />
                                    </div>
                                </div>
                                {/* <div className='col-4 col-sm-2 pl-0 pr-0 my-1 my-sm-2'>
                                    <Input
                                        placeholder='Salutation'
                                        type='select'
                                        onChange={this.handleChange}
                                        defaultValue={this.state.salutation}
                                        invalid={!this.state.valid.salutation}>
                                        <option value='Dr'>Dr</option>
                                        <option value='Mr'>Mr</option>
                                        <option value='Mrs'>Mrs</option>
                                        <option value='Ms'>Ms</option>
                                        <option value='Prof'>Prof</option>
                                    </Input>
                                </div>
                                <div className='col-8 col-sm-5 pr-0 pr-sm-1 my-1 my-sm-2'>
                                    <Label>
                                        First Name{" "}
                                        <span className='text-danger'>*</span>
                                    </Label>
                                    <Input
                                        placeholder='First Name'
                                        name='firstName'
                                        onChange={this.handleChange}
                                        defaultValue={this.state.firstName}
                                        invalid={!this.state.valid.firstName}
                                    />
                                </div> */}
                                <div className='col-12 col-sm-5 pl-0 pl-sm-1 my-1 my-sm-2'>
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
                                        defaultValue={this.state.lastName}
                                        invalid={!this.state.valid.lastName}
                                    />
                                </div>
                                <div className='col-12 col-sm-6 pr-0 pr-sm-1 my-1 my-sm-2'>
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
                                        defaultValue={this.state.gender}
                                        invalid={!this.state.valid.gender}>
                                        <option value='male'>Male</option>
                                        <option value='female'>Female</option>
                                        <option value='other'>Other</option>
                                    </Input>
                                </div>
                                <div className='col-12 col-sm-6 pl-0 pl-sm-1 my-1 my-sm-2'>
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
                                <div className='row my-1 my-sm-2'>
                                    <Label className='col-12 mb-1'>
                                        <h6 className='mb-0 small-heading'>
                                            Location{" "}
                                            <span className='text-danger'>
                                                *
                                            </span>
                                        </h6>
                                    </Label>
                                    <div className='col-12 col-sm-4 pl-0 my-1 my-sm-0'>
                                        <Input
                                            placeholder='city'
                                            name='city'
                                            onChange={this.handleChange}
                                            defaultValue={this.state.city}
                                            invalid={!this.state.valid.city}
                                        />
                                    </div>
                                    <div className='col-12 col-sm-4 pl-0 pl-sm-1 my-1 my-sm-0'>
                                        <Input
                                            placeholder='state'
                                            name='state'
                                            onChange={this.handleChange}
                                            defaultValue={this.state.state}
                                            invalid={!this.state.valid.state}
                                        />
                                    </div>
                                    <div className='col-12 col-sm-4 pl-0 pl-sm-1 my-1 my-sm-0'>
                                        <Input
                                            placeholder='country'
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
                                    <div className='col-12 col-sm-6 pr-0 pr-sm-1 my-1 my-sm-0'>
                                        <Input
                                            placeholder='email'
                                            name='email'
                                            onChange={this.handleChange}
                                            defaultValue={
                                                this.state.username !== ""
                                                    ? this.state.username
                                                    : this.state.email
                                            }
                                            disabled={true}
                                        />
                                    </div>
                                    <div className='col-12 col-sm-6 pl-0 pl-sm-1 my-1 my-sm-0'>
                                        <Input
                                            placeholder='phone'
                                            name='phone'
                                            onChange={this.handleChange}
                                            defaultValue={this.state.phone}
                                            invalid={!this.state.valid.phone}
                                        />
                                    </div>
                                </div>
                            </div>
                        </FormGroup>
                    </div>
                    <hr className='d-block d-sm-none' />
                    <div className='p-sm-4 my-3 mx-2 mx-lg-5 block-sm'>
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
                                        Super Specialization{" "}
                                    </h6>
                                </Label>
                                <Select
                                    isClearable={true}
                                    isMulti
                                    autosize={true}
                                    placeholder='superSpecialization'
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

                    <div className='p-sm-4 my-3 mx-2 mx-lg-5 block-sm'>
                        <FormGroup className='row'>
                            <h5 className='col-8 col-sm-10 px-0'>Education</h5>
                            <div className='col-4 col-sm-2 row justify-content-end px-0 d-none d-sm-flex'>
                                <Button
                                    color='info'
                                    size='sm'
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
                                        onClick={(e) => {
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
                                            {this.state.superSpecialization
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
                                            )}
                                        </datalist>
                                    </div>
                                    <div className='col-12 col-md-3 col-sm-4 px-0 row my-1'>
                                        <div className='col-12 px-0 pl-sm-1 pr-sm-1 row'>
                                            <div className='col-6 pr-1 pl-0'>
                                                {/* <Label className='m-1 d-block d-sm-none'>
                                                    <h6>From </h6>
                                                </Label> */}
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
                                                    defaultValue={
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
                                                                1975 + idx,
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
                                                    defaultValue={
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
                                            className='d-none d-sm-flex text-danger my-auto ml-auto'
                                            style={{
                                                cursor: "pointer",
                                            }}
                                            onClick={(e) => {
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
                                color='info'
                                className='w-100'
                                size='sm'
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

                    <div className='p-sm-4 my-3 mx-2 mx-lg-5 block-sm'>
                        <FormGroup>
                            <h5>Resume</h5>
                        </FormGroup>
                        {this.state.resume === undefined ||
                        (this.state.resume === "" &&
                            this.state.progress !== 1) ? (
                            <div>
                                <input
                                    type='file'
                                    class='file'
                                    accept='.pdf,.doc'
                                    onChange={this.uploadResume}
                                />
                                <div className='my-1 mt-3'>
                                    <Progress
                                        animated
                                        color='info'
                                        value={this.state.progress * 100}>
                                        <h6 className='m-0'>
                                            {Math.round(
                                                this.state.progress * 100,
                                            )}
                                            {"%"}
                                        </h6>
                                    </Progress>
                                </div>
                            </div>
                        ) : (
                            <div className='row'>
                                {/* <div className='col-12 col-sm-4'>
                                    <h6>Uploaded </h6>
                                </div> */}

                                <div className='col-12 col-sm-6 row justify-content-start'>
                                    <a
                                        href={`${this.state.resume}`}
                                        className='btn btn-info btn-sm mr-1 px-2'>
                                        View Resume
                                        <FontAwesomeIcon
                                            className='ml-2'
                                            icon={faFileAlt}
                                        />
                                    </a>
                                    {this.state.resume !== "" && (
                                        <button
                                            className='btn btn-sm btn-primary px-2'
                                            onClick={() => {
                                                this.setState({
                                                    resume: "",
                                                });
                                                this.update();
                                            }}>
                                            Change Resume
                                            <FontAwesomeIcon
                                                className='ml-2'
                                                icon={faPen}
                                            />
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                    <hr className='d-block d-sm-none' />

                    <div className='p-sm-4 my-3 mx-2 mx-lg-5 block-sm'>
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
                                        color='info'
                                        size='sm'
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
                                                onClick={(e) => {
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
                                                            onClick={(e) => {
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
                                                onClick={(e) => {
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
                                color='info'
                                className='w-100 d-block d-sm-none'
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
                    <div className='p-1 p-sm-4 m-1 m-sm-3 mx-lg-4 d-flex justify-content-start'>
                        {this.state.loading ? (
                            <Button
                                // onClick={this.update}
                                // className='w-25'

                                color='primary'>
                                Uploading Image
                                <div class='spinner-border ml-2' role='status'>
                                    {" "}
                                    <span class='sr-only'>Loading...</span>
                                </div>
                            </Button>
                        ) : (
                            <Button
                                onClick={this.update}
                                // className='w-25'

                                color='primary'>
                                Update Profile
                            </Button>
                        )}
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
                </Modal>
            </div>
        );
    }
}
