const it = {
  common: {
    add_event: 'Nuovo evento',
    next: 'Continua',
    export: 'Esporta',
    send: 'Invia',
    where: 'Dove',
    address: 'Indirizzo',
    when: 'Quando',
    what: 'Cosa',
    media: 'Media',
    login: 'Entra',
    email: 'Email',
    password: 'Password',
    register: 'Registrati',
    description: 'Descrizione',
    remove: 'Elimina',
    hide: 'Nascondi',
    search: 'Cerca',
    edit: 'Modifica',
    info: 'Info',
    confirm: 'Conferma',
    admin: 'Amministra',
    users: 'Utenti',
    events: 'Eventi',
    places: 'Luoghi',
    settings: 'Opzioni',
    actions: 'Azioni',
    deactivate: 'Disattiva',
    remove_admin: 'Rimuovi Admin',
    activate: 'Attiva',
    save: 'Salva',
    preview: 'Anteprima',
    logout: 'Esci',
    share: 'Esporta',
    name: 'Nome',
    associate: 'Associa',
    edit_event: 'Modifica evento',
    related: 'Memoria storica',
    add: 'Aggiungi',
    logout_ok: 'Uscita correttamente',
    copy: 'Copia',
    recover_password: 'Recupera password',
    new_password: 'Nuova password',
    new_user: 'Nuovo utente',
    ok: 'Ok',
    cancel: 'Annulla',
    enable: 'Abilita',
    disable: 'Disabilita'
  },

  login: {
    description: `Entrando puoi pubblicare nuovi eventi.`,
    check_email: 'Controlla la tua posta (anche lo spam)',
    not_registered: 'Non sei registrata?',
    forgot_password: 'Dimenticato la password?',
    error: 'Errore: ',
    insert_email: 'Inserisci la mail',
    ok: 'Tutto rego'
  },

  export: {
    intro: `Contrariamente alle piattaforme del capitalismo, che fanno di tutto per tenere
      i dati e gli utenti al loro interno, crediamo che le informazioni, come le persone,
      debbano essere libere. Per questo puoi rimanere aggiornata sugli eventi che vuoi, come meglio credi, senza necessariamente passare da questo sito.`,
    email_description: `Puoi ricevere via mail gli eventi che ti interessano.`,
    insert_your_address: 'Indirizzo email',
    feed_description: `Per seguire gli aggiornamenti da computer o smartphone senza la necessità di aprire periodicamente il sito, il metodo consigliato è quello dei Feed RSS.</p>

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
    anon: 'Anonimo',
    anon_description: `Puoi inserire un evento senza registrarti o fare il login, 
      ma in questo caso dovrai aspettare che qualcuno lo legga confermando che si
      tratta di un evento adatto a questo spazio, delegando questa scelta. Inoltre non sarà possibile modificarlo.<br/><br/> 
      Puoi invece fare il <a href='/login'>login</a> o <a href='/registrarti'>registrarti</a>,
      altrimenti vai avanti e riceverai una risposta il prima possibile. `,
    multidate_description: 'tanti giorni',
    date_description: `Quand'è il gancio?`,
    dates_description: 'Che giorni?',
    same_day: 'stesso giorno',
    what_description: 'Nome evento',
    description_description: 'Descrizione, dajene di copia/incolla',
    tag_description: 'Tag...',
    media_description: 'Puoi aggiungere un volantino',
    time_start_description: 'Comincia alle',
    time_end_description: 'Se vuoi puoi specificare un orario di fine.',
    added: 'Evento aggiunto',
    added_anon: 'Evento aggiunto, verrà confermato quanto prima.',
    where_description: `Dov'è il gancio? Se il posto non è presente, scrivilo e <b>premi invio</b>. `,
    confirmed: 'Evento confermato',
    not_found: 'Evento non trovato',
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
    allow_registration_description : 'Puoi decidere se abilitare la registrazione',
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
  }


}

module.exports = it
