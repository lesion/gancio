export default async function ({ $config, req, res, redirect, route, error }) {
  if (process.server) {
    if (res.locals.status === 'SETUP' && route.path !== '/setup/0') {
      return redirect('/setup/0')
    }

    if (res.locals.status === 'DBCONF' && route.path !== '/setup/1') {
      return redirect('/setup/1')
    }
    
    if (res.locals.status === 'READY' && route.path.startsWith('/setup')) {
      return redirect('/')
    }
  }

}
