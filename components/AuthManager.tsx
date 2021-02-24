import React, {useEffect, useState} from "react";
import {Button, Modal} from "react-bootstrap";
import * as Dispatcher from "../redux/action/Dispatcher";
import {connect, ConnectedProps} from "react-redux";
import {bindActionCreators} from "redux";
import State from "../redux/store/State";
import * as Config from "../config/Google";

enum AuthManagerStage {
    ERROR,
    LOAD_AUTH,
    INIT_CLIENT,
    AUTH_READY,
}

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
                        callback: () => setStage(AuthManagerStage.INIT_CLIENT),
                    });
                    break;
                }
                case AuthManagerStage.INIT_CLIENT: {
                    gapi.client.init({
                        apiKey: Config.API_KEY,
                        clientId: Config.CLIENT_ID,
                        discoveryDocs: Config.DISCOVERY_DOCS,
                        scope: Config.SCOPES.join(" "),
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
            .then(() => {p.updateSignInStatus(gapi.auth2.getAuthInstance().isSignedIn.get())});
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
                            <strong>Privacy policy</strong><br/>
                            The privacy policy of this app is available <a href={"https://github.com/foxhatleo/panic-painter-level-editor/blob/master/PRIVACY.md"}>here</a>.
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
        <Modal backdrop="static" show={stage !== AuthManagerStage.AUTH_READY || !p.loggedIn} onHide={() => {}}>
            <Modal.Header><Modal.Title>{header()}</Modal.Title></Modal.Header>
            <Modal.Body>{content()}</Modal.Body>
            {stage == AuthManagerStage.AUTH_READY ? <Modal.Footer>
                <Button onClick={logIn} variant="primary" disabled={stage != AuthManagerStage.AUTH_READY}>
                    Authorize
                </Button>
            </Modal.Footer> : ""}
        </Modal>
    );
};

export default connector(AuthManager);
