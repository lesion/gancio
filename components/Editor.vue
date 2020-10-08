<template lang='pug'>
  .editor
    editor-menu-bar.menubar.is-hidden(:editor='editor'
      :keep-in-bounds='true' v-slot='{ commands, isActive, getMarkAttrs, focused }')
      v-btn-toggle(dense :class="{ focused }")
        v-btn(icon text tabindex='-1'
          :class="{ primary: isActive.bold() }"
          @click="commands.bold")
          v-icon mdi-format-bold

        v-btn(icon text tabindex='-1'
          :class="{ primary: isActive.underline() }"
          @click="commands.underline")
          v-icon mdi-format-underline

        v-btn(icon text tabindex='-1'
          :class="{ primary: isActive.strike() }"
          @click="commands.strike")
          v-icon mdi-format-strikethrough-variant

        v-btn(icon text tabindex='-1'
          :class="{ primary: isActive.italic() }"
          @click="commands.italic")
          v-icon mdi-format-italic

        v-btn(icon text tabindex='-1'
          :class="{ primary: isActive.heading({level: 1}) }"
          @click="commands.heading({level: 1})")
          v-icon mdi-format-header-1

        v-btn(icon text tabindex='-1'
          :class="{ primary: isActive.heading({level: 2}) }"
          @click="commands.heading({level: 2})")
          v-icon mdi-format-header-2

        v-btn(icon text tabindex='-1'
          :class="{ primary: isActive.heading({level: 3}) }"
          @click="commands.heading({level: 3})")
          v-icon mdi-format-header-3

        v-btn(icon text tabindex='-1'
          :class="{ primary: isActive.code() }"
          @click="commands.code")
          v-icon mdi-code-tags

        v-btn(icon text tabindex='-1'
          :class="{ primary: isActive.blockquote() }"
          @click="commands.blockquote")
          v-icon mdi-format-quote-open

        v-btn(icon text tabindex='-1'
          :class="{ primary: isActive.bullet_list() }"
          @click="commands.bullet_list")
          v-icon mdi-format-list-bulleted

        v-btn(icon text tabindex='-1' :class='{ primary: isActive.link() }'
          @click='commands.link({href: ""}); $refs.link.focus(); linkActive=true')
            v-icon mdi-link

    editor-content.content(:editor='editor' spellcheck='false' :style="{ 'max-height': maxHeight }")
</template>
<script>
import _ from 'lodash'
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
    value: { type: String, default: '' },
    border: { type: Boolean, default: false },
    noSave: { type: Boolean, default: false },
    maxHeight: { type: String, Number, default: '' },
    placeholder: { type: String, default: '' }
  },
  data () {
    return {
      options: [],
      linkActive: false,
      editor: null,
      update: false
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
      onUpdate: _.debounce(({ getHTML }) => {
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
        new Link({ openOnClick: false }),
        new Bold(),
        new Italic(),
        new Strike(),
        new Underline(),
        new Placeholder({
          emptyEditorClass: 'is-editor-empty',
          emptyNodeClass: 'is-empty',
          emptyNodeText: this.placeholder,
          showOnlyWhenEditable: true,
          showOnlyCurrent: true,
        })
      ]
    })
  },
  beforeDestroy () {
    if (this.editor) { this.editor.destroy() }
  }
}
</script>
<style lang='less'>
.editor p.is-editor-empty:first-child::before {
  content: attr(data-empty-text);
  float: left;
  color: #aaa;
  // opacity: .4;
  pointer-events: none;
  height: 0;
  font-style: italic;
}
.editor {
  // max-height: auto;
  // height: auto;
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: #FF4500 transparent;
    scroll-behavior: smooth;  
  font-family: sans-serif;
  font-size: 1.1em;
  border-color: currentColor;
  border-style: solid;
  border-width: 0 0 thin 0;
  // background-color: rgba(255,255,255,0.04);
  .focused {
    opacity: 1 !important;
  }
  .menubar {
    opacity: .3;
    // position: absolute;
  }

  .ProseMirror {
    padding: 15px;
    outline: 0;
  }
}
//   position: relative;
//   overflow-y: auto;
//   padding-top: 1.7em;

//   &.with-border {
//     border: 1px solid #ddd;
//     border-radius: 5px;
//   }

//   .content {
//     padding: 0px 5px 0px 5px;
//     flex: 1;
//     scrollbar-width: thin;
//     overflow-y: auto;
//   }

//   .menububble {
//     position: absolute;
//     display: flex;
//     overflow: hidden;
//     opacity: 0;
//     z-index: 1;
//     background: #dddddd;
//     transform: translateX(-50%);
//     border-radius: 3px;
//     padding: 0.07rem;
//     transition: opacity 0.2s, visibility 0.2s, left .2s, bottom .2s;
//     visibility: hidden;

//     &.is-active {
//       opacity: 1;
//       visibility: visible;
//     }
//     input {
//       padding: 0;
//       margin: 1px;
//       display: block;
//       border: 0;
//       color: #444;
//       font-size: .8em;
//       border-radius: 3px;
//       line-height: 100%;
//       transition: width .2s;
//       padding-left: 5px;
//       flex-grow: 1;
//     }

//     .fa-icon {
//       width: auto;
//       font-size: 10px;
//       height: 1.4em; /* or any other relative font sizes */
//       /* You would have to include the following two lines to make this work in Safari */
//       // max-width: 100%;
//       max-height: 100%;
//     }

//   }
// }

</style>
