<template>
  <nav>
    <NavHeader />

    <!-- title -->
    <h1 v-if="['index'].includes($route.name)" class="text-center">
      <nuxt-link id="title" v-text="settings.title" to="/" />
      <div
        class="text-body-1 font-weight-light pb-3"
        v-text="settings?.description"
      />
    </h1>
    <div v-if="!['index'].includes($route.name)" class="text-center">
      <nuxt-link id="title" v-text="settings.title" to="/" />
      <div
        class="text-body-1 font-weight-light pb-3"
        v-text="settings?.description"
      />
    </div>

    <NavSearch />
    <NavBar v-if="!['event-slug','e-slug'].includes($route.name)"/>
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
  computed: mapState(['settings']),
}
</script>
<style>
nav {
  background-image: linear-gradient(rgba(0, 0, 0, 0.8), rgba(20, 20, 20, 0.7)),
    url(/headerimage.png);
  background-position: center center;
  background-size: cover;
}

.theme--light nav {
  background-image: linear-gradient(
      to bottom,
      rgba(230, 230, 230, 0.95),
      rgba(250, 250, 250, 0.95)
    ),
    url(/headerimage.png);
}

#title {
  word-break: break-all;
  font-size: 2rem;
  font-weight: 600;
  text-decoration: none;
}
</style>
