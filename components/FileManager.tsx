import React, {ChangeEvent, SyntheticEvent, useEffect, useState} from "react";
import {connect, ConnectedProps} from "react-redux";
import State from "../redux/store/State";
import {bindActionCreators} from "redux";
import * as Dispatcher from "../redux/action/Dispatcher";
import {Button, FormControl, Modal} from "react-bootstrap";

const EXT = ".ppl";
const EXT_LEN = EXT.length;

const nwConnector = connect(
    (s: State) => ({loggedIn: s.loggedIn}),
    (d) => bindActionCreators(Dispatcher, d),
);

type NewWindowProps = {
    folderId: string;
    show: boolean;
}

const _NewWindow: React.FunctionComponent<ConnectedProps<typeof nwConnector> & NewWindowProps> = (p) => {
    const [filename, _setFilename] = useState<string>(EXT);
    const [creating, setCreating] = useState<boolean>(false);
    const setFilename = (e: ChangeEvent<HTMLInputElement>) => {
        let fn = e.currentTarget.value.trim();
        fn = fn.replaceAll(/[#%<>&*{}?\/\\$+!`|=:@]/g, "");
        if (!fn.endsWith(EXT)) fn += EXT;
        _setFilename(fn);
    }

    const selectDetect = (e: SyntheticEvent<HTMLInputElement>) => {
        e.currentTarget.selectionEnd =
            Math.min(e.currentTarget.selectionEnd || 0, filename.length - EXT_LEN);
        e.currentTarget.selectionStart =
            Math.min(e.currentTarget.selectionEnd || 0, e.currentTarget.selectionStart || 0);
    };

    const create = () => {
        if (filename.length <= EXT_LEN || creating) return;
        setCreating(true);
        gapi.client.drive.files.create({
            resource: {
                "name": filename,
                "mimeType": 'application/panic-painter-level',
                "parents": [p.folderId]
            },
        }).then((result) => {
            const fid = JSON.parse(result.body)["id"];
            window.location.replace(`/${fid}/edit`);
        }).catch((e) => p.fail(["create", e]));
    };

    const createKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" || e.keyCode === 13) {
            create();
        }
    };

    return (
        <Modal backdrop="static"
               show={p.loggedIn && p.show}
               onHide={() => {
               }}>
            <Modal.Header><Modal.Title>Enter file name</Modal.Title></Modal.Header>
            <Modal.Body>
                Enter a name for your new level file.
                <p>
                    <FormControl onSelect={selectDetect}
                                 disabled={creating}
                                 autoCapitalize="no"
                                 onChange={setFilename}
                                 onKeyUp={createKeyUp}
                                 value={filename}/>
                </p>
            </Modal.Body>
            <Modal.Footer>
                <Button
                    variant="primary"
                    disabled={filename.length <= EXT_LEN || creating}
                    onClick={create}>
                    Continue
                </Button>
            </Modal.Footer>
        </Modal>
    )
};
const NewWindow = nwConnector(_NewWindow);

const gFilesReady = () => (typeof gapi !== "undefined" && gapi.client && gapi.client.drive && gapi.client.drive.files);

export function reload(c: string, p: {fileId: string} & typeof Dispatcher, onDone: () => void, onFail?: (e: any) => void) {
    if (!gFilesReady()) {
        onDone();
        return;
    }
    Promise.all([
        gapi.client.drive.files.get({fileId: p.fileId, alt: "media"}),
        gapi.client.drive.files.get({fileId: p.fileId}),
    ]).then(([media, metadata]) => {
        onDone();
        p.setName(JSON.parse(metadata.body)["name"]);
        p.parseData(media.body || "");
        p.markReady();
    }).catch((e) => typeof onFail === "function" ? onFail(e) : p.fail([c, e]));
}

const fmConnector = connect(
    (s: State) => ({fileId: s.fileId, loggedIn: s.loggedIn}),
    (d) => bindActionCreators(Dispatcher, d),
);

const FileManager: React.FunctionComponent<ConnectedProps<typeof fmConnector> & { createMode: boolean; }> = (p) => {
    const [loading, setLoading] = useState<boolean>(false);
    const [driveApiReady, setDriveApiReady] = useState<boolean>(false);
    const showFolder = p.createMode && driveApiReady;

    // Monitor for Google Drive API for when it is ready.
    useEffect(() => {
        const i = setInterval(() => {
            if (gFilesReady()) {
                setDriveApiReady(true);
                clearInterval(i);
            }
        }, 50);
    }, []);

    // When everything is ready, load file.
    useEffect(() => {
        if (p.fileId && p.loggedIn && driveApiReady && !p.createMode) {
            setLoading(true);
            reload("open", p, () => setLoading(false));
        }
    }, [p.fileId, driveApiReady, p.loggedIn]);

    return (
        <>
            <NewWindow folderId={p.fileId} show={showFolder}/>
            <Modal backdrop="static" show={loading} onHide={() => {
            }}>
                <Modal.Header><Modal.Title>Loading file...</Modal.Title></Modal.Header>
                <Modal.Body>
                    Loading level file... This make take a few seconds.
                </Modal.Body>
            </Modal>
        </>
    );
};
export default fmConnector(FileManager);
