<template lang="pug">
  v-row
    v-combobox.col-md-6(ref='place'
      :rules="[$validators.required('common.where')]"
      :label="$t('common.where')"
      :hint="$t('event.where_description')"
      :hide-no-data="!place._name"
      :search-input.sync="place._name"
      persistent-hint
      :value="value.place"
      :items="places"
      item-text='name'
      @change='selectPlace')
      template(v-slot:no-data)
        v-list-item
          p Create {{place._name}}

    v-text-field.col-md-6(ref='address'
      :disabled='disableAddress'
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
      place: { _name: '' },
      disableAddress: true
    }
  },
  computed: {
    ...mapState(['places'])
  },
  methods: {
    selectPlace (p) {
      console.error(p)
      const place = p && this.places.find(place => place.id === p.id)
      if (place && place.address) {
        this.place.name = p.name
        this.place.address = place.address
        this.disableAddress = true
      } else {
        this.disableAddress = false
        this.$refs.place.blur()
        this.$refs.address.focus()
      }
      this.$emit('input', this.place)
    },
    changeAddress (v) {
      this.place.address = v
      this.$emit('input', this.place)
    }
  }
}
</script>
