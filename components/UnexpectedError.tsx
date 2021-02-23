import React, {SyntheticEvent} from "react";
import {FormControl, Modal} from "react-bootstrap";
import {connect, ConnectedProps} from "react-redux";
import RootState from "../redux/store/State";

const connector = connect((s: RootState) => ({
    ge: s.globalError
}));
const UnexpectedError: React.FunctionComponent<ConnectedProps<typeof connector>> = (p) => {
    return (
        <Modal backdrop="static" show={p.ge} onHide={() => {}}>
            <Modal.Header><Modal.Title>Unexpected Error</Modal.Title></Modal.Header>
            <Modal.Body>
                Try refreshing. If problem persists, please copy and paste the following information and send it
                to Leo for debugging.
                <FormControl rows={5} as={"textarea"} className={"mt-2"} value={p.ge} onChange={() => {}} onSelect={(e: SyntheticEvent<HTMLTextAreaElement>) => {
                    e.currentTarget.selectionStart = 0;
                    e.currentTarget.selectionEnd = p.ge.length;
                }} />
            </Modal.Body>
        </Modal>
    );
}
export default connector(UnexpectedError);