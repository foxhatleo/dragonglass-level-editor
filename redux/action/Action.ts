import ActionType from "./ActionType";
import {Action as ReduxAction} from "redux";

interface PureAction<T extends ActionType> extends ReduxAction<T> {}
interface SetterAction<T extends ActionType, S> extends PureAction<T> {
    value: S;
}

export type CellInd = [number, number];

declare type Action =
    PureAction<ActionType.CLEAR_SELECTION> |
    PureAction<ActionType.MARK_READY> |
    PureAction<ActionType.ADD_QUEUE> |
    PureAction<ActionType.REMOVE_QUEUE> |
    SetterAction<ActionType.MARK_SAVED, string> |
    SetterAction<ActionType.SET_COLORS, string[]> |
    SetterAction<ActionType.FAIL, [string, any]> |
    SetterAction<ActionType.PAINT, number> |
    SetterAction<ActionType.ERASE, number> |
    SetterAction<ActionType.UPDATE_SIGN_IN_STATUS, boolean> |
    SetterAction<ActionType.SET_NAME, string> |
    SetterAction<ActionType.PARSE_DATA, string> |
    SetterAction<ActionType.CTRL_CLICK, CellInd> |
    SetterAction<ActionType.SHIFT_CLICK, CellInd> |
    SetterAction<ActionType.SINGLE_CLICK, CellInd> |
    SetterAction<ActionType.SET_FILE_ID, string>;
export default Action;
