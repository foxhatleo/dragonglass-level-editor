declare type RootState = {
    loggedIn: boolean;
};
export default RootState;

const defaultState: RootState = {
    loggedIn: false,
};
export {defaultState};
