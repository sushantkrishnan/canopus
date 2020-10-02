import React, { useState, useEffect } from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
const InputMap = ({ setCoordinates, coordinates }) => {
    console.log("coordinates");
    console.log(coordinates);
    const mapStyles = {
        height: "370px",
        width: "100%",
    };

    const defaultCenter =
        coordinates.lng === null
            ? {
                  lat: 20.4,
                  lng: 120.7,
              }
            : coordinates;
    const [currentPosition, setCurrentPosition] = useState(defaultCenter);

    const success = (position) => {
        const currentPosition = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
        };
        // console.log(currentPosition);
        setCoordinates(currentPosition);
        setCurrentPosition(currentPosition);
    };
    // useEffect(() => {
    //     console.log(coordinates);
    //     if (!coordinates) {
    //         navigator.geolocation.getCurrentPosition(success, (err) => {
    //             console.log(err);
    //             setCurrentPosition({ lat: 29.4, lng: 77.7 });
    //             setCoordinates({ lat: 29.4, lng: 77.7 });
    //         });
    //     }
    // }, []);
    const onMarkerDragEnd = (e) => {
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        setCurrentPosition({ lat, lng });
        setCoordinates({ lat, lng });
        console.log(lat + " " + lng);
    };
    return (
        <LoadScript googleMapsApiKey={process.env.REACT_APP_MAP_KEY}>
            <GoogleMap
                mapContainerStyle={mapStyles}
                zoom={15}
                center={currentPosition}>
                <Marker
                    position={currentPosition}
                    onDragEnd={(e) => onMarkerDragEnd(e)}
                    draggable={true}
                />
            </GoogleMap>
        </LoadScript>
    );
};
export default InputMap;
