<template lang="pug">
v-row.mb-4
  v-col(cols=12 md=6)
    //- this is the name used by people
    v-combobox(ref='place'
      :rules="[$validators.required('common.where')]"
      :label="$t('common.where')"
      :hint="$t('event.where_description')"
      :prepend-icon='mdiMapMarker'
      no-filter
      hide-no-data
      @input.native='search'
      persistent-hint
      :value='value.name'
      item-text='name'
      :items="places"
      @change='selectPlace')
      template(v-slot:item="{ item, attrs, on }")
        v-list-item(v-bind='attrs' v-on='on')
          v-list-item-content(two-line v-if='item.create')
            v-list-item-title <v-icon color='primary' v-text='mdiPlus' :aria-label='$t("common.add")'></v-icon> {{$t('common.add')}} <strong>{{item.name}}</strong>
          v-list-item-content(two-line v-else-if='item.online')
            v-list-item-title <v-icon color='primary' v-text='mdiLaptopAccount' :aria-label='$t("common.online")'></v-icon> {{$t('common.online')}}
          v-list-item-content(two-line v-else)
            v-list-item-title(v-text='item.name')
            v-list-item-subtitle(v-text='item.address')


  v-col(cols=12 md=6)
    v-row.mx-0.my-0.align-center.justify-center

      v-text-field.mr-4(ref='address' v-if="value.name !== 'online' || !settings.allow_online_event"
        v-model='value.address'
        :prepend-icon='mdiMap'
        :disabled='disableAddress'
        :rules="[ v => disableAddress ? true : $validators.required('common.address')(v)]"
        :label="$t('common.address')"
        :hint="$t('event.address_description')"
        persistent-hint)
        template(v-slot:append v-if="showAdvancedDialogButton")
          v-icon(v-text='mdiCog'
            @click="whereInputAdvancedDialog = true")

      v-combobox.mr-4(v-model="onlineLocations" v-else
        :prepend-icon='mdiLink'
        :hint="$t('event.online_locations_help')"
        :label="$t('event.online_locations')"
        :rules="[$validators.required('event.online_locations')]"
        clearable chips small-chips multiple deletable-chips hide-no-data hide-selected persistent-hint
        :delimiters="[',', ';', '; ']"
        :items="onlineLocations"
        @change='selectLocations')
        template(v-slot:selection="{ item, index, on, attrs, selected, parent }")
          v-chip(v-bind="attrs" :outlined='index !== 0'
            close :close-icon='mdiCloseCircle' @click:close='parent.selectItem(item)'
            :input-value="selected" label small) {{ item }}
        //- template(v-slot:append)
        //-   v-icon(v-text='mdiCog' :disabled='!value.name' @click="whereInputAdvancedDialog = true") 

    v-dialog(v-model='whereInputAdvancedDialog' destroy-on-close max-width='700px' :fullscreen='$vuetify.breakpoint.xsOnly' dense)
      WhereInputAdvanced(ref='whereAdvanced' :place.sync='value' :event='event'
        @close='whereInputAdvancedDialog = false && this.$refs.address.blur()'
        :onlineLocations.sync="onlineLocations"
        @update:onlineLocations="selectLocations")

    
</template>
<script>
import { mdiMap, mdiMapMarker, mdiPlus, mdiCog, mdiLink, mdiCloseCircle, mdiLaptopAccount } from '@mdi/js'
import { mapState } from 'vuex'
import debounce from 'lodash/debounce'
import WhereInputAdvanced from './WhereInputAdvanced.vue'

