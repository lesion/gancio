export default {
  common: {
    add_event: 'Nuevo evento',
    next: 'Continúa',
    export: 'Exporta',
    send: 'Envía',
    where: 'Donde',
    address: 'Dirección',
    when: 'Cuando',
    what: 'Cosa',
    media: 'Media', // media in che senso? in che contesto?
    login: 'Entrá',
    email: 'Email',
    password: 'Contraseña',
    register: 'Regístrate',
    description: 'Descripción',
    remove: 'Elimina',
    hide: 'Oculta',
    search: 'Busca',
    edit: 'Edita',
    info: 'Info',
    confirm: 'Confirma',
    admin: 'Administra',
    users: 'Usuarios',
    events: 'Eventos',
    places: 'Lugares',
    settings: 'Opciones',
    actions: 'Acciones',
    deactivate: 'Desactiva',
    remove_admin: 'Elimina Admin',
    activate: 'Activa',
    save: 'Guarda',
    preview: 'Vista previa',
    logout: 'Cierra sesión',
    share: 'Exporta', // share non sarebbe condividi?
    name: 'Nombre',
    associate: 'Associa', // anche qui per capire ho bisogno del contesto
    edit_event: 'Edita evento',
    related: 'Memoria histórica', // ?
    add: 'Agrega',
    logout_ok: 'Sesión cerrada correctamente',
    copy: 'Copia',
    recover_password: 'Recupera contraseña',
    new_password: 'Nuova contraseña',
    new_user: 'Nuevo usuario',
    ok: 'Ok',
    cancel: 'Cancela',
    enable: 'Habilita',
    disable: 'Deshabilita',
    me: 'Sos tú',
    password_updated: 'Contraseña actualizada!',
    username: 'Nickname',
    comments: 'ningún comentario|un comentario|{n} comentarios'
  },

  login: {
    description: 'Entrando podrás publicar nuevos eventos.',
    check_email: 'Ravisa tu casilla de correo (también el spam o correo no deseado)',
    not_registered: '¿No estás registrado/a?',
    forgot_password: '¿Olvidaste la contraseña?',
    error: 'Error: ',
    insert_email: 'Ingresa tu email',
    ok: 'Todo bien'
  },

  recover: {
    not_valid_code: 'Mmmmm algo no salió bien...'
  },

  export: {
    intro: `A diferencia de las plataformas del capitalismo, que hacen todo lo posible para mantener
       datos y usuarios dentro de ellas, creemos las informaciones, así como las personas,
       deben ser libres. Para esto, podés mantenerte actualizado sobre los eventos que te interesan como mejor te parezca, 
       sin necesariamente tener que pasar por este sitio.`,
    email_description: `Podés recibir por mail los eventos que te interesan.`,
    insert_your_address: 'Casilla de correo',
    feed_description: `Para seguir las actualizaciones desde una computadora o teléfono inteligente sin la necesidad de abrir periódicamente el sitio, el método recomendado es usar los feeds RSS.</p>

      <p>Con rss feeds, utilizás una aplicación especial para recibir actualizaciones de los sitios que más le interesan, como por ejemplo este. Es una buena manera de seguir muchos sitios muy rápidamente, sin la necesidad de crear una cuenta u otras complicaciones.</p>
    
      <li>Si tenés Android, te sugerimos <a href="https://play.google.com/store/apps/details?id=net.frju.flym">Flym</a> o Feeder</li>
      <li>Para iPhone/iPad podés usar <a href="https://itunes.apple.com/ua/app/feeds4u/id1038456442?mt=8">Feed4U</a></li>
      <li>En el caso de una computadora aconsejamos Feedbro, se instala como plugin <a href="https://addons.mozilla.org/en-GB/firefox/addon/feedbroreader/">de Firefox </a>o <a href="https://chrome.google.com/webstore/detail/feedbro/mefgmmbdailogpfhfblcnnjfmnpnmdfa">de Chrome</a> y funciona con todos los principales sistemas.</li>
      <br/>
      Agregando este link a tu lector de feed, estarás siempre actualizado/a.`,
    ical_description: `Las computadoras y los teléfonos inteligentes suelen estar equipados con una aplicación para administrar un calendario. Estos programas generalmente se pueden usar para importar un calendario remoto.`,
    list_description: `Si tenés un sitio web y querés mostrar una lista de eventos, podés usar el siguiente código`
  },

  register: {
    description: `Los movimientos sociales necesitan organizarse y autofinanciarse. <br/> Este es un regalo para ustedes, úsenlo solamente para eventos con fines no comerciales y obviamente antifascistas, antisexistas y antirracistas.
<br/> Antes de que puedas publicar <strong> debemos aprobar la cuenta </strong>. Como imaginarás, <strong> detrás de este sitio hay personas </strong> de carne y hueso, por esto te pedimos escribir algo para hacernos saber que tipos de eventos te gustaría publicar.`,
    error: 'Error: ',
    complete: 'Confirmaremos el registro lo antes posible.'
  },

  event: {
    anon: 'Anónimo',
    anon_description: `Podés ingresar un evento sin registrarte o iniciar sesión,
       pero en este caso tendrás que esperar a que alguien lo lea para confirmar que
       es un evento adecuado para este espacio, delegando esta elección. Además, no será posible modificarlo. <br/> <br/>
       Si no te gusta, podés <a href='/login'> iniciar sesión </a> o <a href='/register'> registrarte </a>,
       de lo contrario, continúa y recibirás una respuesta lo antes posible.`,
    same_day: 'Mismo día',
    what_description: 'Nombre evento',
    description_description: 'Descripción, podés copiar y pegar',
    tag_description: 'Tag...',
    media_description: 'Podés agregar un volante (opcionál)',
    added: 'Evento agregado',
    added_anon: 'Evento agregado, será confirmado cuanto antes.',
    where_description: `¿Dónde es? Si el lugar no está, escribilo y <b>presiona enter</b>. `,
    confirmed: 'Evento confirmado',
    not_found: 'Evento no encontrado',
    remove_confirmation: `¿Estás seguro/a de querér eliminar este evento?`,
    recurrent: `Recurrente`,
    recurrent_description: 'Elegí la frecuencia y selecciona los días.',
    multidate_description: '¿Un festival o más de un día? Elegí cuándo comienza y cuándo termina.',
    multidate: 'Más días',
    normal: 'Normal',
    normal_description: 'Selecciona el d{ia.',
    recurrent_1w_days: 'Cada {days}',
    recurrent_2w_days: 'Un {days} cada dos',
    recurrent_1m_days: '|El día {days} de cada mes|Los días {days} de cada mes',
    recurrent_2m_days: '|El día {days} cada dos meses|Los días {days} cada dos meses',
    recurrent_1m_ordinal: 'El {n} {days} de cada mes',
    recurrent_2m_ordinal: '|El {n} {days} un mes sí y el otro no|El {n} {days} un mes sí y el otro no',
    each_week: 'Cads semana',
    each_2w: 'Cada dos semanas',
    each_month: 'cada mes',
    due: 'a las',
    from: 'Desde las',
    image_too_big: 'La imagén es demasiado grande! Tamaño máx 4M',
    interact_with_me_at: 'Sígueme en el fediverso en'
  },

  admin: {
    mastodon_instance: 'Instancia',
    mastodon_description: 'Podés asociar una cuenta de mastodon a esta instancia de Gancio, cada evento se publicará también allí.',
    place_description: `En el caso de que un lugar sea incorrecto o cambie de dirección, podés cambiarlo. <br/> En este caso hay que tener en cuenta que todos los eventos asociados con ese lugar cambiarán de dirección (¡incluso los pasados!)`,
    event_confirm_description: 'Podés confirmar acá los eventos agregados por usuarios anónimos',
    delete_user: 'Elimina',
    remove_admin: 'Borra admin',
    delete_user_confirm: '¿Estás seguro/a de borrar este usuario?',
    user_remove_ok: 'Usuario eliminado',
    user_create_ok: 'Usuario creado',
    allow_registration_description: '¿Querés habilitar el registro?',
    allow_anon_event: '¿Se pueden ingresar eventos anónimos (sujeto a confirmación)?',
    allow_comments: 'Habilitar comentarios',
    allow_recurrent_event: 'Habilitar eventos fijos',
    recurrent_event_visible: 'Eventos fijos visibles por defecto',
    federation: 'Federación / ActivityPub',
    enable_federation: 'Habilita la federación!'
  },

  auth: {
    not_confirmed: 'Todavía no hemos confirmado este email...',
    fail: 'No pudimos autenticarte. ¿La contraseña es correcta? ¿Y el mail?'
  },

  settings: {
    change_password: 'Cambia contraseña',
    password_updated: 'Contraseña modificada',
    danger_section: 'Sección peligrosa',
    remove_account: 'Al presionar el siguiente botón, su usuario será eliminado. No serán eliminados los eventos que publicaste.',
    remove_account_confirm: 'Estás por borrar definitivamente tu cuenta'
  },

  error: {
    nick_taken: 'Este nickname ya está registrado',
    email_taken: 'Este correo electrónico ya está registrado'
  },

  ordinal: {
    1: 'primero',
    2: 'segundo',
    3: 'tercero',
    4: 'cuarto',
    5: 'quinto',
    [-1]: 'último'
  },

  about: `
  <p>
  Gancio es un proyecto del <a href='https://autistici.org/underscore'>underscore hacklab</a> y es uno de los
  servicios de <a href='https://cisti.org'>cisti.org</a>.</p>

  <h5>¿Que es gancio?</h5>
  <p>Gancio (se pronuncia "gancho") es una herramienta para compartir eventos orientado a las comunidades radicales.
   Dentro del gancio pueden encontrar y agregar eventos.
   Gancio, como todo <a href='https://cisti.org'> cisti.org </a> es una herramienta
   antisexista, antirracista, antifascista y anticapitalista, así que piensen en eso cuando
   van a publicar un evento. </p>

  <h5>Ok, pero ¿que quiere decir gancio?</h5>
  <p>
  Literalmente sería "enganche", pero en realidad viene de una forma de decir que se usa en en Turín (Italia). Ahí si alguien dice: "ehi, ci diamo un gancio alle 8?" ("ehi, ¿nos damos un enganche a las 8?") quiere decir "ehí, ¿nos vemos a las 8?". "Darsi un gancio" es juntarse a una hora X en un lugar Y.</p>
  <code>
  <ul>
  <li> ¿A qué hora es el <i>gancio</i> para ir a la marcha?</li>
  <li> No se, de todos modos no puedo ir, ya tengo un <i>gancio</i> para ir a una reunión.</li>
  </ul>
  </code>

  <h5> Contactos</h5>
  <p>
  ¿Escribiste una nueva interfaz para gancio? ¿Querés abrir un gancio en tu ciudad?
  ¿Hay algo que te gustaría mejorar? Para contribuir el código fuente es libre y disponible 
  <a href='https://git.lattuga.net/cisti/gancio'>acá</a>. Ayuda y sugerencias son siempre bienvenidos, podés comunicarte con nosotros 
  enviando un mail a underscore arroba autistici.org</p>`

}
