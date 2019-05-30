<template lang="pug">
  #home
    Nav
    Home
</template>
<script>
import Home from '~/components/Home.vue'
import Nav from '~/components/Nav.vue'

export default {
  name: 'Index',
  components: { Nav, Home },
}
</script>

