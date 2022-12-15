<template lang='pug'>
v-app(app)
  Snackbar
  Confirm
  Appbar

  v-main(app)
    v-fade-transition(hide-on-leave)
      nuxt

  Footer

</template>
<script>
import Appbar from '~/components/Appbar.vue'
import Snackbar from '../components/Snackbar'
import Footer from '../components/Footer'
import Confirm from '../components/Confirm'

export default {
  name: 'Default',
  components: { Appbar, Snackbar, Footer, Confirm }
}
</script>
