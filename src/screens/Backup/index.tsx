import React from 'react';
import {useTranslation} from 'react-i18next';
import SafeScreen from '@/theme/SafeScreen';
import type {RootScreenProps} from "@/screens/navigation";
import Title from "@/components/common/Title";
import Container from "@/components/common/Container";
import {sizeStats} from "@/utils/mmkv";
import {Button, Colors, Text, View} from "react-native-ui-lib";
import RNFS from 'react-native-fs';
import Share from 'react-native-share'; // optional for sharing
import DocumentPicker from 'react-native-document-picker';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faDownload, faUpload} from '@fortawesome/free-solid-svg-icons';
import {useToast} from "@/components/common/ToastProvider";
import {ScrollView} from 'react-native';


export default function Backup({ route,  navigation }: RootScreenProps<'Backup'>) {
	const { showToast } = useToast();

	const { t } = useTranslation(['main']);
	const exportFile = async () => {
		const sizeData = sizeStats.getAllKeys();
		const doc = {sizes: {}};
		for(const k of sizeData) {
			(doc.sizes as any)[k] = sizeStats.getNumber(k);
		}

		const fileName = 'export.json';
		const filePath = `${RNFS.DocumentDirectoryPath}/${fileName}`;
		try {
			await RNFS.writeFile(filePath, JSON.stringify(doc), 'utf8');
			console.log('File written to:', filePath);

			// Optionally share it
			await Share.open({
				title: 'Exported Data',
				url: 'file://' + filePath,
				type: 'application/json',
			});
		} catch (err) {
			showToast('Export failed.', 'error');
			console.error('Export failed:', err);
		}
	}
	const importData = async () => {
		try {
			const res = await DocumentPicker.pickSingle({
				type: [DocumentPicker.types.json],
			});

			const fileContent = await RNFS.readFile(res.uri, 'utf8');
			try {
				const { sizes } = JSON.parse(fileContent);
				for(const s of Object.keys(sizes)) {
					sizeStats.set(s, sizes[s] as number);
				}
				showToast('Import successful.', 'success');
			} catch (err) {
				showToast('Import failed.', 'error');

			}
		} catch (err) {
			if (DocumentPicker.isCancel(err)) {
				console.log('User cancelled file picker');
			} else {
				console.error('Import error:', err);
			}
			return null;
		}
	};

	return (
		<SafeScreen>
			<Title>{t('main:backup')}</Title>
			<Container>
				<ScrollView>
					<View flex flexG style={{ gap: 10 }}>
						<View>
							<Button
								marginV-12 flex
								backgroundColor={Colors.$backgroundNeutralHeavy}
								onPress={exportFile}
							>
								<FontAwesomeIcon
									icon={faDownload}
									style={{ color: Colors.white }}
								/>
								<Text
									marginL-10
									color={Colors.white}
								>{t('main:backup_export')}</Text>
							</Button>
							<Button
								marginV-12 flex
								backgroundColor={Colors.$backgroundNeutralHeavy}
								onPress={importData}
							>
								<FontAwesomeIcon
									icon={faUpload}
									style={{ color: Colors.white }}
								/>
								<Text
									marginL-10
									color={Colors.white}
								>{t('main:backup_import')}</Text>
							</Button>
						</View>
					</View>
				</ScrollView>
			</Container>
		</SafeScreen>
	);

}
