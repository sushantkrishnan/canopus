import React, { useState, useEffect } from "react";
import { Alert } from "reactstrap";
export default function Banner({ text, link }) {
    const [visible, setVisible] = useState(true);
    const [show, setShow] = useState(false);

    const onDismiss = () => setVisible(false);
    useEffect(() => {
        setTimeout(() => {
            setShow(true);
        }, 30000);
    }, []);
    return (
        <div>
            {show && (
                <Alert
                    className='text-align-center'
                    color='banner '
                    isOpen={visible}
                    toggle={onDismiss}>
                    <h5>
                        <a
                            className='text-emp-primary'
                            target='_blank'
                            href={link}>
                            {text}
                        </a>
                    </h5>
                </Alert>
            )}
        </div>
    );
}
