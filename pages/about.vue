<template lang="pug">
  el-card

    nuxt-link.float-right(to='/')
      v-icon(name='times' color='red')
    h3 {{$t('common.info')}}

    div(v-html='$t("about")')

</template>
