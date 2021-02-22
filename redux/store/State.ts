export type LevelData = {
    colors: string[];
    queues: number[][][];
};

export type EditorState = {
    selected: number[][];
    lastStored: string;
    ready: boolean;
};

declare type RootState = {
    loggedIn: boolean;
    fileId: string;
    level: LevelData;
    name: string;
    editor: EditorState;
};
export default RootState;

const defaultState: RootState = {
    loggedIn: false,
    fileId: "",
    name: "",
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
        lastStored: "",
        ready: false,
        selected: [[0], [0], [0], [0], [0]],
    },
};
export {defaultState};
