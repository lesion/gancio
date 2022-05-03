<template lang='pug'>
  .editor(:class='focused')
    .label {{label}}
    editor-menu-bar.menubar.is-hidden(:editor='editor'
      :keep-in-bounds='true' v-slot='{ commands, isActive, getMarkAttrs, focused }')
      v-btn-toggle(dense)
        v-btn(icon text tabindex='-1'
          :class="{ primary: isActive.bold() }"
          @click="commands.bold")
          v-icon(v-text='mdiFormatBold')

        v-btn(icon text tabindex='-1'
          :class="{ primary: isActive.underline() }"
          @click="commands.underline")
          v-icon(v-text='mdiFormatUnderline')

        v-btn(icon text tabindex='-1'
          :class="{ primary: isActive.strike() }"
          @click="commands.strike")
          v-icon(v-text='mdiFormatStrikethroughVariant')

        v-btn(icon text tabindex='-1'
          :class="{ primary: isActive.italic() }"
          @click="commands.italic")
          v-icon(v-text='mdiFormatItalic')

        v-btn(icon text tabindex='-1'
          :class="{ primary: isActive.heading({level: 1}) }"
          @click="commands.heading({level: 1})")
          v-icon(v-text='mdiFormatHeader1')

        v-btn(icon text tabindex='-1'
          :class="{ primary: isActive.heading({level: 2}) }"
          @click="commands.heading({level: 2})")
          v-icon(v-text='mdiFormatHeader2')

        v-btn(icon text tabindex='-1'
          :class="{ primary: isActive.heading({level: 3}) }"
          @click="commands.heading({level: 3})")
          v-icon(v-text='mdiFormatHeader3')

        v-btn(icon text tabindex='-1'
          :class="{ primary: isActive.code() }"
          @click="commands.code")
          v-icon(v-text='mdiCodeTags')

        v-btn(icon text tabindex='-1'
          :class="{ primary: isActive.blockquote() }"
          @click="commands.blockquote")
          v-icon(v-text='mdiFormatQuoteOpen')

        v-btn(icon text tabindex='-1'
          :class="{ primary: isActive.bullet_list() }"
          @click="commands.bullet_list")
          v-icon(v-text='mdiFormatListBulleted')

        v-btn(icon text tabindex='-1' :class='{ primary: isActive.link() }'
          @click='commands.link({href: getMarkAttrs("link") && getMarkAttrs("link").href ? "" : "https://"}); $refs.link.focus();')
            v-icon(v-text='mdiLink')
        v-text-field.pt-0.ml-1(v-show='isActive.link()' ref='link' @focus='focus' @blur='blur' hide-details
            :value='isActive.link() && getMarkAttrs("link") && getMarkAttrs("link").href || ""'
            @keypress.enter='commands.link({ href: $event.target.value}); editor.focus()')

    editor-content.content(:editor='editor' spellcheck='false' :style="{ 'max-height': maxHeight }" :aria-label='label' :label='label')
</template>
<script>
import debounce from 'lodash/debounce'
import { mdiLink, mdiFormatListBulleted, mdiFormatQuoteOpen, mdiCodeTags,
  mdiFormatHeader1, mdiFormatHeader2, mdiFormatHeader3, mdiFormatItalic,
  mdiFormatStrikethroughVariant, mdiFormatBold, mdiFormatUnderline } from '@mdi/js'
import { Editor, EditorContent, EditorMenuBar, EditorMenuBubble } from 'tiptap'
import {
  Blockquote,
  BulletList,
  CodeBlock,
  HardBreak,
  Heading,
  ListItem,
  OrderedList,
  Bold,
  Code,
  Italic,
  Link,
  History,
  Strike,
  Underline,
  Placeholder
} from 'tiptap-extensions'

