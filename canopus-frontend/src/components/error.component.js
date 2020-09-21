import React from "react";
import error from "../images/404.svg";
const linkStyle = {
    color: "#17a2b8",
    cursor: "pointer",
};
export default function ErrorPage() {
    return (
        <div
            className='m-4 mx-auto row'
            style={{
                width: "80vw",
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
        </div>
    );
}
