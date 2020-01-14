<template lang='pug'>
  el-main.p-4.text-center#error
    h1(v-if="error.statusCode === 404") <i class='el-icon-warning'></i> {{error.message}}
    h1(v-else) <i name='el-icon-warning'></i> An error occurred: {{error.message}}
    nuxt-link(to='/') Back to home
</template>

<script>
import { mapState } from 'vuex'

export default {
  props: { error: { type: Object } },
  computed: mapState(['settings']),
  head () {
    return { title: `${this.settings.title} - Error` }
  }
}
</script>
<style lang="less">
  #error {
    margin-top: 20px;
    color: orange;
    i { color: orangered }
  }
</style>
