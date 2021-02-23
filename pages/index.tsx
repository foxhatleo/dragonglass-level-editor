import React from "react";
import {NextPage} from "next";
import {Modal} from "react-bootstrap";

const Home: NextPage = () => (
    <>
        <Modal backdrop="static" show={true} onHide={() => {}}>
            <Modal.Header><Modal.Title>Invalid request</Modal.Title></Modal.Header>
            <Modal.Body>
                Please open a level file or create a new one from Google Drive.
            </Modal.Body>
        </Modal>
    </>
);

Home.getInitialProps = async (appContext ) => {
    const fail = () => {
        appContext.res?.writeHead(400);
        appContext.res?.write("This is not a valid state object.");
        appContext.res?.end();
    }

    if (typeof window === "undefined" && appContext.res && appContext.res.writeHead && appContext.query.state) {
        try {
            const googleState = JSON.parse(appContext.query.state as string);
            if (googleState["action"] == "create" && typeof googleState["folderId"] === "string") {
                appContext.res.writeHead(302, {Location: `/${googleState["folderId"]}/create`});
                appContext.res.end();
            } else if (googleState["action"] == "open" && typeof googleState["ids"][0] === "string") {
                appContext.res.writeHead(302, {Location: `/${googleState["ids"][0]}/edit`});
                appContext.res.end();
            }
        } catch (e) {
            fail();
        }
    }
    return {};
}
export default Home;
