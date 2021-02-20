import React, {useEffect, useState} from "react";
import {Button, Modal} from "react-bootstrap";
import * as Dispatcher from "../redux/action/Dispatcher";
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import State from "../redux/store/State";

enum AuthWindowStage {
    ERROR,
    LOAD_AUTH,
    INIT_CLIENT,
    AUTH_READY,
}

// Client ID and API key from the Developer Console
const CLIENT_ID = "656662885342-aku8gdtahr0g4a9lu6rieetf8k9kegfp.apps.googleusercontent.com";
const API_KEY = "AIzaSyBbvDvbHa_Fv7Sb4qM449_hlnN3yWg0eK0";

// Array of API discovery doc URLs for APIs used by the quickstart
const DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"];

// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
const SCOPES = [
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile",
    "https://www.googleapis.com/auth/drive.file",
].join(" ");

const AuthWindow: React.FunctionComponent<{loggedIn: boolean;} & typeof Dispatcher> = (p) => {
    const [stage, setStage] = useState<AuthWindowStage>(AuthWindowStage.LOAD_AUTH);
    const fail = (e: any) => {
        setStage(AuthWindowStage.ERROR);
        console.error(`AuthWindow error. Current stage: ${stage}`);
        if (e) console.error(e);
    }

    useEffect(() => {
        try {
            switch (stage) {
                case AuthWindowStage.LOAD_AUTH: {
                    gapi.load("client:auth2", {
                        onerror: fail,
                        callback: () => setStage(AuthWindowStage.INIT_CLIENT),
                    });
                    break;
                }
                case AuthWindowStage.INIT_CLIENT: {
                    gapi.client.init({
                        apiKey: API_KEY,
                        clientId: CLIENT_ID,
                        discoveryDocs: DISCOVERY_DOCS,
                        scope: SCOPES
                    }).then(() => {
                        gapi.auth2.getAuthInstance().isSignedIn.listen(p.updateSignInStatus);
                        p.updateSignInStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
                        setStage(AuthWindowStage.AUTH_READY);
                    }, fail);
                    break;
                }
            }
        } catch (e) {
            fail(e);
        }
    }, [stage]);

    const logIn = () => {
        gapi.auth2.getAuthInstance().signIn()
            .then(() => {
                p.updateSignInStatus(gapi.auth2.getAuthInstance().isSignedIn.get())
            })
    };

    const content = () => {
        switch (stage) {
            case AuthWindowStage.ERROR:
                return (<>Cannot connect to Google auth server.<br/>Refresh this page.</>);
            case AuthWindowStage.INIT_CLIENT:
                return (<>Initializing Google client...</>);
            case AuthWindowStage.LOAD_AUTH:
                return (<>Loading Google auth module...</>);
            case AuthWindowStage.AUTH_READY:
                if (p.loggedIn)
                    return (<>Logged in.</>);
                return (
                    <>
                        Level files are stored in your Google Drive.<br/>
                        To continue, authorize access to your Google account.
                        <p>
                            <strong>Privacy policy: </strong>
                            This level editor only requests access to the files that you have opened or created with
                            this app (in other words, the level files). It will <em>NOT</em> have access to any other
                            file in your Google Drive, nor any other part of your account (including but not limited to
                            Gmail, Contacts, Calendar, etc).
                        </p>
                    </>
                );
        }
    };

    return (
        <Modal show={stage != AuthWindowStage.AUTH_READY || !p.loggedIn} onHide={() => {}}>
            <Modal.Header>
                Sign in with your Google account
            </Modal.Header>
            <Modal.Body>{content()}</Modal.Body>
            <Modal.Footer>
                <Button onClick={logIn} variant="primary" disabled={stage != AuthWindowStage.AUTH_READY}>
                    Authorize
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default connect<{}, {}, {}, State>(
    (s) => ({loggedIn: s.loggedIn}),
    (d) => bindActionCreators(Dispatcher, d),
)(AuthWindow);
