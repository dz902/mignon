/* jslint node: true, esversion: 6 */

const requireAll = (requireContext) => { requireContext.keys().map(requireContext); };

requireAll(require.context('./spec', true, /\.js$/));
