<template lang="pug">
v-container
  v-card-title {{$t('common.theme')}}
  v-card-text

    v-switch.mt-5(v-model='is_dark'
      inset hide-details
      :label="$t('admin.is_dark')")
      
    v-switch.mt-5(v-model='hide_thumbs'
      inset hide-details
      :label="$t('admin.hide_thumbs')")

    v-switch.mt-5(v-model='hide_calendar'
      inset hide-details
      :label="$t('admin.hide_calendar')")

  v-card-title {{$t('admin.default_images')}}
  v-card-subtitle(v-html="$t('admin.default_images_help')")
  v-card-text
    v-row
      v-col(cols='4')
        //- LOGO
        v-file-input.mt-5(ref='upload'
          :label="$t('admin.favicon')"
          @change='uploadLogo'
          accept='image/*')
          template(slot='append-outer')
            v-btn(color='warning' text @click='resetLogo') <v-icon v-text='mdiRestore'></v-icon> {{$t('common.reset')}}
        v-img.mt-2(:src='`/logo.png?${logoKey}`' max-height="60px" contain)

      v-col(cols='4')
        //- FALLBACK IMAGE
        v-file-input.mt-5(ref='upload'
          :label="$t('admin.fallback_image')"
          persistent-hint
          @change='uploadFallbackImage'
          accept='image/*')
          template(slot='append-outer')
            v-btn(color='warning' text @click='resetFallbackImage') <v-icon v-text='mdiRestore'></v-icon> {{$t('common.reset')}}
        v-img.mt-2(:src='`/fallbackimage.png?${fallbackImageKey}`' max-height="150px" contain)

      v-col(cols='4')
        //- HEADER IMAGE
        v-file-input.mt-5(ref='upload'
          :label="$t('admin.header_image')"
          persistent-hint
          @change='uploadHeaderImage'
          accept='image/*')
          template(slot='append-outer')
            v-btn(color='warning' text @click='resetHeaderImage') <v-icon v-text='mdiRestore'></v-icon> {{$t('common.reset')}}
        v-img.mt-2(:src='`/headerimage.png?${headerImageKey}`' max-height="150px" contain)          


  v-card-title {{$t('admin.colors')}}
  //- choose theme colors
  v-card-text
    v-theme-provider(dark)
      v-card(max-width='465')
        v-card-text
          span.mr-2(v-for='(color, i) in settings.dark_colors' :key='i')
            v-menu(v-model='dark_menu[i]'
                :close-on-content-click="false"
                transition="slide-y-transition"
                offset-y
                top right
                max-width="290px"
                min-width="290px")
              template(v-slot:activator='{ on }')
                v-btn(:color='color' dark small v-on='on') {{i}}
              v-color-picker(mode='hexa' :value='color' @update:color='c => updateColor("dark", i, c)')

    v-theme-provider(light)
      v-card.mt-4(max-width='465')
        v-card-text
          span.mr-2(v-for='(color, i) in settings.light_colors' :key='i')
            v-menu(v-model='light_menu[i]'
                :close-on-content-click="false"
                transition="slide-y-transition"
                offset-y
                top right
                max-width="290px"
                min-width="290px")
              template(v-slot:activator='{ on }')
                v-btn(:color='color' small v-on='on') {{i}}
              v-color-picker(mode='hexa' :value='color' @update:color='c => updateColor("light", i, c)')


  v-dialog(v-model='linkModal' width='500' :fullscreen='$vuetify.breakpoint.xsOnly')
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
        v-btn(outlined @click='linkModal=false' color='error') {{$t('common.cancel')}}
        v-btn(outlined @click='addFooterLink' color='primary' :disabled='!valid') {{$t('common.add')}}

  v-card-title {{$t('admin.footer_links')}}
  v-card-text
    v-btn(color='primary' text @click='openLinkModal') <v-icon v-text='mdiPlus'></v-icon> {{$t('admin.add_link')}}
    v-btn(color='warning' text @click='reset') <v-icon v-text='mdiRestore'></v-icon> {{$t('common.reset')}}
    v-card
      v-list.mt-1(two-line subheader)
        v-list-item(v-for='(link, idx) in settings.footerLinks'
          :key='`${link.label}`' @click='editFooterLink(link)')
          v-list-item-content
            v-list-item-title {{link.label}}
            v-list-item-subtitle {{link.href}}
          v-list-item-action
            v-btn.left(v-if='idx !== 0' icon color='warn' @click.stop='moveUpFooterLink(link, idx)')
              v-icon(v-text='mdiChevronUp')
            v-btn.float-right(icon color='error' @click.stop='removeFooterLink(link)')
              v-icon(v-text='mdiDeleteForever')

