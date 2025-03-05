import React, {useEffect, useState} from 'react';
import {ScrollView,} from 'react-native';
import {useTranslation} from 'react-i18next';
import SafeScreen from '@/theme/SafeScreen';
import type {RootScreenProps} from "@/screens/navigation";
import Title from "@/components/common/Title";
import Container from "@/components/common/Container";
import {Colors, LoaderScreen, Text, TouchableOpacity, View} from "react-native-ui-lib";
import {bleManager, requestBluetoothPermission} from "@/utils/blue";
import {Device} from 'react-native-ble-plx';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {fa9, faE, faMattressPillow, faSdCard} from '@fortawesome/free-solid-svg-icons';
import {connectDevice} from "@/screens/Bluetooth/connection";
import {setupDevices} from "@/native/setup";
import { useDispatch } from 'react-redux';
import {makeLoading} from "@/components/utils/loading";
import BlockingLoader from "@/components/common/BlockingLoader";

function BluetoothScan({ route,  navigation }: RootScreenProps<'BluetoothScan'>) {

	const { t } = useTranslation(['main']);
	const [devices, setDevices] = useState<Device[]>([]);
	const dispatch = useDispatch();
	const [loading, setLoading] = useState(false);
	const [scanning, setScanning] = useState(false);


	const addDevice = (scannedDevice: Device) => {
		if (!devices.map(d => d.id).includes(scannedDevice.id)) {
			devices.push(scannedDevice);
			setDevices([...devices]);
		}
	}

	useEffect(() => {
		const subscription = bleManager.onStateChange(state => {
			if (state === 'PoweredOn') {
				requestBluetoothPermission().then(() => {
					bleManager.startDeviceScan(
						null, // ?Array<UUID>
						{}, // options: ? ScanOptions
						(error, scannedDevice) => {
							setScanning(true); // listener: (error: ?Error, scannedDevice: ?Device) => void
							if (scannedDevice !== null) {
								if (
									scannedDevice.name?.startsWith("ESTKme-RED")
									|| scannedDevice.name?.startsWith("eSIM_Writer")
								) {
									addDevice(scannedDevice);
								}
							}
						}
					);
				})
				subscription.remove()
			}
		}, true)

		return () => {
			subscription.remove();
			bleManager.stopDeviceScan();
		}

	}, []);

	return (
		<SafeScreen>
			<Title>{t('main:bluetooth_scan')}</Title>
			{
				loading && (
					<BlockingLoader />
				)
			}
			<Container>
				<ScrollView>
					<View flex flexG style={{ gap: 10 }}>
						<View gap-10>
							{
								devices.map(device => {
									return (
										<TouchableOpacity
											key={device.id}
											paddingV-10
											onPress={async () => {
												makeLoading(setLoading, async () => {
													setScanning(false);
													bleManager.stopDeviceScan();
													await connectDevice(device);
													await setupDevices(dispatch, "ble:" + device.id);
													navigation.goBack();
												})
											}}
										>
											<View row gap-10>
												<FontAwesomeIcon icon={
													device!.name!.startsWith("ESTKme") ? faMattressPillow : device!.name!.startsWith("eSIM_Writer") ? fa9 : faSdCard
												} size={40} style={{ color: Colors.$textPrimary }} />
												<View flexG>
													<Text text70M style={{ marginTop: -2 }} flexG $textDefault>
														{device.name}
													</Text>
													<View>
														<Text $textNeutral text90M flexG>
															{device.id}
														</Text>
													</View>
												</View>
											</View>
										</TouchableOpacity>
									)})
							}
							{
								scanning && (
									<View>
										<LoaderScreen color={Colors.$textPrimary} size="large" loaderColor={Colors.$backgroundNeutral} />
									</View>
								)
							}
						</View>
					</View>
				</ScrollView>
			</Container>
		</SafeScreen>
	);

}

export default BluetoothScan;
