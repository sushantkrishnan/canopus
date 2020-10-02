import Axios from "axios";
import React, { Component } from "react";
import { Modal, ModalHeader, ModalBody } from "reactstrap";
import { Link } from "react-router-dom";
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
                        message: "Email has been sent. Check your mailbox !",
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
                        `/${role === "user" ? "profile" : role}/update`,
                    );
                }
            })
            .catch((err) => {
                console.log(err);
                console.log(err.response);
                this.setState({
                    modal: true,
                    message: "Invalid Token ",
                });
            });
    }
    render() {
        return (
            <div>
                <div className='make-small'>
                    <div className=' p-4 m-3 mx-lg-5' style={block}>
                        <h2>{this.state.data}</h2>
                        Haven't got the mail?{" "}
                        <Link onClick={this.resend} className='text-info'>
                            {" "}
                            Resend again
                        </Link>
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
