module.exports = {
  plugins: {
    'postcss-import': {},
    'tailwindcss/nesting': {},
    tailwindcss: {},
    autoprefixer: {},
    ...(process.env.NODE_ENV === 'production'
      ? {
          cssnano: {
            preset: ['advanced', { 
              discardComments: { removeAll: true },
              mergeRules: true,
              mergeLonghand: true,
              discardDuplicates: true,
              discardOverridden: true,
              normalizeWhitespace: true,
              colormin: true,
              minifySelectors: true,
              minifyParams: true,
              minifyFontValues: true,
              reduceIdents: true,
            }],
          },
        }
      : {}),
  },
}; 