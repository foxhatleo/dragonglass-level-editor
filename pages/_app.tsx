import React, {FunctionComponent} from "react";
import {AppProps} from "next/app";
import "../styles/bootstrap.min.css";

const MyApp: FunctionComponent<AppProps> = ({Component, pageProps}) => (
    <>
        <script type="text/javascript" src="https://apis.google.com/js/platform.js"/>
        <style jsx global>{`
          html,
          body {
            padding: 0;
            margin: 0;
            font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen,
            Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;
          }

          a {
            color: inherit;
            text-decoration: none;
          }

          * {
            box-sizing: border-box;
          }

          a, button, div, form, span {
            cursor: default !important;
            user-select: none;
          }
          
          a:not(.btn) {
            cursor: pointer !important;
          }
          
          a:not(.btn):hover, a:not(.btn):active {
            color: var(--primary);
          }

          p {
            margin-top: 1rem;
          }

          .navbar {
            padding-top: 0;
            padding-bottom: 0;
          }

          .dropdown-menu {
            padding: 0;
            border-radius: 0;
          }

          .dropdown-divider {
            margin: 0;
          }

          .dropdown-item {
            padding: .25rem 1.25em;
          }

          .modal-content {
            border-radius: 0;
          }

          .modal-header {
            padding: .25rem .5rem;
            background-color: var(--primary);
            border-radius: 0;
          }

          .modal-body {
            padding: .5rem;
          }

          .modal-footer {
            padding: .25rem;
          }

          .btn {
            padding: .1rem 1.25rem;
            border-radius: 0;
          }

          .form-control {
            padding: .125rem .25rem;
            border-radius: 0;
            background: black;
            color: white;
          }
          
          .form-control:focus {
            background: #191919;
            color: white;
          }

          .modal-title {
            font-size: 1rem;
            font-weight: 400;
          }
        `}</style>
        <Component {...pageProps} />
    </>
);
export default MyApp;
