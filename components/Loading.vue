<template lang='pug'>
  .loading-page(:class='{ loading }')
    v-progress-circular(:size="100" :width="10" style='color: orangered;' indeterminate)
</template>

<script>
export default {
  data: () => ({
    loading: false
  }),
  methods: {
    start () {
      this.loading = true
    },
    finish () {
      this.loading = false
    }
  }
}
</script>

<style scoped>
  .loading-page {
    z-index: -10;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    color: white;
    background: rgba(0, 0, 0, 0.6);
    text-align: center;
    padding-top: 200px;
    font-size: 4rem;
    font-family: sans-serif;
    transition: opacity .1s;
    opacity: 0;
  }

  .loading {
    z-index: 10;
    opacity: 1;
  }
</style>
