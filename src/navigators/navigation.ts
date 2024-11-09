import type { StackScreenProps } from '@react-navigation/stack';
import {ProfileMetadataMap} from "@/native/types";
import {EuiccList} from "@/redux/stateStore";

export type RootStackParamList = {
	Main: {};
	Stats: {};
	Scanner: {
		appLink?: string,
		eUICC?: EuiccList,
	};
	Profile: {
		iccid: string;
		metadata: ProfileMetadataMap,
		deviceId: string,
	};
};

export type RootScreenProps<
	S extends keyof RootStackParamList = keyof RootStackParamList,
> = StackScreenProps<RootStackParamList, S>;
