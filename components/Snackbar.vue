<template lang='pug'>
  v-snackbar(
    v-model="active"
    :color="color"
    :bottom="bottom"
    :top="top"
    :left="left"
    :right="right"
    :timeout="timeout")
    v-icon.mr-3(color="white") {{icon}}
    span {{ message }}
    template(v-slot:action="{ }")
      v-icon(size="16" @click="active = false") mdi-close-circle
</template>

<script>
export default {
  data () {
    return {
      icon: 'md-alert',
      color: 'primary',
      bottom: false,
      top: true,
      left: false,
      right: false,
      active: false,
      timeout: 5000,
      message: ''
    }
  },
  created () {
    this.$root.$message = snackbar => {
      this.active = true
      this.message = snackbar.message
      this.color = snackbar.color || 'primary'
    }
  }
}
</script>
