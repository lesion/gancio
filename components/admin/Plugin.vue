<template lang='pug'>
v-container
  v-card-title {{ $t('common.plugins') }}
    v-spacer
  v-card-subtitle(v-html="$t('admin.plugins_description')")
  v-dialog(v-if='selectedPlugin.settingsValue' v-model='dialog' width='600' :fullscreen='$vuetify.breakpoint.xsOnly')
    v-card
      v-card-title {{ $t('admin.config_plugin') }} - {{ selectedPlugin.name }}
      v-card-text
        v-form(v-model='valid' ref='form' lazy-validation)
          v-row(v-for='(setting, name) in selectedPlugin.settings' :key='name' mt-2)
            v-col.col-4
              small(v-html='setting.hint')
            v-col.col-8
              v-text-field(v-if='setting.type === "TEXT"' v-model='selectedPlugin.settingsValue[name]'
                type='text' :label='setting.description'
                persistent-hint
                :rules="[setting.required ? $validators.required(setting.description) : false]")

              v-text-field(v-if='setting.type === "NUMBER"' v-model='selectedPlugin.settingsValue[name]' type='number' :label='setting.description')
              v-switch(v-if='setting.type === "CHECK"' v-model='selectedPlugin.settingsValue[name]' :label='setting.description')
              v-select(v-if='setting.type === "LIST"' v-model='selectedPlugin.settingsValue[name]' :items='setting.items' :label='setting.description')
          v-switch(:label="$t('common.enable')" inset color='primary' v-model='selectedPlugin.settingsValue["enable"]')
      v-card-actions
        v-btn(@click='testPlugin' outlined color='primary') {{ $t('common.test') }}
        v-spacer
        v-btn(@click='dialog = false' outlined color='warning') {{ $t('common.close') }}
        v-btn(@click='saveSettings' outlined color='primary' :loading='loading'
          :disable='!valid || loading') {{ $t('common.save') }}

  v-card-text(class='d-flex')
    v-card(v-for='plugin in plugins' :key='plugin.name' max-width="400" outlined class='mr-2')
      v-card-title {{ plugin.name }}
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
import { mapActions, mapState } from 'vuex'

export default {
  data() {
    return {
      mdiPencil, mdiChevronRight, mdiChevronLeft, mdiMagnify, mdiEye,
      loading: false,
      dialog: false,
      valid: false,
      selectedPlugin: {},
      plugins: [],
      headers: [
        { value: 'name', text: 'Name' },
        { value: 'description', text: 'Address' },
        { value: 'actions', text: 'Actions', align: 'right' }
      ]
    }
  },
  async mounted() {
    this.plugins = await this.$axios.$get('/plugins')
  },
  computed: mapState(['settings']),
  methods: {
    ...mapActions(['setSetting']),
    async saveSettings() {
      this.loading = true
      await this.setSetting({
        key: 'plugin_' + this.selectedPlugin.name,
        value: this.selectedPlugin.settingsValue
      })
      this.loading = false
      this.dialog = false
    },
    async testPlugin() {
      await this.saveSettings()
      this.$axios.$post(`/plugin/test/${this.selectedPlugin.name}`)
    },
    toggleEnable(plugin) {
      this.$axios.$put(`/plugin/${plugin.name}`)
    },
    setOptions(plugin) {
      this.selectedPlugin = plugin
      this.dialog = true
    }
  }
}
</script>
