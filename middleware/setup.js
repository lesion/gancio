export default async function ({ $config, req, redirect, route, error }) {
  if (process.server) {
    if (req.status === 'SETUP' && route.path !== '/setup/0') {
      return redirect('/setup/0')
    }

    if (req.status === 'DBCONF' && route.path !== '/setup/1') {
      return redirect('/setup/1')
    }
    
    if (req.status === 'READY' && route.path.startsWith('/setup')) {
      return redirect('/')
    }
  }

}
