<template lang="pug">
v-container.pa-6
  h2.mb-2.text-center Gancio Setup
  v-select(label='Select your language'  single-line :items='$i18n.locales' item-text='name' item-value='code' @change='e => $i18n.setLocale(e)')

  v-stepper.grey.lighten-5(v-model='step')
    v-stepper-header
      v-stepper-step(v-show='!dbdone' :complete='step > 1' step='1') Database
      v-divider(v-show='!dbdone')
      v-stepper-step(:complete='step > 2' step='2') Configuration
      v-divider
      v-stepper-step(:complete='step > 3' step='3') Finish

    v-stepper-items
      v-stepper-content(v-show='!dbdone' step='1')
        DbStep(@complete='dbCompleted')
      v-stepper-content(step='2')
        Settings(setup, @complete='configCompleted')
      v-stepper-content(step='3')
        Completed(ref='completed' :isHttp='isHttp')
</template>
<script>

export default {
  components: {
    Settings: () => import(/* webpackChunkName: "setup" */'@/components/admin/Settings.vue'),
    DbStep: () => import(/* webpackChunkName: "setup" */'@/components/DbStep.vue'),
    Completed: () => import(/* webpackChunkName: "setup" */'@/components/Completed.vue'),
  },
  middleware: 'setup',
  layout: 'clean',
  head: {
    title: 'Setup',
  },
  name: 'Setup',
  auth: false,
  asyncData ({ params, req }) {
    const protocol = process.client ? window.location.protocol : req.protocol + ':'
    return {
      isHttp: protocol === 'http:',
      dbdone: !!Number(params.db),
      config: {
        db: {
          dialect: ''
        }
      },
      step: 1 + Number(params.db)
    }
  },
  methods: {
    dbCompleted (db) {
      this.step = this.step + 1
    },
    async configCompleted () {
      try {
        const user = await this.$axios.$post('/setup/restart')
        this.step = this.step + 1
        this.$refs.completed.start(user)
      } catch (e) {
        this.$root.$message(e.response ? e.response.data : e, { color: 'error' })
      }
    }
  }
}
</script>