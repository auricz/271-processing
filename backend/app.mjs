import bcrypt from 'bcryptjs';
import express from "express";
import validator from "validator";
import { createRecord, readRecord, updateRecord, deleteRecord } from './utils/database.mjs';
import { extractCoverage, extractCopay, extractPharmacy, parse271, extractPatient } from "./utils/parser.mjs";
import { findUser, formatErr, getCurrentTime, getRequestsSentCounter, incrementSentCounter, randomNumberString } from './utils/utils.mjs';

const APP = express();
const PORT = 4000;

let subscribedClients = [];

const isAuth = async (req, res, next) => {
  let username = req.headers.username ? validator.escape(req.headers.username) : "";
  const password = req.headers.password;
  let organization = req.headers.organization ? validator.escape(req.headers.organization) : "";

  try {
    if (validator.isEmpty(username)) throw new Error("Login is missing username");
    if (validator.isEmpty(password)) throw new Error("Login is missing password");
    if (validator.isEmpty(organization)) throw new Error("Login is missing organization");
  }
  catch (msg) {
    return res.status(400).end(msg.message);
  }

  // Check user exists
  const record = readRecord(findUser(username, organization));
  if (record.length === 0)
    return res.status(401).end("Failed to authenticate");

  // Check user's password is valid
  try {
    const match = await bcrypt.compare(password, record[0].password);
    if (!match)
      return res.status(401).end("Failed to authenticate");
  }
  catch (err) {
    return res.status(500).end(formatErr(err));
  }

  // Check that user has been approved to the organization
  if (!['user', 'admin'].includes(record.role))
    return res.status(403).end("Account pending approval from admin");

  next();
}

const isAdmin = async (req, res, next) => {
  const { username, organization } = req.headers;
  const record = readRecord(r =>
    r.username === username &&
    r.organization === organization &&
    r.role === 'admin'
  );
  if (record.length === 0)
    return res.status(403).end("Insufficient permissions");

  next();
}

APP.use(express.json());

// For printing incoming requests
APP.use((req, res, next) => {
  console.log("HTTP request", req.method, req.url);
  next();
});

/* 
  Allows users to create an account

  req: { username, password, organization }
  res: { username (with escaped chars), role }
*/
APP.post("/signup", async (req, res) => {
  let username = req.body.username ? validator.escape(req.body.username) : "";
  const password = req.body.password;
  let organization = req.body.organization ? validator.escape(req.body.organization) : "";

  try {
    if (validator.isEmpty(username)) throw new Error("Username is missing");
    if (validator.isEmpty(password)) throw new Error("Password is missing");
    if (validator.isEmpty(organization)) throw new Error("Organization is missing");
  }
  catch (msg) {
    return res.status(400).end(msg.message);
  }

  // Check if user already exists in org
  const exists = readRecord(findUser(username, organization));
  if (exists.length !== 0)
    return res.status(409).end("User " + username + " already exists for this organization");

  // If new org, make user admin
  let role = 'pending';
  const orgExists = readRecord(r => r.organization === organization);
  if (orgExists.length === 0)
    role = 'admin';

  // Password is stored salted
  bcrypt.genSalt(10, (err, salt) => {
    if (err)
      return res.status(500).end(formatErr(e));

    bcrypt.hash(password, salt, async (err, hash) => {
      if (err)
        return res.status(500).end(formatErr(e));

      createRecord({
        username,
        password: hash,
        organization,
        role
      });
      return res.status(201).json({ username, role });
    });
  });
});

/* 
  Accepts patient data and returns a 271 response

  res: edi

  I feel like this should be a GET, but GET don't have a body.
  You could base64 encode it into the url, but it'll be LONG.
*/
APP.post('/eligibility', (req, res) => {
  const data = req.body;

  // Mockup of what would happen here:
  // const req270 = makeRequest270(data)
  // const res271 = await response271(payer, req270)

  let firstName, lastName;
  const nameSplit = req.body.name.split(' ');
  if (nameSplit[0] === 'SUBSCRIBER') {
    firstName = nameSplit[1];
    lastName = nameSplit[2];
  }
  else {
    firstName = nameSplit[0];
    lastName = nameSplit[1];
  }

  lastName = lastName.slice(0, 6).padEnd(6, ' ');
  const firstInital = firstName[0];

  const todayYYYYMMDD = getCurrentTime('yyyymmdd');
  const todayYYMMDD = getCurrentTime('yymmdd');
  const todayHHMI = getCurrentTime('hhmi');
  const interchangeContNum = getRequestsSentCounter(9);
  const groupControlNum = getRequestsSentCounter(4);

  incrementSentCounter();

  let totalSegments = 19;
  let pharma = "";
  if (Math.random() > 0.5) {
    pharma = `\nEB*1*IND*88~
REF*6P*${randomNumberString(6)}~
REF*HJ*${randomNumberString(4)}~
REF*CE*UHEALTH~\n`;
    totalSegments += 4;
  }

  const res271 = `ISA*00*          *00*          *ZZ*UHC            *ZZ*ICLINIC        *${todayYYMMDD}*${todayHHMI}*^*00501*${interchangeContNum}*0*T*:~
GS*HB*UHC*ICLINIC*${todayYYYYMMDD}*${todayHHMI}*${groupControlNum}*X*005010X279A1~
ST*271*0001*005010X279A1~

BHT*0022*11*${randomNumberString(9)}*${todayYYYYMMDD}*${todayHHMI}~

HL*1**20*1~
NM1*PR*2*UNITEDHEALTHCARE*****PI*87726~

HL*2*1*21*1~
NM1*1P*2*ICLINIC*****XX*1234567893~

HL*3*2*22*0~
TRN*2*93175-012547*9877281234~
NM1*IL*1*${lastName}*${firstInital}****MI*123456789~
N3*345 ANYWHERE STREET~
N4*YOUR CITY*NY*12345~
DMG*D8*19780308*M~

DTP*290*D8*20240101~

EB*1*IND*30**23~
EB*B*IND*86**${Math.floor(Math.random() * 1000)}~
EB*B*IND*98**${Math.floor(Math.random() * 1000)}~
EB*B*IND*AL**${Math.floor(Math.random() * 1000)}~
EB*B*IND*UC**${Math.floor(Math.random() * 1000)}~
${pharma}
SE*${totalSegments}*0001~
GE*1*${groupControlNum}~
IEA*1*${interchangeContNum}~`;

  return res.end(res271);
});

