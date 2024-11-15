import React from 'react';
import {Alert, FlatList, ScrollView, StyleSheet,} from 'react-native';
import {useTranslation} from 'react-i18next';
import {SafeScreen} from '@/components/template';
import type {RootScreenProps} from "@/screens/navigation";
import Title from "@/components/common/Title";
import Container from "@/components/common/Container";
import {ProfileStats} from "@/components/stats/ProfileStats";
import {BorderRadiuses, Colors, ListItem, Text, View} from "react-native-ui-lib";

const renderRow = (row: any, id: number) => {
	const statusColor = row.inventory.status === 'Paid' ? Colors.green30 : Colors.red30;

	return (
		<View>
			<ListItem
				activeBackgroundColor={Colors.grey60}
				activeOpacity={0.3}
				height={77.5}
				onPress={() => Alert.alert(`pressed on order #${id + 1}`)}
			>
				<ListItem.Part left>
					{/*<Image source={{uri: row.mediaUrl}} style={styles.image}/>*/}
				</ListItem.Part>
				<ListItem.Part middle column containerStyle={[styles.border, {paddingRight: 17}]}>
					<ListItem.Part containerStyle={{marginBottom: 3}}>
						<Text grey10 text70 style={{flex: 1, marginRight: 10}} numberOfLines={1}>
							{row.name}
						</Text>
						<Text grey10 text70 style={{marginTop: 2}}>
							{row.formattedPrice}
						</Text>
					</ListItem.Part>
					<ListItem.Part>
						<Text
							style={{flex: 1, marginRight: 10}}
							text90
							grey40
							numberOfLines={1}
						>{`${row.inventory.quantity} item`}</Text>
						<Text text90 color={statusColor} numberOfLines={1}>
							{row.inventory.status}
						</Text>
					</ListItem.Part>
				</ListItem.Part>
			</ListItem>
		</View>
	);
}


function Settings({ route,  navigation }: RootScreenProps<'Settings'>) {

	const { t } = useTranslation(['settings']);
	return (
		<SafeScreen>
			<Title>{t('settings:settings')}</Title>
			<Container>

			</Container>
		</SafeScreen>
	);

}

const styles = StyleSheet.create({
	image: {
		width: 54,
		height: 54,
		borderRadius: BorderRadiuses.br20,
		marginHorizontal: 14
	},
	border: {
		borderBottomWidth: StyleSheet.hairlineWidth,
		borderColor: Colors.grey70
	}
});
export default Settings;
