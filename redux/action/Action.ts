import ActionType from "./ActionType";
import {Action as ReduxAction} from "redux";

interface PureAction<T extends ActionType> extends ReduxAction<T> {}
interface SetterAction<T extends ActionType, S> extends PureAction<T> {
    value: S;
}

declare type Action =
    SetterAction<ActionType.UPDATE_SIGN_IN_STATUS, boolean>;
export default Action;
