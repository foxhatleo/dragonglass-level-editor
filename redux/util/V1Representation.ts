import {LevelData} from "../store/State";

export function parse(o: any): LevelData {
    return {colors: o["colors"], queues: o["queues"]};
}

export function stringify(o: LevelData, readable: boolean = false): string {
    return JSON.stringify({...o, version: 1}, null, readable ? 2 : undefined);
}