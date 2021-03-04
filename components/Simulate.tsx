import React, {useEffect, useState} from "react";
import {Button, Modal} from "react-bootstrap";
import {connect, ConnectedProps} from "react-redux";
import State, {TimerData} from "../redux/store/State";
import {bindActionCreators} from "redux";
import * as Dispatcher from "../redux/action/Dispatcher";
import ColorStrip from "./ColorStrip";
import {GLOBAL_TIMER} from "../config/GlobalTimer";

const connector = connect(
    (s: State) => ({timer: s.level.timer || {}, queues: s.level.queues, colors: s.level.colors}),
    (d) => bindActionCreators(Dispatcher, d),
);

const Simulate: React.FunctionComponent<ConnectedProps<typeof connector> & { show: boolean; onClose: () => void; }> = (p) => {
    const [queues, setQueues] = useState<number[][][]>([[]]);
    const [startTimes, setStartTimes] = useState<number[][]>([]);
    const [colors, setColors] = useState<string[]>(["#000000"]);
    const [currentColor, setCurrentColor] = useState<number>(0);
    const [actionCount, setActionCount] = useState<number>(0);
    const [lostClients, setLostClients] = useState<number>(0);
    const [satisfiedClients, setSatisfiedClients] = useState<number>(0);
    const [lostClientsP, setLostClientsP] = useState<number>(0);
    const [mode, _setMode] = useState<number>(0);
    const [selected, setSelected] = useState<boolean[]>([]);
    const [startDrag, setStartDrag] = useState<number>(-1);
    const [stage, setStage] = useState<number>(0);
    const clearSelected = () => setSelected([...Array(p.queues.length)].map(_ => false));
    const [secondsSoFar, setSecondsSoFar] = useState<number>(-3);
    const [interval, setInt] = useState<any | null>(null);
    const [timerData, setTimerData] = useState<Required<TimerData>>(GLOBAL_TIMER);
    const [leftTime, setLeftTime] = useState<number>(-1);

    const unfinished = queues.reduce((p, c) => p + ((c.length > 0) ? 1 : 0), 0);
    const done = unfinished == 0 || secondsSoFar >= timerData.levelTime;

    if (done && leftTime < 0) {
        setLeftTime(timerData.levelTime - secondsSoFar);
    }

    const setMode = (i: number) => {
        _setMode(i);
        clearSelected();
        setStartDrag(-1);
    }

    useEffect(() => {
        if (stage > 0 && !interval) {
            setInt(setInterval(() => updateCountdown(), 1000));
        } else if (interval) {
            clearInterval(interval);
            setInt(null);
            setSecondsSoFar(-3);
        }
        return () => {
            if (interval) clearInterval(interval);
            setInt(null);
        };
    }, [stage]);

    const updateCountdown = () => {
        setSecondsSoFar(i => i + 1);
    };

    const calcAllowedTime = (i: number, q = queues, td = timerData) => {
        return q[i].length == 0 || q[i][0].length == 0 ? 0 : (td.canvasBaseTime + td.canvasPerColorTime * q[i][0].length);
    };

    if (stage > 0 && !done) {
        let cq: number[][][] = queues;
        for (let i = 0; i < queues.length; i++) {
            if (queues[i].length <= 0) break;
            const elapsedTime = secondsSoFar - startTimes[i][1];
            if (elapsedTime >= startTimes[i][0]) {
                setLostClientsP(i => i + 1);
                setQueues(q => {
                    const t = q.map(a => a.map(b => b.map(c => c)));
                    cq = t;
                    t[i].splice(0, 1);
                    return t;
                })
                setStartTimes(st => {
                    const nst = st.map(a => a.map(b => b));
                    nst[i][0] = calcAllowedTime(i, cq);
                    nst[i][1] = secondsSoFar;
                    return nst;
                });
            }
        }
    }

    const reset = () => {
        const td = {...GLOBAL_TIMER, ...p.timer};
        setQueues(p.queues.map(a => a.map(b => b.map(c => c))));
        setCurrentColor(Math.floor(p.colors.length * Math.random()));
        setStartTimes([...Array(p.queues.length)].map((_, i) => [calcAllowedTime(i, p.queues, td), 0]));
        setActionCount(0);
        setLostClients(0);
        setLostClientsP(0);
        setSatisfiedClients(0);
        setColors(p.colors);
        _setMode(0);
        clearSelected();
        setStartDrag(-1);
        setStage(0);
        setSecondsSoFar(-3);
        setTimerData(td);
        setLeftTime(-1);
    };

    useEffect(() => {
        reset();
    }, [p.show]);

    const hover = (i: number) => {
        if (mode == 2) {
            setSelected((selected) => {
                const s = selected.concat();
                s[i] = true;
                if (i == s.length - 1 && i - 1 >= 0) s[i - 1] = true;
                else if (i + 1 < s.length) s[i + 1] = true;
                return s;
            });
        } else if (mode == 3 && startDrag >= 0) {
            const a = Math.min(i, startDrag);
            const b = Math.max(i, startDrag);
            const s = [...Array(p.queues.length)].map(_ => false);
            for (let i = a; i <= b; i++) {
                s[i] = true;
            }
            setSelected(s);
        }
    };
    const out = (_: number) => {
        if (mode == 2) clearSelected();
    };
    const baseClick = (i: number) => {
        let removingFromQueue = false;
        let q: number[][][];
        setQueues((queues) => {
            const t = queues.map(a => a.map(b => b.map(c => c)));
            if (i < 0 || i >= queues.length || t[i].length == 0) return t;
            const ind = t[i][0].indexOf(currentColor);
            if (ind < 0) {
                if (t[i][0].length == 0) return t;
                setLostClients((p) => p + 1);
                t[i].splice(0, 1);
                removingFromQueue = true;
                q = t;
                return t;
            }
            t[i][0].splice(ind, 1);
            if (t[i][0].length < 1) {
                removingFromQueue = true;
                t[i].splice(0, 1);
                setSatisfiedClients(i => i + 1)
            }
            q = t;
            return t;
        });
        if (removingFromQueue) setStartTimes((s) => {
           const ns = [...s];
           if (queues[i].length <= 0)  return ns;
           ns[i][0] = calcAllowedTime(i, q);
           ns[i][1] = secondsSoFar;
           return ns;
        });
    };
    const clickTile = (i: number) => {
        switch (mode) {
            case 1: {
                setActionCount(a => a + 1);
                baseClick(i);
                break;
            }
            case 2: {
                setActionCount(a => a + 1);
                baseClick(i);
                baseClick(i >= queues.length - 1 ? i - 1 : i + 1);
                break;
            }
            case 3: {
                if (startDrag < 0) {
                    setStartDrag(i);
                    setSelected((selected) => {
                        const s = selected.concat();
                        s[i] = true;
                        return s;
                    });
                } else if (startDrag == i) {
                    setStartDrag(-1);
                    clearSelected();
                } else {
                    setActionCount(a => a + 1);
                    const a = Math.min(i, startDrag);
                    const b = Math.max(i, startDrag);
                    for (let i = a; i <= b; i++) {
                        baseClick(i);
                    }
                    setStartDrag(-1);
                    clearSelected();
                }
                break;
            }
        }
    };

    let helpText = "";
    switch (mode) {
        case 0: {
            helpText = "Choose an action to begin.";
            break;
        }
        case 1: {
            helpText = "To scribble, click on any single item.";
            break;
        }
        case 2: {
            helpText = "To flick, click on an item. The one next to it will also be painted."
            break;
        }
        case 3: {
            if (startDrag < 0) {
                helpText = "To drag, start by clicking an beginning item.";
            } else {
                helpText = "Now, click on the ending item. The area to be painted will be highlighted automatically.";
            }
            break;
        }
    }

    return (
        <Modal show={p.show} onHide={p.onClose} backdrop="static" dialogClassName="modal-bw">
            <Modal.Header closeButton><Modal.Title>Simulate playtesting</Modal.Title></Modal.Header>
            <Modal.Body>
                {stage == 0 ? <div className={"starting"}>
                        <Button variant={mode == 1 ? "primary" : "secondary"}
                                onClick={() => setStage(1)}>Start</Button>
                    <style jsx>{`
                        .starting {
                          text-align: center;
                        }
                    `}</style>
                    </div>
                    : secondsSoFar < 0 ? <div className={"sec"}>
                        {-secondsSoFar}
                        <style jsx>{`
                          .sec {
                            text-align: center;
                            font-size: 3em;
                          }
                        `}</style>
                    </div> : ((!done ? <>
                        <div>Level Time left: {timerData.levelTime - secondsSoFar}</div>
                <div className={"container-row"}>
                    {[...Array(queues.length)].map((_, i) => (
                        <div key={i}>
                            <div>
                                {queues[i].length <= 1 ? "<empty>" :
                                    <ColorStrip colors={queues[i][1].map(id => colors[id])}/>}
                            </div>
                        </div>
                    ))}
                </div>
                <div className={"container-row front pt-2"}>
                    {[...Array(queues.length)].map((_, i) => (
                        <div key={i}
                             className={(selected[i] ? "selected" : "") + (queues[i].length == 0 ? " empty" : "")}>
                            <div onClick={() => clickTile(i)} onMouseEnter={() => hover(i)} onMouseLeave={() => out(i)}>
                                {queues[i].length == 0 ? <>&lt;empty&gt;<br/>0</> :
                                    <><ColorStrip colors={queues[i][0].map(id => colors[id])}/>
                                    <br/>{startTimes[i][0] - (secondsSoFar - startTimes[i][1])}</>}
                            </div>
                        </div>
                    ))}
                </div>
                <div className={"pt-2"}>
                    Current paintbrush:
                    <span className={"pl-1"}><ColorStrip
                        colors={[colors.length > currentColor ? colors[currentColor] : colors[0]]}/></span>
                    <br/>Actions taken: {actionCount}
                    <br/>Clients satisfied: {satisfiedClients}
                    <br/>Clients lost due to incorrect actions: {lostClients}
                    <br/>Clients lost due to impatience: {lostClientsP}
                    <p>{helpText}</p>
                    <p>
                        <Button variant={mode == 1 ? "primary" : "secondary"}
                                onClick={() => setMode(1)}>Scribble</Button>
                        <Button variant={mode == 2 ? "primary" : "secondary"} onClick={() => setMode(2)}>Flick</Button>
                        <Button variant={mode == 3 ? "primary" : "secondary"} onClick={() => setMode(3)}>Drag</Button>
                        {p.colors.map((c, i) => <Button variant="secondary" key={i} onClick={() => {
                            setActionCount(a => a + 1);
                            setCurrentColor(i)
                        }}><ColorStrip colors={[c]}/></Button>)}
                    </p>
                </div>
                <style jsx>{`
                  :global(.modal-bw) {
                    width: 90%;
                    max-width: 800px !important;
                  }

                  .container-row {
                    width: 100%;
                    display: flex;
                  }

                  .container-row > div {
                    flex-grow: 1;
                    flex-shrink: 1;
                    flex-basis: 0;
                    padding: .1rem;
                  }

                  .container-row > div > div {
                    padding: 1rem;
                  }

                  .front > div > div {
                    background: rgba(255, 255, 255, .1);
                  }

                  .front > div.empty {
                    pointer-events: none;
                  }

                  .front > div:not(.empty) > div:hover, .front > div.selected:not(.empty) > div {
                    background: var(--primary);
                  }

                  div {
                    text-align: center;
                  }
                `}</style>
            </> : <>
                <strong>Finished.</strong>
                <br/>Level time remaining when finishing: {leftTime}
                <br/>Actions taken: {actionCount}
                <br/>Clients satisfied: {satisfiedClients}
                <br/>Clients lost due to incorrect actions: {lostClients}
                <br/>Clients lost due to impatience: {lostClientsP}
                <br/>Clients unfinished because level time ran out: {unfinished}
                <div className={"mt-2"}><Button onClick={() => reset()}>Restart</Button></div>
            </>))}
            </Modal.Body>
        </Modal>
    )
};
export default connector(Simulate);
