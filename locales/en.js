export default {
  common: {
    add_event: 'Add event',
    next: 'Next',
    export: 'Export',
    send: 'Send',
    where: 'Where',
    address: 'Address',
    when: 'When',
    what: 'What',
    media: 'Media',
    login: 'Login',
    email: 'Email',
    password: 'Password',
    register: 'Register',
    description: 'Description',
    remove: 'Remove',
    hide: 'Hide',
    search: 'Search',
    edit: 'Edit',
    info: 'Info',
    confirm: 'Confirm',
    admin: 'Admin',
    users: 'Users',
    events: 'Events',
    places: 'Places',
    settings: 'Options',
    actions: 'Actions',
    deactivate: 'Disable',
    remove_admin: 'Remove admin',
    activate: 'Activate',
    save: 'Save',
    preview: 'Preview',
    logout: 'Logout',
    share: 'Share',
    name: 'Name',
    associate: 'Associate',
    edit_event: 'Edit event',
    related: 'Related',
    add: 'Add',
    logout_ok: 'Logged out',
    copy: 'Copy',
    recover_password: 'Recover password',
    new_password: 'New password',
    new_user: 'New user',
    ok: 'Ok',
    cancel: 'Cancel',
    enable: 'Enable',
    disable: 'Disable',
    me: 'You',
    password_updated: 'Password updated!'
  },

  login: {
    description: `By logging in you can publish new events.`,
    check_email: 'Check your mailbox (spam too)',
    not_registered: 'Aren\'t registered',
    forgot_password: 'Forgot the password?',
    error: 'Error: ',
    insert_email: 'Insert your email',
    ok: 'Logged in'
  },

  recover: {
    not_valid_code: 'Something goes wrong...'
  },

  export: {
    intro: ``,
    email_description: ``,
    insert_your_address: 'Insert your email address.',
    feed_description: `
      Per seguire gli aggiornamenti da computer o smartphone senza la necessità di aprire periodicamente il sito, il metodo consigliato è quello dei Feed RSS.</p>

      <p>Con i feed rss utilizzi un'apposita applicazione per ricevere aggiornamenti dai siti che più ti interessano.  È un buon metodo per seguire anche molti siti in modo molto rapido, senza necessità di creare un account o altre complicazioni.</p>
    
      <li>Se hai Android, ti consigliamo <a href="https://play.google.com/store/apps/details?id=net.frju.flym">Flym</a> o Feeder</li>
      <li>Per iPhone/iPad puoi usare <a href="https://itunes.apple.com/ua/app/feeds4u/id1038456442?mt=8">Feed4U</a></li>
      <li>Per il computer fisso/portatile consigliamo  Feedbro, da installare all'interno <a href="https://addons.mozilla.org/en-GB/firefox/addon/feedbroreader/">di Firefox </a>o <a href="https://chrome.google.com/webstore/detail/feedbro/mefgmmbdailogpfhfblcnnjfmnpnmdfa">di Chrome</a> e compatibile con tutti i principali sistemi operativi.</li>
      <br/>
      Aggiungendo questo link al tuo lettore di feed, rimarrai aggiornata.`,
    ical_description: `I computer e gli smartphone sono comunemente attrezzati con un'applicazione per gestire un calendario. A questi programmi solitamente è possibile far importare un calendario remoto.`,
    list_description: `Se hai un sito web e vuoi mostrare una lista di eventi, puoi usare il seguente codice`
  },

  register: {
    description: `I movimenti hanno bisogno di organizzarsi e autofinanziarsi. <br/>Questo è un dono per voi, usatelo solo per eventi non commerciali e ovviamente antifascisti, antisessisti, antirazzisti. 
      <br/>Prima di poter pubblicare <strong>dobbiamo approvare l'account</strong>, considera che <strong>dietro questo sito ci sono delle persone</strong> di
      carne e sangue, scrivici quindi due righe per farci capire che eventi vorresti pubblicare.`,
    error: 'Errore: ',
    admin_complete: 'Sei il primo utente e quindi sei amministratore!',
    complete: 'Confermeremo la registrazione quanto prima.',
    request: 'Richiesta di registrazione',
    registration_email: `Ciao,
    ci è arrivata una richiesta di registrazione su gancio, la confermeremo quanto prima.`
  },

  event: {
    anon: 'Anon',
    anon_description: `Puoi inserire un evento senza registrarti o fare il login, 
      ma in questo caso dovrai aspettare che qualcuno lo legga confermando che si
      tratta di un evento adatto a questo spazio, delegando questa scelta. Inoltre non sarà possibile modificarlo.<br/><br/> 
      Puoi invece fare il <a href='/login'>login</a> o <a href='/registrarti'>registrarti</a>,
      altrimenti vai avanti e riceverai una risposta il prima possibile. `,
    same_day: 'Same day',
    what_description: 'Event\' name',
    description_description: 'Description',
    tag_description: 'Tag...',
    media_description: 'Puoi aggiungere un volantino',
    added: 'Evento aggiunto',
    added_anon: 'Evento aggiunto, verrà confermato quanto prima.',
    where_description: `Dov'è il gancio? Se il posto non è presente, scrivilo e <b>premi invio</b>. `,
    confirmed: 'Evento confermato',
    not_found: 'Evento non trovato',
    remove_confirmation: `Sicura di voler eliminare questo evento?`,
    recurrent: `Ricorrente`,
    recurrent_description: 'Scegli la frequenza e seleziona i giorni',
    multidate_description: 'Un festival o una tre giorni?  Scegli quando comincia e quando finisce.',
    multidate: 'Più giorni',
    normal: 'Normale',
    normal_description: 'Scegli il giorno.',
    recurrent_1w_days: 'Ogni {days}',
    recurrent_2w_days: 'Un {days} ogni due',
    recurrent_1m_days: '|Il giorno {days} di ogni mese|I giorni {days} di ogni mese',
    recurrent_2m_days: '|Il giorno {days} ogni due mesi|I giorni {days} ogni due mesi',
    recurrent_1m_ordinal: 'Il {n} {days} di ogni mese',
    recurrent_2m_ordinal: '|Il {n} {days} un mese sì e uno no|Il {n} {days} un mese sì e uno no',
    due: 'alle',
    from: 'Dalle',
    image_too_big: 'Immagine troppo grande! Massimo 4M'
  },

  admin: {
    mastodon_instance: 'Istanza',
    mastodon_description: 'Puoi associare un account mastodon a questa istanza di gancio, ogni evento verrà pubblicato lì.',
    place_description: `Nel caso in cui un luogo sia errato o cambi indirizzo, puoi modificarlo. <br/>Considera che tutti gli eventi associati a questo luogo cambieranno indirizzo (anche quelli passati!)`,
    event_confirm_description: 'Puoi confermare qui gli eventi inseriti da utenti anonimi',
    delete_user: 'Elimina',
    remove_admin: 'Rimuovi admin',
    delete_user_confirm: 'Sicura di rimuovere questo utente?',
    user_remove_ok: 'Utente eliminato',
    user_create_ok: 'Utente creato',
    allow_registration_description : 'Vuoi abilitare la registrazione?',
    allow_anon_event: 'Si possono inserire eventi anonimi (previa conferma)?',
    allow_comments: 'Abilita commenti',
    allow_recurrent_event: 'Abilita eventi fissi',
    recurrent_event_visible: 'Appuntamenti fissi visibili di default',
    federation: 'Federazione / ActivityPub'
  },

  auth: {
    not_confirmed: 'Non abbiamo ancora confermato questa mail...',
    fail: 'Autenticazione fallita. Sicura la password è giusta? E la mail?'
  },

  settings: {
    change_password: 'Cambia password',
    password_updated: 'Password modificata',
    danger_section: 'Sezione pericolosa',
    remove_account: 'Premendo il seguente tasto il tuo utente verrà eliminato. Gli eventi da te pubblicati invece no.',
    remove_account_confirm: 'Stai per eliminare definitivamente il tuo account',
  },

  err: {
    register_error: 'Errore nella registrazione'
  },

  ordinal: {
    1: 'primo',
    2: 'secondo',
    3: 'terzo',
    4: 'quarto',
    5: 'quinto',
    [-1]: 'ultimo',
  },

  about: `
  <p>
  Gancio e' un progetto dell'<a href='https://autistici.org/underscore'>underscore hacklab</a> e uno dei
  servizi di <a href='https://cisti.org'>cisti.org</a>.</p>

  <h5> Cos'è gancio?</h5>
  <p>Uno strumento di condivisione di eventi per comunità radicali.
  Dentro gancio puoi trovare e inserire eventi.
  Gancio, come tutto <a href='https://cisti.org'>cisti.org</a> è uno strumento
  antisessista, antirazzista, antifascista e anticapitalista, riflettici quando
  pubblichi un evento.</p>
  
  <h5>Ok, ma cosa vuol dire gancio?</h5>
  <p>
  Se vieni a Torino e dici: "ehi, ci diamo un gancio alle 8?" nessuno si presenterà con i guantoni per fare a mazzate.
  Darsi un gancio vuol dire beccarsi alle ore X in un posto Y.</p>
  <code>
  <ul>
  <li> a che ora è il gancio in radio per andare al presidio?</li>
  <li> non so ma domani non posso venire, ho gia' un gancio per caricare il bar.</li>
  </ul>
  </code>

  <h5> Contatti</h5>
  <p>
  Hai scritto una nuova interfaccia per gancio? Vuoi aprire un nuovo nodo di gancio nella tua città?
  C'è qualcosa che vorresti migliorare? Per contribuire i sorgenti sono liberi e disponibili 
  <a href='https://git.lattuga.net/cisti/gancio'>qui</a>. Aiuti e suggerimenti sono sempre benvenuti, puoi scriverci
  su underscore chicciola autistici.org</p>
  `
}
