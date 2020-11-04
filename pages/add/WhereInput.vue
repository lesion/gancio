<template lang="pug">
  v-row
    v-combobox.col-md-6(ref='place'
      :rules="[$validators.required('common.where')]"
      :label="$t('common.where')"
      :hint="$t('event.where_description')"
      :hide-no-data="!place._name"
      :search-input.sync="place._name"
      prepend-icon='mdi-map-marker'
      persistent-hint
      :value="value.name"
      :items="places"
      item-text='name'
      @change='selectPlace')
      template(v-slot:no-data)
        v-list-item(@click='createPlace')
          v-list-item-content Create {{place._name}}

    v-text-field.col-md-6(ref='address'
      prepend-icon='mdi-map'
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
      if (typeof p === 'object') {
        if (p === null) { return }
        this.place.name = p.name
        this.place.address = p.address
        this.disableAddress = true
      } else { // this is a new place
        this.place.name = p
        this.disableAddress = false
        this.$refs.place.blur()
        this.$refs.address.focus()
      }
      this.$emit('input', { ...this.place })
    },
    changeAddress (v) {
      this.place.address = v
      this.$emit('input', { ...this.place })
    },
    createPlace (v) {
      this.$refs.place.blur()
      this.$refs.address.focus()
    }
  }
}
</script>
