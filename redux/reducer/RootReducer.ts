import {Reducer} from "redux";
import State, {defaultState} from "../store/State";
import ActionType from "../action/ActionType";
import Action from "../action/Action";

const RootReducer: Reducer<State, Action> = (s = defaultState, a) => {
    switch (a.type) {
        case ActionType.UPDATE_SIGN_IN_STATUS: {
            return {...s, loggedIn: a.value};
        }
    }
    if (!(typeof (a.type as unknown) === "string" && (a.type as string).startsWith("@@redux")))
        console.warn(`Missed action: ${a.type}`);
    return s;
};
export default RootReducer;
