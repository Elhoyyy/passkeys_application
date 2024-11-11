const express = require('express');
const path = require('path'); 
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();
const SimpleWebAuthnServer = require('@simplewebauthn/server');
const base64url = require('base64url');
app.use(cors({ origin: '*' }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
let users = {};
let challenges = {};
const rpId = 'localhost';
const expectedOrigin = ['http://localhost:3000'];
app.listen(process.env.PORT || 3000, '0.0.0.0', err => {
    if (err) throw err;
    console.log('Server started on port', process.env.PORT || 3000);
});
app.use(express.static(path.join(__dirname, 'passkey-frontend/dist/passkey-frontend/browser')));

// Catch-all route to handle Angular routing
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'passkey-frontend/dist/passkey-frontend/browser/index.html'));
});

app.post('/registro/inicio', (req, res) => {
    let { username, firstName, lastName, email } = req.body;
    let challenge = getNewChallenge();
    challenges[username] = convertChallenge(challenge);
    const pubKey = {
        challenge: challenge,
        rp: {id: rpId, name: 'webauthn-app'},
        user: {id: username, name: username, displayName: `${firstName} ${lastName}`},
        pubKeyCredParams: [
            {type: 'public-key', alg: -7},
            {type: 'public-key', alg: -257},
        ],
        authenticatorSelection: {
            authenticatorAttachment: 'platform',
            userVerification: 'required',
            residentKey: 'preferred',
            requireResidentKey: false,
        }
    };
    console.log(challenge, 'DESAFIO REGISTER');
    console.log(rpId, 'RPID');
    console.log(username, 'REGISTER START');
    res.json(pubKey);
});

app.post('/registro/fin', async (req, res) => {
    const { username, firstName, lastName, email, deviceName } = req.body;
    // Verify the attestation response
    let verification;
    try {
        verification = await SimpleWebAuthnServer.verifyRegistrationResponse({
            response: req.body.data,
            expectedChallenge: challenges[username],
            expectedOrigin: expectedOrigin
        });
    } catch (error) {
        console.error(error);
        return res.status(400).send({error: error.message});
    }
    const {verified, registrationInfo} = verification;
    if (verified) {
        users[username] = {
            credential: registrationInfo.credential,
            firstName,
            lastName,
            email,
            devices: [deviceName] // Store device name here
        };
        console.log(users, 'REGISTER VERIFIED');
        return res.status(200).send(true);
    }
    
    res.status(500).send(false);
});

app.post('/login/inicio', (req, res) => {
    let username = req.body.username;
    if (!users[username]) {
        console.log('user not found');
        return res.status(404).send(false);
    }
    let challenge = getNewChallenge();
    challenges[username] = convertChallenge(challenge);
    res.json({
        challenge,
        rpId,
        allowCredentials: [{
            type: 'public-key',
            id: users[username].credential.id,
            transports: ['internal'],
        }],
        userVerification: 'preferred',
    });
    console.log(username, 'LOGIN START')
    console.log(challenge, 'DESAFIO LOGIN');
    console.log(rpId, 'RPID');

});

app.post('/login/fin', async (req, res) => {
    let username = req.body.username;
    console.log(username, 'LOGIN FINISH');
    if (!users[username]) {
       console.log('user not found');
       return res.status(404).send(false);
    }
    let verification;
    try {
        const credential = users[username].credential;
        verification = await SimpleWebAuthnServer.verifyAuthenticationResponse({
            expectedChallenge: challenges[username],
            response: req.body.data,
            credential: credential,
            expectedRPID: rpId,
            expectedOrigin,
            requireUserVerification: false
        });
        console.log(verification, 'LOGIN VERIFIED');
    } catch (error) {
        console.error(error);
        return res.status(400).send({error: error.message});
    }
    const {verified} = verification;
    if (verified) {
        return res.status(200).send({
            res: true,
            redirectUrl: '/profile',
            userProfile: users[username] // Send user profile data
        });
    }
    return res.status(200).send({
        res: false
    });
});

function getNewChallenge() {
    return Math.random().toString(36).substring(2);
}

function convertChallenge(challenge) {
    return btoa(challenge).replaceAll('=', '');
}
