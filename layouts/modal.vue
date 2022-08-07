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
import Snackbar from '../components/Snackbar'
import Footer from '../components/Footer'
import Confirm from '../components/Confirm'

export default {
  name: 'Default',
  components: { Nav, Snackbar, Footer, Confirm }
}
</script>
