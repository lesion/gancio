<template lang="pug">
  b-modal(hide-footer @hidden='$router.replace("/")' :title='$t("About")' 
    :visible='true' size='lg')
    h5 Chi siamo
    p.
      Gancio e' un progetto dell'<a href='https://autistici.org/underscore'>underscore hacklab</a> e uno dei
      servizi di <a href='https://cisti.org'>cisti.org</a>.

    h5 Ok, ma cosa vuol dire?
    blockquote.
      Se vieni a Torino e dici: "ehi, ci diamo un gancio alle 8?" nessuno si presenterà con i guantoni per fare a mazzate.
      Darsi un gancio vuol dire beccarsi alle ore X in un posto Y
    p 
      small A: a che ora è il gancio in radio per andare al presidio?
    p
      small B: non so ma domani non posso venire, ho gia' un gancio per caricare il bar.


    h5 Contatti
    p.
      Hai scritto una nuova interfaccia per gancio? Vuoi aprire un nuovo nodo di gancio nella tua città?
      C'è qualcosa che vorresti migliorare? Aiuti e suggerimenti sono sempre benvenuti, puoi scriverci
      su underscore chicciola autistici.org

</template>