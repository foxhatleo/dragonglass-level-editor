import {LevelData} from "../store/State";

export function parse(o: any): LevelData {
    return {colors: o["colors"], queues: o["queues"]};
}