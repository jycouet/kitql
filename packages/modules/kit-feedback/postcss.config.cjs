const config = {
	plugins: [
		require('tailwindcss/nesting'),
		require('tailwindcss'),
		require('autoprefixer'),
		...(process.env.NODE_ENV === 'production' ? [ require('cssnano') ] : [])
	]
};

module.exports = config;
