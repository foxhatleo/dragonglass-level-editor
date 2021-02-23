import React, {SyntheticEvent} from "react";
import {Alert, Button, FormControl, Modal} from "react-bootstrap";
import {connect, ConnectedProps} from "react-redux";
import RootState from "../redux/store/State";

const connector = connect((s: RootState) => ({
    fileId: s.fileId,
    ge: s.globalError
}));
const UnexpectedError: React.FunctionComponent<ConnectedProps<typeof connector>> = (p) => {
    const e404 = !!p.ge && JSON.parse(p.ge).error.body?.error?.code == 404 && p.fileId != "";
    const redirect404 = () => window.location.replace(`https://drive.google.com/file/d/${p.fileId}/view`);
    if (e404) {
        setTimeout(redirect404, 5000);
    }
    return (
        <>
            <Modal backdrop="static" show={!!p.ge && !e404} onHide={() => {}}>
                <Modal.Header><Modal.Title>Unexpected Error</Modal.Title></Modal.Header>
                <Modal.Body>
                    Try refreshing. If problem persists, please copy and paste the following information and send it
                    to Leo for debugging.
                    <FormControl rows={5} as={"textarea"} className={"mt-2"} value={p.ge} onChange={() => {
                    }} onSelect={(e: SyntheticEvent<HTMLTextAreaElement>) => {
                        e.currentTarget.selectionStart = 0;
                        e.currentTarget.selectionEnd = p.ge.length;
                    }}/>
                </Modal.Body>
            </Modal>
            <Modal backdrop="static" show={e404} onHide={() => {}}>
                <Modal.Header><Modal.Title>404 Error</Modal.Title></Modal.Header>
                <Modal.Body>
                    The level editor cannot find the resource requested. This issue may be resolved by reopening it from
                    Google Drive.
                    <p>Redirecting you momentarily...</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant={"primary"} onClick={redirect404}>Redirect now</Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}
export default connector(UnexpectedError);