import React, { Component, createRef } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import {
    faUser,
    faMapMarkerAlt,
    faEnvelope,
    faBriefcaseMedical,
    faPen,
    faPlus,
    faFileAlt,
    faPhone,
} from "@fortawesome/free-solid-svg-icons";
import "../stylesheets/profile.css";
import Loader from "react-loader-spinner";
import imageCompression from "browser-image-compression";
import {
    Progress,
    Media,
    Button,
    Nav,
    Modal,
    Input,
    ModalHeader,
    ModalFooter,
    ModalBody,
    Badge,
} from "reactstrap";
import { BlobServiceClient } from "@azure/storage-blob";

export default class Profile extends Component {
    constructor(props) {
        super(props);
        this.state = {
            profile: null,
            editable: true,
            modalAbout: false,
            modalDetail: false,
            modalExperience: false,
            imageLoading: true,
            progress: 0,
            uploaded: true,
        };
        this.image = React.createRef();
        this.firstName = React.createRef();
        this.lastName = React.createRef();
        this.pin = React.createRef();
        this.city = React.createRef();
        this.addState = React.createRef();
        this.about = React.createRef();
        this.resume = React.createRef();
        this.toggleAbout = this.toggleAbout.bind(this);
        this.toggleDetail = this.toggleDetail.bind(this);
        this.toggleExperience = this.toggleExperience.bind(this);
        this.toggleEducation = this.toggleEducation.bind(this);
        this.uploadImage = this.uploadImage.bind(this);
        this.uploadResume = this.uploadResume.bind(this);
        this.update = this.update.bind(this);
        // this.setProgress = this.setProgress.bind(this);

        this.uploadToStorage = this.uploadToStorage.bind(this);
    }
    update() {
        console.log(this.state.profile);
        axios
            .put(`/api/user/profile/update`, this.state.profile)
            .then((res) => {
                console.log(res);
                this.setState({
                    modalDetail: false,
                    modalAbout: false,
                    modalExperience: false,
                    modalEducation: false,
                });
            })
            .catch((err) => console.log(err));
    }

    toggleAbout() {
        this.setState({ modalAbout: !this.state.modalAbout });
    }
    toggleDetail() {
        // this.lastName.current.value = this.state.profile.lastName;
        this.setState({ modalDetail: !this.state.modalDetail });
    }
    toggleExperience() {
        this.setState({ modalExperience: !this.state.modalExperience });
    }
    toggleEducation() {
        this.setState({ modalEducation: !this.state.modalEducation });
    }
    // setProgress(e) {
    //     this.setState({
    //         progress: e,
    //     });
    // }\
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
                        // console.log(this.state.progress);
                        // console.log(state);
                        // console.log(parseInt(file.size));
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

