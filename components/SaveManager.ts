import React from "react";
import {connect, ConnectedProps} from "react-redux";
import State from "../redux/store/State";
import {bindActionCreators} from "redux";
import * as Dispatcher from "../redux/action/Dispatcher";
import {setTimeout} from "timers";
import * as V1Representation from "../redux/util/V1Representation";
import {reload} from "./FileManager";
import {isDebug} from "../config/Debug";

const connector = connect(
    (s: State) => ({
        level: s.level,
        saved: s.lastStored,
        fileId: s.fileId,
        ready: s.ready,
    }),
    (d) => bindActionCreators(Dispatcher, d),
);

const MAX_ERROR_ALLOWED = 5;

class SaveManager extends React.Component<ConnectedProps<typeof connector>, {
    saving: boolean;
    savingError: number;
    refreshing: boolean;
    refreshingError: number;
}> {
    private interval: ReturnType<typeof setTimeout> | undefined;
    private interval2: ReturnType<typeof setTimeout> | undefined;

    constructor(p: ConnectedProps<typeof connector>) {
        super(p);
        this.state = {saving: false, refreshing: false, savingError: 0, refreshingError: 0};
    }

    update(): void {
        const l = this.props.level;
        const j = V1Representation.stringify(l);
        if (isDebug()) {
            this.props.markSaved(j);
            return;
        }
        if (this.state.saving || !this.props.ready || j == this.props.saved || this.state.savingError > MAX_ERROR_ALLOWED) return;
        this.setState({saving: true});
        gapi.client.request({
            path: "/upload/drive/v3/files/" + this.props.fileId,
            method: "PATCH",
            params: {
                uploadType: "media"
            },
            body: j
        }).then(() => {
            this.props.markSaved(j);
            this.setState((p) => ({...p, saving: false, savingError: 0}));
        }, (e) => {
            if (this.state.savingError > MAX_ERROR_ALLOWED) {
                this.props.fail(["save:save", e]);
                return;
            }
            this.setState((p) => ({...p, saving: false, savingError: p.savingError + 1}));
        });
    }

    refresh(): void {
        if (isDebug() || this.state.saving || this.state.refreshing || this.state.refreshingError > MAX_ERROR_ALLOWED) return;
        const l = this.props.level;
        const j = V1Representation.stringify(l);
        if (j != this.props.saved) return;
        this.setState({refreshing: true});
        reload("save:refresh", this.props, () => {
            this.setState((p) => ({...p, refreshing: false, refreshingError: 0}));
        }, (e) => {
            if (this.state.refreshingError > MAX_ERROR_ALLOWED) {
                this.props.fail(["save:save", e]);
                return;
            }
            this.setState((p) => ({...p, refreshing: false, refreshingError: p.refreshingError + 1}));
        });
    }

    componentDidMount() {
        this.interval = setInterval(() => this.update(), 200);
        this.interval2 = setInterval(() => this.refresh(), 1000);
    }

    componentWillUnmount() {
        if (typeof this.interval !== undefined) clearInterval(this.interval as any);
        if (typeof this.interval2 !== undefined) clearInterval(this.interval2 as any);
    }

    render() {
        if (this.props.ready && typeof window !== "undefined") {
            window.onbeforeunload = this.state.saving ? function () {
                return "It seems that your level has not been saved yet. Are you sure you want to exit?";
            } : null;
        }
        return null;
    }
}

export default connector(SaveManager);
