<template>
  <nuxt-link :to='`/announcement/${announcement.id}`'>
    <v-alert class='mb-1 text-h5 font-weight-bold' rounded="0" type='info' color="primary" flat border="left">{{announcement.title}}</v-alert>
  </nuxt-link>
</template>
<script>
export default {
  props: {
    announcement: { type: Object, default: () => ({}) }
  }
}
</script>
