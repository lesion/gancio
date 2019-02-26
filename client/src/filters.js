import moment from 'moment'
moment.locale('it')

export default {
  datetime (value) {
    return moment(value).format('ddd, D MMMM HH:mm')
  },
  short_datetime (value) {
    return moment(value).format('D/MM HH:mm')
  },
  hour (value) {
    return moment(value).format('HH:mm')
  }
}
