import Vue from 'vue'
import { Button, Select, Tag, Option, Table, FormItem, Card, Row, Col, Upload, Checkbox,
  Form, Tabs, TabPane, Switch, Input, Loading, TimeSelect, Badge, ButtonGroup, Divider,
  TableColumn, ColorPicker, Pagination, Popover, Tooltip, Dialog, Calendar, Carousel, CarouselItem,
  Container, Footer , Timeline, TimelineItem, Menu, MenuItem } from 'element-ui'
import localeEn from 'element-ui/lib/locale/lang/en'
import localeIt from 'element-ui/lib/locale/lang/it'
import locale from 'element-ui/lib/locale'
locale.use(localeIt)

export default () => {
  Vue.use(Button)
  Vue.use(Divider)
  Vue.use(Checkbox)
  Vue.use(Upload)
  Vue.use(ButtonGroup)
  Vue.use(Calendar)
  Vue.use(Row)
  Vue.use(Col)
  Vue.use(Carousel)
  Vue.use(CarouselItem)
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
