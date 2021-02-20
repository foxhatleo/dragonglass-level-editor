import React, {FunctionComponent} from "react";
import App from "../components/App";
import {Provider} from "react-redux";
import store from "../redux/store/Store";

const Home: FunctionComponent = () => (
    <Provider store={store}>
        <App />
    </Provider>
);

export default Home;
