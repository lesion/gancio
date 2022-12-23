<template lang="pug">
  #navsearch.mt-2.mt-sm-4(v-if='showCollectionsBar || showSearchBar')
    v-text-field.mx-2(v-if='showSearchBar' outlined dense hide-details :placeholder='$t("common.search")' :append-icon='mdiMagnify' @input='search' clearable :clear-icon='mdiClose')
      template(v-slot:prepend-inner)
        Calendar(v-if='!settings.hide_calendar')
    v-btn.ml-2.mt-2.gap-2(v-if='showCollectionsBar' small outlined v-for='collection in collections' color='primary' :key='collection.id' :to='`/collection/${encodeURIComponent(collection.name)}`') {{collection.name}}
</template>
<script>
import { mapState } from 'vuex'
import Calendar from '@/components/Calendar'
import { mdiMagnify, mdiClose } from '@mdi/js'

export default {
  data: () => ({
    mdiMagnify, mdiClose,
    oldRoute: '',
    collections: []
  }),
  async fetch () {
    this.collections = await this.$axios.$get('collections').catch(_e => [])
  },
  components: { Calendar },
  computed: {
    showSearchBar () {
      return this.$route.name === 'index'
    },
    showCollectionsBar () {
      const show = ['index', 'collection-collection'].includes(this.$route.name)
      if (show && this.oldRoute !== this.$route.name) {
        this.oldRoute = this.$route.name
        this.$fetch()
      }
      return show
    },
    ...mapState(['settings'])
  },
  methods: {
    search (ev) {
      this.$root.$emit('search', ev)
    }
  }
}
</script>
<style>
#navsearch {
  margin: 0 auto;
  max-width: 800px;
}
</style>