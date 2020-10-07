<template lang='pug'>
  v-container
    v-card-title {{$t('common.places')}}
    v-card-subtitle(v-html="$t('admin.place_description')")

    v-dialog(v-model='dialog' width='600')
      v-card
        v-card-title {{$t('admin.edit_place')}}
        v-card-text
          v-form
            v-text-field(
              :label="$t('common.name')"
              v-model='place.name'
              :placeholder='$t("common.name")')

            v-text-field(
              :label="$t('common.address')"
              v-model='place.address'
              :placeholder='$t("common.address")')

        v-card-actions
            v-spacer
            v-btn(@click='dialog=false' color='warning') {{$t('common.cancel')}}
            v-btn(@click='savePlace' color='primary') {{$t('common.save')}}

    v-card-text
      v-data-table(
        @click:row='selectPlace'
        :headers='headers'
        :items='places')
        template(v-slot:item.actions='{item}')
          v-btn(@click='editPlace(item)' color='primary' icon)
            v-icon mdi-pencil
</template>
<script>
import { mapState } from 'vuex'
export default {
  data () {
    return {
      dialog: false,
      place: { name: '', address: '', id: null },
      headers: [
        { value: 'name', text: 'Name' },
        { value: 'address', text: 'Address' },
        { value: 'actions', text: 'Actions', align: 'right' }
      ]
    }
  },
  computed: mapState(['places']),
  methods: {
    editPlace (item) {
      console.error(item)
      // if (items.length === 0) {
      //   this.place.name = this.place.address = ''
      //   return
      // }
      // const item = items[0]
      this.place.name = item.name
      this.place.address = item.address
      this.place.id = item.id
      this.dialog = true
    },
    async savePlace () {
      await this.$axios.$put('/place', this.place)
      this.dialog = false
    }
  }
}
</script>
