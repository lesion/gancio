let db
function _initializeDB () {
  const config = require('../config')
  if (config.status !== 'CONFIGURED') {
    console.error(`> Cannot run CLI before setup (are you in the correct path?)`)
    process.exit(1)
  }
  config.log_level = 'error'
  db = require('../api/models/index')
  return db.initialize()
}

async function resetPassword (args) {
  await _initializeDB()
  const helpers = require('../helpers')
  const { User } = require('../api/models/models')
  const user = await User.findOne({ where: { email: args.email } })
  console.log()
  if (!user) {
    console.error(`User ${args.email} not found`)
    return
  }

  const password = helpers.randomString()
  user.password = password
  await user.save()
  console.log(`New password for user ${user.email} is '${password}'`)
  await db.close()
}

async function create (args) {
  await _initializeDB()
  const { User } = require('../api/models/models')
  try {
    const user = await User.create({
      email: args.email,
      password: args.password,
      is_active: true,
      role: args.role || 'user'
    })
    console.error(`User "${args.email}" created with role ${user.role}`)
  } catch(e) {
    console.error(String(e))
  }
  await db.close()
}

async function setRole (args) {
  await _initializeDB()
  const { User } = require('../api/models/models')
  const user = await User.findOne({ where: { email: args.email } })
  console.log()
  if (!user) {
    console.error(`User ${args.email} not found`)
    return
  }

  user.role = args.role
  await user.save()
  console.log(`User ${user.email} role is now ${user.role}!`)
  await db.close()
}


async function remove (args) {
  await _initializeDB()
  const { User } = require('../api/models/models')
  const user = await User.findOne({
    where: { email: args.email }
  })
  if (user) {
    await user.destroy()
    console.error(`User "${args.email}" succesfully removed`)
  } else {
    console.error(`User "${args.email}" not found!`)
  }
  await db.close()
}

async function list () {
  await _initializeDB()
  const { User } = require('../api/models/models')
  const users = await User.findAll()
  console.log()
  users.forEach(u => console.log(`${u.id}\trole: ${u.role}\tenabled: ${u.is_active}\temail: ${u.email}`))
  console.log()
  await db.close()
}

const usersCLI = yargs => yargs
  .command('list', 'List all users', list)
  .command('reset-password <email|username>', 'Resets the password of the given user', {
  }, resetPassword)
  .command('set_role <email|username> <role>', 'Set specified role privileges to the given user',
    { role: { describe: 'Define this user role', choices: ['user', 'admin', 'editor' ] } }, setRole)
  .command('create <email|username> [password] [role]', 'Create an user',
    { role: { describe: 'Define this user role', choices: ['user', 'admin', 'editor' ] } }, create)
  .command('remove <email|username>', 'Remove an user', {}, remove)
    // .positional('email', { describe: 'user email or username', type: 'string', demandOption: true })
    // .positional('password', { describe: 'Password', type: 'string', demandOption: false })
  .recommendCommands()
  .demandCommand(1, '')
  .argv

module.exports = usersCLI