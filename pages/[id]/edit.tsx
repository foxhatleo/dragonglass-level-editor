import {useRouter} from "next/router";
import App from "../../components/App";
import {Provider} from "react-redux";
import store from "../../redux/store/Store";
import React from "react";

const Edit = () => {
    const router = useRouter();
    const {id} = router.query;
    return (
        <Provider store={store}>
            <App createMode={false} id={id as string}/>
        </Provider>
    );
}
export default Edit;
