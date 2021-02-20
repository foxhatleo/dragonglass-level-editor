import React from "react";
import {AppProps} from "next/app";
import {FunctionComponent} from "react";
import "../styles/bootstrap.min.css";
import "../styles/globals.css";

const MyApp: FunctionComponent<AppProps> = ({Component, pageProps}) => (
    <React.Fragment>
        <script src="https://apis.google.com/js/platform.js" />
        <Component {...pageProps} />
    </React.Fragment>
);

export default MyApp;
