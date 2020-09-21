import React, { Component, Fragment } from "react";
import {
    Label,
    Input,
    FormGroup,
    Form,
    FormText,
    Button,
    FormFeedback,
} from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faPlusCircle,
    faMinus,
    faMinusCircle,
} from "@fortawesome/free-solid-svg-icons";
import InputMap from "./map.component";
import Axios from "axios";
const block = {
    borderRadius: " 0.25rem",
    border: "0.05rem solid lightgrey",
    /* background-color: rgba(0, 0, 0, 0.15); */
    // boxShadow: " 3px 3px 6px rgba(0, 0, 0, 0.3)",
    transition: "0.3s ease-in-out",
};

export default class SignupEmployer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            firstName: "",
            lastName: "",
            password: "",
            email: "",
            line: "",
            pin: "",
            city: "",
            state: "",
            links: [""],
            youtube: [""],
            image: [],
            about: "",
            about2: "",
            employeeCount: 0,
            noLinks: 1,
            noYoutube: 1,
            lat: null,
            lng: null,
            validate: {
                email: false,
                password: false,
            },
        };
        this.handleChange = this.handleChange.bind(this);
        this.signUp = this.signUp.bind(this);
        this.setCoordinates = this.setCoordinates.bind(this);
        this.check = this.check.bind(this);
    }
    setCoordinates(coords) {
        this.setState({
            lat: coords.lat,
            lng: coords.lng,
        });
    }
    handleChange(e, index) {
        // console.log(this.state);
        console.log(index);
        let { validate } = this.state;
        validate = {
            ...validate,
            [e.target.name]: e.target.value === "" ? false : true,
        };
        this.setState({ validate });
        console.log(validate);
        if (index !== undefined) {
            let links = this.state[e.target.name];
            links[index] = e.target.value;
            this.setState({
                [e.target.name]: links,
            });
        } else
            this.setState({
                [e.target.name]: e.target.value,
            });
    }
    check(e) {
        const validate = {
            email: this.state.email === "" ? false : true,
            password: this.state.password === "" ? false : true,
        };
        console.log(validate);
        this.setState({ validate: validate });
    }
    signUp(e) {
        e.preventDefault();
        // if ((this.state.email !== "") & (this.state.password !== ""))
        //     this.setState({ valid: true });

        const employer = {
            username: this.state.email,
            password: this.state.password,
        };
        console.log(employer);
        if (this.state.validate.email && this.state.validate.password)
            Axios.post(`/api/employer`, employer)
                .then((data) => {
                    console.log(data);
                    if (data.status === 200) {
                        // alert("SignUp successful");
                        window.location = "/employer/update";
                    }
                })
                .catch(({ response }) => {
                    console.log(response);
                    alert(response.data.err.message);
                });
    }
    render() {
        return (
            <div className='make-small'>
                <Form className=' p-4 m-3 mx-lg-5' style={block} noValidate>
                    <FormGroup>
                        <h4>Sign Up</h4>
                    </FormGroup>

                    <FormGroup>
                        <Label>Email</Label>
                        <Input
                            type='email'
                            placeholder='Email Address'
                            name='email'
                            onChange={(e) => {
                                this.handleChange(e);
                                // this.check(e);
                            }}
                            defaultValue={this.state.email}
                            required
                            invalid={!this.state.validate.email}
                        />
                        <FormFeedback invalid>
                            Please input a correct email.
                        </FormFeedback>
                    </FormGroup>
                    <FormGroup>
                        <Label>Password</Label>
                        <Input
                            type='password'
                            placeholder='Password'
                            name='password'
                            onChange={(e) => {
                                this.handleChange(e);
                                // this.check(e);
                            }}
                            defaultValue={this.state.password}
                            invalid={!this.state.validate.password}
                            required
                        />
                    </FormGroup>
                    <div className=' d-flex justify-content-end'>
                        <Button
                            onClick={this.signUp}
                            // className='w-25'
                            disabled={
                                this.state.validate.email === false ||
                                this.state.validate.password === false
                            }
                            color='primary'>
                            Sign Up
                        </Button>
                    </div>
                </Form>
            </div>
        );
    }
}
