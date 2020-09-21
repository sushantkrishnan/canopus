import React, { Component } from "react";
// import NavbarComponent from "../navbar.component";
import {
    Form,
    Input,
    Label,
    FormGroup,
    Button,
    Select,
    Option,
} from "reactstrap";
const block = {
    borderRadius: " 0.25rem",
    border: "0.05rem solid lightgrey",
    /* background-color: rgba(0, 0, 0, 0.15); */
    // boxShadow: " 3px 3px 6px rgba(0, 0, 0, 0.3)",
    transition: "0.3s ease-in-out",
};
export default class PersonalDetails extends Component {
    saveAndContinue = (e) => {
        e.preventDefault();
        this.props.nextStep();
    };
    back = (e) => {
        e.preventDefault();
        this.props.prevStep();
    };
    // state = {  }
    render() {
        const { values } = this.props;
        return (
            <div>
                {/* <NavbarComponent /> */}
                <Form className=' p-4 p-lg-5 mx-4 mx-lg-5 m-3' style={block}>
                    <h4>User Details</h4>
                    <FormGroup className='row'>
                        <div className='col-4 col-md-2 p-0 pr-1'>
                            <Label>Salutation</Label>
                            <Input
                                list='salutations'
                                placeholder='Dr'
                                onChange={this.props.handleChange("salutation")}
                                defaultValue={values.salutation}
                            />
                            <datalist id='salutations'>
                                <option value='Dr' />
                                <option value='Mr' />
                                <option value='Mrs' />
                                <option value='Ms' />
                                <option value='Prof' />
                            </datalist>
                        </div>
                        <div className='col-8 col-md-5 p-0 pr-md-1'>
                            <Label>First Name</Label>
                            <Input
                                placeholder='First Name'
                                onChange={this.props.handleChange("firstName")}
                                defaultValue={values.firstName}
                                required
                            />
                        </div>
                        <div className='col-12 col-md-5 p-0 pl-md-1'>
                            <Label>Last Name</Label>
                            <Input
                                placeholder='Last Name'
                                onChange={this.props.handleChange("lastName")}
                                defaultValue={values.lastName}
                            />
                        </div>
                        <div className='col-12 col-md-6 p-0 my-1 pr-md-1'>
                            <Label>Gender</Label>
                            <Input
                                placeholder='Gender'
                                type='select'
                                onClick={() => {
                                    this.props.handleChange("gender");
                                    console.log("dasdsas");
                                }}
                                defaultValue={values.gender}>
                                <option value='male'>Male</option>
                                <option value='female'>female</option>
                                <option value='other'>Other</option>
                            </Input>
                        </div>
                        <div className='col-12 col-md-6 p-0 my-1 pl-md-1'>
                            <Label>Date of Birth</Label>
                            <Input
                                type='date'
                                onChange={this.props.handleChange("dob")}
                                defaultValue={values.dob}
                            />
                        </div>
                    </FormGroup>
                    <h4>Address Details</h4>
                    <div className='row'>
                        <FormGroup className='col-6  px-0 pr-1'>
                            <Label>Pin</Label>
                            <Input
                                placeholder='Pin'
                                onChange={this.props.handleChange("pin")}
                                defaultValue={values.pin}
                            />
                        </FormGroup>
                        <FormGroup className='col-6 px-0 pl-1'>
                            <Label>City</Label>
                            <Input
                                placeholder='City'
                                onChange={this.props.handleChange("city")}
                                defaultValue={values.city}
                            />
                        </FormGroup>
                        <FormGroup className='col-6 px-0 pr-1'>
                            <Label>State</Label>
                            <Input
                                placeholder='state'
                                onChange={this.props.handleChange("state")}
                                defaultValue={values.state}
                            />
                        </FormGroup>
                        <FormGroup className='col-6 px-0 pl-1'>
                            <Label>Country</Label>
                            <Input
                                placeholder='state'
                                // onChange={this.props.handleChange("state")}
                                defaultValue={"India"}
                                disabled
                            />
                        </FormGroup>
                    </div>
                    <FormGroup className='ml-auto mr-1'>
                        <Button onClick={this.back} className='mr-1'>
                            Back
                        </Button>
                        <Button
                            onClick={this.saveAndContinue}
                            className='ml-1'
                            color='primary'>
                            Save And Continue
                        </Button>
                    </FormGroup>
                </Form>
            </div>
        );
    }
}
