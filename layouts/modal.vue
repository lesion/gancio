<template lang='pug'>
  el-container
    el-header
    el-row(:gutter='20')
      el-col(:span='12' :offset='6')
        el-card.mt-5
          h4(slot='header') <img src='/favicon.ico'/> {{$route.name}}
          nuxt
</template>
<style lang="less">
@import '../assets/style.less';
</style>
