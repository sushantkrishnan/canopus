import React, { Component } from "react";
import axios from "axios";
import {
    ListGroup,
    ListGroupItem,
    ListGroupItemHeading,
    ListGroupItemText,
    Table,
    Button,
} from "reactstrap";
const block = {
    borderRadius: " 0.25rem",
    border: "0.05rem solid lightgrey",
    /* background-color: rgba(0, 0, 0, 0.15); */
    // boxShadow: " 3px 3px 6px rgba(0, 0, 0, 0.3)",
    transition: "0.3s ease-in-out",
};
// import NavbarComponent from "../navbar.component";
export default class Confirmation extends Component {
    submit = (e) => {
        e.preventDefault();
        this.props.nextStep();
        // console.log(this.props);
        const { values } = this.props;
        const user = {
            username: values.email,
            salutation: values.salutation,
            firstName: values.firstName,
            lastName: values.lastName,
            password: values.password,
            gender: values.gender,
            dob: new Date(values.dob),
            address: {
                pin: values.pin,
                city: values.city,

                state: values.state,
                country: values.country === "" ? "India" : values.country,
            },
        };
        console.log(user);
        axios
            .post(`/api/user/`, user)
            .then((newUser) => {
                console.log(newUser);
                window.location = "/profile";
            })
            .catch((err) => {
                // this.setState({
                //     alert: true,
                // });
                console.log(err.response);
                // console.log(this.state.alert);
                alert(err.response.data.err.message);
            });
    };

    back = (e) => {
        e.preventDefault();
        this.props.prevStep();
    };
    render() {
        const {
            values: {
                firstName,
                lastName,
                email,
                pin,
                city,
                state,
                salutation,
                gender,
                dob,
                country,
            },
        } = this.props;
        return (
            <div>
                {/* <NavbarComponent /> */}
                <div
                    className='mx-2 mx-sm-4 p-3 p-sm-4 p-lg-5 m-1 m-sm-3'
                    style={block}>
                    <h3>Details</h3>
                    {/* <ListGroup style={{ background: "rgba(0,0,0,0)" }}>
                        <ListGroupItem>
                            <ListGroupItemHeading name='users'>
                                First Name:
                            </ListGroupItemHeading>
                            <ListGroupItemText>{firstName}</ListGroupItemText>
                        </ListGroupItem>
                        <ListGroupItem>
                            <ListGroupItemHeading name='users'>
                                Last Name:
                            </ListGroupItemHeading>
                            <ListGroupItemText>{lastName}</ListGroupItemText>
                        </ListGroupItem>
                        <ListGroupItem>
                            <ListGroupItemHeading name='mail'>
                                Email
                            </ListGroupItemHeading>
                            <ListGroupItemText>
                                <a href='mailto:jack@semantic-ui.com'>
                                    {email}
                                </a>
                            </ListGroupItemText>
                        </ListGroupItem>
                        <ListGroupItem>
                            <ListGroupItemHeading name='marker'>
                                Address
                            </ListGroupItemHeading>
                            <ListGroupItemText>
                                {city},{pin}, {state}
                            </ListGroupItemText>
                        </ListGroupItem>
                    </ListGroup> */}
                    <div className='table-responsive'>
                        <Table>
                            <tr>
                                <td classname='text-align-left'>Name : </td>
                                <td classname='text-align-left'>{`${salutation} ${firstName} ${lastName}`}</td>
                            </tr>
                            <tr>
                                <td classname='text-align-left'>Gender : </td>
                                <td classname='text-align-left'>{`${gender}`}</td>
                            </tr>
                            <tr>
                                <td classname='text-align-left'>DOB : </td>
                                <td classname='text-align-left'>{`${dob}`}</td>
                            </tr>
                            <tr>
                                <td classname='text-align-left'>Address : </td>
                                <td classname='text-align-left'>{`${city}, ${pin}, ${state}, ${"India"}`}</td>
                            </tr>
                            <tr>
                                <td classname='text-align-left'>Email : </td>
                                <td classname='text-align-left'>{`${email}`}</td>
                            </tr>
                        </Table>
                    </div>
                    <div className='row justify-content-start  mx-auto mr-3 mt-2'>
                        <Button onClick={this.back} className='mr-1'>
                            Back
                        </Button>
                        <Button
                            onClick={this.submit}
                            className='ml-1'
                            color='primary'>
                            Confirm
                        </Button>
                    </div>
                </div>
            </div>
        );
    }
}
