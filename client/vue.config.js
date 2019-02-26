module.exports = {
  devServer: {
    disableHostCheck: true
  },
  transpileDependencies: [
    /\bvue-awesome\b/,
    'vuex-persist'
  ]
}
