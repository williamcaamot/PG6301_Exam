import React, {useContext} from "react";
import {Link} from "react-router-dom";
import {AppContext} from "./App.jsx";

function Header() {

    const { user } = useContext(AppContext);

    return <>
        <div className={"flexWrapper"}>
            <div className={"headerWrapper"}>
                <div>
                    <h1>Banter Battle - Chat website</h1>
                </div>
                <div>
                    <nav>
                        <Link to="/" className={"mainMenuLink"}>Hjem</Link>
                        <Link to="/chat" className={"mainMenuLink"}>Chat</Link>

                    </nav>
                </div>
                <div>
                    {user ?
                        <Link to="/profile" className={"mainMenuLink"}>Velkommen, {user.name}</Link>
                        :
                        <Link to="/login" className={"mainMenuLink"}>Logg inn</Link>
                    }

                </div>
            </div>
        </div>
    </>
}

export default Header;