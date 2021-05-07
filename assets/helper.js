import take from 'lodash/take'
import get from 'lodash/get'
import dayjs from 'dayjs'

export function attributesFromEvents (_events, _tags) {
  const colors = ['blue', 'orange', 'yellow', 'teal', 'indigo', 'green', 'red', 'purple', 'pink', 'gray']
  const tags = take(_tags, 10).map(t => t.tag)
  let attributes = []
  attributes.push({ key: 'today', dates: new Date(), bar: { color: 'green', fillMode: 'outline' } })
  const now = dayjs().unix()

  function getColor (event) {
    const color = { class: 'vc-rounded-full', color: 'blue' }
    const tag = get(event, 'tags[0]')
    if (event.start_datetime < now) { color.class += ' vc-past' }
    if (!tag) { return color }
    const idx = tags.indexOf(tag)
    if (idx < 0) { return color }
    color.color = colors[idx]
    if (event.start_datetime < now) { color.class += ' vc-past' }
    return color
  }

  attributes = attributes.concat(_events
    .filter(e => !e.multidate)
    .map(e => {
      return {
        key: e.id,
        dot: getColor(e),
        dates: new Date(e.start_datetime * 1000)
      }
    }))

  attributes = attributes.concat(_events
    .filter(e => e.multidate)
    .map(e => ({
      key: e.id,
      highlight: { start: { ...getColor(e), fillMode: 'solid' }, end: { ...getColor(e), fillMode: 'solid' } },
      dates: { start: new Date(e.start_datetime * 1000), end: new Date(e.end_datetime * 1000) }
    })))

  return attributes
}
