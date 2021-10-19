<template lang="pug">

  v-container.pa-6
    h2.mb-2.text-center Gancio Setup
    v-stepper.grey.lighten-5(v-model='step')
      v-stepper-header
        v-stepper-step(:complete='step > 1' step='1') Database
        v-divider
        v-stepper-step(:complete='step > 2' step='2') Configuration
        v-divider
        v-stepper-step(:complete='step > 3' step='3') Finish

      v-stepper-items
        v-stepper-content(step='1')
          DbStep(@complete='dbCompleted')
        v-stepper-content(step='2')
          Settings(setup, @complete='configCompleted')
        v-stepper-content(step='3')
          Completed(ref='completed')

        
            
            
   
</template>
<script>
import DbStep from './DbStep'
import Settings from '../../components/admin/Settings'
import Completed from './Completed'

export default {
  components: { DbStep, Settings, Completed },
  middleware: 'setup',
  layout: 'clean',
  head: {
    title: 'Setup',
  },
  auth: false,
  data () {
    return {
      config: {
        db: {
          dialect: ''
        }
      },
      step: 1
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
        this.$root.$message(e.response.data, { color: 'error' })
      }
    }
  }
}
</script>