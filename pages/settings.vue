<template>
<v-container class="pa-0 pa-md-3">
  <v-card>
    <v-card-title>{{$auth.user.email}}</v-card-title>
    <v-card-text>
      <v-container>
        <v-btn @click='forgot'>{{$t('login.forgot_password')}}</v-btn><br/><br/>
        <v-divider />
        <p>{{$t('settings.remove_account')}}</p>
        <v-btn color='warning' @click='remove_account'>{{$t('common.remove')}}</v-btn>
      </v-container>
    </v-card-text>
  </v-card>
</v-container>
</template>
<script>

import { mdiChevronLeft, mdiChevronRight, mdiChevronDown, mdiCheckboxOutline, mdiCheckboxBlankOutline,
  mdiPencil, mdiDelete, mdiArrowRight, mdiEye, mdiEyeOff, mdiRepeat, mdiPause, mdiPlay, mdiDebugStepOver, mdiDeleteForever } from '@mdi/js'
import { mapState } from 'vuex'
import TBtn from '../components/TBtn.vue'

export default {
  name: 'Settings',
  middleware: ['auth'],
  components: { TBtn },
  data () {
    return {
      mdiChevronLeft, mdiChevronRight, mdiChevronDown, mdiCheckboxOutline, mdiCheckboxBlankOutline,
      mdiPencil, mdiDelete, mdiArrowRight, mdiEye, mdiEyeOff, mdiRepeat, mdiPause, mdiPlay, mdiDebugStepOver, mdiDeleteForever,
      events: [],
    }
  },
  computed: mapState(['settings']),
  methods: {
    async forgot () {
      this.loading = true
      await this.$axios.$post('/user/recover', { email: this.$auth.user.email })
      this.loading = false
      this.$root.$message('login.check_email', { color: 'success' })
    },    
    async remove_account () {
      const ret = await this.$root.$confirm('settings.remove_account_confirm', { color: 'error' })
      if (!ret) return
      this.$axios.$delete('/user')
      this.$auth.logout()
      this.$router.replace('/')
    },
  },
  head () {
    return {
      title: `${this.settings.title} - ${this.$t('common.settings')}`
    }
  }
}
</script>
