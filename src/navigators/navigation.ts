import type { StackScreenProps } from '@react-navigation/stack';
import {ProfileMetadataMap} from "@/native/types";
import {EuiccList} from "@/redux/reduxDataStore";

export type RootStackParamList = {
	NekokoLPA: {};
	Stats: {};
	Scanner: {
		appLink?: string,
		eUICC?: EuiccList,
	};
	Profile: {
		ICCID: string;
		metadata: ProfileMetadataMap,
		eUICC: EuiccList,
	};
};

export type RootScreenProps<
	S extends keyof RootStackParamList = keyof RootStackParamList,
> = StackScreenProps<RootStackParamList, S>;
