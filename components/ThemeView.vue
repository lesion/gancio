<template lang="pug">
div.p-0.m-0.d-flex.justify-end(:key='reload')
  v-icon.ml-5(@click='_is_dark()' v-text='mdiContrastCircle')
  v-icon.ml-5(@click='_hide_thumbs()' v-text='!hide_thumbs ?  mdiViewList : mdiViewModule')

</template>

<script>
import { mapActions, mapState } from 'vuex'
import { mdiViewModule, mdiViewList, mdiContrastCircle } from '@mdi/js'

export default {
  name: 'ThemeView',
  data ({ $store }) {
    return {
      mdiViewModule, mdiViewList, mdiContrastCircle,
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
      const theme_hide_thumbs = await this.$cookies.get('theme.hide_thumbs')
      if (theme_hide_thumbs != null) {
        this.hide_thumbs = !theme_hide_thumbs
      } else {
        this.hide_thumbs = !$store.state.settings.hide_thumbs
      }
      await this.$cookies.set('theme.hide_thumbs', this.hide_thumbs, {
        path: '/',
        maxAge: 60 * 60 * 24 * 7
      })
      await this.reload++
      this.$root.$emit('layout_loaded', true)
    },
    async hide_thumbs () {
      const hide_thumbs = await this.$cookies.get('theme.hide_thumbs')
      if (hide_thumbs != null) {
        this.hide_thumbs = hide_thumbs
      } else {
        this.hide_thumbs = $store.state.settings.hide_thumbs
      }
      return hide_thumbs
    }
  }
}
</script>
