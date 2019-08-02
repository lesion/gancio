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
    password_updated: 'Password updated!',
    username: 'Username',
    comments: 'Comments'
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
    error: 'Error: ',
    complete: 'Registration has to be confirmed.'
  },

  event: {
    anon: 'Anon',
    anon_description: `Puoi inserire un evento senza registrarti o fare il login, 
      ma in questo caso dovrai aspettare che qualcuno lo legga confermando che si
      tratta di un evento adatto a questo spazio, delegando questa scelta. Inoltre non sarà possibile modificarlo.<br/><br/> 
      Puoi invece fare il <a href='/login'>login</a> o <a href='/registrarti'>registrarti</a>,
      altrimenti vai avanti e riceverai una risposta il prima possibile. `,
    same_day: 'Same day',
    what_description: 'Event\'s name',
    description_description: 'Description',
    tag_description: 'Tag',
    media_description: 'You could add an event\'s flyer (optional)',
    added: 'Event added',
    added_anon: 'Event added but has to be confirmed.',
    where_description: `Where's the event? If not present, write it and <b>press enter</b>. `,
    confirmed: 'Event confirmed',
    not_found: 'Event not found',
    remove_confirmation: `Are you sure to remove this event?`,
    recurrent: `Recurrent`,
    recurrent_description: 'Choose the frequency and select the days',
    multidate_description: 'It\'s a festival? Choose when it starts and when it ends?',
    multidate: 'More days',
    normal: 'Normal',
    normal_description: 'Choose the day.',
    recurrent_1w_days: 'Each {days}',
    recurrent_2w_days: 'A {days} each two',
    recurrent_1m_days: '|The {days} of each month|{days} of each month',
    recurrent_2m_days: '|The {days} a month each two|The {days} a month each two',
    recurrent_1m_ordinal: 'The {n} {days} of each month',
    recurrent_2m_ordinal: '|The {n} {days} a month each two|The {n} {days} a month each two',
    due: 'due',
    from: 'From',
    image_too_big: 'Image too big! Max 4M',
    interact_with_me_at: 'Interact with me on fediverse at'
  },

  admin: {
    place_description: `Nel caso in cui un luogo sia errato o cambi indirizzo, puoi modificarlo. <br/>Considera che tutti gli eventi associati a questo luogo cambieranno indirizzo (anche quelli passati!)`,
    event_confirm_description: 'Puoi confermare qui gli eventi inseriti da utenti anonimi',
    delete_user: 'Remove',
    remove_admin: 'Remove admin',
    delete_user_confirm: 'Are you sure to remove this user?',
    user_remove_ok: 'User removed',
    user_create_ok: 'User created',
    allow_registration_description : 'Allow open registrations?',
    allow_anon_event: 'Allow anon events (has to be confirmed)?',
    allow_recurrent_event: 'Enable recurrent events',
    recurrent_event_visible: 'Show recurrent events by default',
    federation: 'Federation / ActivityPub',
    enable_federation: 'Enable federation'
  },

  auth: {
    not_confirmed: 'Not confirmed yet',
    fail: 'Auth failed!. Are you sure password is correct?'
  },

  settings: {
    change_password: 'Modify your password',
    password_updated: 'Password updated',
    danger_section: 'Dangerous section',
    remove_account: 'Premendo il seguente tasto il tuo utente verrà eliminato. Gli eventi da te pubblicati invece no.',
    remove_account_confirm: 'Stai per eliminare definitivamente il tuo account',
  },

  err: {
    register_error: 'Error during registration'
  },

  ordinal: {
    1: 'first',
    2: 'second',
    3: 'third',
    4: 'fourth',
    5: 'fifth',
    [-1]: 'last',
  },

  about: `
  <p>
  <a href='https://gancio.org'>Gancio</a> is a shared agenda for local communities.

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

