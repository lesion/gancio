import moment from 'moment'
moment.locale('it')

export default {
  datetime (value) {
    return moment(value).format('ddd, D MMMM HH:mm')
  },
  hour (value) {
    return moment(value).format('HH:mm')
  }
}
