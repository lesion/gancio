<template lang="pug">
  div
    el-form(label-width='200px')
      el-form-item(:label="$t('admin.enable_federation')")
        el-popover(:content="$t('admin.enable_federation_help')" placement='right' trigger='hover')
          span(slot='reference')
            el-switch(v-model='enable_federation')

      el-form-item(v-show='enable_federation' :label="$t('admin.enable_resources')")
        el-popover(:content="$t('admin.enable_resources_help')" placement='right' trigger='hover')
          span(slot='reference')
            el-switch(v-model='enable_resources')

      el-form-item(v-show='enable_federation' :label="$t('admin.hide_boost_bookmark')")
        el-popover(:content="$t('admin.hide_boost_bookmark_help')" placement='right' trigger='hover')
          span(slot='reference')
            el-switch(v-model='hide_boosts')

      el-form-item(v-show='enable_federation' :label="$t('admin.instance_name')")
        el-popover(:content="$t('admin.instance_name_help')" placement='right' trigger='hover')
          span(slot='reference')
            el-input.w-25(v-model='instance_name' placeholder='Instance name')
        p Follow this instance from <u>@{{instance_name}}@{{settings.baseurl|url2host}}</u>
      el-row(v-if='enable_federation')
        el-col(:span='12')
          el-divider {{$t('common.instances')}}
          el-input(v-model='instancesFilter' :placeholder="$t('admin.filter_instances')")
          el-table(:data='paginatedInstances' small @row-click='instanceSelected')
            el-table-column(label='Domain' width='180')
              template(slot-scope='data')
                span(slot='reference') {{data.row.domain}}
            el-table-column(label='Name' width='100')
              template(slot-scope='data')
                span(slot='reference') {{data.row.name}}
            el-table-column(label='Users' width='60')
              template(slot-scope='data')
                span(slot='reference') {{data.row.users}}
            el-table-column(:label="$t('common.actions')" width='120')
              template(slot-scope='data')
                el-button-group
                  el-button(size='mini'
                    :type='data.row.blocked?"danger":"warning"'
                    @click='toggleBlock(data.row)') {{data.row.blocked?$t('admin.unblock'):$t('admin.block')}}
          client-only
            el-pagination(v-if='enable_federation && instances.length>perPage' :page-size='perPage' :currentPage.sync='instancePage' :total='instances.length')

        el-col.float-right(:span='11' align='right')
          el-divider {{$t('common.users')}}
          el-input(v-model='usersFilter' :placeholder="$t('admin.filter_users')")
          client-only
            el-pagination(v-if='enable_federation && users.length>perPage' :page-size='perPage' :currentPage.sync='instancePage' :total='users.length')
          el-table(:data='paginatedSelectedUsers' small)
            el-table-column(label='User' width='150')
              template(slot-scope='data')
                span(slot='reference')
                  a(:href='data.row.object.id' target='_blank') {{data.row.object.name}}
                  small ({{data.row.object.preferredUsername}})
            el-table-column(:label="$t('common.resources')" width='90')
              template(slot-scope='data')
                span {{data.row.resources.length}}
            el-table-column(:label="$t('common.actions')" width='200')
              template(slot-scope='data')
                el-button-group
                  el-button(size='mini'
                    :type='data.row.blocked?"danger":"warning"'
                    @click='toggleUserBlock(data.row)') {{data.row.blocked?$t('admin.unblock'):$t('admin.block')}}

      //- div(v-show='enable_federation')
        el-divider {{$t('common.resources')}}
        el-table(:data='paginatedResources' small :row-style='resourceStyle')
          el-table-column(:label="$t('common.event')")
            template(slot-scope='data')
              span {{data.row.event}}
          el-table-column(:label="$t('common.resources')")
            template(slot-scope='data')
              span(:class='{disabled: data.row.hidden}' v-html='data.row.data.content')
          el-table-column(:label="$t('common.actions')" width="150")
            template(slot-scope='data')
              el-dropdown
                el-button(type="primary" icon="el-icon-arrow-down" size='mini') {{$t('common.moderation')}}
                el-dropdown-menu(slot='dropdown')
                  el-dropdown-item(v-if='!data.row.hidden' icon='el-icon-remove' @click.native='toggleHideResource(data.row)') {{$t('admin.hide_resource')}}
                  el-dropdown-item(v-else icon='el-icon-success' @click.native='toggleHideResource(data.row)') {{$t('admin.show_resource')}}
                  el-dropdown-item(icon='el-icon-delete' @click.native='deleteResource(data.row)') {{$t('admin.delete_resource')}}
                  el-dropdown-item(icon='el-icon-lock' @click.native='blockUser(data.row)') {{$t('admin.block_user')}}

</template>
<script>
import { mapState, mapActions, mapGetters } from 'vuex'

export default {
  name: 'Federation',
  data () {
    return {
      perPage: 10,
      instancePage: 1,
      userPage: 1,
      resourcePage: 1,
      usersFilter: '',
      instancesFilter: '',
      users: [],
      resources: [],
      instances: []
    }
  },
  async mounted () {
    this.instances = await this.$axios.$get('/instances')
    this.resources = await this.$axios.$get('/resources')
    // this.users = await this.$axios.$get('/users')
  },
  methods: {
    ...mapActions(['setSetting']),
    // resourceStyle ({ row }) {
    //   if (row.hidden) return 'opacity: 0.5'
    // },
    async instanceSelected (instance) {
      this.users = await this.$axios.$get(`/instances/${instance.domain}`)
    },
    async toggleBlock (instance) {
      await this.$axios.post('/instances/toggle_block', { instance: instance.domain, blocked: !instance.blocked })
      instance.blocked = !instance.blocked
    },
    async toggleUserBlock (user) {
      await this.$axios.post('/instances/toggle_user_block', { user_id: user.ap_id })
      user.blocked = !user.blocked
    },
    async toggleHideResource (resource) {
      await this.$axios.put(`/resources/${resource.id}`, { hidden: !resource.hidden })
      resource.hidden = !resource.hidden
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
      this.usersFilter = this.usersFilter.toLowerCase()
      console.error(this.users)
      return this.users.filter(user => user.name.includes(this.usersFilter) || user.preferredName.includes(this.usersFilter))
    },
    filteredInstances () {
      if (!this.instancesFilter) { return this.instances }
      this.instancesFilter = this.instancesFilter.toLowerCase()
      return this.instances.filter(instance => instance.name.includes(this.instancesFilter) || instance.domain.includes(this.instancesFilter))
    },
    paginatedSelectedUsers () {
      return this.filteredUsers.slice((this.userPage - 1) * this.perPage,
        this.userPage * this.perPage)
    },
    instance_name: {
      get () { return this.settings.instance_name },
      set (value) { this.setSetting({ key: 'instance_name', value }) }
    },
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
    }
  }
}
</script>
<style lang="less">
.instance_thumb {
  height: 20px;
}
</style>
