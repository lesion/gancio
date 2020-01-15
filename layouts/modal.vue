<template lang='pug'>
  el-container#modal
    el-header
    el-row(:gutter='20')
      el-col(:span='12' :offset='6')
        el-card.mt-5
          h4(slot='header') <nuxt-link :to='"/"'><img src='/favicon.ico'/></nuxt-link> {{$route.name}}
          nuxt
</template>
