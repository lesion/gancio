<template lang="pug">
  el-card

    nuxt-link.float-right(to='/')
      v-icon(name='times' color='red')
    h3 {{$t('common.info')}}

    p.
      Gancio e' un progetto dell'<a href='https://autistici.org/underscore'>underscore hacklab</a> e uno dei
      servizi di <a href='https://cisti.org'>cisti.org</a>.

    h5 Cos'è gancio?
    p.
      Uno strumento di condivisione di eventi per comunità radicali.
      Dentro gancio puoi trovare e inserire eventi.
      Gancio, come tutto <a href='https://cisti.org'>cisti.org</a> è uno strumento
      antisessista, antirazzista, antifascista e anticapitalista, riflettici quando
      pubblichi un evento.

    h5 Ok, ma cosa vuol dire gancio?
    blockquote.
      Se vieni a Torino e dici: "ehi, ci diamo un gancio alle 8?" nessuno si presenterà con i guantoni per fare a mazzate.
      Darsi un gancio vuol dire beccarsi alle ore X in un posto Y
    li A: a che ora è il gancio in radio per andare al presidio?
    li B: non so ma domani non posso venire, ho gia' un gancio per caricare il bar.
    br

    h5 Contatti
    p.
      Hai scritto una nuova interfaccia per gancio? Vuoi aprire un nuovo nodo di gancio nella tua città?
      C'è qualcosa che vorresti migliorare? Per contribuire i sorgenti sono liberi e disponibili 
      <a href='https://git.lattuga.net/cisti/gancio'>qui</a>. Aiuti e suggerimenti sono sempre benvenuti, puoi scriverci
      su underscore chicciola autistici.org

</template>
<script>
export default {
  data () {
    return {
      open: true,
    }
  },
  methods: {
    close (done) {
      this.$router.replace('/')
      done()
    }
  }
}
</script>
