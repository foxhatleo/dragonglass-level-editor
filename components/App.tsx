import React, {useEffect, useState} from "react";
import AuthManager from "./AuthManager";
import {parse} from "query-string";
import FileManager from "./FileManager";
import SaveManager from "./SaveManager";
import TableArea from "./TableArea";
import {Container} from "react-bootstrap";
import Navbar from "./Navbar";

const App: React.FunctionComponent = () => {
    const [googleState, setGoogleState] = useState<any | null | undefined>(undefined);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const parsed = parse(window.location.search);
            if (typeof parsed["state"] === "string") {
                setGoogleState(JSON.parse(parsed["state"] as string));
            } else {
                setGoogleState(null);
            }
        }
    }, []);

    return (
        <React.Fragment>
            <AuthManager />
            <FileManager googleState={googleState} />
            <SaveManager />
            <Navbar />
            <Container className={"mt-5 mb-3"}>
                <TableArea />
            </Container>
        </React.Fragment>
    );
};

export default App;
