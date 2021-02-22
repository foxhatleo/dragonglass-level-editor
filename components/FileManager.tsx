import React, {ChangeEvent, SyntheticEvent, useEffect, useState} from "react";
import {connect, ConnectedProps} from "react-redux";
import State from "../redux/store/State";
import {bindActionCreators} from "redux";
import * as Dispatcher from "../redux/action/Dispatcher";
import {Alert, Button, FormControl, Modal} from "react-bootstrap";

const EXT = ".ppl";
const EXT_LEN = EXT.length;

const nwConnector = connect(
    (s: State) => ({loggedIn: s.loggedIn}),
    (d) => bindActionCreators(Dispatcher, d),
);

const NewWindow: React.FunctionComponent<ConnectedProps<typeof nwConnector> & {folderId: string; show: boolean;}> = (p) => {
    const [filename, _setFilename] = useState<string>(EXT);
    const setFilename = (e: ChangeEvent<HTMLInputElement>) => {
        let fn = e.currentTarget.value.trim();
        fn = fn.replaceAll(/[#%<>&*{}?\/\\$+!`|=:@]/g, "");
        if (!fn.endsWith(EXT)) fn += EXT;
        _setFilename(fn);
    }

    const [creating, setCreating] = useState<number>(0);

    const selectDetect = (e: SyntheticEvent<HTMLInputElement>) => {
        e.currentTarget.selectionEnd =
            Math.min(e.currentTarget.selectionEnd || 0, filename.length - EXT_LEN);
        e.currentTarget.selectionStart =
            Math.min(e.currentTarget.selectionEnd || 0, e.currentTarget.selectionStart || 0);
    };

    const create = () => {
        if (creating > 5) {
            setCreating(-1);
            return;
        }
        setCreating(creating + 1);
        const fileMetadata = {
            "name": filename,
            "mimeType": 'application/panic-painter-level',
            "parents": [p.folderId]
        };
        gapi.client.drive.files.create({
            resource: fileMetadata,
        }).then((result) => {
            const nfid = JSON.parse(result.body)["id"];
            window.location.replace(window.location.href.split("?")[0] + "?state=" +
                encodeURIComponent(JSON.stringify({action: "open", ids: [nfid]})));
        }).catch(() => {
            setTimeout(create, 300);
        });
    };

    return (
        <Modal backdrop="static" show={p.loggedIn && p.show} onHide={() => {}}>
            {creating < 0 ?
                <Alert variant="danger">
                    An error occurred. Try again later.
                    If problem exists, contact Wenhao "Leo" Liang.
                </Alert> : ""}
            <Modal.Header><Modal.Title>Enter file name</Modal.Title></Modal.Header>
            <Modal.Body>
                Enter a name for your new level file.
                <p><FormControl onSelect={selectDetect} disabled={creating > 0}
                                autoCapitalize="no" onChange={setFilename} value={filename} /></p>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="primary" disabled={filename.length <= EXT_LEN || creating > 0} onClick={create}>
                    Continue
                </Button>
            </Modal.Footer>
        </Modal>
    )
};
const NWC = nwConnector(NewWindow);

const fmConnector = connect(
    (s: State) => ({fileId: s.fileId, loggedIn: s.loggedIn}),
    (d) => bindActionCreators(Dispatcher, d),
);

const FileManager: React.FunctionComponent<ConnectedProps<typeof fmConnector> & {googleState: any;}> = (p) => {
    const [loading, setLoading] = useState<boolean>(false);
    const [driveApiReady, setDriveApiReady] = useState<boolean>(false);

    const googleStateExists = typeof p.googleState === "object" && p.googleState !== null;
    const showFolder = (googleStateExists &&
        p.googleState["action"] === "create" &&
        p.fileId.length <= 0) &&
        driveApiReady;

    useEffect(() => {
        const i = setInterval(() => {
            if (typeof gapi !== "undefined" && gapi.client && gapi.client.drive && gapi.client.drive.files) {
                setDriveApiReady(true);
                clearInterval(i);
            }
        }, 50);
    }, []);

    useEffect(() => {
        if (googleStateExists && p.googleState["action"] === "open" &&
            p.fileId != p.googleState["ids"][0]) {
            p.setFileId(p.googleState["ids"][0]);
        }
    }, [p.googleState]);

    const loadFile = () => {
        setLoading(true);
        gapi.client.drive.files.get({
            fileId: p.fileId,
            alt: "media"
        }).then(res => {
            gapi.client.drive.files.get({
                fileId: p.fileId
            }).then(res2 => {
                setLoading(false);
                p.setName(JSON.parse(res2.body)["name"]);
                p.parseData(res.body || "");
            }).catch(() => {
                setTimeout(loadFile, 300);
            });
        }).catch(() => {
            setTimeout(loadFile, 300);
        });
    };

    useEffect(() => {
        if (p.fileId.length > 0 && p.loggedIn && driveApiReady) {
            loadFile();
        }
    }, [p.fileId, driveApiReady, p.loggedIn]);

    return (
        <>
            <NWC folderId={googleStateExists ? p.googleState["folderId"] : ""} show={showFolder} />
            <Modal backdrop="static" show={loading} onHide={() => {}}>
                <Modal.Header><Modal.Title>Loading file...</Modal.Title></Modal.Header>
                <Modal.Body>
                    Loading level file... This make take a few seconds.
                </Modal.Body>
            </Modal>
            <Modal backdrop="static" show={p.googleState === null} onHide={() => {}}>
                <Modal.Header><Modal.Title>Error</Modal.Title></Modal.Header>
                <Modal.Body>
                    Please open this app from Google Drive by either opening an existing level file or creating a new
                    level file.
                </Modal.Body>
            </Modal>
        </>
    )

};
export default fmConnector(FileManager);
