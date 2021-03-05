import React from "react";

const ColorStrip: React.FunctionComponent<{ colors: [number, number, number][]; }> = (p) => (
    <ul>
        {p.colors.map((c, i) => (
            <li key={i}>
                <span style={{background: `rgb(${c[0]},${c[1]},${c[2]})`}}/>
            </li>
        ))}
        <style jsx>{`
          ul, li, span {
            margin: 0;
            padding: 0;
            display: inline-block;
          }

          span {
            width: 18px;
            height: 18px;
            border: 1px solid white;
          }

          li:not(:first-child) {
            margin-left: .2rem;
          }
        `}</style>
    </ul>
);
export default ColorStrip;