export default {
  name: 'WhereInput',
  props: {
    value: { type: Object, default: () => ({}) },
    event: { type: Object, default: () => null },
  },
  components: { WhereInputAdvanced },
  data ( {$store} ) {
    return {
      mdiMap, mdiMapMarker, mdiPlus, mdiCog, mdiLink, mdiCloseCircle, mdiLaptopAccount,
      places: [],
      place: { isNew: false },
      placeName: '',
      disableAddress: true,
      whereInputAdvancedDialog: false,
      onlineLocations: this.event.online_locations || [],
    }
  },
  computed: {
    ...mapState(['settings']),
    showAdvancedDialogButton () {

      // do not show advanced dialog button in case geolocation and online events are not allowed
      if (!(this.settings.allow_geolocation || this.settings.allow_online_event)) {
        return false
      }

      // known places already have coords
      if (!this.place.isNew && !this.settings.allow_online_event) return false

      return true
    }
  },
  mounted () {
    this.$nextTick( () => {
      this.search()
    })
  },
  methods: {
    search: debounce(async function(ev) {
      const search = ev ? ev.target.value.trim().toLowerCase() : ''
      this.places = await this.$axios.$get('place', { params: { search } })

      // Filter out the place with name 'online' if not allowed
      if (this.places.length) {
        this.places = this.places.filter(p => p.name !== 'online')
      }
      if (this.settings.allow_online_event) {
        this.places.push({ online: true, name: 'online' })
      }

      if (!search && this.places.length) { 
        return this.places 
      }
      const matches = this.places.find(p => search === p.name.toLocaleLowerCase())
      if (!matches && search) {
        this.places.unshift({ create: true, name: ev.target.value.trim() })
      }
    }, 200),
    selectPlace (p) {
      // force online events under place: online address: online
      // this.event_only_online = false
      this.place.isNew = false
      // this.whereAdvancedId++

      if (!p) { return }
      if (typeof p === 'object' && !p.create && !p.online) {
        if (p.id === this.value.id) return
        this.place.name = p.name
        this.place.address = p.address
        if (this.settings.allow_geolocation) {
          this.place.latitude = p.latitude
          this.place.longitude = p.longitude
        }
        this.place.id = p.id
        // if (this.settings.allow_event_only_online && this.place.name === 'online') {
        //   this.event_only_online = true 
        // }
        this.disableAddress = true
      } else { // this is a new place
        this.place.isNew = true
        this.place.name = (p.name || p).trim()
        const tmpPlace = this.place.name.toLocaleLowerCase()
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
          if (this.settings.allow_geolocation) {
            this.place.latitude = p.latitude
            this.place.longitude = p.longitude
          }
          // If 'event only online' is not allowed: reset place and online_locations
          // if (this.place.name === 'online') {
          //   if (!this.settings.allow_event_only_online) {
          //     this.$nextTick(() => { this.$refs.place && this.$refs.place.setValue('') && this.$refs.place.focus() })
          //     this.event.online_locations = []
          //     return
          //   } else {
          //     this.event_online_only = true
          //   }
          // } 
          this.disableAddress = false
          this.$refs.place.blur()
          this.$nextTick(() => { this.$refs.address && this.$refs.address.focus() })
        }
      }
      this.$emit('input', { ...this.place })
    },
    selectLocations () {
      this.event.online_locations = []

      if (this.onlineLocations) {
        // Insert up to 3 online location: the main one and 2 fallback
        if (this.onlineLocations.length > 3) {
          this.$nextTick(() => this.onlineLocations = this.onlineLocations.slice(0, 3))
        }
        // Remove duplicates
        this.$nextTick(() => this.onlineLocations = [...new Set(this.onlineLocations)])
        
        this.onlineLocations.forEach((item, i) => {
          if (!item.startsWith('http')) { this.onlineLocations[i] = `https://${item}` }
          this.event.online_locations[i] = this.onlineLocations[i]
        })
      }
    },
  //   changeEventOnlyOnline(v) {
  //     this.event_only_online = v
  //     // console.log(this.event_only_online)
  //     if (this.event_only_online) { this.place.name = this.place.address = 'online' }
  //     if (!this.event_only_online) { this.place.name = this.place.address = ''; this.onlineLocations = [] }
  //     this.place.latitude = null
  //     this.place.longitude = null

  //     // Update onlineLocations
  //     this.event.online_locations && this.selectLocations()
  //     this.$emit('input', { ...this.place })
  //   },
  }
}
</script>
