// ~/plugins/vuex-persist.js
import VuexPersistence from 'vuex-persist'

export default ({ store }) => {
  return new VuexPersistence({
    reducer: state => ({ logged: state.logged, user: state.user, token: state.token })
  }).plugin(store)
}
