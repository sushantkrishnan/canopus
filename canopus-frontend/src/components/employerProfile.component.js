import React, { Component } from "react";
import Axios from "axios";
import { Badge, Modal, ModalBody, ModalFooter, Button } from "reactstrap";
// import ReactPlayer from "react-player";
import ShowMap from "./showMap.component";
import ImageCarousel from "./imageCarousel.component";
import VideoCarousel from "./videoCarousel.component";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import "../stylesheets/overview.css";
const block = {
    borderRadius: " 0.25rem",
    border: "0.05rem solid #eeeeee",
    /* background-color: rgba(0, 0, 0, 0.15); */
    boxShadow: " 2px 2px 3px rgba(0, 0, 0, 0.1)",
    transition: "0.3s ease-in-out",
};
export default class EmployerProfile extends Component {
    constructor(props) {
        super(props);
        this.state = {
            employer: null,
            modalError: false,
            messError: "",
        };
    }
    toggleErrorModal() {
        this.setState({
            modalError: !this.state.modalError,
        });
    }
    componentDidMount() {
        console.log(this.props);
        Axios.get(`/api/employer/profile/${this.props.match.params.id}`)
            .then(({ data }) => {
                console.log(data);
                this.setState({ employer: data });
            })
            .catch(({ response }) => {
                console.log(response);

                // alert(response.data.err);
                this.setState({
                    modalError: true,
                    messError: "Something went wrong, Please try again.",
                });
                // window.location = "/";
            });
    }
    render() {
        return (
            <div>
                {this.state.employer && (
                    <div className='d-flex flex-column-reverse flex-sm-row mx-auto col-12 col-xl-8 px-2 px-xl-0'>
                        <div className='col-12  py-3'>
                            <div className='row m-2'>
                                <div className='col-8 col-md-3 col-lg-2 px-5 px-sm-0 text-align-center mx-auto'>
                                    <img
                                        src={
                                            this.state.employer.logo
                                                ? this.state.employer.logo
                                                : "https://curoidprod.blob.core.windows.net/curoid/AdobeStock_210416356.jpeg"
                                        }
                                        alt=''
                                        className='img-fluid img-thumbnail'
                                    />
                                </div>
                                <div
                                    className='col-12 col-md-9 col-lg-10 px-3 px-md-5 my-3 my-md-0'
                                    style={{ maxHeight: "max-content" }}>
                                    <h3 className='text-info'>
                                        {this.state.employer.description &&
                                        this.state.employer.description
                                            .organization
                                            ? this.state.employer.description
                                                  .organization
                                            : this.state.employer.firstName}
                                    </h3>
                                    <h6>
                                        {`${
                                            this.state.employer.description &&
                                            this.state.employer.description.type
                                                ? this.state.employer
                                                      .description.type
                                                : "type"
                                        } 
                                        `}
                                        {/* - $
                                        {this.state.employer.description &&
                                        this.state.employer.description
                                            .employeeCount
                                            ? this.state.employer.description
                                                  .employeeCount
                                            : 0}{" "}
                                        employees */}
                                    </h6>
                                    <h6>
                                        {this.state.employer.speciality
                                            ? this.state.employer.speciality
                                            : "Speciality"}
                                    </h6>
                                    {this.state.employer.validated && (
                                        <Badge color='success'>
                                            <FontAwesomeIcon
                                                icon={faCheck}
                                                className='mr-2'
                                            />
                                            Verified
                                        </Badge>
                                    )}
                                </div>
                            </div>
                            <div className='row p-3 m-2' style={block}>
                                <h4 className='text-blue col-12'>About</h4>
                                <p>
                                    {this.state.employer.description &&
                                        this.state.employer.description.about}
                                </p>
                            </div>
                            <div className='row p-3 m-2' style={block}>
                                <h4 className='col-12 mb-4 text-blue'>
                                    Infrastructure
                                </h4>
                                <div className='col-4 text-align-left'>
                                    <h6>No. of Beds</h6>
                                    {this.state.employer.description &&
                                    this.state.employer.description.beds
                                        ? this.state.employer.description.beds
                                        : "NA"}
                                </div>
                                <div className='col-4 text-align-left'>
                                    <h6>No. of ICUs</h6>
                                    {this.state.employer.description &&
                                    this.state.employer.description.ICUs
                                        ? this.state.employer.description.ICUs
                                        : "NA"}
                                </div>
                                <div className='col-4 text-align-left'>
                                    <h6>No. of OTs</h6>
                                    {this.state.employer.description &&
                                    this.state.employer.description.OTs
                                        ? this.state.employer.description.OTs
                                        : "NA"}
                                </div>
                            </div>
                            <div className='row p-3 m-2' style={block}>
                                <h4 className='text-blue col-12'>Location</h4>
                                <p className='col-12'>
                                    {this.state.employer.address &&
                                        this.state.employer.address.line}
                                </p>
                                <p className='col-12'>
                                    {this.state.employer.address &&
                                        `${this.state.employer.address.city}, ${this.state.employer.address.state}, ${this.state.employer.address.pin}`}
                                </p>
                                <div className='col-12'>
                                    {this.state.employer.address &&
                                        this.state.employer.address
                                            .coordinates && (
                                            <ShowMap
                                                coordinates={
                                                    this.state.employer.address
                                                        .coordinates
                                                }
                                            />
                                        )}
                                </div>
                            </div>
                            {this.state.employer.image &&
                                this.state.employer.image.length !== 0 &&
                                !(
                                    this.state.employer.image.length === 1 &&
                                    this.state.employer.image[0] === ""
                                ) && (
                                    <div className='row p-3 m-2' style={block}>
                                        <h4 className='text-emp-primary col-12'>
                                            Images
                                        </h4>
                                        <div className='col-12 col-md-8 mx-auto'>
                                            <ImageCarousel
                                                style={{ minHeight: "360px" }}
                                                items={
                                                    this.state.employer.image
                                                }
                                            />
                                        </div>
                                    </div>
                                )}
                            {this.state.employer.youtube &&
                                this.state.employer.youtube.length > 0 &&
                                !(
                                    this.state.employer.youtube.length === 1 &&
                                    this.state.employer.youtube[0] === ""
                                ) && (
                                    <div className='row p-3 m-2' style={block}>
                                        <h4 className='text-blue'>Videos</h4>

                                        <VideoCarousel
                                            className='w-100'
                                            items={this.state.employer.youtube}
                                        />
                                    </div>
                                )}
                        </div>
                    </div>
                )}
                <Modal
                    isOpen={this.state.modalError}
                    toggle={this.toggleErrorModal}
                    style={{ marginTop: "20vh" }}>
                    <ModalBody>{this.state.messError}</ModalBody>
                    <ModalFooter className='p-1'>
                        <Button
                            size='sm'
                            color='emp-primary'
                            onClick={this.toggleErrorModal}>
                            Ok
                        </Button>
                    </ModalFooter>
                </Modal>
            </div>
        );
    }
}
