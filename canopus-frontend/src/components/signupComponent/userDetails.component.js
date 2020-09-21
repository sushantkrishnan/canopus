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
                <Form className=' p-4 p-lg-5 mx-4 m-3 mx-lg-5' style={block}>
                    <h3>Sign Up</h3>
                    <FormGroup>
                        <Label>Email Address</Label>
                        <Input
                            type='email'
                            placeholder='Email Address'
                            onChange={this.props.handleChange("email")}
                            defaultValue={values.email}
                        />
                    </FormGroup>
                    <FormGroup>
                        <Label>Password</Label>
                        <Input
                            type='password'
                            placeholder='Password'
                            onChange={this.props.handleChange("password")}
                            defaultValue={values.password}
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
