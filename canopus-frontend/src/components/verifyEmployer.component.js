import Axios from "axios";
import React, { Component } from "react";
import {
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    Alert,
} from "reactstrap";
// import { Link } from "react-router-dom";
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
                            error:
                                "A verification link has been sent to your email account, please click on the link to verify your email address. ",
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
                            error:
                                "A verification link has been sent to your email account, please click on the link to verify your email address. ",
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
                    <div
                        className='p-3 p-sm-5 m-3 m-sm-5 mx-lg-5'
                        style={block}>
                        <h2 className='mb-3'>Thanks for joining Curoid!</h2>
                        If you don't get the verification email within few
                        minutes (check your spam, promotions and trash folders
                        to be sure!), try
                        <span
                            onClick={this.resend}
                            style={{ cursor: "pointer" }}
                            className='text-emp-primary'>
                            {" "}
                            sending again{" "}
                        </span>
                        or contact us at{" "}
                        <a
                            href='mailto:support@curoid.co'
                            className='text-emp-primary'>
                            support@curoid.co.
                        </a>
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
                    <ModalFooter className='p-1'>
                        <Button
                            size='sm'
                            color='emp-primary'
                            onClick={this.toggleModal}>
                            Ok
                        </Button>
                    </ModalFooter>
                </Modal>
            </div>
        );
    }
}
