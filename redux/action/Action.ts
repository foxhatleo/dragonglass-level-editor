import ActionType from "./ActionType";
import {Action as ReduxAction} from "redux";

interface PureAction<T extends ActionType> extends ReduxAction<T> {}
interface SetterAction<T extends ActionType, S> extends PureAction<T> {
    value: S;
}

export type CellInd = [number, number];;

declare type Action =
    SetterAction<ActionType.UPDATE_SIGN_IN_STATUS, boolean> |
    SetterAction<ActionType.CTRL_CLICK, CellInd> |
    SetterAction<ActionType.SHIFT_CLICK, CellInd> |
    SetterAction<ActionType.SINGLE_CLICK, CellInd> |
    SetterAction<ActionType.SET_FILE_ID, string>;
export default Action;
