<template lang='pug'>
  v-container
    v-card-title {{$t('common.places')}}
    v-card-subtitle(v-html="$t('admin.place_description')")

    v-dialog(v-model='dialog' width='600')
      v-card(color='secondary')
        v-card-title {{$t('admin.edit_place')}}
        v-card-text
          v-form(v-model='valid' ref='form' lazy-validation)
            v-text-field(
              :rules="[$validators.required('common.name')]"
              :label="$t('common.name')"
              v-model='place.name'
              :placeholder='$t("common.name")')

            v-text-field(
              :rules="[$validators.required('common.address')]"
              :label="$t('common.address')"
              v-model='place.address'
              :placeholder='$t("common.address")')

        v-card-actions
            v-spacer
            v-btn(@click='dialog=false' color='warning') {{$t('common.cancel')}}
            v-btn(@click='savePlace' color='primary' :loading='loading'
              :disable='!valid || loading') {{$t('common.save')}}

    v-card-text
      v-data-table(
        :headers='headers'
        :items='places')
        template(v-slot:item.actions='{item}')
          v-btn(@click='editPlace(item)' color='primary' icon)
            v-icon mdi-pencil
</template>
<script>
import { mapState, mapActions } from 'vuex'
export default {
  data () {
    return {
      loading: false,
      dialog: false,
      valid: false,
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
    ...mapActions(['updateMeta']),
    editPlace (item) {
      this.place.name = item.name
      this.place.address = item.address
      this.place.id = item.id
      this.dialog = true
    },
    async savePlace () {
      if (!this.$refs.form.validate()) return
      this.loading = true
      await this.$axios.$put('/place', this.place)
      this.updateMeta()
      this.loading = false
      this.dialog = false
    }
  }
}
</script>
