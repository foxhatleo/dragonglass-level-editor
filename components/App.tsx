import React, {useEffect, useState} from "react";
import AuthManager from "./AuthManager";
import FileManager from "./FileManager";
import SaveManager from "./SaveManager";
import TableArea from "./TableArea";
import {Container} from "react-bootstrap";
import Navbar from "./Navbar";
import ColorWindow from "./ColorWindow";
import Simulate from "./Simulate";
import UnexpectedError from "./UnexpectedError";
import Head from "next/head";
import {connect, ConnectedProps} from "react-redux";
import RootState from "../redux/store/State";
import {bindActionCreators} from "redux";
import * as Dispatcher from "../redux/action/Dispatcher";

const connector = connect(
    (s: RootState) => ({ready: s.ready, name: s.name, fileId: s.fileId}),
    (d) => bindActionCreators(Dispatcher, d),
);

export type AppProps = {
    createMode: boolean;
    id: string;
};

const App: React.FunctionComponent<ConnectedProps<typeof connector> & AppProps> = (p) => {
    const [showColor, setShowColor] = useState<boolean>(false);
    const [simulate, setSimulate] = useState<boolean>(false);

    useEffect(() => {
        p.setFileId(p.id);
    }, [p.id]);

    return (
        <React.Fragment>
            <Head>
                <title>{!p.name ? "" : `${p.name} - `}Panic Painter Level Editor</title>
            </Head>
            <AuthManager/>
            <FileManager createMode={p.createMode}/>
            <SaveManager/>
            {p.ready ? <>
                <ColorWindow show={showColor}
                             onClose={() => setShowColor(false)}/>
                <Simulate show={simulate}
                          onClose={() => setSimulate(false)}/>
                <Navbar onColor={() => setShowColor(true)}
                        onSimulate={() => setSimulate(true)}/>
                <Container className={"mt-5 mb-3"}>
                    <TableArea/>
                    <div className={"text-center text-muted"}>
                        Made with ♥ by Wenhao "Leo" Liang<br/>
                        Source available at <a href={"https://github.com/foxhatleo/panic-painter-level-editor/"} target="_blank" rel="noreferrer noopener">GitHub</a>
                        <span className={"pl-3"}>
                            <a href={"https://github.com/foxhatleo/panic-painter-level-editor/blob/master/PRIVACY.md"} target="_blank" rel="noreferrer noopener">
                                Privacy Policy
                            </a>
                        </span>
                    </div>
                </Container>
            </> : ""}
            <UnexpectedError/>
        </React.Fragment>
    );
};
export default connector(App);
