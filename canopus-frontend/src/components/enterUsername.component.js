import React, { Component, Fragment } from "react";
import {
    Label,
    Input,
    FormGroup,
    Form,
    Button,
    Modal,
    ModalBody,
    ModalHeader,
    Nav,
    NavItem,
} from "reactstrap";
import { NavLink } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faPlusCircle,
    faMinus,
    faMinusCircle,
} from "@fortawesome/free-solid-svg-icons";
import Axios from "axios";
const block = {
    borderRadius: " 0.25rem",
    border: "0.05rem solid lightgrey",
    transition: "0.3s ease-in-out",
};

export default class EnterUsername extends Component {
    constructor(props) {
        super(props);
        this.state = {
            email: "",
            disabled: false,
            message: "",
            modal: false,
            role: null,
        };
        this.handleChange = this.handleChange.bind(this);
        this.toggleModal = this.toggleModal.bind(this);
        this.signUp = this.signUp.bind(this);
    }
    toggleModal() {
        this.setState({
            modal: !this.state.modal,
        });
    }
    handleChange(e) {
        this.setState({
            [e.target.name]: e.target.value,
        });
    }
    async signUp(e) {
        e.preventDefault();

        let token;
        try {
            token = await this.recaptcha.current.executeAsync();
            const employer = {
                username: this.state.email,
                captcha: token,
            };
            console.log(employer);
            Axios.post(`/api/${this.state.role}/forgot`, employer)
                .then((data) => {
                    console.log(data);
                    if (data.status === 200) {
                        console.log("200");
                        this.setState({
                            disabled: true,
                            modal: true,
                            message: "Check your mailbox !",
                        });
                    }
                })
                .catch((err) => {
                    console.log(err);
                    const { response } = err;
                    console.log(response);
                    if (response && response.data && response.data.err)
                        alert(response.data.err.message);
                });
        } catch (e) {
            this.setState({
                modal: true,
                message: "Captcha Error !",
            });
            const employer = {
                username: this.state.email,
                captcha: "",
            };
            console.log(employer);
            Axios.post(`/api/${this.state.role}/forgot`, employer)
                .then((data) => {
                    console.log(data);
                    if (data.status === 200) {
                        console.log("200");
                        this.setState({
                            disabled: true,
                            modal: true,
                            message: "Check your mailbox !",
                        });
                    }
                })
                .catch((err) => {
                    console.log(err);
                    const { response } = err;
                    console.log(response);
                    if (response && response.data && response.data.err)
                        alert(response.data.err.message);
                });
        }
    }
    componentDidMount() {
        console.log(window.location.pathname.split("/"));
        const role = window.location.pathname.split("/")[1];
        this.setState({ role });
    }
    render() {
        return (
            <div>
                <Nav tabs className='justify-content-between '>
                    <div className='row justify-content-start'>
                        <NavItem className='mx-1 mx-sm-2 '>
                            <NavLink
                                to={`/${this.state.role}/login`}
                                // onClick={() => {
                                //     this.toggleTab("1");
                                // }}
                                className={` nav-link p-1 p-sm-2`}>
                                <h6>Login</h6>
                            </NavLink>
                        </NavItem>
                        <NavItem className='mx-1 mx-sm-2'>
                            <NavLink
                                to={`/${this.state.role}/signup`}
                                className={`nav-link p-1 p-sm-2`}>
                                <h6>Signup</h6>
                            </NavLink>
                        </NavItem>
                        <NavItem className='mx-1 mx-sm-2'>
                            <NavLink
                                to={`/${this.state.role}/forgot`}
                                className={`active-tab  nav-link p-1 p-sm-2`}>
                                <h6>Forgot password</h6>
                            </NavLink>
                        </NavItem>
                    </div>
                </Nav>

                <div className='make-small'>
                    <Form
                        className=' p-4 m-3 mx-lg-5'
                        style={block}
                        onSubmit={this.signUp}>
                        <FormGroup>
                            <h4>Forgot Password</h4>
                        </FormGroup>

                        <FormGroup>
                            <Label>Email</Label>
                            <Input
                                type='email'
                                placeholder='Email Address'
                                name='email'
                                onChange={this.handleChange}
                                required
                            />
                        </FormGroup>
                        <ReCAPTCHA
                            sitekey={`${process.env.REACT_APP_CAPTCHA_INVISIBLE}`}
                            name='recaptcha'
                            size='invisible'
                            // onChange={this.handleChangeRecaptcha}
                            badge='bottomleft'
                            ref={this.recaptcha}
                        />
                        <div className=' d-flex justify-content-end'>
                            <Button
                                type='submit'
                                color='primary'
                                disabled={this.state.disabled}>
                                Send Mail
                            </Button>
                        </div>
                    </Form>
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
            </div>
        );
    }
}
