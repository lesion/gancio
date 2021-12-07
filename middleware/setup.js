export default function ({ req, redirect, route }) {
  if (process.server) {
    if (req.firstrun && route.path !== '/setup') {
      return redirect('/setup')
    }
    if (!req.firstrun && route.path === '/setup') {
      return redirect('/')
    }
  }

}
