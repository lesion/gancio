<template lang='pug'>
  v-app(app)
    Snackbar
    Confirm
    Nav

    v-main(app)
      v-scroll-y-transition(hide-on-leave)
        nuxt

    Footer

</template>
<script>
import Nav from '~/components/Nav.vue'
import FollowMe from '../components/FollowMe'
import Snackbar from '../components/Snackbar'
import Footer from '../components/Footer'
import Confirm from '../components/Confirm'

export default {
  name: 'Default',
  components: { Nav, FollowMe, Snackbar, Footer, Confirm },
}
</script>
