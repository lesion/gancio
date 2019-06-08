<template lang='pug'>
  .container
    #error
      h1(v-if="error.statusCode === 404") Page not found
      h1(v-else) An error occurred
</template>

<script>
export default {
  props: ['error'],
}
</script>
<style lang="less">
  #error {
    margin-top: 20px;
    color: orange;
  }
</style>
