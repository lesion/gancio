<template lang="pug">
  b-modal(hide-footer hide-header
    @hide='$router.replace("/")' size='lg' :visible='true')
    h4.text-center Admin
    b-tabs(pills)

      b-tab.pt-1
        template(slot='title')
          v-icon(name='users')
          span  {{$t('Users')}}
        b-table(:items='users' :fields='userFields' striped small hover
          :per-page='5' :current-page='userPage')
          template(slot='action' slot-scope='data')
            b-button.mr-1(:variant='data.item.is_active?"warning":"success"' @click='toggle(data.item)') {{data.item.is_active?$t('Deactivate'):$t('Activate')}}
            b-button(:variant='data.item.is_admin?"danger":"warning"' @click='toggleAdmin(data.item)') {{data.item.is_admin?$t('Remove Admin'):$t('Admin')}}
        b-pagination(:per-page='5' v-model='userPage' :total-rows='users.length')
      b-tab.pt-1
        template(slot='title')
          v-icon(name='map-marker-alt')
          span  {{$t('Places')}}
        p You can change place's name or address
        b-form.mb-2(inline)
          b-input.mr-1(:placeholder='$t("Name")' v-model='place.name')
          b-input.mr-1(:placeholder='$t("Address")' v-model='place.address')
          b-button(variant='primary' @click='savePlace') {{$t('Save')}}
        b-table(selectable :items='places' :fields='placeFields' striped hover 
          small selectedVariant='success'  primary-key='id' 
          select-mode="single" @row-selected='placeSelected'
          :per-page='5' :current-page='placePage')
        b-pagination(:per-page='5' v-model='placePage' :total-rows='places.length')
      b-tab.pt-1
        template(slot='title')
          v-icon(name='tag')
          span  {{$t('Tags')}}
        p You can choose colors of your tags
        b-table(:items='tags' :fields='tagFields' 
          striped small hover :per-page='10' :current-page='tagPage')
          template(slot='tag' slot-scope='data')
            b-badge(:style='{backgroundColor: data.item.color}') {{data.item.tag}}
          template(slot='color' slot-scope='data')
            el-color-picker(v-model='data.item.color' @change='updateColor(data.item)')
        b-pagination(:per-page='10' v-model='tagPage' :total-rows='tags.length')
      b-tab.pt-1
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