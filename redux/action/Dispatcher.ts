import ActionType from "./ActionType";
import Action from "./Action";

const updater = <T> (type: ActionType):
    ((value: T) => Action) => ((value: T) => ({type, value} as unknown as Action));

export const updateSignInStatus = updater<boolean>(ActionType.UPDATE_SIGN_IN_STATUS);
