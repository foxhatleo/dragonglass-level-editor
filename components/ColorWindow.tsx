import React, {useEffect, useState} from "react";
import {Button, Modal} from "react-bootstrap";
import {connect, ConnectedProps} from "react-redux";
import State from "../redux/store/State";
import {bindActionCreators} from "redux";
import * as Dispatcher from "../redux/action/Dispatcher";
import {CompactPicker} from "react-color";

const connector = connect(
    (s: State) => ({colors: s.level.colors}),
    (d) => bindActionCreators(Dispatcher, d),
);
const ColorWindow: React.FunctionComponent<ConnectedProps<typeof connector> & {onClose: () => void; show: boolean;}> = (p) => {
    const [colors, setColors] = useState<string[]>([]);
    useEffect(() => {
        setColors(p.colors);
    }, [p.show]);
    const ok = () => {
        p.setColors(colors);
        p.onClose();
    };
    const addNewColor = () => {setColors([...colors, "#ffffff"])};
    const removeColor = () => {
        const c = colors.concat();
        c.splice(c.length - 1, 1);
        setColors(c);
    };
    const cancel = p.onClose;
    return (
        <>
            <Modal show={p.show} onHide={() => {}}>
                <Modal.Header><Modal.Title>Change colors</Modal.Title></Modal.Header>
                <Modal.Body>
                    {
                        colors.map((c, i) => (
                            <div key={i} className={"color"}>
                                <strong>Color {i}</strong>
                                <div className={"mt-2"}><CompactPicker color={c} onChange={(c) => {
                                    const cs = colors.concat();
                                    cs[i] = c.hex;
                                    setColors(cs);
                                }} /></div>
                            </div>
                        ))
                    }
                    <div className={"color"}>
                        <Button disabled={colors.length >= 6} onClick={addNewColor}>Add a new color</Button>
                        <Button disabled={colors.length <= 1} onClick={removeColor}>Remove last color</Button>
                    </div>
                    <style jsx>{`
                      .color:not(:first-child) {
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
export default connector(ColorWindow);
