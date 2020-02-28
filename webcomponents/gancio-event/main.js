import Vue from 'vue'
import wrap from '@vue/web-component-wrapper'
import GancioEvent from './GancioEvent'

const CustomElement = wrap(Vue, GancioEvent)

window.customElements.define('gancio-event', CustomElement)
