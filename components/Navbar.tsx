import React from "react";
import {Button, Navbar as RBNavbar, NavbarBrand} from "react-bootstrap";
import {connect, ConnectedProps} from "react-redux";
import State from "../redux/store/State";
import {bindActionCreators} from "redux";
import * as Dispatcher from "../redux/action/Dispatcher";
import ColorStrip from "./ColorStrip";
import * as V1Representation from "../redux/util/V1Representation";

const connector = connect(
    (s: State) => ({
        name: s.name, colorLength: s.level.colors.length, colors: s.level.colors,
        selected: s.editor.selected,
        queues: s.level.queues,
        level: s.level,
        saved: s.editor.lastStored,
        anySelected: s.editor.selected.reduce((p, q) => (p || q.reduce((p, c) => p || (c > 0), false)), false)
    }),
    (d) => bindActionCreators(Dispatcher, d),
);
const Navbar: React.FunctionComponent<ConnectedProps<typeof connector> & { onColor: () => void; onSimulate: () => void; }> = (p) => {
    const anySelected = p.anySelected;
    const exportJSON = () => {
        const blob = new Blob([V1Representation.stringify(p.level, true)], {type: "application/json"});
        const a = p.name.split(".").concat();
        a.splice(a.length - 1, 1);
        const filename = a.join(".") + ".json";
        if (typeof window.navigator.msSaveOrOpenBlob != "undefined") {
            window.navigator.msSaveBlob(blob, filename);
        } else {
            const elem = window.document.createElement('a');
            elem.href = window.URL.createObjectURL(blob);
            elem.download = filename;
            document.body.appendChild(elem);
            elem.click();
            document.body.removeChild(elem);
        }
    };
    return (
        <RBNavbar variant={"dark"} bg={"dark"} fixed={"top"} className={"justify-content-between"}>
            <div>
                <NavbarBrand>{p.name}</NavbarBrand>
                {!anySelected ? <>
                    <Button onClick={p.onColor}>Edit colors ({p.colorLength})</Button>
                    <Button onClick={p.onSimulate}>Simulate</Button>
                    <Button onClick={exportJSON}>Export</Button>
                </> : <>
                    {p.colors.map((c, i) => {
                        const allSelected = p.selected.reduce((pr, q, qi) => (pr && q.reduce((pr, c, ci) => {
                            return pr && (c ? (ci == p.queues[qi].length ? false : p.queues[qi][ci].includes(i)) : true);
                        }, true)), true);
                        const handler = () => {
                            if (allSelected) p.erase(i);
                            else p.paint(i);
                        };
                        return <Button key={i} onClick={handler} variant={allSelected ? "primary" : "secondary"}>
                            <ColorStrip colors={[c]}/>
                        </Button>;
                    })}
                </>}
            </div>
            <div>
                {p.saved != V1Representation.stringify(p.level) ? "Saving..." : "Saved."}
            </div>
            <style jsx>{`
              div :global(.btn) {
                padding: .1rem .3rem;
                margin-left: .5rem;
              }
            `}</style>
        </RBNavbar>
    );
};
export default connector(Navbar);
