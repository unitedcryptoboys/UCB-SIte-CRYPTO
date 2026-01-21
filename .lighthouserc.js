module.exports = {
  ci: {
    collect: {
      url: ['https://unitedcryptoboys.github.io/UCB-SIte-CRYPTO/'],
      numberOfRuns: 3,
      settings: {
        chromeFlags: '--no-sandbox'
      }
    },
    assert: {
      assertions: {
        'categories:performance': ['error', {minScore: 0.95}],
        'categories:accessibility': ['error', {minScore: 1.0}],
        'categories:best-practices': ['error', {minScore: 1.0}],
        'categories:seo': ['error', {minScore: 1.0}]
      }
    },
    upload: {
      target: 'temporary-public-storage'
    }
  }
};
