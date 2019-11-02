import Vue from 'vue'
import { Button, Select, Tag, Option, Table, FormItem, Card, Row, Col, Upload, Checkbox, RadioButton, RadioGroup,
  Form, Tabs, TabPane, Switch, Input, Loading, TimeSelect, Badge, ButtonGroup, Divider, Step, Steps, Radio, Main,
  TableColumn, ColorPicker, Pagination, Popover, Tooltip, Dialog, Image, Backtop, Collapse, CollapseItem, Link,
  Dropdown, DropdownMenu, DropdownItem, Submenu, PageHeader, Header, Icon, Alert,
  Container, Footer, Timeline, TimelineItem, Menu, MenuItem } from 'element-ui'
import locale from 'element-ui/lib/locale'

const locales = {
  it: require('element-ui/lib/locale/lang/it'),
  en: require('element-ui/lib/locale/lang/en'),
  es: require('element-ui/lib/locale/lang/es')
}

export default ({ app, store }) => {
  locale.use(locales[store.state.locale])
  Vue.use(Button)
  Vue.use(Alert)
  Vue.use(Icon)
  Vue.use(Dropdown)
  Vue.use(Header)
  Vue.use(PageHeader)
  Vue.use(Submenu)
  Vue.use(DropdownItem)
  Vue.use(DropdownMenu)
  Vue.use(Main)
  Vue.use(Link)
  Vue.use(RadioButton)
  Vue.use(RadioGroup)
  Vue.use(Radio)
  Vue.use(Collapse)
  Vue.use(CollapseItem)
  Vue.use(Backtop)
  Vue.use(Divider)
  Vue.use(Image)
  Vue.use(Step)
  Vue.use(Steps)
  Vue.use(Checkbox)
  Vue.use(Upload)
  Vue.use(ButtonGroup)
  Vue.use(Row)
  Vue.use(Col)
  Vue.use(Badge)
  Vue.use(Dialog)
  Vue.use(Menu)
  Vue.use(MenuItem)
  Vue.use(Container)
  Vue.use(Timeline)
  Vue.use(TimelineItem)
  Vue.use(Footer)
  Vue.use(Tooltip)
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
