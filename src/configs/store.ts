import {createMMKV} from "react-native-mmkv";

export const storage = createMMKV();


export const setNicknameByEid = (eid: string, name: string) => {
    storage.set("nickname", JSON.stringify({
        ...getNicknames(),
        [eid]: name,
    }));
}

export const getNicknameByEid = (eid: string) => {
    const nicknames = getNicknames();
    return nicknames[eid] ?? null;
}

export const getNicknames = () => {
    try {
        const v = JSON.parse(storage.getString("nickname") ?? '{}');
        if (typeof v !== "undefined") {
            return v;
        }
        return {};
    } catch (error) {
        return {};
    }
}
