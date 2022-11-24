<template>
  <v-tabs centered background-color='transparent' optional dense icons-and-text class='mt-4'>
    <v-tab to='/'>
      <span class='d-none d-sm-flex'>Home</span>
      <v-icon v-text='mdiHome' />
    </v-tab>
    <v-tab v-if='$auth.loggedIn || settings.allow_anon_event' to='/add'>
      <span class='d-none d-sm-flex'>{{$t('common.add_event')}}</span>
      <v-icon color='primary' v-text='mdiPlus' />
    </v-tab>
    <v-tab to='/export' >
      <span class='d-none d-sm-flex'>{{$t('common.share')}}</span>
      <v-icon v-text='mdiShareVariant' />
    </v-tab>
  </v-tabs>    
</template>

<script>
import { mdiPlus, mdiShareVariant, mdiHome, mdiInformation } from '@mdi/js'
import { mapState } from 'vuex'

export default {
  name: 'Navbar',
  data () { 
    return { mdiPlus, mdiShareVariant, mdiHome, mdiInformation }
  },
  computed: mapState(['settings'])
}
</script>
