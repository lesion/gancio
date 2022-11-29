<template lang="pug">
div.p-0.m-0.d-flex.justify-end(:key='reload')
  v-icon.ml-5(@click='_is_dark()' v-text='mdiContrastCircle')
  v-icon.ml-5(@click='_hide_thumbs()' v-if="!hide_thumbs" v-text='!hide_thumbs_icon ?  mdiViewList : mdiViewModule')

</template>

<script>
import { mapActions, mapState } from 'vuex'
import { mdiViewModule, mdiViewList, mdiContrastCircle } from '@mdi/js'

export default {
  name: 'ThemeView',
  data ({ $store }) {
    return {
      mdiViewModule, mdiViewList, mdiContrastCircle,
      hide_thumbs: $store.state.settings.hide_thumbs,
      hide_thumbs_icon: $store.state.settings.hide_thumbs || this.$cookies.get('theme.hide_thumbs'),
      reload: 0
    }
  },
  methods: {
    ...mapState(['settings']),
    async _is_dark() {
      this.$vuetify.theme.dark = !this.$vuetify.theme.dark
      await this.$cookies.set('theme.is_dark', this.$vuetify.theme.dark, {
        path: '/',
        maxAge: 60 * 60 * 24 * 7
      })
    },
    async _hide_thumbs() {
      let theme_hide_thumbs = await this.$cookies.get('theme.hide_thumbs')
      if (theme_hide_thumbs != null) {
        theme_hide_thumbs = !theme_hide_thumbs
      } else {
        theme_hide_thumbs = !this.settings.hide_thumbs
      }
      await this.$cookies.set('theme.hide_thumbs', theme_hide_thumbs, {
        path: '/',
        maxAge: 60 * 60 * 24 * 7
      })
      this.hide_thumbs_icon = theme_hide_thumbs
      this.reload++
      this.$root.$emit('layout_loaded', true)
    },
  }
}
</script>
