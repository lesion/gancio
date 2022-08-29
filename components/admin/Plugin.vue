<template lang='pug'>
v-container
  v-card-title {{ $t('common.plugins') }}
    v-spacer
  v-card-subtitle(v-html="$t('admin.plugins_description')")

  v-dialog(v-model='dialog' width='600' :fullscreen='$vuetify.breakpoint.xsOnly')
    v-card(color='secondary')
      v-card-title {{ $t('admin.config_plugin') }} - {{ selectedPlugin.name }}
      v-card-text
        v-form(v-model='valid' ref='form' lazy-validation)
        div(v-for='(setting, name) in selectedPlugin.settings')
          v-text-field(v-model='pluginSettings[name]' type='text' :label='setting.description')

      v-card-actions
        v-spacer
        v-btn(@click='dialog = false' outlined color='warning') {{ $t('common.cancel') }}
        v-btn(@click='saveSettings' outlined color='primary' :loading='loading'
          :disable='!valid || loading') {{ $t('common.save') }}

  v-card-text
    v-card(v-for='plugin in plugins' :key='plugin.name' max-width="400" elevation='10' color='secondary')
      v-card-title.d-block {{ plugin.name }}
        v-switch.float-right(:label="$t('common.enable')" @change='toggleEnable(plugin)')
      v-card-text
        p {{ plugin.description }}
        blockquote author: {{ plugin.author }}
        a(:href='plugin.url' v-text='plugin.url')
        v-row
          v-spacer
          v-btn(text color='primary' @click='setOptions(plugin)') {{ $t('common.settings') }}

</template>
<script>
import { mdiPencil, mdiChevronLeft, mdiChevronRight, mdiMagnify, mdiEye } from '@mdi/js'

export default {
  data() {
    return {
      mdiPencil, mdiChevronRight, mdiChevronLeft, mdiMagnify, mdiEye,
      loading: false,
      dialog: false,
      valid: false,
      selectedPlugin: {},
      pluginSettings: {},
      plugins: [],
      headers: [
        { value: 'name', text: 'Name' },
        { value: 'description', text: 'Address' },
        { value: 'actions', text: 'Actions', align: 'right' }
      ]
    }
  },
  async fetch() {
    this.plugins = await this.$axios.$get('/plugins')
  },
  methods: {
    saveSettings() {
      console.error(this.pluginSettings)
      this.setSetting({ key: 'plugin_' + this.selectedPlugin.name, value: this.pluginSettings })
    },
    toggleEnable(plugin) {
      this.pluginSettings.enable = !this.pluginSettings.enable
      this.setSetting({ key: 'plugin_' + this.selectedPlugin.name, value: this.pluginSettings })
    },
    setOptions(plugin) {
      console.error(plugin)
      this.selectedPlugin = plugin
      console.error(plugin)
      this.dialog = true
    }
  }
}
</script>
