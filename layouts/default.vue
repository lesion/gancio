<template lang='pug'>
  v-app(app)
    Snackbar
    Confirm
    Nav

    v-main(app)
      v-fade-transition(hide-on-leave)
        nuxt

    Footer

</template>
<script>
import Nav from '~/components/Nav.vue'
import FollowMe from '../components/FollowMe'
import Snackbar from '../components/Snackbar'
import Footer from '../components/Footer'
import Confirm from '../components/Confirm'
import { mapState } from 'vuex'

export default {
  name: 'Default',
  components: { Nav, FollowMe, Snackbar, Footer, Confirm },
  computed: mapState(['settings']),
  created () {
    this.$vuetify.theme.dark = this.settings['theme.is_dark']
    this.$vuetify.theme.themes.dark.primary = this.settings['theme.primary']
    this.$vuetify.theme.themes.light.primary = this.settings['theme.primary']
  }
}
</script>
<style lang="less">
// html, body {
//   overflow: hidden;
//   max-height: 100%;
// }
.v-dialog {
  max-width: 800px;
}

.theme--dark.v-list {
  background-color: #333;
}

.v-autocomplete__content.v-menu__content {
  scrollbar-width: thin;
  scrollbar-color: #FF4511;
}
</style>
