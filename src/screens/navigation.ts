import type {StackScreenProps} from '@react-navigation/stack';
import {ProfileMetadataMap} from "@/native/types";

export type RootStackParamList = {
	Main: {};
	Stats: {};
	Settings: {};
	EuiccInfo: {
		deviceId?: string,
	};
	Scanner: {
		appLink?: string,
		deviceId?: string,
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
