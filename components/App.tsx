import React from "react";
import Navigation from "./Navigation";
import AuthWindow from "./AuthWindow";

const App: React.FunctionComponent = () => {
    return (
        <React.Fragment>
            <Navigation onAuthorize={() => {}} />
            <AuthWindow />
        </React.Fragment>
    );
};

export default App;
