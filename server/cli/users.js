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
      is_admin: args.admin || false
    })
    console.error(`User ${args.email} created`)
  } catch(e) {
    console.error(String(e))
  }
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
  users.forEach(u => console.log(`${u.id}\tadmin: ${u.is_admin}\tenabled: ${u.is_active}\temail: ${u.email}`))
  console.log()
  await db.close()
}

const usersCLI = yargs => yargs
  .command('list', 'List all users', list)
  .command('reset-password <email|username>', 'Resets the password of the given user', {
  }, resetPassword)
  .command('set-admin <email|username>', 'Set administrator privileges to the given user', {}, setAdmin)
  .command('unset-admin <email|username>', 'Remove administrator privileges to the given user', {}, unsetAdmin)
  .command('create <email|username> [password] [admin]', 'Create an user', { 
    admin: { describe: 'Define this user as administrator', type: 'boolean' },
    }, create)
    .command('remove <email|username>', 'Remove an user', {}, remove)
    .positional('email', { describe: 'user email or username', type: 'string', demandOption: true })
    .positional('password', { describe: 'Password', type: 'string', demandOption: false })
  .recommendCommands()
  .demandCommand(1, '')
  .argv

module.exports = usersCLI