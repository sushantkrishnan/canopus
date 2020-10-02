import React, { Component } from "react";
// import NavbarComponent from "../navbar.component";
import { Form, Input, Label, FormGroup, Button } from "reactstrap";
const block = {
    borderRadius: " 0.25rem",
    border: "0.05rem solid lightgrey",
    /* background-color: rgba(0, 0, 0, 0.15); */
    // boxShadow: " 3px 3px 6px rgba(0, 0, 0, 0.3)",
    transition: "0.3s ease-in-out",
};
export default class UserDetails extends Component {
    saveAndContinue = (e) => {
        e.preventDefault();
        this.props.nextStep();
    };
    // state = {  }
    render() {
        const { values } = this.props;
        return (
            <div className='mx-0 mx-lg-5 px-0 px-lg-5'>
                <Form
                    className='mx-2 mx-sm-4 p-3 p-sm-4 p-lg-5 m-1 m-sm-3'
                    style={block}
                    noValidate>
                    <h3>Sign Up</h3>
                    <FormGroup>
                        <Label>Email Address</Label>
                        <Input
                            type='email'
                            placeholder='Email Address'
                            onChange={this.props.handleChange("email")}
                            defaultValue={values.email}
                            required
                        />
                    </FormGroup>
                    <FormGroup>
                        <Label>Password</Label>
                        <Input
                            type='password'
                            placeholder='Password'
                            onChange={this.props.handleChange("password")}
                            defaultValue={values.password}
                            required
                        />
                    </FormGroup>

                    <Button onClick={this.saveAndContinue} color='primary'>
                        Save And Continue{" "}
                    </Button>
                </Form>
            </div>
        );
    }
}
