<template>
  <nav>

    <NavHeader/>

    <!-- title -->
    <div class='text-center'>
      <nuxt-link class='text-h3 text-decoration-none' v-text='settings.title' to='/' />
      <div class='text-body-1 font-weight-light' v-text='settings.description' />
    </div>

    <NavSearch/>

    <NavBar />

  </nav>



</template>
<script>
import { mapState } from 'vuex'
import NavHeader from './NavHeader.vue'
import NavBar from './NavBar.vue'
import NavSearch from './NavSearch.vue'

export default {
  name: 'Appbar',
  components: { NavHeader, NavBar, NavSearch },
  computed: mapState(['settings'])
}
</script>
<style>
nav {
  background-image: linear-gradient(rgba(59, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(/headerimage.png);
  background-position: center center;
  background-size: cover;
}

.theme--light nav {
  background-image: linear-gradient(to bottom, rgba(255,230,230,.95), rgba(250,250,250,.95)), url(/headerimage.png);
}
</style>