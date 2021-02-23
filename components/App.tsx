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
    (s: RootState) => ({name: s.name, fileId: s.fileId}),
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
        console.log(p.id);
        p.setFileId(p.id);
    }, []);

    return (
        <React.Fragment>
            <Head>
                <title>{!p.name ? "" : `${p.name} - `}Panic Painter Level Editor</title>
            </Head>
            <AuthManager/>
            <FileManager createMode={p.createMode}/>
            <SaveManager/>
            <ColorWindow show={showColor}
                         onClose={() => setShowColor(false)}/>
            <Simulate show={simulate}
                      onClose={() => setSimulate(false)}/>
            <Navbar onColor={() => setShowColor(true)}
                    onSimulate={() => setSimulate(true)}/>
            <Container className={"mt-5 mb-3"}>
                <TableArea/>
            </Container>
            <UnexpectedError/>
        </React.Fragment>
    );
};
export default connector(App);
