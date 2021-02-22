import {Reducer} from "redux";
import State, {defaultState} from "../store/State";
import ActionType from "../action/ActionType";
import Action from "../action/Action";
import * as V1Representation from "../util/V1Representation";

function lastClicked(s: number[][]): [[number, number], number] {
    let biggest = 0, qI = 0, cI = 0;
    for (let i = 0; i < s.length; i++) {
        const q = s[i];
        for (let j = 0; j < q.length; j++) {
            if (q[j] > biggest) {
                biggest = q[j];
                qI = i;
                cI = j;
            }
        }
    }
    return [[qI, cI], biggest];
}

const RootReducer: Reducer<State, Action> = (s = defaultState, a) => {
    switch (a.type) {
        case ActionType.UPDATE_SIGN_IN_STATUS: {
            return {...s, loggedIn: a.value};
        }
        case ActionType.SET_FILE_ID: {
            return {...s, fileId: a.value};
        }
        case ActionType.SINGLE_CLICK: {
            const newSelected = s.editor.selected.map(i => (i.map(_ => 0)));
            newSelected[a.value[0]][a.value[1]] = 1;
            return {...s, editor: {...s.editor, selected: newSelected}};
        }
        case ActionType.CTRL_CLICK: {
            const newSelected = s.editor.selected.map(i => (i.map(o => o)));
            if (newSelected[a.value[0]][a.value[1]] > 0)
                newSelected[a.value[0]][a.value[1]] = 0;
            else
                newSelected[a.value[0]][a.value[1]] = lastClicked(newSelected)[1] + 1;
            return {...s, editor: {...s.editor, selected: newSelected}};
        }
        case ActionType.SHIFT_CLICK: {
            const newSelected = s.editor.selected.map(i => (i.map(o => o)));
            const lc = lastClicked(newSelected);
            if (lc[1] == 0) {
                newSelected[a.value[0]][a.value[1]] = 1;
            } else {
                const qIdLow = Math.min(a.value[0], lc[0][0]);
                const qIdHigh = Math.max(a.value[0], lc[0][0]);
                const cIdLow = Math.min(a.value[1], lc[0][1]);
                const cIdHigh = Math.max(a.value[1], lc[0][1]);
                for (let i = qIdLow; i <= qIdHigh; i++) {
                    const q = newSelected[i];
                    for (let j = cIdLow; j <= cIdHigh; j++) {
                        if (i == a.value[0] && j == a.value[1]) {
                            q[j] = lc[1] + 2;
                        }
                        if (j >= q.length || q[j] > 0) {
                            continue;
                        }
                        q[j] = lc[1] + 1;
                    }
                }
            }
            return {...s, editor: {...s.editor, selected: newSelected}};
        }
        case ActionType.SET_NAME: {
            return {...s, name: a.value};
        }
        case ActionType.PARSE_DATA: {
            if (a.value.trim() == "") {
                return {...s};
            }
            const parsedJson = JSON.parse(a.value);
            let l;
            switch (parsedJson["version"]) {
                case 1: {
                    l = V1Representation.parse(parsedJson);
                    break;
                }
                default: {
                    throw new Error("Not a supported version.");
                }
            }
            const sel = [];
            for (let q = 0; q < l.queues.length; q++) {
                const qsel = [];
                const qc = l.queues[q].length;
                for (let c = 0; c < qc + 1; c++) {
                    qsel.push(0);
                }
                sel.push(qsel);
            }
            let e = {selected: sel};
            return {...s, level: l, editor: e};
        }
        case ActionType.CLEAR_SELECTION: {
            const newSelected = s.editor.selected.map(i => (i.map(_ => 0)));
            return {...s, editor: {...s.editor, selected: newSelected}};
        }
        case ActionType.PAINT: {
            const queues = s.level.queues.map(a => a.map(b => b.map(c => c)));
            const selected = s.editor.selected.map(a => a.map(b => b));
            for (let qi = 0; qi < s.editor.selected.length; qi++) {
                const q = s.editor.selected[qi];
                for (let ci = 0; ci < q.length; ci++) {
                    if (q[ci] < 1) continue;
                    if (ci == s.level.queues[qi].length) {
                        queues[qi].push([a.value]);
                        selected[qi].push(0);
                    } else if (!queues[qi][ci].includes(a.value)) {
                        queues[qi][ci].push(a.value);
                        queues[qi][ci].sort();
                    }
                }
            }
            return {...s, level: {...s.level, queues}, editor: {...s.editor, selected}};
        }
        case ActionType.ERASE: {
            const queues = s.level.queues.map(a => a.map(b => b.map(c => c)));
            const selected = s.editor.selected.map(a => a.map(b => b));
            for (let qi = 0; qi < selected.length; qi++) {
                const q = selected[qi];
                for (let ci = 0; ci < q.length; ci++) {
                    if (q[ci] < 1) continue;
                    queues[qi][ci].splice(queues[qi][ci].indexOf(a.value), 1);
                    if (queues[qi][ci].length == 0) {
                        queues[qi].splice(ci, 1);
                        q.splice(ci, 1);
                        ci--;
                    }
                }
            }
            return {...s, level: {...s.level, queues}, editor: {...s.editor, selected}};
        }
    }
    return s;
};
export default RootReducer;
