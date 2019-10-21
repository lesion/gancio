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
    comments: 'Comments',
    activate_user: 'Confired',
    displayname: 'Display name',
    federation: 'Federation',
    set_password: 'Set password',
    copy_link: 'Copy link',
    send_via_mail: 'Send email',
    add_to_calendar: 'Add to calendar'
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
To follow updates from a computer or smartphone without the need to periodically open this site, the recommended method is RSS Feeds. </p>

<p> With rss feeds you use a special app to receive updates from the sites that interest you most. It's a good way to follow many sites very quickly, without the need to create an account or other complications. </p>

<li> If you have Android, we recommend <a href="https://play.google.com/store/apps/details?id=net.frju.flym"> Flym </a> or Feeder </li>
<li> For iPhone / iPad you can use <a href="https://itunes.apple.com/ua/app/feeds4u/id1038456442?mt=8"> Feed4U </a> </li>
<li> For the desktop / laptop we recommend Feedbro, to be installed in <a href="https://addons.mozilla.org/en-GB/firefox/addon/feedbroreader/"> Firefox </a> or <a href="https://chrome.google.com/webstore/detail/feedbro/mefgmmbdailogpfhfblcnnjfmnpnmdfa"> Chrome </a> and compatible with all major operating systems. </li>
<br/>
Adding this link to your feed reader will keep you up to date.`,
    ical_description: `Computers and smartphones are commonly equipped with an application to manage a calendar. These programs can usually be used to import a remote calendar.`,
    list_description: `If you have a website and want to show a list of events, you can use the following code`
  },

  register: {
    description: `
    Social movements need to organize and self-finance. <br/> This is a gift for you, use it only for non-commercial and obviously anti-fascist, anti-sexist, anti-racist events.
          <br/> Before you can publish <strong> we must approve the account </strong>, consider that <strong> behind this site there are people </strong> of
          flesh and blood, so write us two lines to let us know what events you would like to publish.`,
    error: 'Error: ',
    complete: 'Registration has to be confirmed.'
  },

  event: {
    anon: 'Anon',
    anon_description: `You can add an event without registering or logging in, but in this case you will have to wait for someone to read it 
    confirming that it is an event suitable for this space, delegating this choice. Furthermore it will not be possible to modify it.<br/><br/>
    You can instead <a href='/login'>log in</a> or <a href='/register'>register</a>, otherwise go ahead and get an answer as soon as possible.`,
    same_day: 'on same day',
    what_description: 'Title',
    description_description: 'Description',
    tag_description: 'Tag',
    media_description: 'You can add flyer (optional)',
    added: 'Event added',
    added_anon: 'Event added but has to be confirmed.',
    where_description: `Where's the event? If not present, write it and <b>press enter</b>. `,
    confirmed: 'Event confirmed',
    not_found: 'Event not found',
    remove_confirmation: `Are you sure to remove this event?`,
    recurrent: `Recurrent`,
    recurrent_description: 'Choose the frequency and select the days',
    multidate_description: 'It\'s a festival? Choose when it starts and when it ends',
    multidate: 'More days',
    normal: 'Normal',
    each_week: 'Each week',
    each_2w: 'Each two weeks',
    each_month: 'Each month',
    normal_description: 'Choose the day.',
    recurrent_1w_days: 'Each {days}',
    recurrent_2w_days: 'A {days} each two',
    recurrent_1m_days: '|The {days} of each month|{days} of each month',
    recurrent_2m_days: '|The {days} a month each two|The {days} a month each two',
    recurrent_1m_ordinal: 'The {n} {days} of each month',
    recurrent_2m_ordinal: '|The {n} {days} a month each two|The {n} {days} a month each two',
    due: 'due',
    from: 'From',
    image_too_big: 'Too big image! Max 4M',
    interact_with_me_at: 'Interact with me on fediverse at'
  },

  admin: {
    place_description: `In the event that a place is incorrect or change address, you can change it. <br/> Consider that all events associated with this place will change address (even past ones!)`,
    event_confirm_description: 'You can confirm here the events entered by anonymous users',
    delete_user: 'Remove',
    remove_admin: 'Remove admin',
    delete_user_confirm: 'Are you sure to remove this user?',
    user_remove_ok: 'User removed',
    user_create_ok: 'User created',
    allow_registration_description: 'Allow open registrations?',
    allow_anon_event: 'Allow anon events (has to be confirmed)?',
    allow_recurrent_event: 'Enable recurrent events',
    recurrent_event_visible: 'Show recurrent events by default',
    federation: 'Federation / ActivityPub',
    enable_federation: 'Enable federation',
    select_instance_timezone: 'Select instance timezone',
    enable_comments: 'Enable comments',
    disable_gamification: 'Disable gamification'
  },

  auth: {
    not_confirmed: 'Not confirmed yet',
    fail: 'Auth failed!. Are you sure password is correct?'
  },

  settings: {
    update_confirm: 'Do you want to save your modification?',
    change_password: 'Modify your password',
    password_updated: 'Password updated',
    danger_section: 'Dangerous section',
    remove_account: 'By pressing the following button your user will be deleted. The events you published instead no.',
    remove_account_confirm: 'You are about to permanently delete your account'
  },

  error: {
    nick_taken: 'This nickname is already used',
    email_taken: 'This email is already used'
  },

  confirm: {
    title: 'User confirmation',
    not_valid: 'Mmmmm something goes wrong.',
    valid: 'Your account is confirmed, you can <a href="/login">log in</a>.'
  },

  ordinal: {
    1: 'first',
    2: 'second',
    3: 'third',
    4: 'fourth',
    5: 'fifth',
    [-1]: 'last'
  },

  about: `
  <p><a href='https://gancio.org'>Gancio</a> is a shared agenda for local communities.</p>
  `
}
