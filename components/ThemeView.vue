<template lang="pug">
div.p-0.m-0.d-flex.justify-end
  v-icon.ml-5(@click='toggleDark' v-text='mdiContrastCircle')
  v-icon.ml-5(@click='toggleHideThumbs' v-text='hide_thumbs ?  mdiViewList : mdiViewModule')

</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import { mdiViewModule, mdiViewList, mdiContrastCircle } from '@mdi/js'

export default {
  name: 'ThemeView',
  data () {
    return { mdiViewModule, mdiViewList, mdiContrastCircle }
  },
  computed: {
    ...mapGetters(['hide_thumbs', 'is_dark']),
  },
  methods: {
    ...mapActions(['setLocalSetting']),
    async toggleDark() {
      this.$vuetify.theme.dark = !this.$vuetify.theme.dark
      this.setLocalSetting({ key: 'theme.is_dark', value: !this.is_dark })
    },
    async toggleHideThumbs() {
      this.setLocalSetting({ key: 'hide_thumbs', value: !this.hide_thumbs })
    }
  }
}
</script>
