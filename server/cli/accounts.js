let db
function _initializeDB () {
  const config = require('../config')
  config.log_level = 'error'
  db = require('../api/models/index')
  return db.initialize()
}

async function modify (args) {
  await _initializeDB()
  const helpers = require('../helpers')
  const User = require('../api/models/user')
  const user = await User.findOne({ where: { email: args.account } })
  console.log()
  if (!user) {
    console.error(`User ${args.account} not found`)
    return
  }

  if (args['reset-password']) {
    const password = helpers.randomString()
    user.password = password
    await user.save()
    console.log(`New password for user ${user.email} is '${password}'`)
  }

  if (args.admin) {
    user.is_admin = true
    await user.save()
  }
  await db.close()
}

async function create (args) {
  await _initializeDB()
  const User = require('../api/models/user')  
  const user = await User.create({
    email: args.email,
    is_active: true,
    is_admin: args.admin || false
  }).catch(e => console.error(String(e)))
  console.error(JSON.stringify(user, null, 2))
  await db.close()
}


async function remove (args) {
  await _initializeDB()
  const User = require('../api/models/user')  
  const user = await User.findOne({
    where: { email: args.email }
  })
  if (user) {
    await user.destroy()
  }
  await db.close()
}

async function list () {
  await _initializeDB()
  const User = require('../api/models/user')
  const users = await User.findAll()
  console.log()
  users.forEach(u => console.log(`${u.id}\tadmin: ${u.is_admin}\tenabled: ${u.is_active}\temail: ${u.email}`))
  console.log()
  await db.close()
}

const accountsCLI = yargs => yargs
  .command('list', 'List all accounts', list)
  .command('modify', 'Modify', {
    account: {
      describe: 'Account to modify',
      type: 'string',
      demandOption: true
    },
    'reset-password': {
        describe: 'Resets the password of the given account ',
        type: 'boolean'
    },
    admin: { describe: 'Define this account as administrator', type: 'boolean' }
  }, modify)
  .command('create <email|username> [admin]', 'Create an account', { 
    admin: { describe: 'Define this account as administrator', type: 'boolean' }
    }, create)
    .command('remove <email|username>', 'Remove an account', {}, remove)
    .positional('email', { describe: 'account email or username', type: 'string', demandOption: true })
  .recommendCommands()
  .demandCommand(1, '')
  .argv

module.exports = accountsCLI