/* 
  Clients send edi as a string, returns data for front desk

  req: { edi }
  res: { patient, coverage, copay, pharma }
*/
APP.post('/publish271', isAuth, (req, res) => {
  const { organization } = req.headers;
  const { edi } = req.body;
  let interchange;

  try {
    try {
      interchange = parse271(edi);
    }
    catch (err) {
      return res.status(400).end(formatErr(err));
    }

    const patient = extractPatient(interchange);
    const coverage = extractCoverage(interchange);
    const copay = extractCopay(interchange);
    const pharma = extractPharmacy(interchange);

    if (validator.isEmpty(patient))
      return res.status(400).end("Patient name is missing in EDI");

    const structData = { patient, coverage, copay, pharma };

    // Post the data to all subscribed users within the organization
    subscribedClients.forEach(c => {
      if (c.organization === organization) {
        const message = `data: ${JSON.stringify(structData)}\n\n`
        c.res.write(message);
      }
    });

    return res.json(structData);
  }
  catch (err) {
    res.status(500).end(formatErr(err));
  }
});

/* 
  Lets user get their role
*/
APP.get('/role', isAuth, (req, res) => {
  const { username, organization } = req.headers;

  const record = readRecord(findUser(username, organization));

  return res.end(record[0].role);
});

/* 
  Lets user subscribe and listen for published 271 responses
*/
APP.get('/events271', isAuth, (req, res) => {
  res.setHeader("Content-Type", "text/event-stream")
  res.setHeader("Cache-Control", "no-cache")
  res.setHeader("Connection", "keep-alive")

  res.flushHeaders()

  const { username, organization } = req.headers;

  const clientExists = subscribedClients
    .filter(c => c.username === username && c.organization === organization);
  if (clientExists.length !== 0)
    return res.status(400).end("You are already subscribed to this organization");

  subscribedClients.push({ username, organization, res });

  const heartbeatInt = setInterval(() => {
    const data = {
      timestamp: new Date().toISOString()
    }

    res.write(`heartbeat: ${JSON.stringify(data)}\n\n`);
  }, 5000)

  req.on("close", () => {
    clearInterval(heartbeatInt);
    subscribedClients = subscribedClients.filter(c => c.username !== username || c.organization !== organization);
    res.end();
  })

});

/* 
  Lets admin update role of user inside org

  req: { username, newRole }
*/
APP.patch('/role', isAuth, isAdmin, (req, res) => {
  const { organization } = req.headers;
  const username = req.body.username ? validator.escape(req.body.username) : null;
  const newRole = req.body.newRole ? validator.escape(req.body.newRole) : null;

  if (validator.isEmpty(username))
    return res.status(400).end("Username to update is missing");
  if (validator.isEmpty(newRole))
    return res.status(400).end("Role name to update is missing");

  const userRecord = readRecord(findUser(username, organization));
  if (userRecord.length === 0)
    return res.status(404).end(`User ${username} not found`);

  const allOrgAdmins = readRecord(r => r.organization === organization && r.role === 'admin');
  if (allOrgAdmins.length === 1)
    return res.status(400).end("Organization must have at least 1 admin");

  userRecord[0].role = newRole;

  updateRecord(
    userRecord[0],
    findUser(username, organization)
  );
  return res.status(204).end();
});

/* 
  Lets admin delete a user within the organization

  req: { username }
*/
APP.delete('/user', isAuth, isAdmin, (req, res) => {
  const { organization } = req.headers;
  const username = req.body.username ? validator.escape(req.body.username) : null;

  if (validator.isEmpty(username))
    return res.status(400).end("Username to delete is missing");

  if (username === req.headers.username)
    return res.status(400).end("You cannot remove yourself from the organization");

  const userRecord = readRecord(findUser(username, organization));
  if (userRecord.length === 0)
    return res.status(404).end(`User ${username} not found`);

  deleteRecord(findUser(username, organization));

  return res.status(204).end();
});

APP.listen(PORT, () => {
  console.log(`Server listening on PORT ${PORT}`)
});