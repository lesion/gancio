<template lang='pug'>
  v-container
    v-card-title {{$t('common.moderation')}}
    v-card-text
      v-row
        v-col(:span='12')
          span {{$t('common.instances')}}
          v-text-field(v-model='instancesFilter' :placeholder="$t('admin.filter_instances')")
          v-data-table(:items='instances'
            :items-per-page='5'
            :search='instancesFilter'
            :hide-default-footer='instances.length<5'
            :footer-props='{ prevIcon: mdiChevronLeft, nextIcon: mdiChevronRight }'
            dense :headers='instancesHeader'
            @click:row='instanceSelected')
            template(v-slot:item.blocked="{ item }")
              v-icon(@click='toggleBlock(item)' v-text='item.blocked ? mdiCheckboxIntermediate : mdiCheckboxBlankOutline')

        v-col(:span='11')
          span {{$t('common.users')}}
          v-text-field(v-model='usersFilter' :placeholder="$t('admin.filter_users')")
          v-data-table(:items='users'
            :items-per-page='5'
            :search='usersFilter'
            :hide-default-footer='users.length<5'
            :footer-props='{ prevIcon: mdiChevronLeft, nextIcon: mdiChevronRight }'
            dense :headers='usersHeader')
            template(v-slot:item.blocked="{ item }")
              v-icon(@click='toggleUserBlock(item)' v-text='item.blocked ? mdiCheckboxIntermediate : mdiCheckboxBlankOutline')

      div
        v-card-title {{$t('common.resources')}}
        v-data-table(:items='resources' dense
          :headers='resourcesHeader'
          :hide-default-footer='resources.length<10'
          :items-per-page='10'
          :footer-props='{ prevIcon: mdiChevronLeft, nextIcon: mdiChevronRight }')
          template(v-slot:item.content='{ item }')
            span(v-html='item.data.content')
          template(v-slot:item.created='{ item }')
            span {{item.created | dateFormat('lll')}}
          template(v-slot:item.user='{ item }')
            a(:href='item.ap_user.url || item.ap_user.ap_id' target='_blank') {{item.ap_user.preferredUsername}}
          template(v-slot:item.event='{ item }')
            nuxt-link(:to='`/event/${item.event.slug || item.event.id}`') {{item.event.title}}
          template(v-slot:item.actions='{ item }')
            v-menu(offset-y)
              template(v-slot:activator="{ on }")
                v-btn.mr-2(v-on='on' color='primary' small icon)
                  v-icon(v-text='mdiDotsVertical')
              v-list
                v-list-item(v-if='!item.hidden' @click='hideResource(item, true)')
                  v-list-item-title <v-icon left v-text='mdiEyeOff'></v-icon> {{$t('admin.hide_resource')}}
                v-list-item(v-else @click='hideResource(item, false)')
                  v-list-item-title <v-icon left v-text='mdiEye'></v-icon> {{$t('admin.show_resource')}}
                v-list-item(@click='deleteResource(item)')
                  v-list-item-title <v-icon left v-text='mdiDelete'></v-icon> {{$t('admin.delete_resource')}}
                //- v-list-item(@click='toggleUserBlock(item.ap_user)')
                //-   v-list-item-title <v-icon left>mdi-lock</v-icon> {{$t('admin.block_user')}}
</template>
<script>
import { mapState, mapActions } from 'vuex'
import get from 'lodash/get'
import { mdiDelete, mdiEye, mdiEyeOff, mdiDotsVertical, mdiCheckboxIntermediate,
mdiCheckboxBlankOutline, mdiChevronLeft, mdiChevronRight } from '@mdi/js'

export default {
  name: 'Moderation',
  data () {
    return {
      mdiDelete, mdiEye, mdiEyeOff, mdiDotsVertical, mdiCheckboxIntermediate,
      mdiCheckboxBlankOutline, mdiChevronLeft, mdiChevronRight,
      instances: [],
      resources: [],
      users: [],
      usersHeader: [
        { value: 'object.preferredUsername', text: 'Name' },
        { value: 'blocked', text: 'Blocked' }
      ],
      instancesHeader: [
        { value: 'domain', text: 'Domain' },
        { value: 'name', text: 'Name' },
        { value: 'blocked', text: 'Blocked' },
        { value: 'users', text: 'known users' }
      ],
      resourcesHeader: [
        { value: 'created', text: 'Created' },
        { value: 'event', text: 'Event' },
        { value: 'user', text: 'user' },
        { value: 'content', text: 'Content' },
        { value: 'actions', text: 'Actions' }
      ],
      usersFilter: '',
      instancesFilter: ''
    }
  },
  computed: mapState(['settings']),
  async mounted () {
    this.instances = await this.$axios.$get('/instances')
    if (!this.instances.length) {
      return
    }
    this.users = await this.$axios.$get(`/instances/${this.instances[0].domain}`)
    this.resources = await this.$axios.$get('/resources')
  },
  methods: {
    ...mapActions(['setSetting']),
    resourceStyle ({ row }) {
      if (row.hidden) {
        return { opacity: 0.5 }
      }
    },
    async instanceSelected (instance) {
      this.users = await this.$axios.$get(`/instances/${instance.domain}`)
      this.resources = await this.$axios.$get('/resources', { filters: { instance: instance.domain } })
    },
    async hideResource (resource, hidden) {
      await this.$axios.$put(`/resources/${resource.id}`, { hidden })
      resource.hidden = hidden
    },
    async toggleUserBlock (ap_user) {
      if (!ap_user.blocked) {
        const ret = await this.$root.$confirm('admin.user_block_confirm', { user: get(ap_user, 'object.preferredUsername', ap_user.preferredUsername) })
        if (!ret) { return }
      }
      await this.$axios.post('/instances/toggle_user_block', { ap_id: ap_user.ap_id })
      ap_user.blocked = !ap_user.blocked
    },
    async deleteResource (resource) {
      const ret = await this.$root.$confirm('admin.delete_resource_confirm')
      if (!ret) { return }
      await this.$axios.delete(`/resources/${resource.id}`)
      this.resources = this.resources.filter(r => r.id !== resource.id)
    },
    async toggleBlock (instance) {
      if (!instance.blocked) {
        const ret = await this.$root.$confirm('admin.instance_block_confirm', { instance: instance.domain })
        if (!ret) { return }
      }
      await this.$axios.post('/instances/toggle_block', { instance: instance.domain, blocked: !instance.blocked })
      instance.blocked = !instance.blocked
    }
  }
}
</script>
