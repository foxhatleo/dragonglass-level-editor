import ActionType from "./ActionType";
import Action, {CellInd} from "./Action";

const marker = <T> (type: ActionType): (() => Action) => (() => ({type} as unknown as Action));
const updater = <T> (type: ActionType):
    ((value: T) => Action) => ((value: T) => ({type, value} as unknown as Action));

export const clearSelection = marker(ActionType.CLEAR_SELECTION);
export const updateSignInStatus = updater<boolean>(ActionType.UPDATE_SIGN_IN_STATUS);
export const paint = updater<number>(ActionType.PAINT);
export const erase = updater<number>(ActionType.ERASE);
export const setFileId = updater<string>(ActionType.SET_FILE_ID);
export const setName = updater<string>(ActionType.SET_NAME);
export const ctrlClick = updater<CellInd>(ActionType.CTRL_CLICK);
export const shiftClick = updater<CellInd>(ActionType.SHIFT_CLICK);
export const singleClick = updater<CellInd>(ActionType.SINGLE_CLICK);
export const parseData = updater<string>(ActionType.PARSE_DATA);
