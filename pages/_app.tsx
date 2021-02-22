import React from "react";
import {AppProps} from "next/app";
import {FunctionComponent} from "react";
import "../styles/bootstrap.min.css";
import "../styles/globals.css";

const MyApp: FunctionComponent<AppProps> = ({Component, pageProps}) => (
    <React.Fragment>
        <script type="text/javascript" src="https://apis.google.com/js/platform.js" />
        {/*<script type="text/javascript" src="https://apis.google.com/js/api.js" />*/}
        <Component {...pageProps} />
    </React.Fragment>
);

export default MyApp;
