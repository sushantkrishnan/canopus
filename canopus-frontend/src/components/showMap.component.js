import React, { useState, useEffect } from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
const ShowMap = ({ coordinates }) => {
    const mapStyles = {
        height: "370px",
        width: "100%",
    };
    console.log(coordinates);
    const defaultCenter = {
        lat: 39.4,
        lng: 77.7,
    };
    // const [currentPosition, setCurrentPosition] = useState(defaultCenter);

    // const success = (position) => {
    //     const currentPosition = {
    //         lat: position.coords.latitude,
    //         lng: position.coords.longitude,
    //     };
    //     console.log(currentPosition);
    //     setCoordinates(currentPosition);
    //     setCurrentPosition(currentPosition);
    // };
    // useEffect(() => {
    //     navigator.geolocation.getCurrentPosition(success, (err) => {
    //         console.log(err);
    //         // setCurrentPosition({ lat: 29.4, lng: 77.7 });
    //         // setCoordinates({ lat: 29.4, lng: 77.7 });
    //     });
    // }, []);
    // const onMarkerDragEnd = (e) => {
    //     const lat = e.latLng.lat();
    //     const lng = e.latLng.lng();
    //     setCurrentPosition({ lat, lng });
    //     setCoordinates({ lat, lng });
    //     console.log(lat + " " + lng);
    // };
    return (
        <LoadScript googleMapsApiKey={process.env.REACT_APP_MAP_KEY}>
            <GoogleMap
                mapContainerStyle={mapStyles}
                zoom={10}
                center={coordinates}>
                <Marker position={coordinates} />
            </GoogleMap>
        </LoadScript>
    );
};
export default ShowMap;
