import Axios from "axios";
import React, { Component } from "react";
import Loader from "react-loader-spinner";
import ReactGA from "react-ga";

export default class Analytics extends Component {
    constructor(props) {
        super(props);
    }
    componentDidMount() {
        // if (this.props.location.state !== undefined) {
        //     console.log(this.props.location.state.role);
        // }
        Axios.get(`/auth/analytics`)
            .then((data) => {
                console.log(data);
                console.log(data.data.role);
                if (data.data) {
                    {
                        ReactGA.event({
                            category: data.data.role,
                            action: "loggedin",
                        });
                    }
                    if (data.data.updated === false)
                        window.location =
                            data.data.role === "User"
                                ? "/profile/update"
                                : "/employer/update";
                    else if (data.data.role !== "")
                        window.location =
                            data.data.role === "User"
                                ? "/search-jobs"
                                : "/employer";
                }
            })
            .catch((e) => {
                console.log(e);
                console.log(e.response);
                if (e.response && e.response.data) {
                    if (e.response.data.err === "Not Logged in")
                        window.location = "/user/login";
                    if (e.response.data.status === "already logged") {
                        // if (e.response.data.role === "User")
                        //     window.location = "/search-jobs";
                        if (e.response.data.updated === false) {
                            window.location =
                                e.response.data.role === "User"
                                    ? "/profile/update"
                                    : "/employer/update";
                        } else {
                            window.location =
                                e.response.data.role === "User"
                                    ? "/search-jobs"
                                    : "/employer";
                        }
                    }
                }
            });
    }
    render() {
        return (
            <div>
                <div
                    className='mx-auto my-auto'
                    style={{ textAlign: "center" }}>
                    <Loader
                        type='Bars'
                        color='#17a2b8'
                        height={300}
                        width={120}
                    />
                </div>
            </div>
        );
    }
}