</template>
<script>
import { mapActions, mapState } from 'vuex'
import { mdiDeleteForever, mdiRestore, mdiPlus, mdiChevronUp } from '@mdi/js'
import debounce from 'lodash/debounce'

export default {
  name: 'Theme',
  data ({ $store }) {
    const t = new Date().getMilliseconds()
    return {
      mdiDeleteForever, mdiRestore, mdiPlus, mdiChevronUp,
      valid: false,
      logoKey: t,
      fallbackImageKey: t,
      headerImageKey: t,
      link: { href: '', label: '' },
      linkModal: false,
      dark_menu: [false, false, false, false],
      light_menu: [false, false, false, false],
    }
  },
  computed: {
    ...mapState(['settings']),
    is_dark: {
      get () { return this.settings['theme.is_dark'] },
      set (value) {
        this.$vuetify.theme.dark = value
        this.setSetting({ key: 'theme.is_dark', value })
        this.setLocalSetting({ key: 'theme.is_dark', value })
      }
    },
    hide_thumbs: {
      get () { return this.settings.hide_thumbs },
      set (value) { this.setSetting({ key: 'hide_thumbs', value }) }
    },
    hide_calendar: {
      get () { return this.settings.hide_calendar },
      set (value) { this.setSetting({ key: 'hide_calendar', value }) }
    }
  },
  methods: {
    ...mapActions(['setSetting', 'setLocalSetting']),
    reset () {
      this.setSetting({
        key: 'footerLinks',
        value: [
          { href: '/', label: 'common.home' },
          { href: '/about', label: 'common.about' }
        ]
      })
    },
    forceLogoReload () {
      this.logoKey++
    },
    forceFallbackImageReload () {
      this.fallbackImageKey++
    },
    forceHeaderImageReload () {
      this.headerImageKey++
    },    
    resetLogo (e) {
      this.setSetting({ key: 'logo', value: null })
        .then(this.forceLogoReload)
      e.stopPropagation()
    },
    resetFallbackImage (e) {
      this.setSetting({ key: 'fallback_image', value: null })
        .then(this.forceFallbackImageReload)
      e.stopPropagation()
    },
    resetHeaderImage (e) {
      this.setSetting({ key: 'header_image', value: null })
        .then(this.forceHeaderImageReload)
      e.stopPropagation()
    },
    updateSettingColor: debounce( async function (theme, color, value) {
      const key = `${theme}_colors`
      this.setSetting({ key, value: { ...this.settings[key], [color]: value.hex } })
    }, 200),
    updateColor (theme, color, value) {
      this.$vuetify.theme.themes[theme][color] = value.hex
      this.updateSettingColor(theme, color, value)
    },
    openLinkModal () {
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
    async moveUpFooterLink (item, idx) {
      const footerLinks = [...this.settings.footerLinks]
      footerLinks[idx] = footerLinks[idx-1]
      footerLinks[idx-1] = this.settings.footerLinks[idx]
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
    async uploadFallbackImage (file) {
      const formData = new FormData()
      formData.append('fallbackImage', file)
      try {
        await this.$axios.$post('/settings/fallbackImage', formData)
        this.$root.$emit('message', {
          message: 'Fallback image updated'
        })
        this.forceFallbackImageReload()
      } catch (e) {

      }
    },
    async uploadHeaderImage (file) {
      const formData = new FormData()
      formData.append('headerImage', file)
      try {
        await this.$axios.$post('/settings/headerImage', formData)
        this.$root.$emit('message', {
          message: 'Header image updated'
        })
        this.forceHeaderImageReload()
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
