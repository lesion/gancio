<template lang='pug'>
  v-container
    v-row
      v-col(:span='12')
        //- el-divider {{$t('common.instances')}}
        v-text-field(v-model='instancesFilter' :placeholder="$t('admin.filter_instances')")
        v-data-table(:data='paginatedInstances' small @row-click='instanceSelected')
          //- el-table-column(label='Domain' width='180')
          //-   template(slot-scope='data')
          //-     span(slot='reference') {{data.row.domain}}
          //- el-table-column(label='Name' width='100')
          //-   template(slot-scope='data')
          //-     span(slot='reference') {{data.row.name}}
          //- el-table-column(:label="$t('common.users')" width='70')
          //-   template(slot-scope='data')
          //-     span(slot='reference') {{data.row.users}}
          //- el-table-column(:label="$t('common.actions')" width='120')
          //-   template(slot-scope='data')
          //-     el-button-group
          //-       el-button(size='mini'
          //-         :type='data.row.blocked?"danger":"warning"'
          //-         @click='toggleBlock(data.row)') {{data.row.blocked?$t('admin.unblock'):$t('admin.block')}}

      v-col.float-right(:span='11' align='right')
        //- el-divider {{$t('common.users')}}
        v-text-field(v-model='usersFilter' :placeholder="$t('admin.filter_users')")
        v-data-table(:data='paginatedSelectedUsers' small)
          //- el-table-column(:label="$t('common.user')" width='150')
          //-   template(slot-scope='data')
          //-     span(slot='reference')
          //-       a(:href='data.row.object.id' target='_blank') {{data.row.object.name}}
          //-       small ({{data.row.object.preferredUsername}})
          //- el-table-column(:label="$t('common.resources')" width='90')
          //-   template(slot-scope='data')
          //-     span {{data.row.resources.length}}
          //- el-table-column(:label="$t('common.actions')" width='200')
          //-   template(slot-scope='data')
          //-     el-button-group
          //-       el-button(size='mini'
          //-         :type='data.row.blocked?"danger":"warning"'
          //-         @click='toggleUserBlock(data.row)') {{data.row.blocked?$t('admin.unblock'):$t('admin.block')}}

    div
      //- el-divider {{$t('common.resources')}}
      v-table(:data='paginatedResources' small :row-style='resourceStyle')
        //- el-table-column(:label="$t('common.event')")
        //-   template(slot-scope='data')
        //-     span {{data.row.event}}
        //- el-table-column(:label="$t('common.resources')")
        //-   template(slot-scope='data')
        //-     span(:class='{disabled: data.row.hidden}' v-html='data.row.data.content')
        //- el-table-column(:label="$t('common.user')" width='200')
        //-   template(slot-scope='data')
        //-     span(:class='{disabled: data.row.hidden}' v-html='data.row.data.actor')
        //- el-table-column(:label="$t('common.actions')" width="150")
        //-   template(slot-scope='data')
        //-     el-dropdown
        //-       el-button(type="primary" icon="el-icon-arrow-down" size='mini') {{$t('common.moderation')}}
        //-       el-dropdown-menu(slot='dropdown')
        //-         el-dropdown-item(v-if='!data.row.hidden' icon='el-icon-remove' @click.native='hideResource(data.row, true)') {{$t('admin.hide_resource')}}
        //-         el-dropdown-item(v-else icon='el-icon-success' @click.native='hideResource(data.row, false)') {{$t('admin.show_resource')}}
        //-         el-dropdown-item(icon='el-icon-delete' @click.native='deleteResource(data.row)') {{$t('admin.delete_resource')}}
        //-         el-dropdown-item(icon='el-icon-lock' @click.native='toggleUserBlock(data.row.ap_user)') {{$t('admin.block_user')}}
</template>
<script>
import { mapState, mapActions } from 'vuex'
import { MessageBox } from 'element-ui'

export default {
  name: 'Moderation',
  data () {
    return {
      perPage: 10,
      instancePage: 1,
      instancesFilter: '',
      instances: [],
      resources: [],
      resourcePage: 1,
      usersFilter: '',
      users: [],
      userPage: 1
    }
  },
  computed: {
    ...mapState(['settings']),
    paginatedResources () {
      return this.resources.slice((this.resourcePage - 1) * this.perPage,
        this.resourcePage * this.perPage)
    },
    paginatedInstances () {
      return this.filteredInstances.slice((this.instancePage - 1) * this.perPage,
        this.instancePage * this.perPage)
    },
    filteredUsers () {
      if (!this.usersFilter) { return this.users }
      const usersFilter = this.usersFilter.toLowerCase()
      return this.users.filter(user => user.name.includes(usersFilter) || user.preferredName.includes(usersFilter))
    },
    filteredInstances () {
      if (!this.instancesFilter) { return this.instances }
      const instancesFilter = this.instancesFilter.toLowerCase()
      return this.instances.filter(instance =>
        (instance.name && instance.name.includes(instancesFilter)) ||
        (instance.domain && instance.domain.includes(instancesFilter))
      )
    },
    paginatedSelectedUsers () {
      return this.filteredUsers.slice((this.userPage - 1) * this.perPage,
        this.userPage * this.perPage)
    }
  },
  async mounted () {
    this.instances = await this.$axios.$get('/instances')
    this.resources = await this.$axios.$get('/resources')
    // this.users = await this.$axios.$get('/users')
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
    },
    async hideResource (resource, hidden) {
      await this.$axios.$put(`/resources/${resource.id}`, { hidden })
      resource.hidden = hidden
    },
    async toggleUserBlock (ap_user) {
      try {
        if (!ap_user.blocked) {
          await this.$root.$confirm(this.$t('admin.user_block_confirm'), {
            confirmButtonText: this.$t('common.ok'),
            cancelButtonText: this.$t('common.cancel'),
            type: 'error'
          })
        }
        await this.$axios.post('/instances/toggle_user_block', { ap_id: ap_user.ap_id })
        ap_user.blocked = !ap_user.blocked
      } catch (e) { }
    },
    deleteResource (resource) {
      this.$root.$confirm(this.$t('admin.delete_resource_confirm'),
        this.$t('common.confirm'), {
          confirmButtonText: this.$t('common.ok'),
          cancelButtonText: this.$t('common.cancel'),
          type: 'error'
        }
      ).then(() => {
        this.$axios.delete(`/resources/${resource.id}`)
        this.resources = this.resources.filter(r => r.id !== resource.id)
      })
    },
    async toggleBlock (instance) {
      await this.$axios.post('/instances/toggle_block', { instance: instance.domain, blocked: !instance.blocked })
      instance.blocked = !instance.blocked
    }
  }
}
</script>
