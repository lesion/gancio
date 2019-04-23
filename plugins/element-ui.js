import Vue from 'vue'
import { Button, Select, Tag, Option, Table, FormItem, Card,
  Form, Tabs, TabPane, Switch, Input, Loading, TimeSelect,
  TableColumn, ColorPicker, Pagination, Popover } from 'element-ui'
import localeEn from 'element-ui/lib/locale/lang/en'
import localeIt from 'element-ui/lib/locale/lang/it'
import locale from 'element-ui/lib/locale'
locale.use(localeIt)

export default () => {
  Vue.use(Button)
  Vue.use(Popover)
  Vue.use(Card)
  Vue.use(Select)
  Vue.use(Tag)
  Vue.use(Input)
  Vue.use(Tabs)
  Vue.use(TabPane)
  Vue.use(Option)
  Vue.use(Switch)
  Vue.use(ColorPicker)
  Vue.use(Table)
  Vue.use(TableColumn)
  Vue.use(Pagination)
  Vue.use(FormItem)
  Vue.use(Form)
  Vue.use(TimeSelect)
  Vue.use(Loading.directive)
}
