<template lang="pug">
  v-container
    v-card-title.text-h5 Database
      v-card-text
      v-form
        v-btn-toggle(text color='primary' v-model='db.dialect')
          v-btn(value='sqlite' text) sqlite
          v-btn(value='postgres' text) postgres
        template(v-if='db.dialect === "sqlite"')
          v-text-field(v-model='db.storage' label='Path')
        template(v-if='db.dialect === "postgres"')
          v-text-field(v-model='db.hostname' label='Hostname' :rules="[$validators.required('hostname')]")
          v-text-field(v-model='db.database' label='Database' :rules="[$validators.required('database')]")
          v-text-field(v-model='db.username' label='Username' :rules="[$validators.required('username')]")
          v-text-field(type='password' v-model='db.password' label='Password' :rules="[$validators.required('password')]")  

    v-card-actions
      v-btn(text @click='checkDb' color='primary' :loading='loading' :disabled='loading') {{$t('setup.check_db')}}
        v-icon mdi-arrow-right
</template>
<script>
export default {
  data () {
    return {
      db: {
        storage: './gancio.sqlite',
        hostname: 'localhost',
        database: 'gancio'
      },
      loading: false,
      buttonText: 'setup.check_db'
    }
  },
  methods: {
    async checkDb () {
      this.loading = true
      try {
        await this.$axios.$post('/setup/db', { db: this.db })
        this.$root.$message('DB Connection OK!', { color: 'success' })
        this.$emit('complete', this.db)
      } catch (e) {
        this.$root.$message(e.response.data, { color: 'error' })
      }
      this.loading = false
    }
  }
}
</script>