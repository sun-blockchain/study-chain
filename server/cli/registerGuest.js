'use strict';

const argv = require('yargs').argv;
const { FileSystemWallet, Gateway, X509WalletMixin } = require('fabric-network');
const path = require('path');
const User = require('../models/User');
const USER_ROLES = require('../configs/constant').USER_ROLES;

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
 * Register user for org
 * @param  {String} orgMSP  Org Name (default: student)
 * @param  {String} username User Name (required)
 */

async function main() {
  try {
    let username = 'guest';
    let admin = process.env.ADMIN_STUDENT_USERNAME;
    const ccpPath = path.resolve(__dirname, '../..', 'network', `connection-student.json`);

    // Create a new file system based wallet for managing identities.
    const walletPath = path.join(process.cwd(), `/wallet/wallet-student`);
    const wallet = new FileSystemWallet(walletPath);

    // Check to see if we've already enrolled the user.
    const userExists = await wallet.exists(username);
    if (userExists) {
      console.log(`An identity for the user ${username} already exists in the wallet-student`);
      return;
    }

    // Check to see if we've already enrolled the admin user.
    const adminExists = await wallet.exists(admin);
    if (!adminExists) {
      console.log(`Admin user ${admin} does not exist in the wallet`);
      console.log('Run the enrollAdmin.js application before retrying');
      return;
    }

    // Create a new gateway for connecting to our peer node.
    const gateway = new Gateway();
    await gateway.connect(ccpPath, {
      wallet,
      identity: admin,
      discovery: { enabled: true, asLocalhost: true }
    });

    // Get the CA client object from the gateway for interacting with the CA.
    const ca = gateway.getClient().getCertificateAuthority();
    const adminIdentity = gateway.getCurrentIdentity();
    const secret = await ca.register(
      {
        affiliation: '',
        enrollmentID: username,
        role: 'client',
        attrs: [{ name: 'username', value: username, ecert: true }]
      },
      adminIdentity
    );

    const enrollment = await ca.enroll({
      enrollmentID: username,
      enrollmentSecret: secret
    });

    const userIdentity = X509WalletMixin.createIdentity(
      `StudentMSP`,
      enrollment.certificate,
      enrollment.key.toBytes()
    );

    await wallet.import(username, userIdentity);

    console.log(
      `Successfully registered and enrolled user ${username} and imported it into the wallet`
    );

    await gateway.disconnect();
    process.exit(0);
  } catch (error) {
    process.exit(1);
  }
}

main();
