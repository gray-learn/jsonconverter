module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Remove source-map-loader for node_modules
      webpackConfig.module.rules = webpackConfig.module.rules.map(rule => {
        if (Array.isArray(rule.oneOf)) {
          rule.oneOf = rule.oneOf.filter(
            r =>
              !(
                r.loader &&
                r.loader.includes("source-map-loader") &&
                r.exclude === undefined
              )
          );
        }
        return rule;
      });
      return webpackConfig;
    }
  }
};
