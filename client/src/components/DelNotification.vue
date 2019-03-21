<template lang="pug">
  b-modal(hide-footer @hidden='$router.replace("/")' :title='$t("Remove notification")'
    :visible='true' size='sm' ref='modal')
    div( v-loading='loading')
      p Vuoi eliminare le notifiche?
      el-button.float-right(type='success' @click='remove') {{$t('Yes')}}
      el-button.float-right.mr-1(type='danger' @click='$refs.modal.hide()') {{$t('No')}}

</template>
<script>
import api from '@/api'
import { Message } from 'element-ui';

export default {
  name: 'DelNotification',
  data () {
    return {
      code: '',
      loading: false
    }
  },
  mounted () {
    this.code = this.$route.params.code
  },
  methods: {
    async remove () {
      this.loading = true
      try {
        await api.delNotification(this.code)
        Message({message: this.$t('Email notification removed'), type: 'success'})
      } catch(e) {
        Message({message: this.$t('Error removing email notification'), type: 'error'})
      }
      this.$refs.modal.hide()
      this.loading = false
    }
  }
}
</script>
