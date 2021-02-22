import React from "react";
import {connect, ConnectedProps} from "react-redux";
import State from "../redux/store/State";
import {bindActionCreators} from "redux";
import * as Dispatcher from "../redux/action/Dispatcher";
import {Button} from "react-bootstrap";

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
        inner = (
            <ul>
                {colors.map((c, i) => (
                    <li key={i}>
                        <span className={"dot"} style={{background: c}} />
                    </li>
                ))}
                <style jsx>{`
                  ul, li {
                    display: block;
                    width: 100%;
                    text-align: center;
                  }
                  li, span {
                    display: inline-block;
                  }
                  span {
                    width: 15px;
                    height: 15px;
                    border-radius: 8px;
                  }
                  li:not(:first-child) {
                    margin-left: .5rem;
                  }
                `}</style>
            </ul>
        )
    } else if (p.customerInd == queue.length) {
        inner = <>&lt;add&gt;</>
    }
    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
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
                    background: rgba(255, 255, 255, ${p.editorSelected[p.queueInd][p.customerInd] ? .3 : .05});
                  }
                  .area:hover, .area:active {
                    background: rgba(255, 255, 255, ${p.editorSelected[p.queueInd][p.customerInd] ? .3 : .15});
                  }
                `}</style>
            </div>
        </>
    )
}
const Cell = connector(_Cell);

const TableArea: React.FunctionComponent<ConnectedProps<typeof connector>> = (p) => {
    return (
        <>
            Hold Ctrl to select individual cells at the same time.<br/>
            Hold Shift to select an area of cells.
            <div className={"table-area"}>
                <div className={"top-header"}><div className={"cell"}>Queues</div></div>
                <div>
                    {[...Array(p.queues.length)].map((_, i) => <div className={"cell"}>Q{i + 1}</div>)}
                    <div className={"cell"}>
                        <Button>+</Button><Button>-</Button>
                    </div>
                </div>
                {[...Array(p.queues.reduce((u, c) => Math.max(u, c.length), 0) + 1)].map(
                    (_, i) => (
                        <div className={"content-row"}>
                            {[...Array(p.queues.length)].map((_, i2) => (
                                <div className={"cell"}>
                                    <Cell queueInd={i2} customerInd={i} />
                                </div>
                            ))}
                        </div>
                    )
                )}
            </div>
            <style jsx>{`
              .table-area :global(.btn) {
                padding: .2rem;
              }
              .cell {
                width: 80px;
                display: inline-block;
                padding: .2rem;
                text-align: center;
              }
              .top-header .cell {
                width: ${(p.queues.length + 1) * 80}px;
              }
              .content-row .cell {
                padding: .3rem .1rem;
              }
            `}</style>
        </>
    );
};
export default connector(TableArea);
