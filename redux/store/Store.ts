import {createStore, Store as ReduxStore} from "redux";
import State from "./State";
import RootReducer from "../reducer/RootReducer";
import Action from "../action/Action";

const store: ReduxStore<State, Action> = createStore(RootReducer);
export default store;
