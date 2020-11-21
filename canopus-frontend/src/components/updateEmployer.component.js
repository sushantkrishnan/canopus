import React, { Component, Fragment } from "react";
import {
    Label,
    Input,
    FormGroup,
    Form,
    Button,
    Progress,
    Modal,
    Nav,
    NavItem,
    ModalFooter,
    ModalHeader,
    ModalBody,
    Alert,
    InputGroupAddon,
    InputGroup,
    InputGroupText,
} from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { NavLink, Link } from "react-router-dom";
import {
    faPlusCircle,
    faPen,
    faMinus,
    faMinusCircle,
    faPlus,
} from "@fortawesome/free-solid-svg-icons";
import InputMap from "./map.component";
import Axios from "axios";
import { BlobServiceClient } from "@azure/storage-blob";
import imageCompression from "browser-image-compression";
import ImageCarousel from "./imageCarousel.component";
import Select from "react-select";
import data from "../data";

const block = {
    borderRadius: " 0.25rem",
    border: "0.05rem solid lightgrey",
    /* background-color: rgba(0, 0, 0, 0.15); */
    // boxShadow: " 3px 3px 6px rgba(0, 0, 0, 0.3)",
    transition: "0.3s ease-in-out",
};

export default class UpdateEmployer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            firstName: "",
            logo: "",
            lastName: "",
            password: "",
            email: "",
            username: "",
            line: "",
            pin: "",
            city: "",
            state: "",
            speciality: "",
            organization: "",
            type: "",
            links: [""],
            youtube: [""],
            phone: "",
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
            showError2: false,
            logoError: "",
            showError3: false,
            imageError: "",
            valid: {
                organization: true,
                type: true,
                // speciality: true,
                city: true,
                pin: true,
                state: true,
                firstName: true,
                lastName: true,
                firstName: true,
                phone: true,
                youtube: true,
                OTs: true,
                beds: true,
                ICUs: true,
                employeeCount: true,
            },
        };
        this.logo = React.createRef();
        this.image = React.createRef();

        this.handleChange = this.handleChange.bind(this);
        this.update = this.update.bind(this);
        this.setCoordinates = this.setCoordinates.bind(this);
        this.uploadImage = this.uploadImage.bind(this);
        this.uploadLogo = this.uploadLogo.bind(this);
        this.toggleModalError = this.toggleModalError.bind(this);
        this.reload = this.reload.bind(this);
        this.getGeoLocation = this.getGeoLocation.bind(this);
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
        this.setState({
            [name]: value,
            valid: {
                ...this.state.valid,
                [name]: value !== "",
            },
        });
    }

    handleChange(e, index) {
        if (index !== undefined) {
            let links = this.state[e.target.name];
            links[index] = e.target.value;
            this.setState({
                [e.target.name]: links,
            });
        } else
            this.setState({
                [e.target.name]: e.target.value,
            });
        if (
            e.target.name !== "about" &&
            e.target.name !== "about2" &&
            e.target.name !== "line" &&
            e.target.name !== "speciality" &&
            e.target.name !== "pin"
        ) {
            if (
                e.target.name === "OTs" ||
                e.target.name === "ICUs" ||
                e.target.name === "beds" ||
                e.target.name === "employeeCount"
            )
                this.setState({
                    valid: {
                        ...this.state.valid,
                        [e.target.name]:
                            Number(e.target.value) >= 0 &&
                            Number(e.target.value) <= 100000,
                    },
                });
            else if (e.target.name === "phone") {
                console.log(e.target.value);
                // newValid[x] = Number(e.target.value) < 1000000000;
                this.setState({
                    valid: {
                        ...this.state.valid,
                        [e.target.name]: e.target.value.length === 10,
                    },
                });
            } else
                this.setState({
                    valid: {
                        ...this.state.valid,
                        [e.target.name]: e.target.value !== "",
                    },
                });
        } else if (e.target.name === "pin") {
            console.log(e.target.value);
            // newValid[x] = Number(e.target.value) < 1000000000;
            this.setState({
                valid: {
                    ...this.state.valid,
                    [e.target.name]:
                        e.target.value.length === 6 ||
                        e.target.value.length === 0,
                },
            });
        }
    }
    checkYoutube() {
        let valid = true;
        this.state.youtube.forEach((l) => {
            valid =
                valid &&
                (l.startsWith("https://youtu.be") ||
                    l.startsWith("https://youtube.com") ||
                    l.startsWith("https://www.youtube.com"));
        });
        return valid;
    }
    update() {
        const isValid = Object.values(this.state.valid).every(
            (item) => item === true,
        );
        const emp =
            this.state.firstName === "" ||
            this.state.lastName === "" ||
            this.state.organization === "" ||
            this.state.city === "" ||
            this.state.state === "" ||
            this.state.phone === "" ||
            this.state.type === "" ||
            this.state.phone.length !== 10 ||
            (this.state.pin.length !== 0 && this.state.pin.length > 6);

        const ytLinks = this.state.youtube.filter((link) => link !== "");
        const validYoutube = ytLinks.length > 0 ? this.checkYoutube() : true;
        console.log(isValid);
        if (!isValid || emp) {
            this.setState({
                modalError: true,
                modalMess: "Please fill the required fields !",
            });
        } else if (!validYoutube) {
            this.setState({
                modalError: true,
                modalMess: "Please provide correct Youtube links !",
            });
        } else {
            const employer = {
                logo: this.state.logo,
                firstName: this.state.firstName,
                lastName: this.state.lastName,
                image: this.state.image,
                links: this.state.links,
                youtube: ytLinks,
                specialty: this.state.speciality,
                phone: this.state.phone,
                instituteName: this.state.organization,
                // username: this.state.username,
                address: {
                    line: this.state.line,
                    pin: this.state.pin,
                    city: this.state.city,
                    state: this.state.state,
                    coordinates: { lat: this.state.lat, lng: this.state.lng },
                },
                description: {
                    about: this.state.about,
                    about2: this.state.about2,
                    ICUs: Number(this.state.ICUs),
                    OTs: Number(this.state.OTs),
                    beds: Number(this.state.beds),
                    employeeCount: Number(this.state.employeeCount),
                    organization: this.state.organization,
                    type: this.state.type,
                },
            };

            console.log(employer);
            Axios.put(`/api/employer/profile/update`, employer)
                .then((data) => {
                    console.log(data);
                    if (data.status === 200) {
                        // alert("Update successful");
                        this.props.setUser(data.data);
                        window.location = "/employer";
                    }
                })
                .catch((err) => {
                    console.log(err);
                    const response = err.response;
                    if (response && response.err) {
                        this.setState({
                            modalError: true,
                            modalMess:
                                response.err === ""
                                    ? "Something went wrong, Please try again."
                                    : response.err,
                        });
                    } else
                        this.setState({
                            modalError: true,
                            modalMess:
                                "Something went wrong, Please try again.",
                        });
                });
        }
    }
    getGeoLocation() {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude,
                    lng = position.coords.longitude;

                this.setState({ lat, lng });
            },
            (err) => {
                console.log(err);
                this.setState({
                    lat: 20,
                    lng: 120,
                });
            },
        );
    }
    componentDidMount() {
        Axios.get("/api/employer/profile")
            .then(({ data }) => {
                const user = data;
                console.log(user._id);
                console.log(user);
                if (user) {
                    this.setState({
                        id: user._id,
                        firstName: user.firstName,
                        username: user.username,
                        lastName: user.lastName,
                    });
                    if (user.address === undefined) this.getGeoLocation();
                    else if (
                        !user.address.coordinates.lat ||
                        !user.address.coordinates.lng
                    )
                        this.getGeoLocation();
                    this.setState({
                        id: user._id,
                        // });
                        // this.setState({
                        //     id: user._id,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        logo:
                            !user.logo ||
                            user.logo === undefined ||
                            user.logo === ""
                                ? "https://curoidprod.blob.core.windows.net/curoid/AdobeStock_210416356.jpeg"
                                : user.logo,
                        links: user.links,
                        username: user.username,
                        youtube: user.youtube,
                        image: user.image,
                        speciality: user.specialty,
                        phone: user.phone,
                        line: user.address.line,
                        pin: user.address.pin,
                        city: user.address.city,
                        // state: user.address.state===""?"Maharashtra":user.address.state,
                        state: user.address.state,
                        lat: user.address.coordinates
                            ? user.address.coordinates.lat
                            : null,
                        lng: user.address.coordinates
                            ? user.address.coordinates.lng
                            : null,

                        about: user.description.about,
                        about2: user.description.about2,
                        beds: Number(user.description.beds),
                        OTs: user.description.OTs
                            ? Number(user.description.OTs)
                            : 0,
                        ICUs: user.description.ICUs ? user.description.ICUs : 0,
                        employeeCount: user.description.employeeCount
                            ? Number(user.description.employeeCount)
                            : 0,
                        organization: user.instituteName
                            ? user.instituteName
                            : user.description.organization,
                        type: user.description.type,
                    });
                }
            })
            .catch((err) => {
                console.log(err);
                if (err.response)
                    this.setState({
                        modalError: true,
                        modalMess: "Something went wrong, Please try again.",
                    });
            });
    }
    reload() {
        this.props.history.push("/employer");
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
                "employer-image",
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
                    },
                },
            );
            console.log(uploadBlobResponse);
            return `https://curoidprod.blob.core.windows.net/employer-image/profile`;
        } catch (error) {
            console.error(error);
        }
    }

    uploadImage(e) {
        // console.log(this.image.current.value);
        this.setState({ loading: true });
        const files = Array.from(e.target.files);
        if (files.length !== 0) {
            this.setState({ uploadingImage: true });
            let profile = this.state.profile;
            if (
                files[0].type.split("/")[0] !== "image" ||
                files[0].size > 10000000
            ) {
                console.log("wrong");
                this.setState({
                    loading: false,
                    showError3: true,
                    imageError: "Invalid File Format or Size",
                    loading: false,
                    uploadingImage: false,
                    progress: 0,
                });
                this.image.current.value = "";
                return;
            } else {
                this.setState({
                    showError3: false,
                });
            }
            const options = {
                maxSizeMB: 0.512, // (default: Number.POSITIVE_INFINITY)
                maxWidthOrHeight: 1920,
            };
            imageCompression(files[0], options).then((file) => {
                // console.log("compressedFile instanceof Blob", file instanceof Blob); // true
                console.log(`file size ${file.size / 1024 / 1024} MB`); // smaller than maxSizeMB
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
                    Axios.post(`/api/upload/employer`, {
                        context: `${this.state.id}_${file.name}`,
                    })
                        .then(({ data }) => {
                            const sas = data.token;
                            this.uploadToStorage("canopus", sas, image).then(
                                (res) => {
                                    const url = `https://canopus.blob.core.windows.net/employer-image/${this.state.id}_${file.name}`;
                                    let imgs = this.state.image;
                                    console.log(imgs);
                                    this.setState({
                                        image: [...imgs, url],
                                        loading: false,
                                        uploadingImage: false,
                                        progress: 0,
                                        showError3: false,
                                    });
                                    // console.log(profile);
                                    console.log(res);
                                    // this.update();
                                    // this.update();
                                },
                            );
                        })
                        .catch((e) => {
                            console.log(e);
                            this.setState({
                                modalError: true,
                                modalMess:
                                    "Something went wrong, Please try again.",
                            });
                        });
                };
            });
        }
    }
    uploadLogo(e) {
        // console.log(this.image.current.value);
        this.setState({ loading: true });
        console.log(this.state);
        const files = Array.from(e.target.files);
        if (files.length !== 0) {
            this.setState({ uploadingLogo: true });
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
            const options = {
                maxSizeMB: 0.256, // (default: Number.POSITIVE_INFINITY)
                maxWidthOrHeight: 1920,
            };
            imageCompression(files[0], options).then((file) => {
                // console.log("compressedFile instanceof Blob", file instanceof Blob); // true
                console.log(`file size ${file.size / 1024 / 1024} MB`); // smaller than maxSizeMB
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
                    Axios.post(`/api/upload/employer`, {
                        context: `${this.state.id}_${file.name}`,
                    })
                        .then(({ data }) => {
                            const sas = data.token;
                            this.uploadToStorage("canopus", sas, image).then(
                                (res) => {
                                    const url = `https://canopus.blob.core.windows.net/employer-image/${this.state.id}_${file.name}`;
                                    this.setState({
                                        logo: url,
                                        loading: false,
                                        uploadingLogo: false,
                                        showError2: false,
                                    });

                                    console.log(res);
                                    // this.update();
                                    // this.setState({
                                    //     profile: profile,
                                    //     // imageLoading: false,
                                    // });
                                    // this.update();
                                },
                            );
                        })
                        .catch((e) => {
                            console.log(e);
                            this.setState({
                                modalError: true,
                                modalMess:
                                    "Something went wrong, Please try again.",
                            });
                        });
                };
            });
        }
    }
    render() {
        let orgTypeArray = [],
            stateArray = [],
            cityArray = [],
            specialityArray = [];
        let locationArray = {};
        if (this.props.data) {
            orgTypeArray = this.props.data.instituteType.map((degree) => {
                return {
                    value: degree,
                    label: degree,
                };
            });
            specialityArray = this.props.data.speciality.map((degree) => {
                return {
                    value: degree,
                    label: degree,
                };
            });
        }
        if (this.props.locationData) {
            stateArray = this.props.locationData.location.map((obj) => {
                return obj.state;
            });
            stateArray = [...new Set(stateArray)];
            cityArray = this.props.locationData.location.map((obj) => {
                return obj.name;
            });
            for (let i = 0; i < stateArray.length; i++) {
                locationArray[stateArray[i]] = [];
            }
            // console.log(locationArray);

            this.props.locationData.location.forEach((obj) => {
                locationArray[obj.state] = [
                    ...locationArray[obj.state],
                    obj.name,
                ];
            });

            // console.log(locationArray);
            // console.log(stateArray);
            // console.log(cityArray);
        }
        return (
            <div className='mx-auto col-12 col-sm-10 col-xl-8 px-0 overflow-hidden'>
                <Nav tabs className='justify-content-between '>
                    <div className='row justify-content-start col-7 col-sm-5 col-md-6 col-lg-7'>
                        <NavItem className='mx-1 mx-sm-2'>
                            <NavLink
                                className='p-1 p-sm-2 active-tab nav-link'
                                to='/employer'>
                                <h6>Overview</h6>
                            </NavLink>
                        </NavItem>
                        <NavItem className='mx-1 mx-sm-2'>
                            <NavLink
                                className='nav-link p-1 p-sm-2 '
                                to='/applications'>
                                <h6>Jobs</h6>
                            </NavLink>
                        </NavItem>
                    </div>
                    <div className='row ustify-content-end'>
                        {/* <div className='px-0 pr-0 pr-sm-1'>
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
                        </div> */}
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
                <div className='my-2'>
                    <div className='p-4 my-3 mx-2 mx-sm-auto' style={block}>
                        <FormGroup>
                            <h4 className='text-emp-primary'>Details</h4>
                        </FormGroup>
                        <FormGroup className='row'>
                            <div className='col-12 col-md-3 text-align-center'>
                                {/* <Label className='w-100'>Logo</Label> */}
                                <Alert
                                    color='warning'
                                    isOpen={this.state.showError2}
                                    toggle={() => {
                                        this.setState({ showError2: false });
                                    }}>
                                    {this.state.logoError}
                                </Alert>
                                {this.state.logo && this.state.logo !== "" && (
                                    <img
                                        src={this.state.logo}
                                        className='img-fluid img-thumbnail'
                                        alt='logo'
                                    />
                                )}
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
                                        <div className=''>
                                            <button
                                                className='btn btn-emp-secondary btn-sm m-2 btn-float'
                                                // style={{
                                                //     borderRadius: "50%",
                                                // }}
                                                disabled={
                                                    this.state.uploadingLogo
                                                }>
                                                <label
                                                    htmlFor='logo'
                                                    style={{
                                                        display: "inline-block",
                                                        margin: 0,
                                                        cursor: "pointer",
                                                        width: "100%",
                                                    }}>
                                                    {/* <FontAwesomeIcon icon={faPen} /> */}
                                                    Upload Logo
                                                </label>
                                            </button>

                                            <input
                                                type='file'
                                                style={{
                                                    // position: "absolute",
                                                    zIndex: "-1",
                                                    overflow: "hidden",
                                                    opacity: 0,
                                                    cursor: "pointer",
                                                }}
                                                id='logo'
                                                accept='image/*'
                                                ref={this.logo}
                                                disabled={
                                                    this.state.uploadingLogo
                                                }
                                                onChange={this.uploadLogo}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className='col-md-9 row'>
                                <div className='col-12 col-sm-6 pr-0 pr-sm-1 my-1 my-sm-2'>
                                    <Label className='mb-1'>
                                        Oranization Name{" "}
                                        <span className='text-danger'>*</span>
                                    </Label>
                                    <Input
                                        placeholder='Organization Name'
                                        name='organization'
                                        onChange={this.handleChange}
                                        value={this.state.organization}
                                        invalid={!this.state.valid.organization}
                                    />
                                </div>
                                <div className='col-12 col-sm-6 pr-0 pl-sm-1 my-1 my-sm-2'>
                                    <Label className='mb-1'>
                                        Organization Type{" "}
                                        <span className='text-danger'>*</span>
                                    </Label>
                                    {/* <Input
                                placeholder='Organization Type'
                                name='type'
                                onChange={this.handleChange}
                                defaultValue={this.state.type}
                            /> */}
                                    <Select
                                        autosize={true}
                                        isClearable={true}
                                        placeholder='Organization Type'
                                        value={
                                            this.state.type !== "" && {
                                                value: this.state.type,
                                                label: this.state.type,
                                            }
                                        }
                                        className={
                                            !this.state.valid.type
                                                ? "border-invalid"
                                                : ""
                                        }
                                        options={orgTypeArray}
                                        onChange={(e) => {
                                            console.log(e);
                                            this.handleChangeSelect(
                                                "type",
                                                e ? e.value : "",
                                            );
                                        }}
                                    />
                                </div>
                                <div className='col-12  my-1 my-sm-2'>
                                    <Label className='mb-1'>Speciality</Label>
                                    {/* <Input
                                placeholder='Organization Type'
                                name='type'
                                onChange={this.handleChange}
                                defaultValue={this.state.type}
                            /> */}
                                    <Input
                                        // autosize={true}
                                        // isClearable={true}
                                        // className={
                                        //     !this.state.valid.speciality
                                        //         ? "border-invalid"
                                        //         : ""
                                        // }
                                        name='speciality'
                                        placeholder='Speciality'
                                        value={this.state.speciality}
                                        onChange={this.handleChange}
                                    />
                                    <datalist>
                                        {/* options= */}
                                        {data.speciality.map((type) => {
                                            return (
                                                <option value={type}>
                                                    {type}
                                                </option>
                                            );
                                        })}
                                    </datalist>
                                </div>

                                <div className='col-12  my-1'>
                                    <Label className='mb-1'>
                                        About Organization
                                    </Label>

                                    <textarea
                                        name=''
                                        className='form-control'
                                        name='about'
                                        value={this.state.about}
                                        onChange={this.handleChange}
                                        rows='4'
                                        placeholder='About Organization'></textarea>
                                </div>
                            </div>

                            {/* <div className='col-12 col-md-9 px-2'></div> */}
                        </FormGroup>
                    </div>
                    <div className='p-4 my-3 mx-2 mx-sm-auto' style={block}>
                        {/* AIzaSyANIOnj2SfsuhCNZ9iqb4FMagPb7K_vdH0 */}
                        <FormGroup>
                            <h4 className='text-emp-primary'>Address</h4>
                        </FormGroup>
                        <div className='row '>
                            <div className='col-12 col-lg-6 pr-2 d-flex flex-column '>
                                <FormGroup>
                                    <Label className='mb-1'>Line</Label>
                                    <textarea
                                        placeholder='Address Line'
                                        name='line'
                                        className='form-control'
                                        rows='2'
                                        onChange={this.handleChange}
                                        value={this.state.line}
                                    />
                                </FormGroup>
                                <FormGroup className='row '>
                                    <div className='col-12 col-sm-6 pr-0 pr-sm-1 mb-2 mb-sm-0'>
                                        <Label className='mb-1'>PIN</Label>
                                        <Input
                                            placeholder='PIN'
                                            name='pin'
                                            onChange={this.handleChange}
                                            value={this.state.pin}
                                            invalid={!this.state.valid.pin}
                                        />
                                    </div>
                                    <div className='col-12 col-sm-6 pl-0 pl-sm-1 mb-2 mb-sm-0'>
                                        <Label className='mb-1'>
                                            State{" "}
                                            <span className='text-danger'>
                                                *
                                            </span>
                                        </Label>
                                        <select
                                            placeholder='State'
                                            name='state'
                                            className='custom-select'
                                            onChange={(e) => {
                                                this.setState({ city: "" });
                                                this.handleChange(e);
                                            }}
                                            value={this.state.state}
                                            invalid={!this.state.valid.state}
                                            // onChange={this.props.handleChange("email")}
                                            // defaultValue={values.email}
                                            list='states'>
                                            {/* <datalist id='states'> */}
                                            <option selected value=''>
                                                Select State
                                            </option>
                                            {stateArray.length !== 0 &&
                                                stateArray.map((state) => (
                                                    <option value={state}>
                                                        {state}
                                                    </option>
                                                ))}
                                            {/* </datalist> */}
                                        </select>
                                    </div>
                                </FormGroup>
                                <FormGroup>
                                    <Label className='mb-1'>
                                        City{" "}
                                        <span className='text-danger'>*</span>
                                    </Label>
                                    <Input
                                        placeholder='City'
                                        name='city'
                                        onChange={this.handleChange}
                                        value={this.state.city}
                                        invalid={!this.state.valid.city}
                                        list='cities'
                                    />
                                    <datalist id='cities'>
                                        {this.state.state === "" ||
                                        !locationArray[this.state.state]
                                            ? cityArray.length !== 0 &&
                                              cityArray.map((city) => (
                                                  <option value={city}>
                                                      {city}
                                                  </option>
                                              ))
                                            : locationArray[this.state.state] &&
                                              locationArray[
                                                  this.state.state
                                              ].map((city) => (
                                                  <option value={city}>
                                                      {city}
                                                  </option>
                                              ))}
                                    </datalist>
                                </FormGroup>
                                {/* <FormGroup className='row '>
                                    <div className='col-12 col-sm-6 pr-1'>
                                        <Label className='mb-1'>Latitude</Label>
                                        <Input
                                            placeholder='Latitude'
                                            name='lat'
                                            // onChange={this.handleChange}
                                            value={this.state.lat}
                                            disabled
                                        />
                                    </div>
                                    <div className='col-12 col-sm-6 pl-1'>
                                        <Label className='mb-1'>Longitude</Label>
                                        <Input
                                            placeholder='longitude'
                                            name='lng'
                                            // onChange={this.handleChange}
                                            value={this.state.lng}
                                            disabled
                                        />
                                    </div>
                                </FormGroup> */}
                            </div>

                            <div className='col-12 col-lg-6'>
                                <FormGroup className='img-thumbnail'>
                                    {this.state.lat && this.state.lng && (
                                        <InputMap
                                            setCoordinates={this.setCoordinates}
                                            coordinates={{
                                                lat: this.state.lat,
                                                lng: this.state.lng,
                                            }}
                                        />
                                    )}
                                    {/* ) : (
                                        <InputMap
                                            setCoordinates={this.setCoordinates}
                                            coordinates={null}
                                        />
                                    )} */}
                                </FormGroup>
                            </div>
                        </div>
                    </div>
                    <div className='p-4 my-3 mx-2 mx-sm-auto' style={block}>
                        <FormGroup>
                            <h4 className='text-emp-primary'>Infrastructure</h4>
                        </FormGroup>

                        <FormGroup className='row'>
                            <div className='col-12 col-sm-3 pr-0 pr-sm-1'>
                                <Label className='mb-1'>Beds</Label>
                                <Input
                                    type='number'
                                    placeholder='Number of Beds'
                                    name='beds'
                                    value={Number(this.state.beds)}
                                    onChange={this.handleChange}
                                    invalid={!this.state.valid.beds}

                                    // defaultValue={`${this.state.beds}`}
                                />
                            </div>
                            <div className='col-12 col-sm-3 pr-0 pr-sm-1'>
                                <Label className='mb-1'>ICUs</Label>
                                <Input
                                    type='number'
                                    placeholder='Number of ICUs'
                                    name='ICUs'
                                    onChange={this.handleChange}
                                    value={Number(this.state.ICUs)}
                                    invalid={!this.state.valid.ICUs}
                                />
                            </div>
                            <div className='col-12 col-sm-3 pr-0 pr-sm-1'>
                                <Label className='mb-1'>OTs</Label>
                                <Input
                                    type='number'
                                    placeholder='Number of OTs'
                                    name='OTs'
                                    onChange={this.handleChange}
                                    value={Number(this.state.OTs)}
                                    invalid={!this.state.valid.OTs}
                                />
                            </div>
                            <div className='col-12 col-sm-3 pr-0 pr-sm-1'>
                                <Label className='mb-1'>Employee count</Label>
                                <Input
                                    type='number'
                                    placeholder='No. of Employees'
                                    name='employeeCount'
                                    onChange={this.handleChange}
                                    invalid={!this.state.valid.employeeCount}
                                    value={Number(this.state.employeeCount)}
                                />
                            </div>
                        </FormGroup>
                    </div>
                    <div className='p-4 my-3 mx-2 mx-sm-auto' style={block}>
                        <FormGroup>
                            <h4 className='text-emp-primary'>Media</h4>
                        </FormGroup>
                        <Label className='row'>
                            <h5 className='col-8 col-sm-10 my-auto pl-0'>
                                Links
                            </h5>
                            <div className='col-4 col-sm-2 px-0 row justify-content-end'>
                                <Button
                                    color={"emp-secondary-2"}
                                    disabled={this.state.links.length >= 5}
                                    onClick={() => {
                                        if (this.state.links.length < 5) {
                                            let links = this.state.links;
                                            links.push("");
                                            this.setState({
                                                links: links,
                                            });
                                        }
                                    }}
                                    className={`btn-sm`}
                                    style={{ cursor: "pointer" }}>
                                    <FontAwesomeIcon icon={faPlus} /> Add Link
                                </Button>
                            </div>
                        </Label>
                        {this.state.links.map((x, i) => (
                            <div className='my-1 row'>
                                <Input
                                    id={i}
                                    placeholder='Social Media Link'
                                    name='links'
                                    onChange={(e) => this.handleChange(e, i)}
                                    value={this.state.links[i]}
                                    className='col-9 col-sm-10 col-md-11'
                                />
                                <FontAwesomeIcon
                                    icon={faMinusCircle}
                                    className='text-danger my-auto col-3 col-sm-1 col-md-1'
                                    size='lg'
                                    style={{ cursor: "pointer" }}
                                    onClick={(e) => {
                                        let links = this.state.links;
                                        links.splice(i, 1);
                                        this.setState({
                                            links: links,
                                        });
                                    }}
                                />
                            </div>
                        ))}
                        <hr />
                        <Alert
                            color='warning'
                            isOpen={this.state.showError3}
                            toggle={() => {
                                this.setState({
                                    showError3: !this.state.showError3,
                                });
                            }}>
                            {this.state.imageError}
                        </Alert>
                        <Label className='row mt-2'>
                            <h5 className='col-7 col-sm-10 pl-0 my-auto'>
                                Images
                            </h5>
                            <div className='col-5 col-sm-2 px-0 row justify-content-end'>
                                <div className='my-1  ml-0 pl-0'>
                                    <button
                                        className='btn btn-emp-secondary-2 btn-sm '
                                        // style={{
                                        //     borderRadius: "50%",
                                        // }}
                                        disabled={
                                            this.state.loading ||
                                            this.state.image.length >= 5
                                        }>
                                        <label
                                            htmlFor='image'
                                            style={{
                                                display: "inline-block",
                                                margin: 0,
                                                cursor: "pointer",
                                                width: "100%",
                                            }}>
                                            <FontAwesomeIcon icon={faPlus} />{" "}
                                            Add Image
                                        </label>
                                    </button>

                                    <input
                                        type='file'
                                        style={{
                                            // position: "absolute",
                                            zIndex: "-1",
                                            overflow: "hidden",
                                            opacity: 0,
                                            cursor: "pointer",
                                            width: ".1px",
                                            height: ".1px",
                                        }}
                                        id='image'
                                        accept='image/*'
                                        ref={this.image}
                                        disabled={
                                            this.state.loading ||
                                            this.state.image.length >= 5
                                        }
                                        onChange={this.uploadImage}
                                    />
                                </div>
                            </div>
                        </Label>
                        {this.state.uploadingImage && (
                            <Progress
                                animated
                                color='info'
                                value={this.state.progress * 100}>
                                <h6 className='m-0'>
                                    {Math.round(this.state.progress * 100)}
                                    {"%"}
                                </h6>
                            </Progress>
                        )}
                        <div className='mx-auto' style={{ maxWidth: "600px" }}>
                            {this.state.image && (
                                <ImageCarousel
                                    className='col-12 text-align-center'
                                    items={this.state.image}
                                />
                            )}
                        </div>

                        {this.state.image.map((x, i) => (
                            <div className='my-1 row'>
                                <Input
                                    id={i}
                                    placeholder='Image Link'
                                    name='image'
                                    onChange={(e) => this.handleChange(e, i)}
                                    value={this.state.image[i]}
                                    style={{ opacity: 0, height: ".1px" }}
                                    // className='col-10 col-sm-10 col-md-11'
                                />
                                <Input
                                    value={this.state.image[i].split("_")[1]}
                                    className='col-10 col-sm-10 col-md-11'
                                    disabled
                                />
                                <FontAwesomeIcon
                                    icon={faMinusCircle}
                                    className='text-danger col-2 col-sm-2 col-md-1 my-auto'
                                    size='lg'
                                    style={{ cursor: "pointer" }}
                                    onClick={(e) => {
                                        let image = this.state.image;
                                        image.splice(i, 1);
                                        this.setState({
                                            image: image,
                                        });
                                    }}
                                />
                            </div>
                        ))}
                        <hr />
                        <Label className='row mt-2'>
                            <h5 className='col-8 col-sm-10 pl-0 my-auto'>
                                Videos
                            </h5>
                            <div className='col-4 col-sm-2 px-0 row justify-content-end'>
                                <Button
                                    // icon={faPlusCircle}
                                    // size='lg'
                                    color={"emp-secondary-2"}
                                    disabled={this.state.youtube.length >= 5}
                                    onClick={() => {
                                        if (this.state.youtube.length < 5) {
                                            let youtube = this.state.youtube;
                                            youtube.push("");
                                            this.setState({
                                                youtube: youtube,
                                            });
                                        }
                                    }}
                                    disabled={this.state.youtube.length >= 5}
                                    className={` btn-sm`}
                                    style={{ cursor: "pointer" }}>
                                    <FontAwesomeIcon icon={faPlus} /> Add Link
                                </Button>
                            </div>
                        </Label>
                        {this.state.youtube.map((x, i) => (
                            <div className='my-1 row'>
                                <Input
                                    id={i}
                                    placeholder='Youtube Link'
                                    name='youtube'
                                    onChange={(e) => this.handleChange(e, i)}
                                    value={this.state.youtube[i]}
                                    className='col-10 col-sm-10 col-md-11'
                                />
                                <FontAwesomeIcon
                                    icon={faMinusCircle}
                                    className='text-danger col-2 col-sm-2 col-md-1 my-auto'
                                    size='lg'
                                    style={{ cursor: "pointer" }}
                                    onClick={(e) => {
                                        let youtube = this.state.youtube;
                                        youtube.splice(i, 1);
                                        this.setState({
                                            youtube: youtube,
                                        });
                                    }}
                                />
                            </div>
                        ))}
                    </div>
                    <div className='p-4 my-3 mx-2 mx-sm-auto' style={block}>
                        <FormGroup>
                            <h4 className='text-emp-primary'>
                                Contact Details
                            </h4>
                        </FormGroup>
                        <FormGroup className='row'>
                            <div className='col-12 col-md-6  p-0 pr-sm-1  my-1'>
                                <Label className='mb-1'>
                                    First Name{" "}
                                    <span className='text-danger'> *</span>
                                </Label>
                                <Input
                                    placeholder='First Name'
                                    name='firstName'
                                    onChange={this.handleChange}
                                    value={this.state.firstName}
                                    invalid={!this.state.valid.firstName}
                                />
                            </div>
                            <div className='col-12 col-md-6  p-0 pl-sm-1  my-1'>
                                <Label className='mb-1'>
                                    Last Name{" "}
                                    <span className='text-danger'>*</span>
                                </Label>
                                <Input
                                    placeholder='Last Name'
                                    name='lastName'
                                    onChange={this.handleChange}
                                    value={this.state.lastName}
                                />
                            </div>
                            <div className='col-12 col-md-6  p-0 pr-sm-1  my-1'>
                                <Label className='mb-1'>E-mail</Label>
                                <Input
                                    placeholder='Email'
                                    // name='firstName'
                                    // onChange={this.handleChange}
                                    value={this.state.username}
                                    disabled={true}
                                />
                            </div>
                            <div className='col-12 col-md-6  p-0 pl-sm-1  my-1'>
                                <Label className='mb-1'>
                                    Phone no.{" "}
                                    <span className='text-danger'>*</span>
                                </Label>
                                <InputGroup>
                                    <InputGroupAddon addonType='prepend'>
                                        <InputGroupText>+91</InputGroupText>
                                    </InputGroupAddon>
                                    <Input
                                        type='number'
                                        // max='999999999'
                                        pattern='[1-9]{1}[0-9]{9}'
                                        placeholder='Phone Number'
                                        name='phone'
                                        onChange={this.handleChange}
                                        value={this.state.phone}
                                        invalid={!this.state.valid.phone}
                                    />
                                </InputGroup>
                            </div>
                        </FormGroup>
                    </div>
                    <div className='px-lg-0 m-2 mx-lg-0 d-flex justify-content-end'>
                        {/* {this.state.loading ? (
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
                        ) : ( */}

                        <Button
                            onClick={this.reload}
                            // className='w-25'

                            disabled={this.state.loading}
                            color='emp-secondary'>
                            Discard Updates
                        </Button>
                        <Button
                            onClick={this.update}
                            // className='w-25'

                            className='ml-1'
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
