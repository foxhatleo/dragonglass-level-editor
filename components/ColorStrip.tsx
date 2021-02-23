import React from "react";

const ColorStrip: React.FunctionComponent<{ colors: string[]; }> = (p) => (
    <ul>
        {p.colors.map((c, i) => (
            <li key={i}>
                <span style={{background: c}}/>
            </li>
        ))}
        <style jsx>{`
          ul, li, span {
            margin: 0;
            padding: 0;
            display: inline-block;
          }

          span {
            width: 15px;
            height: 15px;
          }

          li:not(:first-child) {
            margin-left: .2rem;
          }
        `}</style>
    </ul>
);
export default ColorStrip;
