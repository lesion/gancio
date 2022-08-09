<template lang='pug'>
v-container
  v-card-title {{$t('common.plugins')}}
    v-spacer
  v-card-subtitle(v-html="$t('admin.plugins_description')")

  v-dialog(v-model='dialog' width='600' :fullscreen='$vuetify.breakpoint.xsOnly')
    v-card(color='secondary')
      v-card-title {{$t('admin.config_plugin')}}
      v-card-text
        v-form(v-model='valid' ref='form' lazy-validation)

      v-card-actions
          v-spacer
          v-btn(@click='dialog=false' color='warning') {{$t('common.cancel')}}
          v-btn(@click='saveSettings' color='primary' :loading='loading'
            :disable='!valid || loading') {{$t('common.save')}}

  v-card-text
    v-card(v-for='plugin in plugins' :key='plugin.name' max-width="400" elevation='10')
        v-card-title {{plugin.name}}
        v-card-text
            p {{plugin.description}}
            blockquote author: {{plugin.author}}
            a(:href='plugin.url' v-text='plugin.url')
            v-row
                v-switch
                v-spacer
                v-btn(text color='primary') {{$t('common.settings')}}

</template>
<script>
import { mdiPencil, mdiChevronLeft, mdiChevronRight, mdiMagnify, mdiEye } from '@mdi/js'

export default {
  data () {
    return {
      mdiPencil, mdiChevronRight, mdiChevronLeft, mdiMagnify, mdiEye,
      loading: false,
      dialog: false,
      valid: false,
      plugins: [],
      headers: [
        { value: 'name', text: 'Name' },
        { value: 'description', text: 'Address' },
        { value: 'actions', text: 'Actions', align: 'right' }
      ]
    }
  },
  async fetch () {
    this.plugins = await this.$axios.$get('/plugins')
  },
  methods: {
    editPlugin (item) {
      this.place.name = item.name
      this.place.address = item.address
      this.place.id = item.id
      this.dialog = true
    },
    async saveSettings () {
      if (!this.$refs.form.validate()) return
      this.loading = true
      await this.$axios.$put('/place', this.place)
      await this.$fetch()
      this.loading = false
      this.dialog = false
    }
  }
}
</script>
