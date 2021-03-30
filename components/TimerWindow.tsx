import React, {ChangeEvent, useEffect, useState} from "react";
import {Button, FormControl, Modal} from "react-bootstrap";
import {connect, ConnectedProps} from "react-redux";
import State, {TimerData} from "../redux/store/State";
import {bindActionCreators} from "redux";
import * as Dispatcher from "../redux/action/Dispatcher";
import {GLOBAL_TIMER} from "../config/GlobalTimer";

const connector = connect(
    (s: State) => ({timer: s.level.timer || {}}),
    (d) => bindActionCreators(Dispatcher, d),
);

type EditTimerData = {
    levelTime?: string;
    canvasBaseTime?: string;
    canvasPerColorTime?: string;
};

export const NO_TIMER_DATA: Required<EditTimerData> = {
    levelTime: "-1",
    canvasBaseTime: "-1",
    canvasPerColorTime: "-1"
};

function toEdit(t: TimerData): EditTimerData {
    if (!t) return {};
    const a: EditTimerData = {};
    if (typeof t.levelTime === "number")
        a.levelTime = t.levelTime.toString();
    if (typeof t.canvasBaseTime === "number")
        a.canvasBaseTime = t.canvasBaseTime.toString();
    if (typeof t.canvasPerColorTime === "number")
        a.canvasPerColorTime = t.canvasPerColorTime.toString();
    return a;
}

const pi = (n: string) => {
    const z = parseInt(n);
    if (isNaN(z)) return -1;
    return z;
}

const TimerWindow: React.FunctionComponent<ConnectedProps<typeof connector> & { onClose: () => void; show: boolean; }> = (p) => {
    const [timer, setTimer] = useState<Required<EditTimerData>>(NO_TIMER_DATA);
    useEffect(() => {
        setTimer({...NO_TIMER_DATA, ...toEdit(p.timer)});
    }, [p.show]);
    const ok = () => {
        p.setLevelTime(pi(timer.levelTime));
        p.setCanvasBaseTime(pi(timer.canvasBaseTime));
        p.setCanvasPerColorTime(pi(timer.canvasPerColorTime));
        p.onClose();
    };
    const setAttr = (attrName: keyof TimerData, e: ChangeEvent<HTMLInputElement>) => {
        const v = e.currentTarget.value as string;
        setTimer({...timer, [attrName]: v});
    }
    const cancel = p.onClose;
    return (
        <>
            <Modal backdrop="static" show={p.show} onHide={() => {
            }}>
                <Modal.Header><Modal.Title>Change timer</Modal.Title></Modal.Header>
                <Modal.Body>
                    <div className={"setting"}>
                        <strong>Level time</strong>
                        <FormControl onChange={(e: ChangeEvent<HTMLInputElement>) => setAttr("levelTime", e)}
                                     value={timer.levelTime}
                                     type={"number"}
                                     min={-1} max={600} step={1} />
                             This is the time allowed for the entire level.<br/>
                             -1 means using global default, which is set at {GLOBAL_TIMER.levelTime}.
                    </div>
                    <div className={"setting pt-2"}>
                        <strong>Canvas Base Time</strong>
                        <FormControl onChange={(e: ChangeEvent<HTMLInputElement>) => setAttr("canvasBaseTime", e)}
                                     value={timer.canvasBaseTime}
                                     type={"number"}
                                     min={-1} max={60} step={1} />
                            This is the base time for each canvas.<br/>
                            -1 means using global default, which is set at {GLOBAL_TIMER.canvasBaseTime}.
                    </div>
                    <div className={"setting pt-2"}>
                        <strong>Canvas Per Color Time</strong>
                        <FormControl onChange={(e: ChangeEvent<HTMLInputElement>) => setAttr("canvasPerColorTime", e)}
                                     value={timer.canvasPerColorTime}
                                     type={"number"}
                                     min={-1} max={60} step={1} />
                            This is the time for each color on a canvas, added to the base time.<br/>
                            -1 means using global default, which is set at {GLOBAL_TIMER.canvasPerColorTime}.
                    </div>
                    <style jsx>{`
                      .setting:not(:first-child) {
                        margin-top: 1rem;
                      }
                    `}</style>
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={cancel} variant="secondary">Cancel</Button>
                    <Button onClick={ok} variant="primary">OK</Button>
                </Modal.Footer>
            </Modal>
        </>
    )
};
export default connector(TimerWindow);