export default {
  name: 'Editor',
  components: { EditorContent, EditorMenuBar, EditorMenuBubble },
  props: {
    label: { type: String, default: 'Editor' },
    value: { type: String, default: '' },
    border: { type: Boolean, default: false },
    noSave: { type: Boolean, default: false },
    maxHeight: { type: String, Number, default: '' },
    placeholder: { type: String, default: '' }
  },
  data () {
    return {
      mdiLink, mdiFormatListBulleted, mdiFormatQuoteOpen, mdiCodeTags,
      mdiFormatHeader1, mdiFormatHeader2, mdiFormatHeader3, mdiFormatItalic,
      mdiFormatStrikethroughVariant, mdiFormatBold, mdiFormatUnderline,      
      options: [],
      linkActive: false,
      editor: null,
      blurring: false,
      update: false,
      focused: ''
    }
  },
  watch: {
    value () {
      if (this.update) {
        this.update = false
        return
      }
      this.editor.setContent(this.value)
    }
  },
  mounted () {
    this.editor = new Editor({
      onFocus: () => this.focus(),
      onBlur: () => this.blur(),
      onUpdate: debounce(({ getHTML }) => {
        this.update = true
        this.$emit('input', getHTML())
      }, 1000),
      content: this.value,
      extensions: [
        new Blockquote(),
        new BulletList(),
        new CodeBlock(),
        new HardBreak(),
        new Heading({ levels: [1, 2, 3, 4, 5, 6] }),
        new OrderedList(),
        new ListItem(),
        new Code(),
        new History(),
        new Link({ openOnClick: false, target: '_blank' }),
        new Bold(),
        new Italic(),
        new Strike(),
        new Underline(),
        new Placeholder({
          emptyEditorClass: 'is-editor-empty',
          emptyNodeClass: 'is-empty',
          emptyNodeText: this.placeholder,
          showOnlyWhenEditable: true,
          showOnlyCurrent: true
        })
      ]
    })
  },
  beforeDestroy () {
    if (this.editor) { this.editor.destroy() }
  },
  methods: {
    blur () {
      this.blurring = true
      window.setTimeout(() => {
        if (this.blurring) {
          this.focused = ''
          this.blurring = false
        }
      }, 200)
    },
    focus () {
      this.focused = 'editor--focused'
      this.$nextTick(() => {
        this.blurring = false
      })
    }
  }
}
</script>
<style lang='scss'>

.editor {
  margin-top: 4px;
  padding-top: 12px;
  padding-bottom: 22px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: #FF4500 transparent;
  scroll-behavior: smooth;
  font-family: sans-serif;
  font-size: 1.1em;

  .editor p.is-editor-empty:first-child::before {
    content: attr(data-empty-text);
    float: left;
    color: #aaa;
    // opacity: .4;
    pointer-events: none;
    height: 0;
    font-style: italic;
  }

  .label {
    left: 0px;
    position: relative;
    transform-origin: top left;
    transition: transform .3s, scale .3s, color .3s;
    transform: translateY(20px);
  }

  &.editor--focused {
    .label {
      color: #FF4500;
      transform: translateY(0px) scale(0.75);
    }

    .menubar {
      visibility: visible;
      opacity: 1 !important;
    }

    .ProseMirror::after {
      width : 100% !important;
      transform: scaleX(1) !important;
    }
  }

  .menubar {
    transition: opacity .5s;
    opacity: 0;
    visibility: hidden;
    // position: absolute;
  }

  .focused .ProseMirror::after {
    width: 100%;
  }
  .ProseMirror {
    padding: 15px;
    outline: 0;
    &::before {
      bottom: 0px;
      content: "";
      left: 0;
      position: absolute;
      transition: 0.3s cubic-bezier(0.25, 0.8, 0.5, 1);
      width: 100%;
      border-width: thin 0 0 0;
      border-style: solid;
      height: 0px;
      border-color: rgba(255, 255, 255, 0.7);
    }

    &::after {
      bottom: 0px;
      content: "";
      left: 0;
      position: absolute;
      height: 0px;
      transition: 0.3s cubic-bezier(0.25, 0.8, 0.5, 1);
      width: 100%;
      border-width: 2px 0 0 0;
      border-style: solid;
      border-color: #FF4500;
      transform: scaleX(0);
    }
  }
}

</style>
