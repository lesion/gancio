export default {
  methods: {
    clipboard (str, msg = 'common.copied') {
      try {
        navigator.clipboard.writeText(str)
      } catch (e) {
        const el = document.createElement('textarea')
        el.addEventListener('focusin', e => e.stopPropagation())
        el.value = str
        document.body.appendChild(el)
        el.select()
        document.execCommand('copy')
        document.body.removeChild(el)
      }
      this.$root.$message(msg)
    }
  }
}
