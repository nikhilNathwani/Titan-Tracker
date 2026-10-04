// Turbopack loader for .sql files (see next.config.mjs): turns a file into a
// JS module whose default export is the file's text, so queries are built into
// the bundle instead of being read from disk at runtime.
module.exports = function sqlLoader(source) {
	return `export default ${JSON.stringify(source)};`;
};
