import {useRouter} from "next/router";
import App from "../../components/App";
import store from "../../redux/store/Store";
import {Provider} from "react-redux";
import React from "react";

const Create = () => {
    const router = useRouter();
    const {rid} = router.query;
    return (
        <Provider store={store}>
            <App createMode={true} id={rid as string}/>
        </Provider>
    );
}
export default Create;