    uploadImage(e) {
        // console.log(this.image.current.value);
        const files = Array.from(e.target.files);
        if (files.length !== 0) {
            this.setState({ imageLoading: true });
            let profile = this.state.profile;
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
                        name: `${profile._id}_${file.name}`,
                        data: buffer,
                        mimeType: file.type,
                    };
                    console.log(image);
                    axios
                        .post(`/api/upload`, {
                            context: `${profile._id}_${file.name}`,
                        })
                        .then(({ data }) => {
                            const sas = data.token;
                            this.uploadToStorage("canopus", sas, image).then(
                                (res) => {
                                    // console.log(res);
                                    profile.image = `https://canopus.blob.core.windows.net/user-image/${profile._id}_${file.name}`;
                                    // console.log(profile);
                                    this.setState({
                                        profile: profile,
                                        // imageLoading: false,
                                    });
                                    this.update();
                                },
                            );
                        })
                        .catch((e) => console.log(e));
                };
            });
        }
    }
    uploadResume(e) {
        const files = Array.from(e.target.files);
        if (files.length !== 0) {
            this.setState({ uploaded: false });
            let profile = this.state.profile;
            const file = files[0];

            let reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                var matches = reader.result.match(
                    /^data:([A-Za-z-+\/]+);base64,(.+)$/,
                );
                var buffer = new Buffer(matches[2], "base64");
                const resume = {
                    name: `${profile._id}_${file.name}`,
                    data: buffer,
                    mimeType: file.type,
                    size: file.size,
                };
                console.log(resume);
                axios
                    .post(`/api/upload`, {
                        context: `${profile._id}_${file.name}`,
                    })
                    .then(({ data }) => {
                        const sas = data.token;
                        this.uploadToStorage("canopus", sas, resume).then(
                            (res) => {
                                console.log(res);
                                const url = `https://canopus.blob.core.windows.net/user-image/${profile._id}_${file.name}`;
                                console.log(url);
                                profile.resume = url;

                                this.setState({
                                    profile: profile,
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
    componentDidMount() {
        if (this.props.match) {
            if (!this.props.user) {
                this.setState({ editable: false });
                console.log("not editable");
            } else if (this.props.match.params.id !== this.props.user._id) {
                this.setState({ editable: false });
                console.log("not editable");
            }
            axios
                .get(`/api/user/profile/${this.props.match.params.id}`)
                .then(({ data }) => {
                    if (!data.image)
                        data.image =
                            "https://i.pinimg.com/736x/74/73/ba/7473ba244a0ace6d9d301d5fe4478983--sarcasm-meme.jpg";
                    this.setState({
                        profile: data,
                    });
                    console.log(this.state.profile);
                })
                .catch((err) => console.log(err.response));
        } else
            axios
                .get("/api/user/profile")
                .then(({ data }) => {
                    if (!data.image)
                        data.image =
                            "https://i.pinimg.com/736x/74/73/ba/7473ba244a0ace6d9d301d5fe4478983--sarcasm-meme.jpg";
                    this.setState({
                        profile: data,
                    });
                    console.log(this.state.profile);
                })
                .catch((err) => console.log(err.response));
    }
    render() {
        return (
            <div>
                <Nav tabs className='justify-content-between '>
                    <div className='row justify-content-start col-6 col-sm-7'>
                        {/* <NavItem className='mx-1 mx-sm-2'>
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
                        </NavItem> */}
                    </div>
                    <div className='col-6 col-sm-5 row pr-2 pr-sm-3 justify-content-end'>
                        <div className='col-12 col-sm-5 px-0 pr-0 pr-sm-1'>
                            {/* <Link to='/profile/update'>
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
                            </Link> */}
                        </div>
                        <div className='col-12 col-sm-5 px-0 pl-0 pl-sm-1'>
                            <Link to='/profile/update'>
                                <Button
                                    className=' mt-2 my-1 px-2 w-100'
                                    size='sm'
                                    style={{ textAlign: "center" }}
                                    color='primary'>
                                    Update Profile{" "}
                                    <FontAwesomeIcon
                                        icon={faPen}
                                        className='ml-2'
                                    />
                                </Button>
                            </Link>
                        </div>
                    </div>
                </Nav>
                {this.state.profile ? (
                    <div className='row my-3 mx-1 mx-lg-5 p-2 px-lg-5 justify-content-center '>
                        <div className='col-12 col-lg-3'>
                            <div
                                className='block-noHover row text-dark p-2 mt-3 mb-5 my-lg-0'
                                style={{
                                    height: "fit-content",
                                }}>
                                <div className='img-container col-12 col-sm-4 col-lg-12'>
                                    {/* <Loader
                                            type='Rings'
                                            color='#17a2b8'
                                            className='mx-auto w-100'
                                            style={{ textAlign: "center" }}
                                            height={120}
                                            width={120}
                                        />
                                     */}
                                    <div
                                        className='position-relative text-align-center'
                                        style={{ minHeight: "200px" }}>
                                        <img
                                            src={this.state.profile.image}
                                            alt=''
                                            className='img-fluid '
                                            style={{
                                                borderRadius: "0.5rem",
                                                maxHeight: "30vh",
                                            }}
                                            onLoad={() => {
                                                this.setState({
                                                    imageLoading: false,
                                                });
                                            }}
                                        />
                                        <Loader
                                            visible={this.state.imageLoading}
                                            type='Rings'
                                            color='#17a2b8'
                                            className='mx-auto my-2 my-auto w-100 position-absolute'
                                            style={{
                                                textAlign: "center",
                                                top: 0,
                                                height: "100%",
                                                background:
                                                    "rgba(255,255,255,.7)",
                                            }}
                                            height={160}
                                            width={220}
                                        />
                                    </div>
                                </div>
                                <div
                                    className='py-3 px-2 col-12 col-sm-8 col-lg-12 position-relative'
                                    style={{
                                        borderRadius: "0.5rem",
                                    }}>
                                    <div className='m-2 mx-auto'>
                                        <h6 className='row'>
                                            <div className='col-1 px-0'>
                                                <FontAwesomeIcon
                                                    icon={faUser}
                                                    className='ml-2 mr-3'
                                                />
                                            </div>
                                            <div className='col-11 pl-3 text-capitalize'>
                                                {`${this.state.profile.salutation}. ${this.state.profile.firstName} ${this.state.profile.lastName}`}
                                            </div>
                                        </h6>
                                    </div>
                                    <div className='m-2 mx-auto'>
                                        <h6 className='row'>
                                            <div className='col-1 px-0'>
                                                <FontAwesomeIcon
                                                    icon={faBriefcaseMedical}
                                                    className='ml-2 mr-3'
                                                />
                                            </div>
                                            <div className='col-11 pl-3'>
                                                {this.state.profile.title &&
                                                    this.state.profile.title}
                                            </div>
                                        </h6>
                                    </div>
                                    {this.state.profile.address && (
                                        <div className='m-2 mx-auto'>
                                            <h6 className='row'>
                                                <div className='col-1 px-0'>
                                                    <FontAwesomeIcon
                                                        icon={faMapMarkerAlt}
                                                        className='ml-2 mr-3'
                                                    />
                                                </div>
                                                <div className='col-11 px-0 pl-3'>
                                                    {this.state.profile.address
                                                        .city !== "" &&
                                                    this.state.profile.address
                                                        .state !== "" &&
                                                    this.state.profile.address
                                                        .country !== ""
                                                        ? `${this.state.profile.address.city}, ${this.state.profile.address.state}, ${this.state.profile.address.country}`
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
                                                {this.state.profile.username}
                                            </div>
                                        </h6>
                                    </div>
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
                                                {this.state.profile.phone}
                                            </div>
                                        </h6>
                                    </div>
                                    {/* {this.state.editable && (
                                        <button
                                            className='btn btn-info btn-sm m-2 btn-float'
                                            style={{ borderRadius: "50%" }}
                                            onClick={this.toggleDetail}>
                                            <FontAwesomeIcon icon={faPen} />
                                        </button>
                                    )} */}
                                </div>
                            </div>
                        </div>

                        <div className='col-12 col-lg-7 mt-lg-0 ml-sm-0 ml-lg-3 '>
                            <div className='p-3 block-noHover'>
                                <h4 className='position-relative'>
                                    {this.state.profile.title}
                                </h4>
                            </div>
                            <div className='p-3 block-noHover mt-4'>
                                <h4 className='position-relative'>
                                    Area of Work
                                </h4>
                                <h6>
                                    <strong>
                                        {this.state.profile.profession}
                                    </strong>
                                </h6>
                                <h6>{this.state.profile.specialization}</h6>
                                <h6>
                                    <em>
                                        {this.state.profile.superSpecialization.join(
                                            ", ",
                                        )}
                                    </em>
                                </h6>
                            </div>

                            <div className='p-3 block-noHover mt-4'>
                                <h4 className='position-relative mb-3'>
                                    Education
                                </h4>

                                {this.state.profile.education &&
                                    this.state.profile.education.map((data) => (
                                        <div>
                                            <hr className='my-2' />
                                            <Media>
                                                <Media body>
                                                    <Media heading>
                                                        <h5>
                                                            <strong>
                                                                {data.degree}
                                                            </strong>
                                                        </h5>
                                                    </Media>
                                                    <Media heading>
                                                        <h6>
                                                            {data.speciality}
                                                        </h6>
                                                    </Media>
                                                    <div>
                                                        {data.startYear} -{" "}
                                                        {data.endYear}
                                                    </div>
                                                </Media>
                                            </Media>
                                        </div>
                                    ))}
                            </div>
                            <div className='p-3 block-noHover mt-4'>
                                <h4 className='position-relative'>
                                    Availability
                                </h4>

                                {this.state.profile.availability &&
                                    this.state.profile.availability.map(
                                        (data) => (
                                            <div>
                                                <hr />
                                                <Media>
                                                    <Media body>
                                                        <div>
                                                            {`${data.startTime} - ${data.endTime} on `}
                                                            {data.days.map(
                                                                (day) => (
                                                                    <Badge className='mx-1'>
                                                                        {day}
                                                                    </Badge>
                                                                ),
                                                            )}
                                                        </div>
                                                    </Media>
                                                </Media>
                                            </div>
                                        ),
                                    )}
                            </div>

                            {!(
                                typeof this.state.profile.resume ===
                                    "undefined" ||
                                this.state.profile.resume === ""
                            ) && (
                                <div className='block-noHover mt-4 p-2 p-sm-3'>
                                    <h4>Resume</h4>

                                    {(typeof this.state.profile.resume ===
                                        "undefined" ||
                                        this.state.profile.resume === "") &&
                                    this.state.progress !== 1 ? (
                                        <div>
                                            <input
                                                type='file'
                                                class='file'
                                                ref={this.resume}
                                                accept='.pdf,.doc,docx'
                                                onChange={this.uploadResume}
                                            />
                                            <div className='my-1 mt-3'>
                                                <Progress
                                                    animated
                                                    color='info'
                                                    value={
                                                        this.state.progress *
                                                        100
                                                    }>
                                                    <h6 className='m-0'>
                                                        {Math.round(
                                                            this.state
                                                                .progress * 100,
                                                        )}
                                                        {"%"}
                                                    </h6>
                                                </Progress>
                                            </div>
                                        </div>
                                    ) : this.state.uploaded ? (
                                        <div className='row'>
                                            {/* {this.state.editable && (
                                                <div className='col-12 col-sm-4'>
                                                    <h5>Uploaded !</h5>
                                                </div>
                                            )} */}
                                            <div className='col-12 col-sm-8 row justify-content-between'>
                                                <a
                                                    href={`${this.state.profile.resume}`}
                                                    className=' btn btn-info btn-sm mr-1'>
                                                    View Resume
                                                    <FontAwesomeIcon
                                                        className='ml-2'
                                                        icon={faFileAlt}
                                                    />
                                                </a>
                                                {/* <a
                                                href={`${this.state.profile.resume}`}
                                                className='btn btn-info btn-sm float-right mr-3'>
                                                Change Resume
                                            </a> */}
                                                {/* {this.state.editable && (
                                                    <button
                                                        className='col-6 btn btn-sm btn-primary'
                                                        onClick={() => {
                                                            let profile = this
                                                                .state.profile;
                                                            profile.resume = "";
                                                            this.setState({
                                                                profile: profile,
                                                            });
                                                            this.update();
                                                        }}>
                                                        Change Resume
                                                        <FontAwesomeIcon
                                                            className='ml-2'
                                                            icon={faPen}
                                                        />
                                                    </button>
                                                )} */}
                                            </div>
                                        </div>
                                    ) : (
                                        <Loader
                                            type='Rings'
                                            color='#17a2b8'
                                            className='mx-auto my-2 my-auto w-100 '
                                            style={{
                                                textAlign: "center",
                                                height: "100%",
                                                background:
                                                    "rgba(255,255,255,.7)",
                                            }}
                                            height={160}
                                            width={220}
                                        />
                                    )}
                                </div>
                            )}
                        </div>
                        <Modal
                            isOpen={this.state.modalAbout}
                            toggle={this.toggleAbout}>
                            <ModalHeader toggle={this.toggleAbout}>
                                Edit Info
                            </ModalHeader>
                            <ModalBody>
                                <h4>About</h4>
                                <div className='form-group'>
                                    <textarea
                                        className='form-control'
                                        rows='4'
                                        ref={this.about}
                                        value={this.state.profile.description}
                                        onChange={(e) => {
                                            let profile = this.state.profile;
                                            profile.description =
                                                e.target.value;
                                            this.setState({
                                                profile: profile,
                                            });
                                        }}></textarea>
                                </div>
                            </ModalBody>
                            <ModalFooter>
                                <Button color='primary' onClick={this.update}>
                                    Update
                                </Button>{" "}
                                <Button
                                    color='secondary'
                                    onClick={this.toggleAbout}>
                                    Cancel
                                </Button>
                            </ModalFooter>
                        </Modal>
                        <Modal
                            isOpen={this.state.modalDetail}
                            toggle={this.toggleDetail}>
                            <ModalHeader toggle={this.toggleDetail}>
                                Modal title
                            </ModalHeader>
                            <ModalBody>
                                <div className='form-group'>
                                    <div className='img-container '>
                                        <div
                                            className='position-relative'
                                            style={{ minHeight: "200px" }}>
                                            <img
                                                src={this.state.profile.image}
                                                alt=''
                                                className='img-fluid col-12 '
                                                style={{
                                                    borderRadius: "0.5rem",
                                                }}
                                                onLoad={() => {
                                                    this.setState({
                                                        imageLoading: false,
                                                    });
                                                }}
                                            />
                                            <Loader
                                                visible={
                                                    this.state.imageLoading
                                                }
                                                type='Rings'
                                                color='#17a2b8'
                                                className='mx-auto my-2 my-auto w-100 position-absolute'
                                                style={{
                                                    textAlign: "center",
                                                    top: 0,
                                                    height: "100%",
                                                    background:
                                                        "rgba(255,255,255,.7)",
                                                }}
                                                height={260}
                                                width={220}
                                            />
                                        </div>

                                        {/* {this.state.editable && (
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
                                                        <FontAwesomeIcon
                                                            icon={faPen}
                                                        />
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
                                                    onChange={this.uploadImage}
                                                />
                                            </div>
                                        )} */}
                                    </div>
                                    <div className='input-group my-1 row'>
                                        <h6 className='col-12'>Name</h6>
                                        <div className='col-6 px-0 pr-1'>
                                            <input
                                                type='text'
                                                className='form-control'
                                                placeholder='First Name'
                                                value={
                                                    this.state.profile.firstName
                                                }
                                                onChange={(e) => {
                                                    let profile = this.state
                                                        .profile;
                                                    profile.firstName =
                                                        e.target.value;
                                                    this.setState({
                                                        profile: profile,
                                                    });
                                                }}
                                            />
                                        </div>
                                        <div className='col-6 px-0 pl-1'>
                                            <Input
                                                type='text'
                                                className='form-control '
                                                placeholder='Last Name'
                                                ref={this.lastName}
                                                value={
                                                    this.state.profile.lastName
                                                }
                                                onChange={(e) => {
                                                    let profile = this.state
                                                        .profile;
                                                    profile.lastName =
                                                        e.target.value;
                                                    this.setState({
                                                        profile: profile,
                                                    });
                                                }}
                                            />
                                        </div>
                                        <h6 className='col-12 py-1'>
                                            Profession
                                        </h6>

                                        <div className='col-12'>
                                            <Input
                                                type='text'
                                                className='form-control '
                                                placeholder='Profession'
                                                ref={this.lastName}
                                                value={
                                                    this.state.profile
                                                        .profession
                                                }
                                                onChange={(e) => {
                                                    let profile = this.state
                                                        .profile;
                                                    profile.profession =
                                                        e.target.value;
                                                    this.setState({
                                                        profile: profile,
                                                    });
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <hr />
                                    <h6 className='px-1'>Address</h6>
                                    <div className='form-group my-1 row'>
                                        <div className='col-2 col-form-label'>
                                            PIN
                                        </div>
                                        <input
                                            type='text'
                                            className='form-control col-10'
                                            value={`${
                                                this.state.profile.address &&
                                                this.state.profile.address.pin
                                            }`}
                                            onChange={(e) => {
                                                let profile = this.state
                                                    .profile;
                                                profile.address = {
                                                    ...profile.address,
                                                    pin: e.target.value,
                                                };
                                                this.setState({
                                                    profile: profile,
                                                });
                                            }}
                                        />
                                    </div>
                                    <div className='form-group my-1 row'>
                                        <div className='col-2 col-form-label'>
                                            City
                                        </div>
                                        <input
                                            type='text'
                                            className='form-control col-10'
                                            value={`${
                                                this.state.profile.address &&
                                                this.state.profile.address.city
                                            }`}
                                            onChange={(e) => {
                                                let profile = this.state
                                                    .profile;
                                                profile.address = {
                                                    ...profile.address,
                                                    city: e.target.value,
                                                };
                                                this.setState({
                                                    profile: profile,
                                                });
                                            }}
                                        />
                                    </div>
                                    <div className='form-group my-1 row'>
                                        <div className='col-2 col-form-label'>
                                            State
                                        </div>
                                        <input
                                            type='text'
                                            className='form-control col-10'
                                            value={`${
                                                this.state.profile.address &&
                                                this.state.profile.address.state
                                            }`}
                                            onChange={(e) => {
                                                let profile = this.state
                                                    .profile;
                                                profile.address = {
                                                    ...profile.address,
                                                    state: e.target.value,
                                                };
                                                this.setState({
                                                    profile: profile,
                                                });
                                            }}
                                        />
                                    </div>
                                </div>
                            </ModalBody>
                            <ModalFooter>
                                <Button color='primary' onClick={this.update}>
                                    Update
                                </Button>{" "}
                                <Button
                                    color='secondary'
                                    onClick={this.toggleDetail}>
                                    Cancel
                                </Button>
                            </ModalFooter>
                        </Modal>
                        <Modal
                            isOpen={this.state.modalEducation}
                            toggle={this.toggleEducation}>
                            <ModalHeader toggle={this.toggleEducation}>
                                <h5>Edit Educations</h5>
                            </ModalHeader>
                            <ModalBody>
                                <div className='experience'>
                                    {this.state.profile.education &&
                                        this.state.profile.education.map(
                                            (data, i) => {
                                                return (
                                                    <div className='form-group'>
                                                        <h6>
                                                            {data.institute}
                                                        </h6>
                                                        <div className='form-group my-1 row'>
                                                            <div className='col-3 col-form-label'>
                                                                Institute
                                                            </div>
                                                            <input
                                                                type='text'
                                                                className='form-control col-9'
                                                                value={
                                                                    this.state
                                                                        .profile
                                                                        .education[
                                                                        i
                                                                    ].institute
                                                                }
                                                                onChange={(
                                                                    e,
                                                                ) => {
                                                                    let profile = this
                                                                        .state
                                                                        .profile;
                                                                    profile.education[
                                                                        i
                                                                    ] = {
                                                                        ...profile
                                                                            .education[
                                                                            i
                                                                        ],
                                                                        institute:
                                                                            e
                                                                                .target
                                                                                .value,
                                                                    };
                                                                    this.setState(
                                                                        {
                                                                            profile: profile,
                                                                        },
                                                                    );
                                                                }}
                                                            />
                                                        </div>

                                                        <div className='form-group my-1 row'>
                                                            <div className='col-3 col-form-label'>
                                                                Degree
                                                            </div>
                                                            <input
                                                                type='text'
                                                                className='form-control col-9'
                                                                value={
                                                                    this.state
                                                                        .profile
                                                                        .education[
                                                                        i
                                                                    ].degree
                                                                }
                                                                onChange={(
                                                                    e,
                                                                ) => {
                                                                    let profile = this
                                                                        .state
                                                                        .profile;
                                                                    profile.education[
                                                                        i
                                                                    ] = {
                                                                        ...profile
                                                                            .education[
                                                                            i
                                                                        ],
                                                                        degree:
                                                                            e
                                                                                .target
                                                                                .value,
                                                                    };
                                                                    this.setState(
                                                                        {
                                                                            profile: profile,
                                                                        },
                                                                    );
                                                                }}
                                                            />
                                                        </div>

                                                        <div className='form-group my-1 row'>
                                                            <div className='col-3 col-form-label'>
                                                                Start-Year
                                                            </div>
                                                            <input
                                                                type='date'
                                                                className='form-control col-9'
                                                                value={
                                                                    this.state
                                                                        .profile
                                                                        .education[
                                                                        i
                                                                    ].startTime
                                                                }
                                                                onChange={(
                                                                    e,
                                                                ) => {
                                                                    let profile = this
                                                                        .state
                                                                        .profile;
                                                                    profile.education[
                                                                        i
                                                                    ] = {
                                                                        ...profile
                                                                            .education[
                                                                            i
                                                                        ],
                                                                        startTime:
                                                                            e
                                                                                .target
                                                                                .value,
                                                                    };
                                                                    this.setState(
                                                                        {
                                                                            profile: profile,
                                                                        },
                                                                    );
                                                                }}
                                                            />
                                                        </div>
                                                        <div className='form-group my-1 row'>
                                                            <div className='col-3 col-form-label'>
                                                                End-Year
                                                            </div>
                                                            <input
                                                                type='date'
                                                                className='form-control col-9'
                                                                value={
                                                                    this.state
                                                                        .profile
                                                                        .education[
                                                                        i
                                                                    ].endTime
                                                                }
                                                                onChange={(
                                                                    e,
                                                                ) => {
                                                                    let profile = this
                                                                        .state
                                                                        .profile;
                                                                    profile.education[
                                                                        i
                                                                    ] = {
                                                                        ...profile
                                                                            .education[
                                                                            i
                                                                        ],
                                                                        endTime:
                                                                            e
                                                                                .target
                                                                                .value,
                                                                    };
                                                                    console.log(
                                                                        profile,
                                                                    );
                                                                    this.setState(
                                                                        {
                                                                            profile: profile,
                                                                        },
                                                                    );
                                                                }}
                                                            />
                                                        </div>
                                                        <hr />
                                                    </div>
                                                );
                                            },
                                        )}
                                </div>

                                <div className='form-group'>
                                    <button
                                        className='btn btn-danger btn-sm m-2 float-right'
                                        style={{ borderRadius: "50%" }}
                                        onClick={() => {
                                            let pro = this.state.profile;
                                            pro.education = pro.education
                                                ? [
                                                      ...pro.education,
                                                      {
                                                          institute: "",
                                                          degree: "",
                                                          startTime: "",
                                                          endTime: "",
                                                      },
                                                  ]
                                                : [
                                                      {
                                                          institute: "",
                                                          degree: "",
                                                          startTime: "",
                                                          endTime: "",
                                                      },
                                                  ];
                                            this.setState({ profile: pro });
                                        }}>
                                        <FontAwesomeIcon icon={faPlus} />
                                    </button>
                                </div>
                            </ModalBody>
                            <ModalFooter>
                                <Button color='primary' onClick={this.update}>
                                    Update
                                </Button>{" "}
                                <Button
                                    color='secondary'
                                    onClick={this.toggleEducation}>
                                    Cancel
                                </Button>
                            </ModalFooter>
                        </Modal>
                        <Modal
                            isOpen={this.state.modalExperience}
                            toggle={this.toggleExperience}>
                            <ModalHeader toggle={this.toggleExperience}>
                                <h5>Edit Experiences</h5>
                            </ModalHeader>
                            <ModalBody>
                                <div className='experience'>
                                    {this.state.profile.experience &&
                                        this.state.profile.experience.map(
                                            (data, i) => {
                                                return (
                                                    <div className='form-group'>
                                                        <h6>{data.title}</h6>
                                                        <div className='form-group my-1 row'>
                                                            <div className='col-2 col-form-label'>
                                                                Title
                                                            </div>
                                                            <input
                                                                type='text'
                                                                className='form-control col-10'
                                                                value={
                                                                    this.state
                                                                        .profile
                                                                        .experience[
                                                                        i
                                                                    ].title
                                                                }
                                                                onChange={(
                                                                    e,
                                                                ) => {
                                                                    let profile = this
                                                                        .state
                                                                        .profile;
                                                                    profile.experience[
                                                                        i
                                                                    ] = {
                                                                        ...profile
                                                                            .experience[
                                                                            i
                                                                        ],
                                                                        title:
                                                                            e
                                                                                .target
                                                                                .value,
                                                                    };
                                                                    this.setState(
                                                                        {
                                                                            profile: profile,
                                                                        },
                                                                    );
                                                                }}
                                                            />
                                                        </div>

                                                        <div className='form-group my-1 row'>
                                                            <div className='col-2 col-form-label'>
                                                                Line
                                                            </div>
                                                            <input
                                                                type='text'
                                                                className='form-control col-10'
                                                                value={
                                                                    this.state
                                                                        .profile
                                                                        .experience[
                                                                        i
                                                                    ].line
                                                                }
                                                                onChange={(
                                                                    e,
                                                                ) => {
                                                                    let profile = this
                                                                        .state
                                                                        .profile;
                                                                    profile.experience[
                                                                        i
                                                                    ] = {
                                                                        ...profile
                                                                            .experience[
                                                                            i
                                                                        ],
                                                                        line:
                                                                            e
                                                                                .target
                                                                                .value,
                                                                    };
                                                                    this.setState(
                                                                        {
                                                                            profile: profile,
                                                                        },
                                                                    );
                                                                }}
                                                            />
                                                        </div>

                                                        <div className='form-group my-1 row'>
                                                            <div className='col-2 col-form-label'>
                                                                Time
                                                            </div>
                                                            <input
                                                                type='text'
                                                                className='form-control col-10'
                                                                value={
                                                                    this.state
                                                                        .profile
                                                                        .experience[
                                                                        i
                                                                    ].time
                                                                }
                                                                onChange={(
                                                                    e,
                                                                ) => {
                                                                    let profile = this
                                                                        .state
                                                                        .profile;
                                                                    profile.experience[
                                                                        i
                                                                    ] = {
                                                                        ...profile
                                                                            .experience[
                                                                            i
                                                                        ],
                                                                        time:
                                                                            e
                                                                                .target
                                                                                .value,
                                                                    };
                                                                    this.setState(
                                                                        {
                                                                            profile: profile,
                                                                        },
                                                                    );
                                                                }}
                                                            />
                                                        </div>
                                                        <hr />
                                                    </div>
                                                );
                                            },
                                        )}
                                </div>

                                <div className='form-group'>
                                    <button
                                        className='btn btn-danger btn-sm m-2 float-right'
                                        style={{ borderRadius: "50%" }}
                                        onClick={() => {
                                            let pro = this.state.profile;
                                            pro.experience = [
                                                ...pro.experience,
                                                {
                                                    title: "",
                                                    time: "",
                                                    line: "",
                                                },
                                            ];
                                            this.setState({ profile: pro });
                                        }}>
                                        <FontAwesomeIcon icon={faPlus} />
                                    </button>
                                </div>
                            </ModalBody>
                            <ModalFooter>
                                <Button color='primary' onClick={this.update}>
                                    Update
                                </Button>{" "}
                                <Button
                                    color='secondary'
                                    onClick={this.toggleExperience}>
                                    Cancel
                                </Button>
                            </ModalFooter>
                        </Modal>
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
                )}
            </div>
        );
    }
}
