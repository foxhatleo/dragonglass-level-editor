import React from "react";
import {connect, ConnectedProps} from "react-redux";
import State from "../redux/store/State";
import {bindActionCreators} from "redux";
import * as Dispatcher from "../redux/action/Dispatcher";
import {setTimeout} from "timers";
import * as V1Representation from "../redux/util/V1Representation";

const connector = connect(
    (s: State) => ({
        level: s.level,
        saved: s.editor.lastStored,
        fileId: s.fileId,
        ready: s.editor.ready
    }),
    (d) => bindActionCreators(Dispatcher, d),
);
class SaveManager extends React.Component<ConnectedProps<typeof connector>, {loading: boolean;}> {
    private interval: ReturnType<typeof setTimeout> | undefined;

    constructor(p: ConnectedProps<typeof connector>) {
        super(p);
        this.state = {loading: false};
    }

    update(): void {
        const l = this.props.level;
        const j = V1Representation.stringify(l);
        if (this.state.loading || !this.props.ready || j == this.props.saved) return;
        this.setState({loading: true});
        gapi.client.request({
            path: "/upload/drive/v3/files/" + this.props.fileId,
            method: "PATCH",
            params: {
                uploadType: "media"
            },
            body: j
        }).then(() => {
            this.props.markSaved(j);
            this.setState({loading: false});
        }, () => {
            console.error("Failed to save.");
            this.setState({loading: false});
        });
    }

    componentDidMount() {
        this.interval = setInterval(() => this.update(), 200);
    }

    componentWillUnmount() {
        if (typeof this.interval !== undefined) clearInterval(this.interval as any);
    }

    render() {
        return null;
    }
}
export default connector(SaveManager);
