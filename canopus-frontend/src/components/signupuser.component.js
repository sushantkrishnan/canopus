import React, { Component } from "react";
import UserDetails from "./signupComponent/userDetails.component";
import PersonalDetails from "./signupComponent/personalDetails.component";
import Confirmation from "./signupComponent/confirmation.component.js";
const block = {
    borderRadius: " 0.25rem",
    border: "0.05rem solid lightgrey",
    /* background-color: rgba(0, 0, 0, 0.15); */
    // boxShadow: " 3px 3px 6px rgba(0, 0, 0, 0.3)",
    transition: "0.3s ease-in-out",
};
export default class SignupUser extends Component {
    constructor(props) {
        super(props);
        this.state = {
            step: 1,
            firstName: "",
            salutation: "",
            lastName: "",
            email: "",
            password: "",
            age: "",
            pin: "",
            city: "",
            state: "",
            country: "India",
            gender: "male",
            dob: "",
            experience: {
                title: "",
                name: "",
                line: "",
            },
        };
    }
    nextStep = () => {
        const { step } = this.state;
        this.setState({
            step: step + 1,
        });
    };

    prevStep = () => {
        const { step } = this.state;
        this.setState({
            step: step - 1,
        });
    };
    handleChange = (input) => (event) => {
        this.setState({ [input]: event.target.value });
    };
    render() {
        const { step } = this.state;
        const {
            firstName,
            lastName,
            email,
            salutation,
            gender,
            dob,
            age,
            city,
            country,
            state,
            pin,
            password,
        } = this.state;
        const values = {
            firstName,
            lastName,
            email,
            age,
            city,
            salutation,
            gender,
            dob,
            state,
            pin,
            country,
            password,
        };
        switch (step) {
            case 1:
                return (
                    <UserDetails
                        nextStep={this.nextStep}
                        handleChange={this.handleChange}
                        values={values}
                    />
                );
            case 2:
                return (
                    <PersonalDetails
                        nextStep={this.nextStep}
                        prevStep={this.prevStep}
                        handleChange={this.handleChange}
                        values={values}
                    />
                );
            case 3:
                return (
                    <Confirmation
                        nextStep={this.nextStep}
                        prevStep={this.prevStep}
                        values={values}
                    />
                );
            default:
                return (
                    <UserDetails
                        nextStep={this.nextStep}
                        handleChange={this.handleChange}
                        values={values}
                    />
                );
        }
    }
}
