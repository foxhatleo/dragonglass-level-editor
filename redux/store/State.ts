export type LevelData = {
    colors: string[];
    queues: number[][][];
};

export type EditorState = {
    selected: number[][];
};

declare type RootState = {
    loggedIn: boolean;
    fileId: string;
    level: LevelData;
    editor: EditorState;
};
export default RootState;

const defaultState: RootState = {
    loggedIn: false,
    fileId: "",
    level: {
        colors: [
            "#ff0000",
            "#ffff00",
            "#00ff00",
            "#00ffff",
        ],
        queues: [[], [], [], [], []],
    },
    editor: {
        selected: [[false], [false], [false], [false], [false]],
    },
};
export {defaultState};
