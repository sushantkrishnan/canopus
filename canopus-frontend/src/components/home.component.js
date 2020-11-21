import React, { useRef, useState } from "react";
import Select from "react-select";
import "../stylesheets/home.css";
import "bootstrap/dist/css/bootstrap.min.css";

import { Button, Alert } from "reactstrap";
import { Link } from "react-router-dom";
import video from "../images/video.mp4";

const Home = (props) => {
    let professionArray = [];
    console.log(props.data);
    if (props.data) {
        professionArray = props.data.specializations.map((opt) => ({
            label: opt.profession,
            value: opt.profession,
        }));
    }
    const profession = useRef(null);
    const [param, setParam] = useState("");
    const [alert, setAlert] = useState(true);
    return (
        <div>
            {props.location && props.location.search !== "" && (
                <Alert
                    color='danger'
                    className='mb-0'
                    isOpen={alert}
                    toggle={() => {
                        setAlert(!alert);
                    }}>
                    {props.location.search.slice(
                        5,
                        props.location.search.length,
                    )}
                </Alert>
            )}
            <div className='flex flex-column justify-content-between main-container'>
                {/* <a
                    href='https://canopus.blob.core.windows.net/mail-image/privacy_temp.html'
                    target='_blank'>
                    Privacy
                </a> */}
                <div
                    className='main py-5 position-relative'
                    style={{ height: "100%", flexGrow: 1 }}>
                    <video
                        className='d-none d-sm-block'
                        playsinline='playsinline'
                        autoplay='autoplay'
                        muted='muted'
                        loop='loop'>
                        <source src={video} type='video/mp4' />
                    </video>
                    <div className='position-relative'>
                        <h1
                            className='text-white px-2'
                            style={{ textAlign: "center", zIndex: "100" }}>
                            New Possibilities Every Day
                        </h1>
                    </div>
                    <div className='form-inline home-search  justify-content-center mt-3 '>
                        <div
                            className='col-8 '
                            style={{
                                width: `100%`,
                            }}>
                            <Select
                                autosize={true}
                                placeholder='Profession'
                                options={professionArray}
                                onChange={(e) => {
                                    console.log(e);
                                    setParam(e.value);
                                }}
                                ref={profession}
                            />
                        </div>
                        {param !== "" ? (
                            <Link
                                to={{
                                    pathname: `/search-jobs/`,
                                    state: {
                                        feild: "profession",
                                        query: param,
                                    },
                                }}
                                className='col-3 col-md-2 btn btn-emp-primary my-2 my-sm-0'>
                                <span
                                // style={{
                                //     fontSize:
                                //         " calc(12px + (26 - 14) * ((100vw - 300px) / (1600 - 300)))",
                                // }}
                                >
                                    Search
                                </span>
                            </Link>
                        ) : (
                            <Button
                                color='emp-primary'
                                className='my-2 my-sm-0 col-3 col-md-2'
                                disabled>
                                Search
                            </Button>
                        )}
                    </div>
                </div>
            </div>
            <div
                className='row p-3 p-md-5'
                style={{ backgroundColor: "#f9f9f9" }}>
                <div className='col-12 col-md-3 p-4 text-align-center my-auto'>
                    <h4>
                        <strong>Jobs for any scope</strong>
                    </h4>
                </div>
                <div className='col-12 col-md-9 row border p-3 bg-white'>
                    <div className='col-12 col-md-4 p-2'>
                        <h5
                            className='w-75 pb-2'
                            style={{ borderBottom: "3px solid #0A4F70" }}>
                            <strong>Day Jobs</strong>
                        </h5>
                        {/* <div
                            className='w-75 mb-1'
                            style={{
                                backgroundColor: "#0A4F70",
                                height: "4px",
                            }}></div> */}
                        <p>
                            Short stints that can be wrapped up in less than a
                            day. Think specialized procedures or consultations.
                        </p>
                    </div>
                    <div className='col-12 col-md-4 p-2 px-md-4 py-2 border-xy'>
                        <h5
                            className='w-75 pb-2'
                            style={{ borderBottom: "3px solid #0A4F70" }}>
                            <strong>Locum Positions</strong>
                        </h5>
                        {/* <div
                            className='w-75 mb-1'
                            style={{
                                backgroundColor: "#0A4F70",
                                height: "4px",
                            }}></div> */}
                        <p>
                            Slightly longer stints that last less than a month
                            to ensure uninterrupted care for patients.
                        </p>
                    </div>
                    <div className='col-12 col-md-4 p-2 pl-md-4'>
                        <h5
                            className='w-75 pb-2'
                            style={{ borderBottom: "3px solid #0A4F70" }}>
                            <strong>Formal Jobs</strong>
                        </h5>
                        {/* <div
                            className='w-75 mb-1'
                            style={{
                                backgroundColor: "#0A4F70",
                                height: "4px",
                            }}></div> */}
                        <p>
                            Longer-term jobs for career growth and continuous
                            education.
                        </p>
                    </div>
                </div>
            </div>
            <div className='p-3 p-md-5  '>
                <h2 style={{ textAlign: "center" }}>Jobs by Category</h2>
                <div className='row justify-content-center px-3 px-md-4 m-4 '>
                    {professionArray.map((prof) => (
                        <div className='jobs text-secondary mx-2'>
                            <Link
                                to={{
                                    pathname: `/search-jobs/`,
                                    state: {
                                        feild: "profession",
                                        query: prof.value,
                                    },
                                }}>
                                {prof.label}
                            </Link>
                        </div>
                    ))}
                    {/* <div className='jobs text-secondary'>
                        <Link
                            to={{
                                pathname: `/search-jobs/`,
                                state: {
                                    feild: "specialization",
                                    query: "General Surgery",
                                },
                            }}>
                            General Surgery
                        </Link>
                    </div>
                   */}
                </div>
            </div>
            {/* <div className='p-3 p-md-5 row w-100 mx-auto justify-content-center'>
                <img
                    src={doctor}
                    alt='doctor'
                    className='col-md-4 col-12 img-fluid mx-auto'
                    style={{ maxWidth: "300px" }}
                />
                <div
                    className='p-1 p-lg-5 col-md-8 col-12 my-auto flex flex-column align-content-center'
                    style={{ textAlign: "center" }}>
                    <h1>
                        Apply for Positions + Set Up Job Alerts + Get
                        Newsletters
                    </h1>
                    <Link
                        to='/search-jobs/'
                        className='btn btn-lg btn-outline-info mt-3'>
                        Get Started
                    </Link>
                </div>
            </div> */}
        </div>
    );
};

export default Home;
