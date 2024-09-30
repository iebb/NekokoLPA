import React from 'react';
import {ScrollView,} from 'react-native';
import {useTranslation} from 'react-i18next';
import {SafeScreen} from '@/components/template';
import type {RootScreenProps} from "@/navigators/navigation";
import Title from "@/components/common/Title";
import Container from "@/components/common/Container";
import {ProfileStats} from "@/components/stats/ProfileStats";


function Stats({ route,  navigation }: RootScreenProps<'Stats'>) {

	const { t } = useTranslation(['profile']);
	return (
		<SafeScreen>
			<Title>{t('profile:collection_stats')}</Title>
			<Container>
				<ScrollView>
					<ProfileStats />
				</ScrollView>
			</Container>
		</SafeScreen>
	);

}

export default Stats;
