import React, { Component } from "react";
import { Label, Input, FormGroup, Form, Button } from "reactstrap";
import Axios from "axios";
const block = {
    borderRadius: " 0.25rem",
    border: "0.05rem solid lightgrey",
    transition: "0.3s ease-in-out",
};

export default class EnterPassword extends Component {
    constructor(props) {
        super(props);
        this.state = {
            email: "",
            password: "",
            role: null,
        };
        this.handleChange = this.handleChange.bind(this);
        this.signUp = this.signUp.bind(this);
    }
    handleChange(e) {
        this.setState({
            [e.target.name]: e.target.value,
        });
    }
    signUp(e) {
        e.preventDefault();
        const employer = {
            password: this.state.password,
        };
        console.log(employer);
        const token = window.location.pathname.split("/")[3];
        Axios.put(`/api/${this.state.role}/forgot/${token}`, employer)
            .then((data) => {
                console.log(data);
                if (data.status === 200) {
                    console.log("200");
                    window.location = "/analytics";
                }
            })
            .catch((data) => {
                console.log(data);
                const { response } = data;
                console.log(response);

                if (response && response.data && response.data.err)
                    alert(
                        response.data.err.message !== undefined &&
                            response.data.err.message !== ""
                            ? response.data.err.message
                            : "Something went wrong, Please try again.",
                    );
            });
    }
    componentDidMount() {
        console.log(window.location.pathname.split("/"));
        const role = window.location.pathname.split("/")[1];
        this.setState({ role });
    }
    render() {
        return (
            <div className='row m-1 m-sm-2'>
                <Form
                    className='col-11 col-sm-7 col-md-6 col-lg-5 mx-auto p-4 '
                    style={block}
                    onSubmit={this.signUp}>
                    <FormGroup>
                        <h4>Enter New Password</h4>
                    </FormGroup>

                    <FormGroup>
                        <Label>Password</Label>
                        <Input
                            type='password'
                            placeholder='Password'
                            name='password'
                            onChange={this.handleChange}
                            required
                        />
                    </FormGroup>

                    <div className=' d-flex justify-content-end'>
                        <Button type='submit' color='emp-primary'>
                            Reset Password
                        </Button>
                    </div>
                </Form>
            </div>
        );
    }
}
