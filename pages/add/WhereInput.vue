<template lang="pug">
v-row
  v-col(cols=12 md=6)
    v-combobox(ref='place'
      :rules="[$validators.required('common.where')]"
      :label="$t('common.where')"
      :hint="$t('event.where_description')"
      :search-input.sync="placeName"
      :prepend-icon='mdiMapMarker'
      persistent-hint
      :value="value.name"
      :items="filteredPlaces"
      no-filter
      item-text='name'
      @change='selectPlace')
      template(v-slot:item="{ item, attrs, on }")
        v-list-item(v-bind='attrs' v-on='on')
          v-list-item-content(two-line v-if='item.create')
            v-list-item-title <v-icon color='primary' v-text='mdiPlus' :aria-label='$t("common.add")'></v-icon> {{item.name}}
          v-list-item-content(two-line v-else)
            v-list-item-title(v-text='item.name')
            v-list-item-subtitle(v-text='item.address')

  v-col(cols=12 md=6)
    v-text-field(ref='address'
      :prepend-icon='mdiMap'
      :disabled='disableAddress'
      :rules="[ v => disableAddress ? true : $validators.required('common.address')(v)]"
      :label="$t('common.address')"
      @change="changeAddress"
      :value="value.address")

</template>
<script>
import { mapState } from 'vuex'
import { mdiMap, mdiMapMarker, mdiPlus } from '@mdi/js'

export default {
  name: 'WhereInput',
  props: {
    value: { type: Object, default: () => {} }
  },
  data () {
    return {
      mdiMap, mdiMapMarker, mdiPlus,
      place: { },
      placeName: '',
      disableAddress: true
    }
  },
  computed: {
    ...mapState(['places']),
    filteredPlaces () {
      if (!this.placeName) { return this.places }
      const placeName = this.placeName.toLowerCase()
      let nameMatch = false
      const matches = this.places.filter(p => {
        const tmpName = p.name.toLowerCase()
        const tmpAddress = p.address.toLowerCase()
        if (tmpName.includes(placeName)) {
          if (tmpName === placeName) { nameMatch = true }
          return true
        }
        return tmpAddress.includes(placeName)
      })
      if (!nameMatch) {
        matches.unshift({ create: true, name: this.placeName })
      }
      return matches
    }
  },
  methods: {
    selectPlace (p) {
      if (!p) { return }
      if (typeof p === 'object' && !p.create) {
        this.place.name = p.name
        this.place.address = p.address
        this.disableAddress = true
      } else { // this is a new place
        this.place.name = p.name || p
        // search for a place with the same name
        const place = this.places.find(p => p.name === this.place.name)
        if (place) {
          this.place.address = place.address
          this.disableAddress = true
        } else {
          this.place.address = ''
          this.disableAddress = false
          this.$refs.place.blur()
          this.$refs.address.focus()
        }
      }
      this.$emit('input', { ...this.place })
    },
    changeAddress (v) {
      this.place.address = v
      this.$emit('input', { ...this.place })
    }
  }
}
</script>
