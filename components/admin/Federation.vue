<template lang="pug">
  v-container
    v-card-title {{$t('common.federation')}}
    v-card-text
      v-switch(v-model='enable_federation'
        :label="$t('admin.enable_federation')"
        persistent-hint
        inset
        :hint="$t('admin.enable_federation_help')")

      template(v-if='enable_federation')

        v-switch.mt-4(v-model='enable_resources'
          :label="$t('admin.enable_resources')"
          :hint="$t('admin.enable_resources_help')"
          persistent-hint inset)

        v-switch.mt-4(v-model='hide_boosts'
          :label="$t('admin.hide_boost_bookmark')"
          :hint="$t('admin.hide_boost_bookmark_help')"
          persistent-hint inset)

        //- div.mt-4 {{$t('admin.instance_name')}}
        v-text-field.mt-5(v-model='instance_name'
          :label="$t('admin.instance_name')"
          :hint="`${$t('admin.instance_name_help')} ${instance_ap_url}`"
          placeholder='Instance name' persistent-hint
          @blur='save("instance_name", instance_name)')

      v-switch.mt-4(v-model='enable_trusted_instances'
        :label="$t('admin.enable_trusted_instances')"
        persistent-hint inset
        :hint="$t('admin.trusted_instances_help')")

      template(v-if='enable_trusted_instances')
        v-text-field.mt-4(v-model='instance_place'
          :label="$t('admin.instance_place')"
          persistent-hint
          :hint="$t('admin.instance_place_help')"
          @blur='save("instance_place", instance_place)'
        )

        v-dialog(v-model='dialogAddInstance' width='500px' :fullscreen='$vuetify.breakpoint.xsOnly')
          v-card
            v-card-title {{$t('admin.add_trusted_instance')}}
            v-card-text
              v-form(v-model='valid' @submit.prevent='createTrustedInstance' ref='form' lazy-validation)
                v-text-field.mt-4(v-model='instance_url'
                  persistent-hint
                  :rules="[$validators.required('common.url')]"
                  :loading='loading'
                  :hint="$t('admin.add_trusted_instance')"
                  :label="$t('common.url')")
            v-card-actions
              v-spacer
              v-btn(color='error' @click='dialogAddInstance=false') {{$t('common.cancel')}}
              v-btn(color='primary' :disabled='!valid || loading' :loading='loading' @click='createTrustedInstance') {{$t('common.ok')}}

        v-btn.mt-4(@click='dialogAddInstance = true' color='primary' text) <v-icon>mdi-plus</v-icon> {{$t('admin.add_instance')}}
        v-data-table(
          v-if='settings.trusted_instances.length'
          :hide-default-footer='settings.trusted_instances.length<10'
          :headers='headers'
          :items='settings.trusted_instances')
          template(v-slot:item.actions="{item}")
            v-btn(icon @click='deleteInstance(item)' color='error')
              v-icon mdi-delete-forever

</template>
<script>
import { mapActions, mapState } from 'vuex'
import axios from 'axios'

export default {
  name: 'Federation',
  data ({ $store, $options }) {
    return {
      instance_url: '',
      instance_name: $store.state.settings.instance_name,
      instance_place: $store.state.settings.instance_place,
      url2host: $options.filters.url2host,
      dialogAddInstance: false,
      loading: false,
      valid: false,
      headers: [
        { value: 'name', text: 'Name' },
        { value: 'url', text: 'URL' },
        { value: 'label', text: 'Place' },
        { value: 'actions', text: 'Actions', align: 'right' }
      ]
    }
  },
  computed: {
    ...mapState(['settings']),
    enable_federation: {
      get () { return this.settings.enable_federation },
      set (value) { this.setSetting({ key: 'enable_federation', value }) }
    },
    enable_resources: {
      get () { return this.settings.enable_resources },
      set (value) { this.setSetting({ key: 'enable_resources', value }) }
    },
    hide_boosts: {
      get () { return this.settings.hide_boosts },
      set (value) { this.setSetting({ key: 'hide_boosts', value }) }
    },
    enable_trusted_instances: {
      get () { return this.settings.enable_trusted_instances },
      set (value) { this.setSetting({ key: 'enable_trusted_instances', value }) }
    },
    instance_ap_url () {
      const instance_url = this.settings.baseurl.match(/^https?:\/\/(.[^/:]+)/i)[1]
      return `(@${this.instance_name}@${instance_url})`
    }
  },
  methods: {
    ...mapActions(['setSetting']),
    async createTrustedInstance () {
      if (!this.$refs.form.validate()) { return }
      this.loading = true
      try {
        if (!this.instance_url.startsWith('http')) {
          this.instance_url = `https://${this.instance_url}`
        }
        const instance = await axios.get(`${this.instance_url}/.well-known/nodeinfo/2.1`)
        this.setSetting({
          key: 'trusted_instances',
          value: this.settings.trusted_instances.concat({
            url: this.instance_url,
            name: instance.data.metadata.nodeName,
            label: instance.data.metadata.nodeLabel
          })
        })
        this.$refs.form.reset()
        this.dialogAddInstance = false
      } catch (e) {
        this.$root.$message(e, { color: 'error' })
      }
      this.loading = false
    },
    async deleteInstance (instance) {
      const ret = await this.$root.$confirm('admin.delete_trusted_instance_confirm')
      if (!ret) { return }
      this.setSetting({
        key: 'trusted_instances',
        value: this.settings.trusted_instances.filter(i => i.url !== instance.url)
      })
    },
    save (key, value) {
      if (this.settings[key] !== value) {
        this.setSetting({ key, value })
      }
    }
  }
}
</script>
