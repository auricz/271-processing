import bcrypt from 'bcryptjs';
import express from "express";
import validator from "validator";
import { parse, serialize } from "cookie";
import { createRecord, readRecord, updateRecord, deleteRecord } from './utils/database.mjs';
import { body, validationResult } from "express-validator";
import { extractCoverage, extractCopay, extractPharmacy, parse271 } from "./utils/parser.mjs";
import { formatErr } from './utils/utils.mjs';

const APP = express();
const PORT = 4000;

const isAuth = async (req, res, next) => {
  let username = req.headers.username ? validator.escape(req.headers.username) : "";
  const password = req.headers.password;
  let organization = req.headers.organization ? validator.escape(req.headers.organization) : "";

  try {
    if (validator.isEmpty(username)) throw new Error("Username is missing");
    if (validator.isEmpty(password)) throw new Error("Password is missing");
    if (validator.isEmpty(organization)) throw new Error("Organization is missing");
  }
  catch (msg) {
    return res.status(400).send(msg.toString());
  }

  const record = readRecord(r => r.username === username && r.organization === organization);
  if (record.length === 0)
    return res.status(401).end("Access denied");

  try {
    const match = await bcrypt.compare(password, doc.password);
    if (!match)
      return res.status(401).end("Access denied");
  }
  catch (err) {
    return res.status(500).end(formatErr(err));
  }
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
  res: { username (with escaped chars) }
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
    return res.status(400).send(msg.toString());
  }

  // Check if user already exists in org
  const exists = readRecord(r => r.username === username && r.organization === organization);
  console.log(exists);
  if (exists.length !== 0)
    return res.status(409).end("User " + username + " already exists for this organization");

  // If new org, make user admin
  let role = 'user';
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
        salt,
        organization,
        role
      });
      return res.status(201).json(username);
    });
  });
});

/* 
  Accepts patient data and returns a 271 response

  res: { edi }
*/
APP.get('/eligibility', (req, res) => {
  return res.status(500).send("NOT DONE");
});

/* 
  Clients send edi as a string, returns data for front desk

  req: { edi }
  res: { coverage, copay, pharma }
*/
APP.get('/process271', isAuth, (req, res) => {
  const { edi } = req.body;
  let interchange;

  try {
    try {
      interchange = parse271(edi);
    }
    catch (err) {
      return res.status(400).send(formatErr(err));
    }

    const coverage = extractCoverage(interchange);
    const copay = extractCopay(interchange);
    const pharma = extractPharmacy(interchange);

    return res.json({ coverage, copay, pharma });
  }
  catch (err) {
    res.status(500).send(formatErr(err));
  }
});

/* 
  Lets admin update role of user inside org

  req: { username, newRole }
*/
APP.patch('/role', isAuth, isAdmin, (req, res) => {
  const { organization } = req.headers;
  const { username, newRole } = req.body;

  const userRecord = readRecord(r => r.username === username && r.organization === organization);
  if (userRecord.length === 0)
    return res.status(404).send(`User ${username} not found`);

  updateRecord(
    {...userRecord[0], role: newRole }, 
    r => r.username === username && r.organization === organization
  );

  return res.status(204);
});

/* 
  Lets admin delete a user within the organization

  req: { username }
*/
APP.delete('/user', isAuth, isAdmin, (req, res) => {
  const { organization } = req.headers;
  const { username } = req.body;

  const userRecord = readRecord(r => r.username === username && r.organization === organization);
  if (userRecord.length === 0)
    return res.status(404).send(`User ${username} not found`);

  deleteRecord(r => r.username === username && r.organization === organization);

  return res.status(204);
});

APP.listen(PORT, () => {
  console.log(`Server listening on PORT ${PORT}`)
});