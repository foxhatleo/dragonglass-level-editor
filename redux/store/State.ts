import * as V1Representation from "../util/V1Representation";

export type TimerData = {
    levelTime?: number;
    canvasBaseTime?: number;
    canvasPerColorTime?: number;
};

export type LevelData = {
    colors: string[];
    queues: number[][][];
    timer?: TimerData;
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

const defaultLevel: LevelData = {
    colors: [
        "#F44E3B",
        "#FB9E00",
        "#68BC00",
        "#73D8FF",
    ],
    queues: [[], [], [], [], []],
};

const defaultState: RootState = {
    loggedIn: false,
    fileId: "",
    name: "",
    globalError: "",
    lastStored: V1Representation.stringify(defaultLevel),
    ready: false,
    selected: [[0], [0], [0], [0], [0]],
    level: defaultLevel,
};
export {defaultState};
