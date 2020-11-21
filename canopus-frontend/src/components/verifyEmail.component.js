import Axios from "axios";
import React, { Component } from "react";
import { Alert } from "reactstrap";
import "../stylesheets/verifyEmail.css";
const block = {
    borderRadius: " 0.25rem",
    border: "0.05rem solid lightgrey",
    /* background-color: rgba(0, 0, 0, 0.15); */
    // boxShadow: " 3px 3px 6px rgba(0, 0, 0, 0.3)",
    transition: "0.3s ease-in-out",
};
export default class VerifyEmail extends Component {
    constructor(props) {
        super(props);
        this.state = {
            modal: false,
            username: "",
            message: "",
            data: "Verifying your email ...",
        };
        this.resend = this.resend.bind(this);
        this.toggleModal = this.toggleModal.bind(this);
    }
    toggleModal() {
        this.setState({
            modal: !this.state.modal,
        });
    }
    resend() {
        if (this.props.user)
            Axios.post(
                `/api/${
                    this.props.user.role === "Employer" ? "employer" : "user"
                }/validate`,
                {
                    username: this.props.user.username,
                },
            ).then((data) => {
                console.log(data);
                if (data.status === 200) {
                    this.setState({
                        modal: true,
                        message:
                            "A verification link has been sent to your email account, please click on the link to verify your email address. ",
                    });
                }
            });
    }
    componentDidMount() {
        console.log(this.props.match);
        const token = this.props.match.params.token;
        const role = this.props.match.url.split("/")[1];
        Axios.get(`/api/${role}/validate/${token}`)
            .then((data) => {
                if (data.status === 200) {
                    console.log(data);
                    this.props.history.push(
                        // `/${role === "user" ? "profile" : role}/update`,
                        "/analytics",
                    );
                }
            })
            .catch((err) => {
                console.log(err);
                console.log(err.response);
                this.setState({
                    modal: true,
                    message: "Invalid Token",
                });
            });
    }
    render() {
        return (
            <div>
                <Alert
                    color={
                        this.state.message === "Invalid Token"
                            ? "danger"
                            : "success"
                    }
                    isOpen={this.state.modal}
                    toggle={() => {
                        this.setState({ modal: false });
                    }}>
                    {this.state.message}
                </Alert>
                <div className='make-small'>
                    <div className=' p-4 m-3 mx-lg-5' style={block}>
                        <h2>{this.state.data}</h2>
                        If you don't get the email within few minutes (check
                        your spam, promotions and trash folders to be sure!),
                        try or
                        <span
                            onClick={this.resend}
                            style={{ cursor: "pointer" }}
                            className='text-emp-primary'>
                            {" "}
                            sending again{" "}
                        </span>
                        contact us at{" "}
                        <a
                            href='mailto:support@curoid.co'
                            className='text-emp-primary'>
                            support@curoid.co.
                        </a>
                    </div>
                </div>
                {/* <Modal
                    isOpen={this.state.modal}
                    toggle={this.toggleModal}
                    style={{ marginTop: "20vh" }}>
                    <ModalHeader toggle={this.toggleModal} className='py-1'>
                        Message
                    </ModalHeader>
                    
                    <ModalBody>{this.state.message}</ModalBody>
                </Modal> */}
            </div>
        );
    }
}
