import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ErrorMessage from "../globals/ErrorMessage.jsx";
import { AppContext } from "../App.jsx";
import SuccessMessage from "../globals/SuccessMessage.jsx";

function EntraIdLoginCallback({}) {
  const [errorMessage, setErrorMessage] = useState();
  const [successMessage, setSuccessMessage] = useState();

  const navigate = useNavigate();
  const { setUser } = useContext(AppContext);

  const client_id = "57350161-fcb3-43d0-a7e7-0c2ba9658b8e";

  async function handleCallback() {
    try {
      const hash = Object.fromEntries(
        new URLSearchParams(window.location.hash.substring(1)),
      );
      let { access_token, error, error_description, state, code } = hash;
      const { token_endpoint } = await fetchJSON(
        "https://login.microsoftonline.com/common/v2.0/.well-known/openid-configuration",
      );

      if (state !== window.sessionStorage.getItem("state")) {
        setErrorMessage("Invalid state");
        return;
      }

      const client_id = "57350161-fcb3-43d0-a7e7-0c2ba9658b8e";

      if (code) {
        const code_verifier = window.sessionStorage.getItem("code_verifier");
        const res = await fetch(token_endpoint, {
          method: "POST",
          body: new URLSearchParams({
            grant_type: "authorization_code",
            code,
            client_id,
            code_verifier,
          }),
        });
        const json = await res.json();
        access_token = json.access_token;
      }
      if (access_token) {
        const res = await fetch("/api/v1/login/entraid", {
          method: "POST",
          body: JSON.stringify({ access_token: access_token }),
          headers: {
            "content-type": "application/json",
          },
        });
        const { message, data } = await res.json();

        if (res.status !== 201) {
          setErrorMessage(message || "En ukjent feil har oppstått");
          return;
        }
        setSuccessMessage(message);
        setUser(data);
        navigate("/");
      }
    } catch (e) {
      setErrorMessage(e.message);
    }
  }

  useEffect(() => {
    handleCallback();
  }, []);

  return (
    <>
      <div className={"pageContentWrapper"}>
        <div className={"innerWrapper"}>
          <h2>Logging in with Entra ID... Please wait</h2>
          <ErrorMessage message={errorMessage} />
          <SuccessMessage message={successMessage} />
        </div>
      </div>
    </>
  );
}

export default EntraIdLoginCallback;

async function fetchJSON(path) {
  const res = await fetch(path);
  if (!res.ok) {
    throw new Error(`Failed to fetch ${path}: ${res.statusText}`);
  }
  return await res.json();
}
