import type { StackScreenProps } from '@react-navigation/stack';
import {ProfileMetadataMap} from "@/native/types";

export type RootStackParamList = {
	Startup: undefined;
	Scanner: undefined;
	NekokoLPA: undefined;
	Profile: { ICCID: string; metadata: ProfileMetadataMap, eUICC: string };
};

export type RootScreenProps<
	S extends keyof RootStackParamList = keyof RootStackParamList,
> = StackScreenProps<RootStackParamList, S>;
