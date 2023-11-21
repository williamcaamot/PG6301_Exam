import React, {useEffect, useState} from "react";
import ErrorMessage from "../globals/ErrorMessage.jsx";
import {useMatch} from "react-router-dom";
import Profile from "./Profile.jsx";

function ExternalProfilePage() {

    const match = useMatch("/profile/:email");
    const email = match.params.email;

    const [user, setUser] = useState();
    const [errorMessage, setErrorMessage] = useState();


    async function getUser() {
        try {
            const res = await fetch(`/api/v1/profile/${email}`);
            const {message, data} = await res.json();

            if(res.status !== 200){
                setErrorMessage(message);
                return;
            }
            setUser(data);
            console.log(data);

        } catch (e) {
            setErrorMessage(e.message);
        }
    }

    useEffect(() => {
        getUser();
    }, []);


    return <>


        <div className={"pageContentWrapper"}>
            <div className={"innerWrapper"}>
                <ErrorMessage message={errorMessage}/>
                <Profile user={user}/>
            </div>
        </div>
    </>
}

export default ExternalProfilePage;