import Vue from 'vue'
import vueCustomElement from 'vue-custom-element'
import App from '../../components/List'
// import router from './router'
// import store from '../../store'

Vue.use(vueCustomElement)

// App.store = store
// App.router = router
Vue.customElement('gancio-widget', App)
export default App
