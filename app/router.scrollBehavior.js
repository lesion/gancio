/**
 * https://nuxtjs.org/docs/configuration-glossary/configuration-router/#scrollbehavior
 * always scrollToTop but on index page
 */
export default function (to, _from, savedPosition) {
  if (to.name === 'index') {
    return savedPosition
  }
  return { x: 0, y: 0 }
}
