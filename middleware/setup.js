export default function ({ $axios, req, res, redirect, route }) {
  if (process.server) {
    $axios.defaults.headers.common['host'] = res.locals.hostname
    if (req.firstrun && route.path !== '/setup') {
      return redirect('/setup')
    }
    if (!req.firstrun && route.path === '/setup') {
      return redirect('/')
    }
  }

}
