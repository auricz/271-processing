import bcrypt from 'bcryptjs';
import express from "express";
import validator from "validator";
import { parse, serialize } from "cookie";
import { createRecord, readRecord, updateRecord, deleteRecord } from './utils/database.mjs';
import { body, validationResult } from "express-validator";
import { extractCoverage, extractCopay, extractPharmacy, parse271 } from "./utils/parser.mjs";
import { findUser, formatErr, getCurrentTime, getRequestsSentCounter, incrementSentCounter, randomNumberString } from './utils/utils.mjs';

const APP = express();
const PORT = 4000;

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
    return res.status(401).end("Access denied no user");

  // Check user's password is valid
  try {
    const match = await bcrypt.compare(password, record[0].password);
    if (!match)
      return res.status(401).end("Access denied passwrod");
  }
  catch (err) {
    return res.status(500).end(formatErr(err));
  }

  // Check that user has been approved to the organization
  if (record.role === 'pending')
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
  let cookies = parse(req.headers.cookie || "");
  req.username = cookies.username ? cookies.username : null;
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
  res: { coverage, copay, pharma }
*/
APP.post('/publish271', isAuth, (req, res) => {
  const { edi } = req.body;
  let interchange;

  try {
    try {
      interchange = parse271(edi);
    }
    catch (err) {
      return res.status(400).end(formatErr(err));
    }

    const coverage = extractCoverage(interchange);
    const copay = extractCopay(interchange);
    const pharma = extractPharmacy(interchange);

    return res.json({ coverage, copay, pharma });
  }
  catch (err) {
    res.status(500).end(formatErr(err));
  }
});

/* 
  Lets admin update role of user inside org

  req: { username, newRole }
*/
APP.patch('/role', isAuth, isAdmin, (req, res) => {
  const { organization } = req.headers;
  const { username, newRole } = req.body;
  
  const userRecord = readRecord(findUser(username, organization));
  if (userRecord.length === 0)
    return res.status(404).end(`User ${username} not found`);

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
  const { username } = req.body;

  const userRecord = readRecord(findUser(username, organization));
  if (userRecord.length === 0)
    return res.status(404).end(`User ${username} not found`);

  deleteRecord(findUser(username, organization));

  return res.status(204).end();
});

APP.listen(PORT, () => {
  console.log(`Server listening on PORT ${PORT}`)
});