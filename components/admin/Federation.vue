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
      //- v-text-field.mt-5(v-model='instance_name'
      //-   :label="$t('admin.instance_name')"
      //-   :hint="`${$t('admin.instance_name_help')} ${instance_ap_url}`"
      //-   placeholder='Instance name' persistent-hint
      //-   @blur='save("instance_name", instance_name)')

    //- v-switch.mt-4(v-model='enable_trusted_instances'
    //-   :label="$t('admin.enable_trusted_instances')"
    //-   persistent-hint inset
    //-   :hint="$t('admin.trusted_instances_help')")

    //- //- template(v-if='enable_trusted_instances')
    //- v-text-field.mt-4(v-model='instance_place'
    //-   :label="$t('admin.instance_place')"
    //-   persistent-hint
    //-   :hint="$t('admin.instance_place_help')"
    //-   @blur='save("instance_place", instance_place)'
    //- )

    v-text-field.mt-4(v-model='trusted_instances_label'
      :label="$t('admin.trusted_instances_label')"
      persistent-hint inset
      :hint="$t('admin.trusted_instances_label_help')"
      @blur='save("trusted_instances_label", trusted_instances_label)'
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
          v-btn(outlined color='error' @click='dialogAddInstance=false') {{$t('common.cancel')}}
          v-btn(outlined color='primary' :disabled='!valid || loading' :loading='loading' @click='createTrustedInstance') {{$t('common.ok')}}

    v-btn.mt-4(@click='dialogAddInstance = true' color='primary' text) <v-icon v-text='mdiPlus'></v-icon> {{$t('admin.add_instance')}}
    v-data-table(
      dense
      v-if='trusted_instances.length'
      :hide-default-footer='trusted_instances.length<10'
      :footer-props='{ prevIcon: mdiChevronLeft, nextIcon: mdiChevronRight }'
      :header-props='{ sortIcon: mdiChevronDown }'
      :headers='headers'
      :items='trusted_instances')
      template(v-slot:item.logo="{item}")
        v-img(height=20 width=20 :src="item?.object?.icon?.url") 
      template(v-slot:item.name="{item}")
        span @{{ item?.object?.name ?? item?.instance?.data?.metadata?.nodeName}}@{{ item.instance.domain }}
      template(v-slot:item.info="{item}")
        span {{ item?.object?.summary ?? item?.instance?.data?.metadata?.nodeDescription}} / {{ item.instance.name }}
      template(v-slot:item.url="{item}")
        a(:href='item.ap_id') {{ item.ap_id }}
      template(v-slot:item.status="{item}")
        v-icon(v-if='item.following' v-text='mdiDownload')
        v-icon(v-if='item.follower' v-text='mdiUpload')
      template(v-slot:item.actions="{item}")

        //- v-btn(icon @click='deleteInstance(item)' color='error')
        //-   v-icon(v-text='mdiDeleteForever')

        v-btn(icon @click='deleteInstance(item)' color='error')
          v-icon(v-text='mdiDeleteForever')

</template>
<script>
import { mapActions, mapState } from 'vuex'
import { mdiDeleteForever, mdiPlus, mdiChevronLeft, mdiChevronRight, mdiChevronDown, mdiDownload, mdiUpload } from '@mdi/js'

export default {
  name: 'Federation',
  data ({ $store, $options }) {
    return {
      mdiDeleteForever, mdiPlus, mdiChevronLeft, mdiChevronRight, mdiChevronDown, mdiDownload, mdiUpload,
      instance_url: '',
      instance_name: $store.state.settings.instance_name,
      instance_place: $store.state.settings.instance_place,
      trusted_instances_label: $store.state.settings.trusted_instances_label,
      url2host: $options.filters.url2host,
      dialogAddInstance: false,
      loading: false,
      trusted_instances: [],
      valid: false,
      headers: [
        { value: 'logo', text: 'Logo', width: 60, sortable: false },
        { value: 'name', text: 'Name' },
        { value: 'info', text: 'Info' },
        { value: 'url', text: 'URL' },
        { value: 'status', text: 'Status' },
        { value: 'actions', text: 'Actions', align: 'right' }
      ]
    }
  },
  async fetch() {
    this.trusted_instances = await this.$axios.$get('/instances/trusted')
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
        // if (!this.instance_url.startsWith('http')) {
        //   this.instance_url = `https://${this.instance_url}`
        // }
        this.instance_url = this.instance_url.replace(/\/$/, '')
        await this.$axios.$post('/instances/add_trust', { url: this.instance_url })
        this.$refs.form.reset()
        this.$fetch()
        this.dialogAddInstance = false
        this.$root.$emit('update_friendly_instances')
      } catch (e) {
        this.$root.$message(e, { color: 'error' })
      }
      this.loading = false
    },
    async deleteInstance (instance) {
      const ret = await this.$root.$confirm('admin.delete_trusted_instance_confirm')
      if (!ret) { return }
      try {
        await this.$axios.$delete('/instances/trust', { params: { ap_id: instance.ap_id }})
        this.$fetch()
        this.$root.$emit('update_friendly_instances')
        this.$root.$message('admin.instance_removed', { color: 'success' })
      } catch (e) {
        this.$root.$message(e, { color: 'error' })
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
