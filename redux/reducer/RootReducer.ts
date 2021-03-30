import {Reducer} from "redux";
import State, {defaultState} from "../store/State";
import ActionType from "../action/ActionType";
import Action from "../action/Action";
import * as V1Representation from "../util/V1Representation";
import * as Config from "../../config/Google";

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
            if (!a.value) return {...s, loggedIn: false};
            const grantedScopes = gapi.auth2.getAuthInstance().currentUser.get().getGrantedScopes().split(" ");
            let missingScope = false;
            for (let s of Config.SCOPES) {
                if (grantedScopes.indexOf(s) < 0) {
                    missingScope = true;
                    break;
                }
            }
            return {...s, loggedIn: !missingScope};
        }
        case ActionType.SET_FILE_ID: {
            return {...s, fileId: a.value};
        }
        case ActionType.SINGLE_CLICK: {
            const newSelected = s.selected.map(i => (i.map(_ => 0)));
            newSelected[a.value[0]][a.value[1]] = 1;
            return {...s, selected: newSelected};
        }
        case ActionType.CTRL_CLICK: {
            const newSelected = s.selected.map(i => (i.map(o => o)));
            if (newSelected[a.value[0]][a.value[1]] > 0)
                newSelected[a.value[0]][a.value[1]] = 0;
            else
                newSelected[a.value[0]][a.value[1]] = lastClicked(newSelected)[1] + 1;
            return {...s, selected: newSelected};
        }
        case ActionType.SHIFT_CLICK: {
            const newSelected = s.selected.map(i => (i.map(o => o)));
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
            return {...s, selected: newSelected};
        }
        case ActionType.SET_NAME: {
            return {...s, name: a.value};
        }
        case ActionType.PARSE_DATA: {
            if (s.lastStored != V1Representation.stringify(s.level)) {
                console.warn("Refused to parse data. Last stored does not match level.");
                return s;
            }
            let l;
            if (a.value.trim() == "") {
                l = JSON.parse(JSON.stringify(defaultState.level));
            } else {
                l = V1Representation.parse(a.value);
            }
            const sel = [];
            for (let q = 0; q < l.queues.length; q++) {
                const qsel = [];
                const qc = l.queues[q].length;
                for (let c = 0; c < qc + 1; c++) {
                    qsel.push(q < s.level.queues.length ? (c < s.level.queues[q].length + 1 ? s.selected[q][c] : 0) : 0);
                }
                sel.push(qsel);
            }
            let e = {selected: sel, ready: true, lastStored: V1Representation.stringify(l)};
            return {...s, level: l, ...e};
        }
        case ActionType.CLEAR_SELECTION: {
            const newSelected = s.selected.map(i => (i.map(_ => 0)));
            return {...s, selected: newSelected};
        }
        case ActionType.PAINT: {
            const queues = s.level.queues.map(a => a.map(b => b.map(c => c)));
            const selected = s.selected.map(a => a.map(b => b));
            for (let qi = 0; qi < s.selected.length; qi++) {
                const q = s.selected[qi];
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
            return {...s, level: {...s.level, queues}, selected};
        }
        case ActionType.ERASE: {
            const queues = s.level.queues.map(a => a.map(b => b.map(c => c)));
            const selected = s.selected.map(a => a.map(b => b));
            for (let qi = 0; qi < selected.length; qi++) {
                const q = selected[qi];
                for (let ci = 0; ci < q.length - 1; ci++) {
                    if (q[ci] < 1) continue;
                    const ind = queues[qi][ci].indexOf(a.value);
                    if (ind < 0) continue;
                    queues[qi][ci].splice(ind, 1);
                    if (queues[qi][ci].length == 0) {
                        queues[qi].splice(ci, 1);
                        q.splice(ci, 1);
                        ci--;
                    }
                }
            }
            return {...s, level: {...s.level, queues}, selected};
        }
        case ActionType.ADD_QUEUE: {
            return {
                ...s,
                level: {...s.level, queues: [...s.level.queues, []]},
                selected: [...s.selected, [0]]
            };
        }
        case ActionType.REMOVE_QUEUE: {
            const queues = s.level.queues;
            queues.splice(queues.length - 1, 1);
            const selected = s.selected;
            selected.splice(selected.length - 1, 1);
            return {...s, level: {...s.level, queues}, selected};
        }
        case ActionType.MARK_READY: {
            return {...s, ready: true};
        }
        case ActionType.MARK_SAVED: {
            return {...s, lastStored: a.value}
        }
        case ActionType.SET_COLORS: {
            const st = {...s, level: {...s.level, colors: a.value}};
            if (st.level.colors.length >= s.level.colors.length) return st;
            const newSelected = st.selected.map(i => (i.map(_ => 1)));
            let temp_st = {...st, selected: newSelected};
            for (let i = s.level.colors.length - 1; i > st.level.colors.length - 1; i--) {
                temp_st = RootReducer(temp_st, {type: ActionType.ERASE, value: i});
            }
            return RootReducer(temp_st, {type: ActionType.CLEAR_SELECTION});
        }
        case ActionType.FAIL: {
            let body = null;
            let stack = null;
            let details = null;
            if (typeof a.value[1] !== "undefined") {
                if (a.value[1].body) {
                    body = a.value[1].body.toString();
                    try {
                        body = JSON.parse(body);
                    } catch (e) {
                    }
                }
                if (a.value[1].stack) {
                    stack = a.value[1].stack.toString();
                }
                if (a.value[1].details) {
                    stack = a.value[1].details.toString();
                }
            }
            return {
                ...s, globalError: JSON.stringify({
                    reporter: a.value[0],
                    state: s,
                    error: {
                        toString: typeof a.value[1] !== "undefined" ? a.value[1].toString() : null,
                        stack,
                        body,
                        details
                    }
                })
            };
        }
        case ActionType.SET_LEVEL_TIME: {
            const tObj = s.level["timer"] || {};
            if (a.value >= 0) {
                tObj.levelTime = a.value;
            } else {
                delete tObj["levelTime"];
            }
            return {...s, level: {...s.level, timer: tObj}};
        }
        case ActionType.SET_CANVAS_BASE_TIME: {
            const tObj = s.level["timer"] || {};
            if (a.value >= 0) {
                tObj.canvasBaseTime = a.value;
            } else {
                delete tObj["canvasBaseTime"];
            }
            return {...s, level: {...s.level, timer: tObj}};
        }
        case ActionType.SET_CANVAS_PER_COLOR_TIME: {
            const tObj = s.level["timer"] || {};
            if (a.value >= 0) {
                tObj.canvasPerColorTime = a.value;
            } else {
                delete tObj["canvasPerColorTime"];
            }
            return {...s, level: {...s.level, timer: tObj}};
        }
    }
    return s;
};
export default RootReducer;
