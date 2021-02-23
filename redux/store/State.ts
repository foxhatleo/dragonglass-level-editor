export type LevelData = {
    colors: string[];
    queues: number[][][];
};

declare type RootState = {
    loggedIn: boolean;
    fileId: string;
    level: LevelData;
    name: string;
    globalError: string;
    selected: number[][];
    lastStored: string;
    ready: boolean;
};
export default RootState;

const defaultState: RootState = {
    loggedIn: false,
    fileId: "",
    name: "",
    globalError: "",
    lastStored: "",
    ready: false,
    selected: [[0], [0], [0], [0], [0]],
    level: {
        colors: [
            "#F44E3B",
            "#FB9E00",
            "#68BC00",
            "#73D8FF",
        ],
        queues: [[], [], [], [], []],
    },
};
export {defaultState};
