import {Reducer} from "redux";
import State, {defaultState} from "../store/State";
import ActionType from "../action/ActionType";
import Action from "../action/Action";

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
    }
    return s;
};
export default RootReducer;
