<template lang='pug'>
  v-container
    v-subheader(v-html="$t('admin.place_description')")

    v-dialog
      v-form.mb-2
        //- el-form-item(:label="$t('common.name')")
        //-   el-input.mr-1(:placeholder='$t("common.name")' v-model='place.name')
        v-text-field(
          :label="$t('common.name')"
          v-model='place.name'
          :placeholder='$t("common.name")')

        v-text-field(
          :label="$t('common.address')"
          v-model='place.address'
          :placeholder='$t("common.address")')

        v-btn(@click='savePlace') {{$t('common.save')}}

    v-data-table(
      @click:row='selectPlace'
      :headers='headers'
      :items='places')
</template>
<script>
import { mapState } from 'vuex'
export default {
  data () {
    return {
      place: { name: '', address: '', id: null },
      headers: [
        { value: 'name', text: 'Name' }
      ]
    }
  },
  computed: mapState(['places']),
  methods: {
    selectPlace (item) {
      // if (items.length === 0) {
      //   this.place.name = this.place.address = ''
      //   return
      // }
      // const item = items[0]
      this.place.name = item.name
      this.place.address = item.address
      this.place.id = item.id
    },
    async savePlace () {
      await this.$axios.$put('/place', this.place)
    }
  }
}
</script>
