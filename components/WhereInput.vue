<template lang="pug">
v-row
  v-col(cols=12 md=6)
    v-combobox(ref='place'
      :rules="[$validators.required('common.where')]"
      :label="$t('common.where')"
      :hint="$t('event.where_description')"
      :prepend-icon='mdiMapMarker'
      no-filter
      :value='value.name'
      hide-no-data
      @input.native='search'
      persistent-hint
      :items="places"
      @focus='search'
      @change='selectPlace')
      template(v-slot:item="{ item, attrs, on }")
        v-list-item(v-bind='attrs' v-on='on')
          v-list-item-content(two-line v-if='item.create')
            v-list-item-title <v-icon color='primary' v-text='mdiPlus' :aria-label='$t("common.add")'></v-icon> {{$t('common.add')}} <strong>{{item.name}}</strong>
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
import { mdiMap, mdiMapMarker, mdiPlus } from '@mdi/js'
import debounce from 'lodash/debounce'

export default {
  name: 'WhereInput',
  props: {
    value: { type: Object, default: () => ({}) }
  },
  data () {
    return {
      mdiMap, mdiMapMarker, mdiPlus,
      place: { },
      placeName: '',
      places: [],
      disableAddress: true
    }
  },
  computed: {
    filteredPlaces () {
      if (!this.placeName) { return this.places }
      const placeName = this.placeName.trim().toLowerCase()
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
    search: debounce(async function(ev) {
      const search = ev.target.value.trim().toLowerCase()
      this.places = await this.$axios.$get(`place?search=${search}`)
      if (!search && this.places.length) { return this.places }
      const matches = this.places.find(p => search === p.name.toLocaleLowerCase())
      if (!matches && search) {
        this.places.unshift({ create: true, name: ev.target.value.trim() })
      }
    }, 100),
    selectPlace (p) {
      if (!p) { return }
      if (typeof p === 'object' && !p.create) {
        this.place.name = p.name.trim()
        this.place.address = p.address
        this.place.id = p.id
        this.disableAddress = true
      } else { // this is a new place
        this.place.name = p.name || p
        const tmpPlace = this.place.name.trim().toLocaleLowerCase()
        // search for a place with the same name
        const place = this.places.find(p => !p.create && p.name.trim().toLocaleLowerCase() === tmpPlace)
        if (place) {
          this.place.name = place.name
          this.place.id = place.id
          this.place.address = place.address
          this.disableAddress = true
        } else {
          delete this.place.id
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
