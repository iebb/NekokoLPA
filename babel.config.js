/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
	presets: ['module:@react-native/babel-preset'],
	plugins: [
		[
			'module-resolver',
			{
				root: ['./src'],
				extensions: ['.js', '.json'],
				alias: {
					'@': './src',
				},
			},
		],
		'inline-dotenv',
		// Temporarily disabled until we start using Tamagui components
		// [
		// 	'@tamagui/babel-plugin',
		// 	{
		// 		components: ['tamagui'],
		// 		config: './tamagui.config.ts',
		// 		logTimings: true,
		// 		disableExtraction: process.env.NODE_ENV === 'development',
		// 		disable: false,
		// 		optimize: true,
		// 	},
		// ],
		'react-native-reanimated/plugin', // needs to be last
	],
};
