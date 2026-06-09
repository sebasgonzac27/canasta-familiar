module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    // Must be listed last. Required by react-native-reanimated v4 / worklets.
    plugins: ["react-native-worklets/plugin"],
  };
};
