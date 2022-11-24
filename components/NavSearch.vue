<template lang="pug">
  #navsearch.mt-2.mt-sm-4
    v-text-field.mx-2(outlined dense hide-details :placeholder='$t("common.search")' :append-icon='mdiMagnify')
      template(v-slot:prepend-inner)
        Calendar(v-if='!settings.hide_calendar')
    v-btn.ml-2.mt-2.gap-2(small outlined v-for='collection in collections' color='primary' :key='collection.id' :to='`/collection/${encodeURIComponent(collection.name)}`') {{collection.name}}
</template>
<script>
import { mapState } from 'vuex'
import Calendar from '@/components/Calendar'
import { mdiMagnify } from '@mdi/js'

export default {
  data: () => ({
    mdiMagnify,
    collections: []
  }),
  async fetch () {
    this.collections = await this.$axios.$get('collections').catch(_e => [])
  },
  components: { Calendar },
  computed: mapState(['settings'])
}
</script>
<style>
#navsearch {
  margin: 0 auto;
  max-width: 800px;
}
</style>