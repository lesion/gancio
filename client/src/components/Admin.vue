<template lang="pug">
  b-modal(hide-footer hide-header
    @hide='$router.go(-1)' size='lg' :visible='true')
    h4.text-center Admin
    b-tabs(pills)
      b-tab
        template(slot='title')
          v-icon(name='users')
          span  {{$t('Users')}}
        b-table(:items='users' :fields='userFields' striped hover)
          template(slot='action' slot-scope='data')
            b-button.mr-1(:variant='data.item.is_active?"warning":"success"' @click='toggle(data.item)') {{data.item.is_active?$t('Deactivate'):$t('Activate')}}
            b-button(:variant='data.item.is_admin?"danger":"warning"' @click='toggleAdmin(data.item)') {{data.item.is_admin?$t('Remove Admin'):$t('Admin')}}
      b-tab
        template(slot='title')
          v-icon(name='map-marker-alt')
          span  {{$t('Places')}}
        b-table(:items='places' :fields='placeFields' striped hover)
      b-tab
        template(slot='title')
          v-icon(name='tag')
          span  {{$t('Tags')}}
        b-table(:items='tags' :fields='tagFields' striped hover)
          template(slot='tag' slot-scope='data')
            b-badge(:style='{backgroundColor: data.item.color}') {{data.item.tag}}
          template(slot='color' slot-scope='data')
            el-color-picker(v-model='data.item.color' @change='updateColor(data.item)')
      b-tab
        template(slot='title')
          v-icon(name='tools')
          span  {{$t('Settings')}}
        
</template>
<script>
import { mapState } from 'vuex'
import api from '@/api'

export default {
  name: 'Admin',
  data () {
    return {
      users: [],
      userFields: ['email', 'action'],
      placeFields: ['name', 'address'],
      tagFields: ['tag', 'color'],
      description: '',
    }
  },
  async mounted () {
    this.users = await api.getUsers()
  },
  computed: mapState(['tags', 'places']),
  methods: {
    async toggle(user) {
      user.is_active = !user.is_active
      const newuser = await api.updateUser(user)
    },
    async toggleAdmin(user) {
      user.is_admin = !user.is_admin
      const newuser = await api.updateUser(user)
    },
    async updateColor(tag) {
      const newTag = await api.updateTag(tag)
    }
  }
}
</script>
