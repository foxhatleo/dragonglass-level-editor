import React, {useEffect, useState} from "react";
import {Button, Modal} from "react-bootstrap";
import {connect, ConnectedProps} from "react-redux";
import State from "../redux/store/State";
import {bindActionCreators} from "redux";
import * as Dispatcher from "../redux/action/Dispatcher";
import ColorStrip from "./ColorStrip";

const connector = connect(
    (s: State) => ({queues: s.level.queues, colors: s.level.colors}),
    (d) => bindActionCreators(Dispatcher, d),
);

const Simulate: React.FunctionComponent<ConnectedProps<typeof connector> & { show: boolean; onClose: () => void; }> = (p) => {
    const [queues, setQueues] = useState<number[][][]>([[]]);
    const [currentColor, setCurrentColor] = useState<number>(0);
    const [actionCount, setActionCount] = useState<number>(0);
    const [lostClients, setLostClients] = useState<number>(0);
    const [mode, _setMode] = useState<number>(0);
    const [selected, setSelected] = useState<boolean[]>([]);
    const [startDrag, setStartDrag] = useState<number>(-1);
    const clearSelected = () => setSelected([...Array(p.queues.length)].map(_ => false));

    const setMode = (i: number) => {
        _setMode(i);
        clearSelected();
        setStartDrag(-1);
    }

    const reset = () => {
        setQueues(p.queues.map(a => a.map(b => b.map(c => c))));
        setCurrentColor(Math.floor(p.colors.length * Math.random()));
        setActionCount(0);
        setLostClients(0);
        _setMode(0);
        clearSelected();
        setStartDrag(-1);
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
        setQueues((queues) => {
            const t = queues.map(a => a.map(b => b.map(c => c)));
            if (i < 0 || i >= queues.length || t[i].length == 0) return t;
            const ind = t[i][0].indexOf(currentColor);
            if (ind < 0) {
                if (t[i][0].length == 0) return t;
                setLostClients((p) => p + 1);
                t[i].splice(0, 1);
                setQueues(t);
                return t;
            }
            t[i][0].splice(ind, 1);
            if (t[i][0].length < 1) {
                t[i].splice(0, 1);
            }
            return t;
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

    return (
        <Modal show={p.show} onHide={p.onClose} backdrop="static" dialogClassName="modal-bw">
            <Modal.Header closeButton><Modal.Title>Simulate playtesting</Modal.Title></Modal.Header>
            <Modal.Body>{queues.reduce((p, c) => p || (c.length > 0), false) ? <>
                <div className={"container-row"}>
                    {[...Array(queues.length)].map((_, i) => (
                        <div key={i}>
                            <div>
                                {queues[i].length <= 1 ? "<empty>" :
                                    <ColorStrip colors={queues[i][1].map(id => p.colors[id])}/>}
                            </div>
                        </div>
                    ))}
                </div>
                <div className={"container-row front pt-2"}>
                    {[...Array(queues.length)].map((_, i) => (
                        <div key={i}
                             className={(selected[i] ? "selected" : "") + (queues[i].length == 0 ? " empty" : "")}>
                            <div onClick={() => clickTile(i)} onMouseEnter={() => hover(i)} onMouseLeave={() => out(i)}>
                                {queues[i].length == 0 ? "<empty>" :
                                    <ColorStrip colors={queues[i][0].map(id => p.colors[id])}/>}
                            </div>
                        </div>
                    ))}
                </div>
                <div className={"pt-2"}>
                    Current paintbrush:
                    <span className={"pl-1"}><ColorStrip
                        colors={[p.colors.length > currentColor ? p.colors[currentColor] : p.colors[0]]}/></span>
                    <br/>Actions taken: {actionCount}
                    <br/>Clients lost due to incorrect actions: {lostClients}
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
                <br/>Actions taken: {actionCount}
                <br/>Clients lost due to incorrect actions: {lostClients}
                <div className={"mt-2"}><Button onClick={() => reset()}>Restart</Button></div>
            </>}</Modal.Body>
        </Modal>
    )
};
export default connector(Simulate);
