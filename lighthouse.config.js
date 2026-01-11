// lighthouse.config.js
module.exports = {
  ci: {
    collect: {
      url: ['https://digital.va.gov'],
      numberOfRuns: 3,
      settings: {
        configPath: './lighthouse-config.json',
      },
    },
    upload: {
      target: 'filesystem',
      outputDir: './lhci_results',
    },
    assert: {
      preset: 'lighthouse:recommended',
      assertions: {
        'cumululative-layout-shift': ['warn', { maxNumericValue: 0.1 }],
        'largest-contentful-paint': ['warn', { maxNumericValue: 2500 }],
        'first-input-delay': ['warn', { maxNumericValue: 100 }],
        categories: [
          'error',
          {
            performance: { minScore: 0.9 },
            accessibility: { minScore: 0.95 },
            'best-practices': { minScore: 0.9 },
            seo: { minScore: 0.9 },
          },
        ],
      },
    },
  },
};
