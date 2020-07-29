import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faAngleDoubleRight,
    faEnvelope,
} from "@fortawesome/free-solid-svg-icons";
import {
    faFacebook,
    faGoogle,
    faLinkedin,
    faTwitter,
} from "@fortawesome/free-brands-svg-icons";
// import { faEnvelope } from "@fortawesome/free-solid-svg-icons";

export default function FooterComponent() {
    return (
        <div className=' pt-5 pb-5 footer'>
            <div className='container'>
                <div className='row'>
                    <div className='col-lg-5 col-xs-12 about-company'>
                        <h2>Canopus</h2>
                        <p className='pr-5 text-white-50'>
                            Lorem ipsum dolor sit amet, consectetur adipiscing
                            elit. Nullam ac ante mollis quam tristique convallis{" "}
                        </p>
                        <p>
                            <Link to='/profile/asdsad'>
                                <i className='fa fa-facebook-square mr-1'></i>
                            </Link>
                            <Link to='/profile/asdsad'>
                                <i className='fa fa-linkedin-square'></i>
                            </Link>
                        </p>
                    </div>
                    <div className='col-lg-3 col-xs-12 links'>
                        <h4 className='mt-lg-0 mt-sm-3'>Links</h4>
                        <ul className='m-0 p-0'>
                            <li>
                                <FontAwesomeIcon icon={faAngleDoubleRight} />{" "}
                                <Link to='/profile/asdsad'>Lorem ipsum</Link>
                            </li>
                            <li>
                                <FontAwesomeIcon icon={faAngleDoubleRight} />{" "}
                                <Link to='/profile/asdsad'>
                                    Nam mauris velit
                                </Link>
                            </li>
                            <li>
                                <FontAwesomeIcon icon={faAngleDoubleRight} />{" "}
                                <Link to='/profile/asdsad'>
                                    Etiam vitae mauris
                                </Link>
                            </li>
                            <li>
                                <FontAwesomeIcon icon={faAngleDoubleRight} />{" "}
                                <Link to='/profile/asdsad'>
                                    Fusce scelerisque
                                </Link>
                            </li>
                            <li>
                                <FontAwesomeIcon icon={faAngleDoubleRight} />{" "}
                                <Link to='/profile/asdsad'>Sed faucibus</Link>
                            </li>
                            <li>
                                <FontAwesomeIcon icon={faAngleDoubleRight} />{" "}
                                <Link to='/profile/asdsad'>
                                    Mauris efficitur nulla
                                </Link>
                            </li>
                        </ul>
                    </div>
                    <div className='col-lg-4 col-xs-12 location mt-5 mt-md-0'>
                        <h4 className='mt-lg-0 mt-sm-4'>Location</h4>
                        <p>22, Lorem ipsum dolor, consectetur adipiscing</p>
                        <p className='mb-0'>
                            <i className='fa fa-phone mr-3'></i>(541) 754-3010
                        </p>
                        <p>
                            <i className='fa fa-envelope-o mr-3'></i>
                            info@hsdf.com
                        </p>
                    </div>
                </div>
                <div className='row'>
                    <div className='col-xs-12 col-sm-12 col-md-12 mt-2 mt-sm-5'>
                        <ul className='list-unstyled list-inline social text-center'>
                            <li className='list-inline-item'>
                                <a href='#'>
                                    <FontAwesomeIcon icon={faFacebook} />
                                </a>
                            </li>
                            <li className='list-inline-item'>
                                <a href='#'>
                                    <FontAwesomeIcon icon={faGoogle} />
                                </a>
                            </li>
                            <li className='list-inline-item'>
                                <a href='#'>
                                    <FontAwesomeIcon icon={faLinkedin} />
                                </a>
                            </li>
                            <li className='list-inline-item'>
                                <a href='#'>
                                    <FontAwesomeIcon icon={faTwitter} />
                                </a>
                            </li>
                            <li className='list-inline-item'>
                                <a href='#' target='_blank'>
                                    <FontAwesomeIcon icon={faEnvelope} />
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
                                © 2020. All Rights Reserved.
                            </small>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
