function _initializeDB () {
  const config = require('../config')
  config.load()
  config.log_level = 'error'
  const db = require('../api/models/index')
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
}

async function add (args) {
  
}

async function list () {
  await _initializeDB()
  const User = require('../api/models/user')
  const users = await User.findAll()
  console.log()
  users.forEach(u => console.log(`${u.id}\tadmin: ${u.is_admin}\tenabled: ${u.is_active}\temail: ${u.email}`))
  console.log()
}

const accountsCLI = yargs => {
  return yargs
  .command('list', 'List all accounts', list)
  .command('modify', 'Modify', {
    account: {
      describe: 'Account to modify',
      type: 'string',
      demandOption: true
    },
    'reset-password': {
        describe: 'Resets the password of the given accoun ',
        type: 'boolean'
    }
  }, modify)
  .command('add', 'Add an account', {}, add)
  .recommendCommands()
  .strict()
  .demandCommand(1, '')
}

module.exports = accountsCLI
