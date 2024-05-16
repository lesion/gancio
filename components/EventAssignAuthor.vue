<template>
  <v-card>
    <v-card-title>{{$t('event.assign_to_user')}}</v-card-title>
    <v-card-subtitle>{{$t('event.assign_to_user_description')}}</v-card-subtitle>
    <v-card-text>
      <v-form>
        <v-autocomplete
          v-model='selectedUser'
          :items="users"
          :prepend-inner-icon="mdiAccount"
          hide-no-data
          item-text="email"
          item-value="id"
          placeholder='Choose user'
          :label="$t('common.user')" />
      </v-form>
    </v-card-text>
    <v-card-actions>
      <v-spacer />
      <v-btn color="primary" @click='assign' outlined :disabled="!selectedUser || loading" :loading="loading">{{ $t('event.assign_to_user') }}</v-btn>
      <v-btn color="warning" @click='$emit("close")' outlined>{{ $t('common.close') }}</v-btn>
    </v-card-actions>
  </v-card>
</template>
<script>
import { mdiAccount } from '@mdi/js'

export default {
  data () {
    return {
      mdiAccount,
      loading: false,
      selectedUser: {},
      users: []
    }
  },
  props: {
    event: { type: Object, default: () => ({ }) },
  },
  async mounted () {
    this.users = await this.$axios.$get(`/users`)
  },
  methods: {
    async assign () {
      try {
        this.loading = true
        await this.$axios.$put('/event/assign_to_author', { id: this.event.id, user_id: this.selectedUser })
        this.loading = false
        this.$emit('close')
        this.$root.$message('event.saved', { color: 'success' })
      } catch(e) {
        this.$root.$message(e, { color: 'warning' })
      }
    }
  }
}
</script>
