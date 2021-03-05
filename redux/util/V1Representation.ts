import {LevelData} from "../store/State";
import prettyStringify from "json-stringify-pretty-compact";

export function hexToRgb(hex: string): [number, number, number] {
    let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16),
    ] : [255, 255, 255];
}

export function parse(a: string): LevelData | null {
    const o = JSON.parse(a.replaceAll(/;.*\n/g, "").trim());
    if (o.version != 1) return null;
    const cl = o["colors"];
    if (cl.length > 0 && typeof cl[0] === "string") {
        for (let i = 0, j = cl.length; i < j; i++) {
            cl[i] = hexToRgb(cl[i]);
        }
    }
    return {colors: cl, queues: o["queues"]};
}

const pretext =
    "; ==============================================================================\n" +
    "; This file is to be opened by Panic Painter Level Editor.\n" +
    ";\n" +
    "; To install, go to:\n" +
    ";     https://workspace.google.com/marketplace/app/appname/656662885342\n" +
    "; Access limited to individuals affiliated with Cornell University.\n" +
    "; ==============================================================================\n" +
    "\n\n\n";

export function stringify(o: LevelData, forExport: boolean = false): string {
    if (!forExport) {
        return pretext + JSON.stringify({...o, version: 1});
    } else {
        return prettyStringify({...o, version: 1});
    }
}