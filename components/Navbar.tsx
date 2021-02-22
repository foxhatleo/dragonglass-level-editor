import React, {useEffect, useState} from "react";
import {Button, Navbar as RBNavbar, NavbarBrand} from "react-bootstrap";
import {connect, ConnectedProps} from "react-redux";
import State from "../redux/store/State";
import {bindActionCreators} from "redux";
import * as Dispatcher from "../redux/action/Dispatcher";
import ColorStrip from "./ColorStrip";

const connector = connect(
    (s: State) => ({name: s.name, colorLength: s.level.colors.length, colors: s.level.colors,
        selected: s.editor.selected,
        queues: s.level.queues,
        anySelected: s.editor.selected.reduce((p, q) => (p || q.reduce((p, c) => p || (c > 0), false)), false)}),
    (d) => bindActionCreators(Dispatcher, d),
);
const Navbar: React.FunctionComponent<ConnectedProps<typeof connector>> = (p) => {
    const anySelected = p.anySelected;
    return (
        <RBNavbar variant={"dark"} bg={"dark"} fixed={"top"}>
            <NavbarBrand>{p.name}</NavbarBrand>
            <div>
                {!anySelected ? <>
                    <Button>Edit colors ({p.colorLength})</Button>
                    <Button disabled={true}>Simulate</Button>
                    <Button disabled={true}>Export</Button>
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
