import dayjs from 'dayjs'

export function attributesFromEvents (_events) {

  // const colors = ['teal', 'green', 'yellow', 'teal', 'indigo', 'green', 'red', 'purple', 'pink', 'gray']
  // merge events with same date
  let attributes = []
  const now = dayjs().unix()
  for(let e of _events) {
    const key = dayjs.unix(e.start_datetime).format('YYYYMMDD')
    const c = e.start_datetime < now ? 'vc-past' : ''

    const i = attributes.find(a => a.day === key)
    if (!i) {
      attributes.push({ day: key, key: e.id, n: 1, dates: new Date(e.start_datetime * 1000),
        dot: { color: 'teal', class: c } })
      continue
    }

    i.n++
    if (i.n >= 20 ) {
      i.dot = { color: 'purple', class: c }
    } else if ( i.n >= 10 ) {
      i.dot = { color: 'red', class: c}
    } else if ( i.n >= 5 ) {
      i.dot = { color: 'orange', class: c}
    } else if ( i.n >= 3 ) {
      i.dot = { color: 'yellow', class: c}
    } else {
      i.dot = { color: 'teal', class: c }
    }

  }

  // add a bar to highlight today
  attributes.push({ key: 'today', dates: new Date(), highlight: { color: 'green', fillMode: 'outline' } })

  return attributes
}
