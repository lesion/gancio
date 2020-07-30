<template lang="pug">
  v-card
    v-card-title {{$t('common.theme')}}
    v-card-text
      p {{settings['theme.primary']}}
      //- LOGO
      v-file-input.mt-5(ref='upload'
        :label="$t('admin.favicon')"
        @change='uploadLogo'
        accept='image/*')
        template(slot='append-outer')
          v-btn(small @click='resetLogo') Reset
          v-img(:src='`${settings.baseurl}/favicon.ico?${logoKey}`'
            max-width="100px" max-height="80px" contain)

      v-switch.mt-5(v-model='is_dark'
        inset
        :label="$t('admin.is_dark')")

      v-row
        v-col
          v-menu(v-model='primaryMenu'
              :close-on-content-click="false"
              transition="slide-x-transition"
              offset-y
              absolute
              bottom
              max-width="290px"
              min-width="290px")
            template(v-slot:activator='{ on }')
              v-text-field(
                :label="$t('event.from')"
                :value='primary_color'
                v-on='on'
                clearable
                readonly)
            v-color-picker(
              mode='hexa'
              :label="$t('common.primary_color')"
              v-model='primary_color')
</template>
<script>
import { mapActions, mapState } from 'vuex'
export default {
  name: 'Theme',
  data () {
    return {
      logoKey: 0,
      primaryMenu: false
    }
  },
  computed: {
    ...mapState(['settings']),
    is_dark: {
      get () { return this.settings['theme.is_dark'] },
      set (value) {
        this.$vuetify.theme.dark = value
        this.setSetting({ key: 'theme.is_dark', value })
      }
    },
    primary_color: {
      get () { return this.settings['theme.primary'] },
      set (value) {
        if (!value) { return }
        this.setSetting({ key: 'theme.primary', value })
        if (this.settings['theme.is_dark']) {
          this.$vuetify.theme.themes.dark.primary = value
        } else {
          this.$vuetify.theme.themes.light.primary = value
        }
      }
    }
  },
  methods: {
    ...mapActions(['setSetting']),
    forceLogoReload () {
      this.$refs.upload.reset()
      this.logoKey++
    },
    resetLogo (e) {
      this.setSetting({ key: 'logo', value: null })
        .then(this.forceLogoReload)
      e.stopPropagation()
    },
    async uploadLogo (file) {
      const formData = new FormData()
      formData.append('logo', file)
      try {
        await this.$axios.$post('/settings/logo', formData)
        this.$root.$emit('message', {
          message: 'Logo updated'
        })
        this.forceLogoReload()
      } catch (e) {

      }
    },
    save (key, value) {
      if (this.settings[key] !== value) {
        this.setSetting({ key, value })
      }
    }
  }
}
</script>
