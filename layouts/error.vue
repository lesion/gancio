<template lang='pug'>
  .container
    #error
      h1(v-if="error.statusCode === 404") {{error.message}}
      h1(v-else) An error occurred: {{error.message}}
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
