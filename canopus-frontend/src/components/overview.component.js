import React, { Component } from "react";
import Axios from "axios";
import hospital from "../images/hospital.svg";
import { Table, Badge } from "reactstrap";
import ReactPlayer from "react-player";
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
export default class Overview extends Component {
    constructor(props) {
        super(props);
        this.state = {
            employer: null,
        };
    }
    componentDidMount() {
        Axios.get("/api/employer/profile")
            .then(({ data }) => {
                console.log(data);
                this.setState({ employer: data });
            })
            .catch((err) => {
                console.log(err);
                const response = err.response;
                if (response && response.data) {
                    window.location = "/";
                }
            });
    }
    render() {
        let banner;
        if (this.props.banner) banner = this.props.banner;
        return (
            <div>
                {this.state.employer && (
                    <div className='d-flex flex-column-reverse flex-sm-row mx-1 mx-sm-3'>
                        <div className='col-12  col-sm-7 col-md-8  py-3'>
                            <div className='row m-1 m-sm-2'>
                                <div className='col-8 mx-auto col-md-3 col-lg-2 px-5 px-sm-0 text-align-center'>
                                    <img
                                        src={
                                            this.state.employer.logo
                                                ? this.state.employer.logo
                                                : hospital
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
                                    <h6>{this.state.employer.specialty}</h6>
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
                                <div
                                    className='col-12 d-block d-sm-none'
                                    style={{ height: "max-content" }}>
                                    <h4 className='text-blue text-align-center'>
                                        Subscription Details
                                    </h4>
                                    <Table
                                        // size='md'
                                        hover
                                        className='col-12 border p-1'>
                                        <thead>
                                            <tr>
                                                <th className='text-align-left'>
                                                    Jobs
                                                </th>
                                                <th>Open</th>
                                                <th>Closed</th>
                                                <th>Available</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <th
                                                    scope='row'
                                                    className='text-align-left'>
                                                    Regular
                                                </th>
                                                <td>
                                                    {this.state.employer
                                                        .jobtier &&
                                                        this.state.employer
                                                            .jobtier.posted -
                                                            this.state.employer
                                                                .jobtier.closed}
                                                </td>
                                                <td>
                                                    {this.state.employer
                                                        .jobtier &&
                                                        this.state.employer
                                                            .jobtier.closed}
                                                </td>
                                                <td>
                                                    {this.state.employer
                                                        .jobtier &&
                                                        this.state.employer
                                                            .jobtier.allowed -
                                                            this.state.employer
                                                                .jobtier.posted}
                                                </td>
                                            </tr>
                                            <tr>
                                                <th
                                                    scope='row'
                                                    className='text-align-left'>
                                                    Day Jobs
                                                </th>
                                                <td>
                                                    {this.state.employer
                                                        .freelancetier &&
                                                        this.state.employer
                                                            .freelancetier
                                                            .posted -
                                                            this.state.employer
                                                                .freelancetier
                                                                .closed}
                                                </td>
                                                <td>
                                                    {this.state.employer
                                                        .freelancetier &&
                                                        this.state.employer
                                                            .freelancetier
                                                            .closed}
                                                </td>
                                                <td>
                                                    {this.state.employer
                                                        .freelancetier &&
                                                        this.state.employer
                                                            .freelancetier
                                                            .allowed -
                                                            this.state.employer
                                                                .freelancetier
                                                                .posted}
                                                </td>
                                            </tr>
                                            <tr>
                                                <th
                                                    scope='row'
                                                    className='text-align-left'>
                                                    Locum Positions
                                                </th>
                                                <td>
                                                    {this.state.employer
                                                        .locumtier
                                                        ? this.state.employer
                                                              .locumtier
                                                              .posted -
                                                          this.state.employer
                                                              .locumtier.closed
                                                        : 0}
                                                </td>
                                                <td>
                                                    {this.state.employer
                                                        .locumtier
                                                        ? this.state.employer
                                                              .locumtier.closed
                                                        : 0}
                                                </td>
                                                <td>
                                                    {this.state.employer
                                                        .locumtier
                                                        ? this.state.employer
                                                              .locumtier
                                                              .allowed -
                                                          this.state.employer
                                                              .locumtier.posted
                                                        : "-"}
                                                </td>
                                            </tr>
                                            <tr>
                                                <th
                                                    scope='row'
                                                    className='text-align-left'>
                                                    Promoted
                                                </th>
                                                <td>
                                                    {this.state.employer
                                                        .sponsors
                                                        ? this.state.employer
                                                              .sponsors.posted -
                                                          this.state.employer
                                                              .sponsors.closed
                                                        : "-"}
                                                </td>
                                                <td>
                                                    {this.state.employer
                                                        .sponsors
                                                        ? this.state.employer
                                                              .sponsors.closed
                                                        : "-"}
                                                </td>
                                                <td>
                                                    {this.state.employer
                                                        .sponsors
                                                        ? this.state.employer
                                                              .sponsors
                                                              .allowed -
                                                          this.state.employer
                                                              .sponsors.posted
                                                        : "-"}
                                                </td>
                                            </tr>
                                        </tbody>
                                    </Table>
                                    <hr />
                                    <div className='text-align-left col-12 border p-2'>
                                        <h6>{banner}</h6>
                                    </div>
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
                                <div className='col-12 col-md-5'>
                                    <p className='col-12'>
                                        {this.state.employer.address &&
                                            this.state.employer.address.line}
                                    </p>
                                    <p className='col-12'>
                                        {this.state.employer.address &&
                                            `${this.state.employer.address.city}, ${this.state.employer.address.state}, ${this.state.employer.address.pin}`}
                                    </p>
                                </div>

                                <div className='col-12 col-md-7'>
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
                                        <h4 className='text-blue col-12'>
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
                                !(
                                    this.state.employer.youtube.length === 1 &&
                                    this.state.employer.youtube[0] === ""
                                ) && (
                                    <div className='row p-3 m-2' style={block}>
                                        <h4 className='col-12 text-blue'>
                                            Videos
                                        </h4>
                                        <div className='col-12 col-md-8 mx-auto'>
                                            <VideoCarousel
                                                className='w-100'
                                                items={
                                                    this.state.employer.youtube
                                                }
                                            />
                                        </div>

                                        {/* <ReactPlayer
                                        className='w-100'
                                        url='https://www.youtube.com/watch?v=b_lHyhTRb-8&list=RDv2-9rIL_f4w&index=34'
                                    /> */}
                                    </div>
                                )}
                        </div>
                        <div
                            className='d-none d-sm-flex col-12 col-sm-5 col-md-4  row p-3 pt-4'
                            style={{ borderLeft: "1px solid #dddddd" }}>
                            <div
                                className='col-12 '
                                style={{ height: "max-content" }}>
                                <h4 className='text-blue text-align-left'>
                                    Subscription Details
                                </h4>
                                <Table
                                    // size='md'
                                    hover
                                    className='col-12 border p-1'>
                                    <thead>
                                        <tr>
                                            <th className='text-align-left'>
                                                Jobs
                                            </th>
                                            <th>Open</th>
                                            <th>Closed</th>
                                            <th>Available</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <th
                                                scope='row'
                                                className='text-align-left'>
                                                Regular
                                            </th>
                                            <td>
                                                {this.state.employer.jobtier &&
                                                    this.state.employer.jobtier
                                                        .posted -
                                                        this.state.employer
                                                            .jobtier.closed}
                                            </td>
                                            <td>
                                                {this.state.employer.jobtier &&
                                                    this.state.employer.jobtier
                                                        .closed}
                                            </td>
                                            <td>
                                                {this.state.employer.jobtier &&
                                                    this.state.employer.jobtier
                                                        .allowed -
                                                        this.state.employer
                                                            .jobtier.posted}
                                            </td>
                                        </tr>
                                        <tr>
                                            <th
                                                scope='row'
                                                className='text-align-left'>
                                                Day Jobs
                                            </th>
                                            <td>
                                                {this.state.employer
                                                    .freelancetier &&
                                                    this.state.employer
                                                        .freelancetier.posted -
                                                        this.state.employer
                                                            .freelancetier
                                                            .closed}
                                            </td>
                                            <td>
                                                {this.state.employer
                                                    .freelancetier &&
                                                    this.state.employer
                                                        .freelancetier.closed}
                                            </td>
                                            <td>
                                                {this.state.employer
                                                    .freelancetier &&
                                                    this.state.employer
                                                        .freelancetier.allowed -
                                                        this.state.employer
                                                            .freelancetier
                                                            .posted}
                                            </td>
                                        </tr>
                                        <tr>
                                            <th
                                                scope='row'
                                                className='text-align-left'>
                                                Locum Positions
                                            </th>
                                            <td>
                                                {this.state.employer.locumtier
                                                    ? this.state.employer
                                                          .locumtier.posted -
                                                      this.state.employer
                                                          .locumtier.closed
                                                    : 0}
                                            </td>
                                            <td>
                                                {this.state.employer.locumtier
                                                    ? this.state.employer
                                                          .locumtier.closed
                                                    : 0}
                                            </td>
                                            <td>
                                                {this.state.employer.locumtier
                                                    ? this.state.employer
                                                          .locumtier.allowed -
                                                      this.state.employer
                                                          .locumtier.posted
                                                    : "-"}
                                            </td>
                                        </tr>
                                        <tr>
                                            <th
                                                scope='row'
                                                className='text-align-left'>
                                                Promoted
                                            </th>
                                            <td>
                                                {this.state.employer.sponsors
                                                    ? this.state.employer
                                                          .sponsors.posted -
                                                      this.state.employer
                                                          .sponsors.closed
                                                    : "-"}
                                            </td>
                                            <td>
                                                {this.state.employer.sponsors
                                                    ? this.state.employer
                                                          .sponsors.closed
                                                    : "-"}
                                            </td>
                                            <td>
                                                {this.state.employer.sponsors
                                                    ? this.state.employer
                                                          .sponsors.allowed -
                                                      this.state.employer
                                                          .sponsors.posted
                                                    : "-"}
                                            </td>
                                        </tr>
                                    </tbody>
                                </Table>
                                <hr />
                                <div className='text-align-left col-12 border p-2'>
                                    <h6>{banner}</h6>
                                </div>
                            </div>
                            {/* <hr /> */}
                        </div>
                    </div>
                )}
            </div>
        );
    }
}
