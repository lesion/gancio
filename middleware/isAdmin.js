export default async function ({ req, redirect }) {
    if (!req.user.is_admin) {
        return redirect('/')
    }
}