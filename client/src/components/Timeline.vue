// <template lang="pug">
// b-card.column.pl-1(bg-variant='dark' text-variant='white' no-body)
//   b-card-header
//     strong Public events
//     b-btn.float-right(v-if='logged' variant='success' size='sm' to='/newEvent') <v-icon name="plus"/> Add Event
//   event(v-for='event in events', :event='event' :key='event.id')
// </template>
// <script>
// import api from '@/api'
// import event from './Event'
// import { mapState } from 'vuex';

// export default {
//   components: {event},
//   computed: mapState(['events', 'logged'])
// }
// </script>
