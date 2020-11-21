import React, { useEffect, Component } from "react";
import error from "../images/404.svg";
// import Loader from "react-loader-spinner";

const linkStyle = {
    color: "#17a2b8",
    cursor: "pointer",
};

export default class ErrorPage extends Component {
    componentDidMount() {
        console.log("mounted:ERRoR");
    }
    render() {
        return (
            <div
                className='m-4 mx-auto row'
                style={{
                    width: "80vw",
                    minHeight: "60vh",
                    textAlign: "center",
                    alignItems: "center",
                }}>
                <div className='col-12 col-md-6'>
                    <h1 style={{ fontFamily: "Chivo" }}>Page Not Found</h1>
                    <h4>
                        Go Back to{" "}
                        <a href='/' style={linkStyle}>
                            Home
                        </a>{" "}
                        Page
                    </h4>
                </div>

                <img
                    src={error}
                    className='img-fluid col-12 col-md-6'
                    style={{ maxHeight: "70vh" }}
                />
                {/* <div
                    className='mx-auto my-auto col-12'
                    style={{ textAlign: "center" }}>
                    <Loader
                        type='Bars'
                        color='#17a2b8'
                        height={300}
                        width={220}
                    />
                </div> */}
            </div>
        );
    }
}
