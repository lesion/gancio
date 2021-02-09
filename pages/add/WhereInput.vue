<template lang="pug">
  v-row
    v-combobox.col-md-6(ref='place'
      :rules="[$validators.required('common.where')]"
      :label="$t('common.where')"
      :hint="$t('event.where_description')"
      :search-input.sync="placeName"
      prepend-icon='mdi-map-marker'
      persistent-hint
      :value="value.name"
      :items="filteredPlaces"
      no-filter
      item-text='name'
      @change='selectPlace')
      template(v-slot:item="{ item }")
        v-list-item-content(two-line v-if='item.create')
          v-list-item-title <v-icon color='primary'>mdi-plus</v-icon> {{item.name}}
        v-list-item-content(two-line v-else)
          v-list-item-title {{item.name}}
          v-list-item-subtitle {{item.address}}

    v-text-field.col-md-6(ref='address'
      prepend-icon='mdi-map'
      v-show='!disableAddress'
      :rules="[$validators.required('common.address')]"
      :label="$t('common.address')"
      @change="changeAddress"
      :value="value.address")

</template>
<script>
import { mapState } from 'vuex'

export default {
  name: 'WhereInput',
  props: {
    value: { type: Object, default: () => {} }
  },
  data () {
    return {
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
        if (tmpAddress.includes(placeName)) { return true }
        return false
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
        this.place.address = ''
        this.disableAddress = false
        this.$refs.place.blur()
        this.$refs.address.focus()
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
