<template lang="pug">
  #navsearch.mt-2.mt-sm-4(v-if='showCollectionsBar || showSearchBar || showCalendar')

    div.mx-2
      client-only(v-if='showSearchBar')
        v-menu(offset-y :close-on-content-click='false' tile)
          template(v-slot:activator="{on ,attrs}")
            v-text-field(hide-details outlined v-model='query'
              :placeholder='$t("common.search")' @click:clear="setFilter(['query', null])"
              @keypress.enter="setFilter(['query', query])" clearable :clear-icon='mdiClose')
              template(v-slot:append)
                v-icon.mr-2(v-if='query' v-text='mdiMagnify' @click="setFilter(['query', query])")
                v-icon(v-if='settings.allow_recurrent_event || settings.allow_multidate_event' v-text='mdiCog' v-bind='attrs' v-on='on')
          v-card(outlined :rounded='"0"')
            v-card-text
              v-row(dense)
                v-col(v-if='settings.allow_recurrent_event')
                  v-switch.mt-0(v-model='show_recurrent' @change="v => setFilter(['show_recurrent', v])"
                    hide-details :label="$t('event.show_recurrent')" inset)
                v-col(v-if='settings.allow_multidate_event')
                  v-switch.mt-0(v-model='show_multidate' @change="v => setFilter(['show_multidate', v])"
                    hide-details :label="$t('event.show_multidate')" inset)
              v-row(v-if='!showCalendar')
                v-col
                  Calendar.mt-2
        v-text-field(slot='placeholder' outlined hide-details :placeholder="$t('common.search')" :append-icon='mdiCog')

      span(v-if='showCollectionsBar')
        v-btn.mr-2.mt-2(small outlined v-for='collection in collections'
          color='primary' :key='collection.id'
          :to='`/collection/${encodeURIComponent(collection.name)}`') {{collection.name}}

      Calendar.mt-2(v-if='showCalendar')

    
</template>
<script>
import { mapState, mapActions } from 'vuex'
import Calendar from '@/components/Calendar'
import { mdiClose, mdiCog, mdiMagnify } from '@mdi/js'

export default {
  data: ({ $store }) => ({
    oldRoute: '',
    mdiClose, mdiCog, mdiMagnify,
    collections: [],
    show_recurrent: $store.state.settings.recurrent_event_visible,
    show_multidate: true,
    query: ''
  }),
  async fetch () {
    this.collections = await this.$axios.$get('collections').catch(_e => [])
  },
  components: { Calendar },
  computed: {
    showSearchBar () {
      return this.$route.name === 'index'
    },
    showCalendar () {
      return (!this.settings.hide_calendar && this.$route.name === 'index')
    },
    showCollectionsBar () {
      const show = ['index', 'collection-collection'].includes(this.$route.name)
      if (show && this.oldRoute !== this.$route.name) {
        this.oldRoute = this.$route.name
        this.$fetch()
      }
      return show
    },
    ...mapState(['settings', 'filter'])
  },
  methods: {
    ...mapActions(['setFilter']),
  }
}
</script>
<style>
#navsearch {
  margin: 0 auto;
  max-width: 700px;
}
</style>
