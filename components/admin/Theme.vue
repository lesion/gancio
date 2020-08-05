<template lang="pug">
  v-container
    v-card-title {{$t('common.theme')}}
    v-card-text
      //- LOGO
      v-file-input.mt-5(ref='upload'
        :label="$t('admin.favicon')"
        @change='uploadLogo'
        accept='image/*')
        template(slot='append-outer')
          v-btn(small text @click='resetLogo') Reset
          v-img(:src='`${settings.baseurl}/favicon.ico?${logoKey}`'
            max-width="100px" max-height="80px" contain)

      v-switch.mt-5(v-model='is_dark'
        inset
        :label="$t('admin.is_dark')")

      v-row
        v-col(v-for='(color, i) in colors' :key='i')
          v-menu(v-model='menu[i]'
              :close-on-content-click="false"
              transition="slide-x-transition"
              offset-y
              absolute
              bottom
              max-width="290px"
              min-width="290px")
            template(v-slot:activator='{ on }')
              v-text-field(:value='colors[i]'
                :label='i'
                v-on='on' clearable readonly)
            v-color-picker(light @update:color='c => updateColor(i, c)')

      v-dialog(v-model='linkModal' width='500')
        v-card
          v-card-title Add footer link
          v-card-text
            v-form(v-model='valid' ref='linkModalForm')
              v-text-field(v-model='link.label'
                :rules="[validators.required('label')]"
                label='Label')
              v-text-field(v-model='link.href'
                :rules="[validators.required('href')]"
                label='Href')
          v-card-actions
            v-spacer
            v-btn(link @click='linkModal=false' color='error') {{$t('common.cancel')}}
            v-btn(link @click='addFooterLink' color='primary' :disabled='!valid') {{$t('common.add')}}

      label Footer links
      v-list
        v-list-item(link @click='linkModal = true')
          v-list-item-content
            v-list-item-title Add
            v-list-item-subtitle a new link
        v-list-item(v-for='link in settings.footerLinks'
          :key='`${link.label}`'
          :to='link.href')
          v-list-item-content
            v-list-item-title {{link.label}}
            v-list-item-subtitle {{link.href}}
          v-list-item-action
            v-btn(icon color='error' @click.prevent='removeFooterLink(link)')
              v-icon mdi-delete-forever

</template>
<script>
import { mapActions, mapState } from 'vuex'
import { validators } from '../../plugins/helpers'

export default {
  name: 'Theme',
  data () {
    return {
      validators,
      valid: false,
      logoKey: 0,
      link: { href: '', label: '' },
      linkModal: false,
      menu: [false, false, false, false],
      colors: { primary: '', secondary: '', tertiary: '' }
      //   primary: {},
      //   secondary: {}
      // }
    }
  },
  computed: {
    ...mapState(['settings']),
    // 'colors.primary': this.color('primary'),
    // 'colors.secondary': this.color('primary'),
    // 'colors.tertiary': this.color('primary'),
    is_dark: {
      get () { return this.settings['theme.is_dark'] },
      set (value) {
        this.$vuetify.theme.dark = value
        this.setSetting({ key: 'theme.is_dark', value })
      }
    }
    // 'colors[0]': {
    // get () {
    //   return this.settings['theme.colors'] || [0, 0]
    // },
    // set (value) {
    //   console.error(value)
    //     if (!value) { return }
    //     this.setSetting({ key: 'theme.primary', value })
    //     if (this.settings['theme.is_dark']) {
    //       this.$vuetify.theme.themes.dark.primary = value
    //     } else {
    //       this.$vuetify.theme.themes.light.primary = value
    //     }
    // }
    // }
  },
  methods: {
    ...mapActions(['setSetting']),
    color (name) {
      return {
        get () {
          console.error('get ', name)
        },
        set (value) {
          console.error('set ', name, value)
        }
      }
    },
    forceLogoReload () {
      this.$refs.upload.reset()
      this.logoKey++
    },
    resetLogo (e) {
      this.setSetting({ key: 'logo', value: null })
        .then(this.forceLogoReload)
      e.stopPropagation()
    },
    updateColor (i, v) {
      this.colors[i] = v.hex
      this.$vuetify.theme.themes.dark[i] = v.hex
    },
    addFooterLink () {
      const link = Object.assign({}, this.link)
      this.setSetting({ key: 'footerLinks', value: this.settings.footerLinks.concat(link) })
      // this.link = { href: '', label: '' }
      // this.$refs.linkModalForm.clear()
      this.$refs.linkModalForm.reset()
      this.linkModal = false
    },
    async removeFooterLink (item) {
      const ret = await this.$root.$confirm(this.$t('common.confirm'), this.$t('admin.delete_footer_link_confirm'))
      if (!ret) { return }
      const footerLinks = this.settings.footerLinks.filter(l => l.label !== item.label)
      this.setSetting({ key: 'footerLinks', value: footerLinks })
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