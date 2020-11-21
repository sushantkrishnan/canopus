import React from "react";
import "../stylesheets/footer.css";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleDoubleRight } from "@fortawesome/free-solid-svg-icons";
import {
    faFacebook,
    faInstagram,
    faLinkedin,
    faTwitter,
} from "@fortawesome/free-brands-svg-icons";
// import { faEnvelope } from "@fortawesome/free-solid-svg-icons";

export default function FooterComponent() {
    return (
        <div className=' pt-4 pb-3 footer'>
            <div className='container'>
                <div className='row'>
                    <div className='col-lg-5 col-xs-12 about-company'>
                        <h2>Curoid</h2>
                        <p className='pr-5 text-white-50'>
                            Find the best medical talent to care for your
                            patients
                        </p>
                    </div>
                    <div className='col-lg-3 col-xs-12 links'>
                        <h4 className='mt-lg-0 mt-sm-3'>Links</h4>
                        <ul className='m-0 p-0'>
                            <li>
                                <FontAwesomeIcon icon={faAngleDoubleRight} />{" "}
                                <Link to='/privacy/'>Privacy Policy</Link>
                            </li>
                            <li>
                                <FontAwesomeIcon icon={faAngleDoubleRight} />{" "}
                                <Link to='/terms-and-conditions'>
                                    Terms & Conditions
                                </Link>
                            </li>
                            {/* <li>
                                <FontAwesomeIcon icon={faAngleDoubleRight} />{" "}
                                <Link to='/profile/asdsad'>
                                    Career Resoures
                                </Link>
                            </li>
                            <li>
                                <FontAwesomeIcon icon={faAngleDoubleRight} />{" "}
                                <Link to='/profile/asdsad'>About Us</Link>
                            </li> */}
                        </ul>
                        <br />
                    </div>

                    <div className='col-lg-4 col-xs-12 location'>
                        <h4 className='mt-lg-0 mt-sm-4'>Contact Us</h4>
                        <p className='mb-0'>
                            <i className='fa fa-phone mr-3'></i>(+91)
                            8999-718-313
                        </p>
                        <p>
                            <i className='fa fa-envelope-o mr-3'></i>
                            support@curoid.co
                        </p>
                    </div>
                </div>
                <div className='row'>
                    <div className='col-xs-12 col-sm-12 col-md-12 mt-2 mt-sm-5'>
                        <ul className='list-unstyled list-inline social text-center'>
                            <li className='list-inline-item'>
                                <a href='https://www.facebook.com/Curoid'>
                                    <FontAwesomeIcon icon={faFacebook} />
                                </a>
                            </li>
                            <li className='list-inline-item'>
                                <a href='https://www.instagram.com/curoid.co/'>
                                    <FontAwesomeIcon icon={faInstagram} />
                                </a>
                            </li>
                            <li className='list-inline-item'>
                                <a href='https://www.linkedin.com/company/curoidco'>
                                    <FontAwesomeIcon icon={faLinkedin} />
                                </a>
                            </li>
                            <li className='list-inline-item'>
                                <a href='https://twitter.com/CuroidCo'>
                                    <FontAwesomeIcon icon={faTwitter} />
                                </a>
                            </li>
                        </ul>
                    </div>
                    <hr />
                </div>
                <div className='row mt-2'>
                    <div className='col copyright'>
                        <p className=''>
                            <small className='text-white-50'>
                                © Curoid 2020. All Rights Reserved.
                            </small>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
