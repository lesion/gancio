<template lang='pug'>
  div
    p(v-html="$t('admin.place_description')")
    el-form.mb-2(:inline='true' label-width='120px')
      el-form-item(:label="$t('common.name')")
        el-input.mr-1(:placeholder='$t("common.name")' v-model='place.name')
      el-form-item(:label="$t('common.address')")
        el-input.mr-1(:placeholder='$t("common.address")' v-model='place.address')
      el-button(variant='primary' @click='savePlace') {{$t('common.save')}}
    el-table(:data='paginatedPlaces' small @current-change="val => place=val")
      el-table-column(:label="$t('common.name')")
        template(slot-scope='data') {{data.row.name}}
      el-table-column(:label="$t('common.address')")
        template(slot-scope='data') {{data.row.address}}
    no-ssr
      el-pagination(:page-size='perPage' :currentPage.sync='placePage' :total='places.length')
</template>
<script>
import { mapState, mapActions } from 'vuex'
export default {
	data () {
		return {
      perPage: 10,
      placePage: 0,
      place: { name: '', address: '', id: null}
    }
  },
  computed: {
    ...mapState(['places']),
    paginatedPlaces () {
      return this.places.slice((this.placePage-1) * this.perPage,
        this.placePage * this.perPage)
    },
  },
  methods: {
		placeSelected (items) {
			if (items.length === 0 ) {
				this.place.name = this.place.address = ''
				return
			}
			const item = items[0]
			this.place.name = item.name
			this.place.address = item.address
			this.place.id = item.id
		},
    async savePlace () {
      const place = await this.$axios.$put('/place', this.place)
    },
  }
}
</script>

