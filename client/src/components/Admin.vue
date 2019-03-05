<template lang="pug">
  b-modal(@hidden='$router.replace("/")' :title='$t("Admin")' :visible='true' size='lg')
    el-tabs
      el-tab-pane.pt-1
        template(slot='label')
          v-icon(name='users')
          span.ml-1 {{$t('Users')}}
        b-table(:items='users' :fields='userFields' striped small hover
          :per-page='5' :current-page='userPage')
          template(slot='action' slot-scope='data')
            el-button.mr-1(size='mini' :type='data.item.is_active?"warning":"success"' @click='toggle(data.item)') {{data.item.is_active?$t('Deactivate'):$t('Activate')}}
            el-button(size='mini' :type='data.item.is_admin?"danger":"warning"' @click='toggleAdmin(data.item)') {{data.item.is_admin?$t('Remove Admin'):$t('Admin')}}
        b-pagination(:per-page='5' v-model='userPage' :total-rows='users.length')
      el-tab-pane.pt-1
        template(slot='label')
          v-icon(name='map-marker-alt')
          span.ml-1 {{$t('Places')}}
        p You can change place's name or address
        el-form.mb-2(:inline='true' label-width='120px')
          el-form-item(:label="$t('Name')")
            el-input.mr-1(:placeholder='$t("Name")' v-model='place.name')
          el-form-item(:label="$t('Address')")
            el-input.mr-1(:placeholder='$t("Address")' v-model='place.address')
          el-button(variant='primary' @click='savePlace') {{$t('Save')}}
        b-table(selectable :items='places' :fields='placeFields' striped hover 
          small selectedVariant='success'  primary-key='id' 
          select-mode="single" @row-selected='placeSelected'
          :per-page='5' :current-page='placePage')
        b-pagination(:per-page='5' v-model='placePage' :total-rows='places.length')

      el-tab-pane.pt-1
        template(slot='label')
          v-icon(name='tag')
          span  {{$t('Tags')}}
        p You can choose colors of your tags
        el-table(:data='tags' striped small hover :per-page='10' :current-page='tagPage')
          el-table-column(label='Tag')
            template(slot-scope='data')
              el-tag(:color='data.row.color' size='mini') {{data.row.tag}}
          el-table-column(label='Color')
            template(slot-scope='data')
              el-color-picker(v-model='data.row.color' @change='updateColor(data.row)')
        b-pagination(:per-page='10' v-model='tagPage' :total-rows='tags.length')
      el-tab-pane.pt-1
        template(slot='label')
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
      placePage: 1,
      userPage: 1,
      tagPage: 1,
      tagFields: ['tag', 'color'],
      description: '',
      place: {name: '', address: '' }
    }
  },
  async mounted () {
    this.users = await api.getUsers()
  },
  computed: mapState(['tags', 'places']),
  methods: {
    placeSelected (items) {
      const item = items[0]
      this.place.name = item.name
      this.place.address = item.address
      this.place.id = item.id
    },
    async savePlace () {
      const place = await api.updatePlace(this.place)

    },
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