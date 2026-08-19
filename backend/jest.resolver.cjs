// Custom Jest resolver for ESM projects — resolves .js extension imports
module.exports = (path, options) => {
  return options.defaultResolver(path, {
    ...options,
    packageFilter: (pkg) => ({ ...pkg, main: pkg.module || pkg.main }),
  });
};
