const config = {
	content: [ './src/lib/**/*.{html,js,svelte,ts}' ],
	theme: {
		extend: {
			colors: {
				primary: '#029431',
				'primary-focus': '#03B53B',
				'primary-content': '#ffffff',

				secondary: '#42B4E6',
				'secondary-focus': '#0087cd',
				'secondary-content': '#ffffff',

				accent: '#D42A21',
				'accent-focus': '#C2261E',
				'accent-content': '#ffffff',

				neutral: '#2F3437',
				'neutral-focus': '#3d4346',
				'neutral-content': '#ffffff',

				'base-100': '#293133',
				'base-200': '#242B2D',
				'base-300': '#1B2122',
				'base-content': '#ffffff',

				info: '#2094f3',
				success: '#029431',
				warning: '#ff9900',
				error: '#D42A21'
			}
		}
	},

	plugins: [ require("daisyui"), require('tailwind-scrollbar') ],
	daisyui: {
		base: false,
		themes: [
			{
				default: {
					primary: '#029431',
					'primary-focus': '#03B53B',
					'primary-content': '#ffffff',

					secondary: '#42B4E6',
					'secondary-focus': '#0087cd',
					'secondary-content': '#ffffff',

					accent: '#D42A21',
					'accent-focus': '#C2261E',
					'accent-content': '#ffffff',

					neutral: '#2F3437',
					'neutral-focus': '#3d4346',
					'neutral-content': '#ffffff',

					'base-100': '#293133',
					'base-200': '#242B2D',
					'base-300': '#1B2122',
					'base-content': '#ffffff',

					info: '#2094f3',
					success: '#029431',
					warning: '#ff9900',
					error: '#D42A21'
				},
			}
		],
	},
};

module.exports = config;
