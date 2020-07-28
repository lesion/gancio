<template lang="pug">
  v-container

    //- LOGO
    v-file-input.mt-5(ref='upload'
      :label="$t('admin.favicon')"
      @change='uploadLogo'
      accept='image/*')
      template(slot='append-outer')
        v-btn(small @click='resetLogo') Reset
        v-img(:src='`${settings.baseurl}/favicon.ico?${logoKey}`'
          max-width="100px" max-height="80px" contain)
      //- el-button-group
        el-button(size='small' type='primary' plain) Select file
        el-button(size='small' type='success' plain @click='resetLogo') Reset

    v-switch.mt-5(v-model='is_dark'
      inset
      :label="$t('admin.is_dark')")

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
      logoKey: 0
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
        // this.$vuetify.theme.themes.dark.primary = value.hex
        this.$vuetify.theme.themes.light.primary = value.hex
        this.setSetting({ key: 'theme.primary', value: value.hex })
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
