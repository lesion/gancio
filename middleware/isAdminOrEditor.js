export default async function ({ redirect, $auth }) {
    if (!$auth?.user?.is_editor && !$auth?.user?.is_admin) {
        return redirect('/')
    }
}