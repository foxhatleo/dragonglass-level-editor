import ActionType from "./ActionType";
import Action, {CellInd} from "./Action";

const updater = <T> (type: ActionType):
    ((value: T) => Action) => ((value: T) => ({type, value} as unknown as Action));

export const updateSignInStatus = updater<boolean>(ActionType.UPDATE_SIGN_IN_STATUS);
export const setFileId = updater<string>(ActionType.SET_FILE_ID);
export const ctrlClick = updater<CellInd>(ActionType.CTRL_CLICK);
export const shiftClick = updater<CellInd>(ActionType.SHIFT_CLICK);
export const singleClick = updater<CellInd>(ActionType.SINGLE_CLICK);
