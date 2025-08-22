module.exports = {
  plugins: {
    'postcss-import': {},
    'tailwindcss/nesting': {},
    tailwindcss: {},
    autoprefixer: {},
    ...(process.env.NODE_ENV === 'production'
      ? {
          cssnano: {
            preset: ['default', { 
              discardComments: { removeAll: true },
              normalizeWhitespace: true,
              colormin: true,
              minifyFontValues: true,
              minifyGradients: true,
              discardUnused: false,
              discardDuplicates: true,
              discardEmpty: true,
              minifySelectors: true,
              reduceIdents: false,
              zindex: false,
              mergeRules: true
            }],
          },
        }
      : {}),
  },
}; 