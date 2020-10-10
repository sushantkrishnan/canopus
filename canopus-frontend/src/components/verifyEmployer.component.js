import Axios from "axios";
import React, { Component } from "react";
import { Modal, ModalHeader, ModalBody, Alert } from "reactstrap";
import { Link } from "react-router-dom";
import "../stylesheets/verifyEmail.css";
const block = {
    borderRadius: " 0.25rem",
    border: "0.05rem solid lightgrey",
    /* background-color: rgba(0, 0, 0, 0.15); */
    // boxShadow: " 3px 3px 6px rgba(0, 0, 0, 0.3)",
    transition: "0.3s ease-in-out",
};
export default class VerifyEmployer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            modal: false,
            username: "",
            message: "",
            role: null,
            showError: false,
            error: "",
            color: "success",
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
            Axios.post(`/api/${this.state.role}/validate`, {
                username: this.props.user.username,
            })
                .then((data) => {
                    console.log(data);
                    if (data.status === 200) {
                        this.setState({
                            showError: true,
                            color: "success",
                            error: "Email has been sent. Check your mailbox !",
                        });
                    }
                })
                .catch((e) => {
                    console.log(e);
                    console.log(e.response);
                    this.setState({
                        showError: true,
                        error: "Email already verified",
                        color: "warning",
                    });
                });
    }
    componentDidMount() {
        console.log(this.props.location.pathname.split("/")[1]);
        const role = this.props.location.pathname.split("/")[1];
        this.setState({
            role,
        });
        if (this.props.user)
            Axios.post(`/api/${role}/validate`, {
                username: this.props.user.username,
            })
                .then((data) => {
                    console.log(data);
                    if (data.status === 200) {
                        this.setState({
                            showError: true,
                            error: "Email has been sent. Check your mailbox !",
                            color: "success",
                        });
                    }
                })
                .catch((e) => {
                    console.log(e);
                    console.log(e.response);
                    this.setState({
                        showError: true,
                        error: "Email already verified",
                        color: "warning",
                    });
                });
    }
    render() {
        return (
            <div>
                <Alert
                    color={this.state.color}
                    isOpen={this.state.showError}
                    toggle={() => {
                        this.setState({ showError: false });
                    }}>
                    {this.state.error}
                </Alert>
                <div className='make-small'>
                    <div className=' p-4 m-3 mx-lg-5' style={block}>
                        <h2>Check You Email </h2>
                        Haven't got the mail?{" "}
                        <span
                            onClick={this.resend}
                            style={{ cursor: "pointer" }}
                            className='text-info '>
                            {" "}
                            Resend again
                        </span>
                    </div>
                </div>
                <Modal
                    isOpen={this.state.modal}
                    toggle={this.toggleModal}
                    style={{ marginTop: "20vh" }}>
                    <ModalHeader toggle={this.toggleModal} className='py-1'>
                        Message
                    </ModalHeader>
                    {/* <ModalHeader toggle={toggle}>
                    {mess === "promote" && "Promote"}
                </ModalHeader> */}
                    <ModalBody>{this.state.message}</ModalBody>
                </Modal>
            </div>
        );
    }
}
