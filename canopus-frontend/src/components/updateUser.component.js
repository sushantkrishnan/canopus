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
} from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import data from "../data";

import { NavLink, Link } from "react-router-dom";
import {
    faPlusCircle,
    faPen,
    faMinus,
    faMinusCircle,
    faPlus,
    faFileAlt,
} from "@fortawesome/free-solid-svg-icons";
import InputMap from "./map.component";
import Axios from "axios";
import { BlobServiceClient } from "@azure/storage-blob";
import imageCompression from "browser-image-compression";
import ImageCarousel from "./imageCarousel.component";
import Select from "react-select";
import data from "../data";
const superSpecializationArray = data.superSpecialization.map((opt) => ({
    label: opt,
    value: opt,
}));
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
    handleChangeSelect(name, value) {
        console.log(value, name);
        if (
            (name === "days" || name === "superSpecialization") &&
            value &&
            value.length > 0
        ) {
            value = value.map((e) => e.value);
        }
        this.setState({
            [name]: value,
            valid: {
                ...this.state.valid,
                [name]: value !== "",
            },
        });
    }

    handleChange(e, index, name) {
        if (index !== undefined) {
            let links = this.state.education;
            let obj = links[index];
            obj.startYear = "1975";
            obj.endYear = "2020";
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
                const locum = {
                    startTime:
                        this.state.startTime === ""
                            ? "08:00"
                            : this.state.startTime,
                    endTime:
                        this.state.endTime === ""
                            ? "18:00"
                            : this.state.endTime,
                    days: this.state.days,
                };
                user = {
                    ...user,
                    locum,
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
                        this.props.setUser(data.data);
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
                            startTime: user.locum.startTime,
                            endTime: user.locum.endTime,
                            days: user.locum.days,
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
        return (
            <div>
                <div className='my-2 mx-1 mx-lg-5 py-2 px-1 px-lg-5'>
                    <div className=' p-4 my-3 mx-2 mx-lg-5' style={block}>
                        <FormGroup>
                            <h4>Details</h4>
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
                            <div className='col-md-9 row'>
                                <div className='col-12 my-1 my-sm-2'>
                                    <Label>
                                        Title{" "}
                                        <span className='text-danger'>*</span>
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
                                    <Label className='col-12 px-0'>
                                        First Name{" "}
                                        <span className='text-danger'>*</span>
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
                                    <Label>
                                        Last Name{" "}
                                        <span className='text-danger'>*</span>
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
                                    <Label>
                                        Gender{" "}
                                        <span className='text-danger'>*</span>
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
                                    <Label>Date of Birth </Label>
                                    <Input
                                        type='date'
                                        name='dob'
                                        placeholder='date placeholder'
                                        className=''
                                        defaultValue={this.state.dob}
                                        onChange={this.handleChange}
                                    />
                                </div>
                                <div className='row my-1 my-sm-2'>
                                    <Label className='col-12 px-0'>
                                        Location{" "}
                                        <span className='text-danger'>*</span>
                                    </Label>
                                    <div className='col-12 col-sm-4 pl-0 '>
                                        <Input
                                            placeholder='city'
                                            name='city'
                                            onChange={this.handleChange}
                                            defaultValue={this.state.city}
                                            invalid={!this.state.valid.city}
                                        />
                                    </div>
                                    <div className='col-12 col-sm-4 pl-0 pl-sm-1 '>
                                        <Input
                                            placeholder='state'
                                            name='state'
                                            onChange={this.handleChange}
                                            defaultValue={this.state.state}
                                            invalid={!this.state.valid.state}
                                        />
                                    </div>
                                    <div className='col-12 col-sm-4 pl-0 pl-sm-1 '>
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
                                    <Label className='col-12 px-0'>
                                        Contact Info{" "}
                                    </Label>
                                    <div className='col-12 col-sm-6 pr-0 pr-sm-1 '>
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
                                    <div className='col-12 col-sm-6 pl-0 pl-sm-1 '>
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
                    <div className='p-4 my-3 mx-2 mx-lg-5' style={block}>
                        <FormGroup>
                            <h4>Area of Work</h4>
                        </FormGroup>

                        <FormGroup className='row'>
                            <div className='col-12 col-sm-6 pr-0 pr-sm-1 my-1'>
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
                                    value={
                                        this.state.profession !== "" && {
                                            value: this.state.profession,
                                            label: this.state.profession,
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
                                    onChange={(e) => {
                                        console.log(e);
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
                                        this.state.specialization !== "" && {
                                            value: this.state.specialization,
                                            label: this.state.specialization,
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
                                <Label className='m-1'>
                                    <h6>Super Specialization </h6>
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
                                    options={superSpecializationArray}
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
                    <div className='p-4 my-3 mx-2 mx-lg-5' style={block}>
                        <FormGroup className='row'>
                            <h4 className='col-8 col-sm-10 px-0'>Education</h4>
                            <div className='col-4 col-sm-2 row justify-content-end px-0'>
                                <Button
                                    color='info'
                                    size='sm'
                                    onClick={() => {
                                        let education = this.state.education;
                                        education.push({
                                            degree: "",
                                            speciality: "",
                                            startYear: "1975",
                                            endYear: "2020",
                                        });
                                        this.setState({
                                            education: education,
                                        });
                                    }}>
                                    Add
                                    <FontAwesomeIcon
                                        className='ml-1'
                                        icon={faPlus}
                                    />
                                </Button>
                            </div>
                        </FormGroup>

                        {this.state.education.map((x, i) => (
                            <div>
                                <hr />
                                <div className='my-1 row'>
                                    <h5 className='col-9 col-sm-10 col-md-11 my-1 pl-0'>
                                        Education {i + 1}
                                    </h5>
                                    <FontAwesomeIcon
                                        icon={faMinusCircle}
                                        className='text-danger my-auto col-3 col-sm-1 col-md-1 pr-0'
                                        size='md'
                                        style={{ cursor: "pointer" }}
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
                                <div className='row'>
                                    <div className='col-12 col-sm-3 pr-0 pr-sm-1 my-1'>
                                        {i + 1 === 1 && (
                                            <Label className='m-1'>
                                                <h6>Degree </h6>
                                            </Label>
                                        )}
                                        <Input
                                            id={i}
                                            placeholder='Degree'
                                            name='degree'
                                            onChange={(e) =>
                                                this.handleChange(
                                                    e,
                                                    i,
                                                    "degree",
                                                )
                                            }
                                            value={
                                                this.state.education[i]
                                                    ? this.state.education[i]
                                                          .degree
                                                    : ""
                                            }
                                        />
                                    </div>
                                    <div className='col-12 col-sm-6 px-0 pl-sm-1 pr-sm-1 my-1'>
                                        {i + 1 === 1 && (
                                            <Label className='m-1'>
                                                <h6>Speciality </h6>
                                            </Label>
                                        )}
                                        <Input
                                            id={i}
                                            placeholder='Speciality'
                                            name='education'
                                            onChange={(e) =>
                                                this.handleChange(
                                                    e,
                                                    i,
                                                    "speciality",
                                                )
                                            }
                                            value={
                                                this.state.education[i]
                                                    ? this.state.education[i]
                                                          .speciality
                                                    : ""
                                            }
                                        />
                                    </div>
                                    <div className='col-12 col-sm-3 px-0 row my-1'>
                                        <div className='col-12 col-md-12 pl-sm-1 row'>
                                            <div className='col-6 pr-1 pl-0'>
                                                {i + 1 === 1 && (
                                                    <Label className='m-1'>
                                                        <h6>From</h6>
                                                    </Label>
                                                )}
                                                <Input
                                                    placeholder='startYear'
                                                    type='select'
                                                    className=''
                                                    onChange={(e) => {
                                                        this.handleChange(
                                                            e,
                                                            i,
                                                            "startYear",
                                                        );
                                                    }}
                                                    defaultValue={
                                                        this.state.education[i]
                                                            ? this.state
                                                                  .education[i]
                                                                  .startYear
                                                            : ""
                                                    }>
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
                                                {i + 1 === 1 && (
                                                    <Label className='m-1'>
                                                        <h6>To</h6>
                                                    </Label>
                                                )}
                                                <Input
                                                    placeholder='endYear'
                                                    type='select'
                                                    className=''
                                                    onChange={(e) => {
                                                        this.handleChange(
                                                            e,
                                                            i,
                                                            "endYear",
                                                        );
                                                    }}
                                                    defaultValue={
                                                        this.state.education[i]
                                                            ? this.state
                                                                  .education[i]
                                                                  .endYear
                                                            : ""
                                                    }>
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
                                    {/* <div className='col-sm-1'>
                                        <FontAwesomeIcon
                                            icon={faMinusCircle}
                                            className='text-danger my-auto '
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
                                    </div> */}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className='p-4 my-3 mx-2 mx-lg-5' style={block}>
                        <FormGroup>
                            <h4>Resume</h4>
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
                                <div className='col-12 col-sm-4'>
                                    <h5>Uploaded !</h5>
                                </div>

                                <div className='col-12 col-sm-8 row justify-content-between'>
                                    <a
                                        href={`${this.state.resume}`}
                                        className='col-5 btn btn-info btn-sm mr-1'>
                                        View Resume
                                        <FontAwesomeIcon
                                            className='ml-2'
                                            icon={faFileAlt}
                                        />
                                    </a>
                                    {this.state.resume !== "" && (
                                        <button
                                            className='col-6 btn btn-sm btn-primary'
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
                    <div className='p-4 my-3 mx-2 mx-lg-5' style={block}>
                        <FormGroup>
                            <h4>Availability</h4>
                        </FormGroup>
                        <FormGroup>
                            <h5 className='position-relative pl-2 row'>
                                <div className='position-relative ml-3 mr-2'>
                                    <Input
                                        type='checkbox'
                                        style={{
                                            height: "1.2rem",
                                            width: "1.2rem",
                                            position: "absolute",
                                        }}
                                        checked={this.state.locum}
                                        onChange={(e) => {
                                            this.setState({
                                                locum: e.target.checked,
                                            });
                                        }}
                                    />
                                    <span className='pl-2'>
                                        I'm interested in Day Jobs or Locum
                                        Positions
                                    </span>
                                </div>
                            </h5>
                        </FormGroup>
                        {this.state.locum && (
                            <FormGroup className='row'>
                                <InputGroup className='col-12 col-sm-6 my-1 pr-0 pr-sm-1'>
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
                                        name='startTime'
                                        id='exampleTime'
                                        placeholder='time placeholder'
                                        onChange={this.handleChange}
                                        defaultValue={
                                            this.state.startTime ===
                                                undefined ||
                                            this.state.startTime === ""
                                                ? "08:00"
                                                : this.state.startTime
                                        }
                                        invalid={
                                            this.state.valid.startTime ===
                                            undefined
                                                ? false
                                                : !this.state.valid.startTime
                                        }
                                    />
                                </InputGroup>
                                <InputGroup className='col-12 col-sm-6 my-1 pl-0 pl-sm-1'>
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
                                        name='endTime'
                                        id='exampleTime'
                                        placeholder='time placeholder'
                                        className=''
                                        onChange={this.handleChange}
                                        defaultValue={
                                            this.state.endTime === undefined ||
                                            this.state.endTime === ""
                                                ? "18:00"
                                                : this.state.endTime
                                        }
                                        invalid={
                                            this.state.valid.startTime ===
                                            undefined
                                                ? false
                                                : !this.state.valid.startTime
                                        }
                                    />
                                </InputGroup>
                                <InputGroup className='col-12 px-0 my-1'>
                                    <Label className='m-1 col-12'>
                                        <h6>Days </h6>
                                    </Label>
                                    <Select
                                        isClearable={true}
                                        isMulti
                                        className='w-100'
                                        autosize={true}
                                        placeholder='days'
                                        value={this.state.days.map((e) => {
                                            return { value: e, label: e };
                                        })}
                                        options={daysArray}
                                        onChange={(e) => {
                                            console.log(e);
                                            this.handleChangeSelect("days", e);
                                        }}
                                    />
                                </InputGroup>
                            </FormGroup>
                        )}
                    </div>
                    <div className='p-4 m-3 mx-lg-4 d-flex justify-content-end'>
                        {this.state.loading ? (
                            <Button
                                // onClick={this.update}
                                // className='w-25'
                                size='lg'
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
                                size='lg'
                                color='primary'>
                                Update
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
