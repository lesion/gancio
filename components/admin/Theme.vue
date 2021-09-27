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
          v-btn(color='warning' text @click='resetLogo') <v-icon>mdi-restore</v-icon> {{$t('common.reset')}}
          v-img(:src='`${settings.baseurl}/logo.png?${logoKey}`'
            max-width="60px" max-height="60px" contain)

      v-switch.mt-5(v-model='is_dark'
        inset
        :label="$t('admin.is_dark')")

      //- TODO choose theme colors
      //- v-row
      //-   v-col(v-for='(color, i) in colors' :key='i')
      //-     v-menu(v-model='menu[i]'
      //-         :close-on-content-click="false"
      //-         transition="slide-x-transition"
      //-         offset-y
      //-         absolute
      //-         bottom
      //-         max-width="290px"
      //-         min-width="290px")
      //-       template(v-slot:activator='{ on }')
      //-         v-btn(:color='i' small
      //-           v-on='on') {{i}}
      //-       v-color-picker(light @update:color='c => updateColor(i, c)')

      v-dialog(v-model='linkModal' width='500')
        v-card
          v-card-title {{$t('admin.footer_links')}}
          v-card-text
            v-form(v-model='valid' ref='linkModalForm')
              v-text-field(v-model='link.label'
                :rules="[$validators.required('common.label')]"
                label='Label')
              v-text-field(v-model='link.href'
                :rules="[$validators.required('common.url')]"
                :label="$t('common.url')")
          v-card-actions
            v-spacer
            v-btn(link @click='linkModal=false' color='error') {{$t('common.cancel')}}
            v-btn(link @click='addFooterLink' color='primary' :disabled='!valid') {{$t('common.add')}}

    v-card-title {{$t('admin.footer_links')}}
    v-card-text
      v-btn(color='primary' text @click='openLinkModal') <v-icon>mdi-plus</v-icon> {{$t('admin.add_link')}}
      v-btn(color='warning' text @click='reset') <v-icon>mdi-restore</v-icon> {{$t('common.reset')}}
      v-card
        v-list.mt-1(two-line subheader)
          v-list-item(v-for='link in settings.footerLinks'
            :key='`${link.label}`' @click='editFooterLink(link)')
            v-list-item-content
              v-list-item-title {{link.label}}
              v-list-item-subtitle {{link.href}}
            v-list-item-action
              v-btn(icon color='error' @click.stop='removeFooterLink(link)')
                v-icon mdi-delete-forever

</template>
<script>
import { mapActions, mapState } from 'vuex'

export default {
  name: 'Theme',
  data () {
    return {
      valid: false,
      logoKey: 0,
      link: { href: '', label: '' },
      linkModal: false
      // menu: [false, false, false, false]
      // colors: { primary: '', secondary: '', accent: '', error: '', info: '', success: '', warning: '' }
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
  //   'colors[0]': {
  //     get () {
  //       return this.settings['theme.colors'] || [0, 0]
  //     },
  //     set (value) {
  //       console.error(value)
  //       if (!value) { return }
  //       this.setSetting({ key: 'theme.primary', value })
  //       if (this.settings['theme.is_dark']) {
  //         this.$vuetify.theme.themes.dark.primary = value
  //       } else {
  //         this.$vuetify.theme.themes.light.primary = value
  //       }
  //     }
  //   }
  },
  methods: {
    ...mapActions(['setSetting']),
    reset () {
      this.setSetting({
        key: 'footerLinks',
        value: [
          { href: '/about', label: 'about' },
          { href: '/', label: 'home' }]
      })
    },
    forceLogoReload () {
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
    openLinkModal () {
      // this.link = { href: '', label: '' }
      this.linkModal = true
      this.$nextTick(() => this.$refs.linkModalForm.reset())
    },
    addFooterLink () {
      const link = Object.assign({}, this.link)
      this.setSetting({ key: 'footerLinks', value: this.settings.footerLinks.concat(link) })
      // this.link = { href: '', label: '' }
      this.$refs.linkModalForm.reset()
      this.linkModal = false
    },
    async removeFooterLink (item) {
      const ret = await this.$root.$confirm('admin.delete_footer_link_confirm')
      if (!ret) { return }
      const footerLinks = this.settings.footerLinks.filter(l => l.label !== item.label)
      this.setSetting({ key: 'footerLinks', value: footerLinks })
    },
    editFooterLink (item) {
      this.link = { href: item.href, label: item.label }
      this.linkModal = true
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
