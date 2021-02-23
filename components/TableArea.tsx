import React from "react";
import {connect, ConnectedProps} from "react-redux";
import State from "../redux/store/State";
import {bindActionCreators} from "redux";
import * as Dispatcher from "../redux/action/Dispatcher";
import {Alert, Button} from "react-bootstrap";
import ColorStrip from "./ColorStrip";

const connector = connect(
    (s: State) => ({colors: s.level.colors, queues: s.level.queues, editorSelected: s.editor.selected}),
    (d) => bindActionCreators(Dispatcher, d),
);

const _Cell: React.FunctionComponent<ConnectedProps<typeof connector> & {queueInd: number; customerInd: number;}> = (p) => {
    const queue = p.queues[p.queueInd];
    if (p.customerInd > queue.length) return null;
    let inner;
    if (p.customerInd < queue.length) {
        const colorInds = queue[p.customerInd];
        const colors = colorInds.map((c) => p.colors[c]);
        inner = <ColorStrip colors={colors} />;
    } else if (p.customerInd == queue.length) {
        inner = <>&lt;add&gt;</>
    }
    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation();
        if (e.shiftKey) {
            p.shiftClick([p.queueInd, p.customerInd]);
        } else if (e.ctrlKey) {
            p.ctrlClick([p.queueInd, p.customerInd]);
        } else {
            p.singleClick([p.queueInd, p.customerInd]);
        }
    };
    return (
        <>
            <div className={"area"} onClick={handleClick}>
                {inner}
                <style jsx>{`
                  .area {
                    user-select: none;
                    -moz-user-select: none;
                    -ms-user-select: none;
                    -webkit-user-select: none;
                    padding: 1rem .2rem;
                    color: ${p.editorSelected[p.queueInd][p.customerInd] ? "black" : "white"};
                    background: rgba(255, 255, 255, ${p.editorSelected[p.queueInd][p.customerInd] ? 1 : .2});
                  }
                  .area:hover, .area:active {
                    background: rgba(255, 255, 255, ${p.editorSelected[p.queueInd][p.customerInd] ? 1 : .35});
                  }
                `}</style>
            </div>
        </>
    )
}
const Cell = connector(_Cell);

const TableArea: React.FunctionComponent<ConnectedProps<typeof connector>> = (p) => {
    const clear = (e: React.MouseEvent<HTMLDivElement>) => {
        p.clearSelection();
    }
    return (
        <>
            <div className={"table-area"} onClick={clear}>
                <div>
                    {[...Array(p.queues.length)].map((_, i) => <div className={"cell"} key={i}>Q{i + 1}</div>)}
                    <div className={"cell pm"}>
                        {p.queues.length < 6 ? <Button onClick={p.addQueue}>+</Button> : ""}
                        {p.queues.length > 1 ? <Button onClick={p.removeQueue}>-</Button> : ""}
                    </div>
                </div>
                {[...Array(p.queues.reduce((u, c) => Math.max(u, c.length), 0) + 1)].map(
                    (_, i) => (
                        <div className={"content-row"} key={i}>
                            {[...Array(p.queues.length)].map((_, i2) => (
                                <div className={"cell"} key={i2}>
                                    <Cell queueInd={i2} customerInd={i} />
                                </div>
                            ))}
                        </div>
                    )
                )}
            </div>
            <Alert variant={"dark"} className={"mt-3"}>
                <strong>How to use:</strong>
                <ul>
                    <li>Hold Ctrl to select individual cells at the same time.</li>
                    <li>Hold Shift to select an area of cells.</li>
                    <li>Click anywhere else in the table area to clear selections.</li>
                </ul>
            </Alert>
            <style jsx>{`
              .table-area :global(.btn) {
                padding: .1rem .5rem;
              }
              .table-area {
                padding: 1rem;
                border-radius: 10px;
                background: black;
                border: 1px solid #666;
              }
              .cell {
                width: 120px;
                display: inline-block;
                padding: .1rem .2rem;
                text-align: center;
              }
              .cell.pm {
                width: auto;
              }
              .content-row .cell {
                padding: .3rem .1rem;
              }
            `}</style>
        </>
    );
};
export default connector(TableArea);
