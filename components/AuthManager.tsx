import React, {useEffect, useState} from "react";
import {Button, Modal} from "react-bootstrap";
import * as Dispatcher from "../redux/action/Dispatcher";
import {connect, ConnectedProps} from "react-redux";
import {bindActionCreators} from "redux";
import State from "../redux/store/State";

enum AuthManagerStage {
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
    "https://www.googleapis.com/auth/drive",
    "https://www.googleapis.com/auth/drive.appdata",
    "https://www.googleapis.com/auth/drive.metadata",
    "https://www.googleapis.com/auth/drive.file",
].join(" ");

const connector = connect(
    (s: State) => ({loggedIn: s.loggedIn}),
    (d) => bindActionCreators(Dispatcher, d),
);

const AuthManager: React.FunctionComponent<ConnectedProps<typeof connector>> = (p) => {
    const [stage, setStage] = useState<AuthManagerStage>(AuthManagerStage.LOAD_AUTH);
    const fail = (c: string, e: any) => {
        setStage(AuthManagerStage.ERROR);
        p.fail(["auth:" + c, e]);
    }

    useEffect(() => {
        try {
            switch (stage) {
                case AuthManagerStage.LOAD_AUTH: {
                    gapi.load("client:auth2", {
                        onerror: (e: any) => fail("loadAuth", e),
                        // callback: () => {
                        // gapi.load('drive-share', {
                        //     onerror: fail,
                        callback: () => setStage(AuthManagerStage.INIT_CLIENT)
                        // });
                        // },
                    });
                    break;
                }
                case AuthManagerStage.INIT_CLIENT: {
                    gapi.client.init({
                        apiKey: API_KEY,
                        clientId: CLIENT_ID,
                        discoveryDocs: DISCOVERY_DOCS,
                        scope: SCOPES
                    }).then(() => {
                        gapi.auth2.getAuthInstance().isSignedIn.listen(p.updateSignInStatus);
                        p.updateSignInStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
                        setStage(AuthManagerStage.AUTH_READY);
                    }, (e: any) => fail("initClient", e));
                    break;
                }
            }
        } catch (e) {
            fail("uncaught", e);
        }
    }, [stage]);

    const logIn = () => {
        gapi.auth2.getAuthInstance().signIn()
            .then(() => {
                p.updateSignInStatus(gapi.auth2.getAuthInstance().isSignedIn.get())
            });
    };

    const header = () => {
        if (stage === AuthManagerStage.AUTH_READY) return "Sign In with your Cornell Google account";
        return "Initializing";
    }

    const content = () => {
        switch (stage) {
            case AuthManagerStage.ERROR:
                return (<>Cannot connect to Google auth server.<br/>Refresh this page.</>);
            case AuthManagerStage.INIT_CLIENT:
                return (<>Initializing Google client...</>);
            case AuthManagerStage.LOAD_AUTH:
                return (<>Loading Google auth module...</>);
            case AuthManagerStage.AUTH_READY:
                if (p.loggedIn) return <>Logged in. Please wait...</>;
                return (
                    <>
                        Level files are stored in the Google Drive of your Cornell account.<br/>
                        To continue, authorize access to your Google account.
                        <p>
                            <strong>Privacy policy</strong><br/>
                            This level editor only requests access to the files that you have opened or created with
                            this app (in other words, the level files). It will <em>NOT</em> have access to any other
                            file in your Google Drive or any other part of your account (including but not limited to
                            Gmail, Contacts, Calendar, etc).
                        </p>
                        <p>
                            <strong>If you are stuck on this screen</strong><br/>
                            Try to clear cookies and cache of your browser. If problem persists, try disabling browser
                            extensions or settings that limit third-party cookies.
                        </p>
                    </>
                );
        }
    };

    return (
        <Modal backdrop="static" show={stage !== AuthManagerStage.AUTH_READY || !p.loggedIn} onHide={() => {
        }}>
            <Modal.Header><Modal.Title>{header()}</Modal.Title></Modal.Header>
            <Modal.Body>{content()}</Modal.Body>
            {stage == AuthManagerStage.AUTH_READY ? <Modal.Footer>
                <Button onClick={logIn} variant="primary" disabled={stage != AuthManagerStage.AUTH_READY}>
                    Authorize
                </Button>
            </Modal.Footer> : <></>}
        </Modal>
    );
};

export default connector(AuthManager);
