<template lang='pug'>
  .editor
    editor-menu-bar.menubar.is-hidden(:editor='editor'
      :keep-in-bounds='true' v-slot='{ commands, isActive, getMarkAttrs, focused }')
      v-btn-toggle(dense :class="{ focused }")
        v-btn(icon text
          :class="{ primary: isActive.bold() }"
          @click="commands.bold")
          v-icon mdi-format-bold

        v-btn(icon text
          :class="{ primary: isActive.underline() }"
          @click="commands.underline")
          v-icon mdi-format-underline

        v-btn(icon text
          :class="{ primary: isActive.strike() }"
          @click="commands.strike")
          v-icon mdi-format-strikethrough-variant

        v-btn(icon text
          :class="{ primary: isActive.italic() }"
          @click="commands.italic")
          v-icon mdi-format-italic

        v-btn(icon text
          :class="{ primary: isActive.heading({level: 1}) }"
          @click="commands.heading({level: 1})")
          v-icon mdi-format-header-1

        v-btn(icon text
          :class="{ primary: isActive.heading({level: 2}) }"
          @click="commands.heading({level: 2})")
          v-icon mdi-format-header-2

        v-btn(icon text
          :class="{ primary: isActive.heading({level: 3}) }"
          @click="commands.heading({level: 3})")
          v-icon mdi-format-header-3

        v-btn(icon text
          :class="{ primary: isActive.code() }"
          @click="commands.code")
          v-icon mdi-code-tags

        v-btn(icon text
          :class="{ primary: isActive.blockquote() }"
          @click="commands.blockquote")
          v-icon mdi-format-quote-open

        v-btn(icon text
          :class="{ primary: isActive.bullet_list() }"
          @click="commands.bullet_list")
          v-icon mdi-format-list-bulleted

        v-btn(icon text :class='{ primary: isActive.link() }'
          @click='commands.link({href: ""}); $refs.link.focus(); linkActive=true')
            v-icon mdi-link

      //- v-btn-toggle.menububble(:class="{ 'is-active': menu.isActive }" :style="`left: ${menu.left}px; bottom: ${menu.bottom}px;`")
        v-popover(trigger='hover' placement='bottom-start')
          v-btn.float-left(slot='reference' size='mini') <v-icon name='question'/>
          template
            span This editor supports inline <code>markdown</code>
            div <v-icon name='heading'/> → Title ⇒ Start a line with <code>#</code>
            div <v-icon name='bold'/> → Bold ⇒ <code>ctrl+b</code>
            div <v-icon name='italic'/> → Italic ⇒ <code>ctrl+i</code>
            div <v-icon name='underline'/> → Underline ⇒ <code>ctrl+u</code>
            div <v-icon name='list-ul'/> → List ⇒ Start a line with <code>-</code>
            div <v-icon name='list-ol'/> → Ordered List ⇒ Start a line with <code>1.</code>
            div <v-icon name='quote-right'/> → Quote ⇒ Start a line with <code>&gt;</code>
            div <v-icon name='code'/> → Code ⇒ Use backtick <code>`</code>
            div <v-icon name='link'/> → Link ⇒ Select a word and fill the input
        //- el-button(size='mini' :class='{ "is-active": isActive.heading({level:4})}' @click='commands.heading({level: 4})') <v-icon name='heading'/>
        //- el-button(size='mini' :class='{ "is-active": isActive.bold() }' @click='commands.bold')
          <v-icon name='bold' />
        //- el-button(size='mini' :class='{ "is-active": isActive.italic() }' @click='commands.italic') <v-icon name='italic'/>
        //- el-button(size='mini' :class='{ "is-active": isActive.underline() }' @click='commands.underline') <v-icon name='underline'/>
        v-btn(size='mini' :class='{ "is-active": isActive.link() }' @click='commands.link({href: ""}); $refs.link.focus(); linkActive=true') <v-icon name='link'/>
        input(:value='isActive.link() && getMarkAttrs("link") && getMarkAttrs("link").href || ""' ref='link' :class='{ "is-active": isActive.link() || linkActive }'
          placeholder='https://' @keypress.enter='commands.link({ href: $event.target.value})')
          //- el-button(size='mini' :class='{ "is-active": isActive.strike() }' @click='commands.strike') <v-icon name='strikethrough'/>
        //- br
        //- el-button-group
        //-   el-button(size='mini' :class='{ "is-active": isActive.code() }' @click='commands.code') <v-icon size=16 name='code'/>
        //-   el-button(size='mini' :class='{ "is-active": isActive.bullet_list() }' @click='commands.bullet_list') <v-icon name='list-ul'/>
        //-   //- el-button(size='mini' :class='{ "is-active": isActive.ordered_list() }' @click='commands.ordered_list') <v-icon name='list-ol'/>
        //-   el-button(size='mini' :class='{ "is-active": isActive.blockquote() }' @click='commands.blockquote') <v-icon name='quote-right'/>

        //- el-button.float-right(v-if='!noSave' size='mini' type='success' plain icon='el-icon-check'
        //-   @click='$emit("save", editor.getHTML())') {{$t('common.save')}}

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
  Underline
} from 'tiptap-extensions'

export default {
  name: 'Editor',
  components: { EditorContent, EditorMenuBar, EditorMenuBubble },
  props: {
    value: { type: String, default: '' },
    border: { type: Boolean, default: false },
    noSave: { type: Boolean, default: false },
    maxHeight: { type: String, Number, default: '' }
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
      }, 300),
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
        new Underline()
      ]
    })
  },
  beforeDestroy () {
    if (this.editor) { this.editor.destroy() }
  }
}
</script>
<style lang='less'>

.editor {
  // max-height: auto;
  // height: auto;
  font-family: sans-serif;
  font-size: 1.1em;
  border-color: currentColor;
  border-style: solid;
  border-width: 0 0 thin 0;
  // background-color: rgba(255,255,255,0.04);
  height: auto;

  .focused {
    opacity: 1 !important;
  }
  .menubar {
    opacity: .3;

    // position: absolute;
  }

  .content {
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: #FF4500 transparent;
    scroll-behavior: smooth;
    // padding-top: 30px;
    // padding: 30px;
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
