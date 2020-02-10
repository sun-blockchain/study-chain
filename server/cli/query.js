'use strict';

const argv = require('yargs').argv;
const path = require('path');
const conn = require('../fabric/network');
const User = require('../models/User');
const mongoose = require('mongoose');
require('dotenv').config();

// Connect database
mongoose.connect(
  process.env.MONGODB_URI,
  { useUnifiedTopology: true, useNewUrlParser: true },
  (error) => {
    if (error) console.log(error);
  }
);
mongoose.set('useCreateIndex', true);

/**
 * Query function of chaincode
 * @param  {String} func  Function Name (required)
 * @param  {String} username User Name (required)
 * @param  {String} args argument of function (optional)
 */

async function main() {
  try {
    if (!argv.func || !argv.username) {
      console.log(`Parameter func or userid cannot undefined`);
      return;
    }

    let func = argv.func.toString();
    let username = argv.username.toString();
    let args = argv.args;
    let result;

    let user = await User.findOne({ username: username });

    if (user) {
      const networkObj = await conn.connectToNetwork(user, true);

      if (typeof args === 'object') {
        result = await networkObj.contract.evaluateTransaction(func, ...args);
        console.log(`Transaction has been evaluated, result is a: ${result.toString()}`);
      } else if (args) {
        args = args.toString();
        result = await networkObj.contract.evaluateTransaction(func, args);
        console.log(`Transaction has been evaluated, result is a: ${result.toString()}`);
      } else {
        result = await networkObj.contract.evaluateTransaction(func);
        console.log(`Transaction has been evaluated, result is a: ${result.toString()}`);
      }
      process.exit(0);
    }
  } catch (error) {
    console.error(`Failed to evaluate transaction: ${error}`);
    process.exit(1);
  }
}

main();
