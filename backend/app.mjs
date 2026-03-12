import express from "express";
import { parse, serialize } from "cookie";
import { extractCoverage, extractCopay, extractPharmacy, parse271 } from "./utils/parser.mjs";

const APP = express();
const PORT = 4000;

APP.use(express.json());

APP.use(function (req, res, next) {
  let cookies = parse(req.headers.cookie || "");
  req.username = cookies.username ? cookies.username : null;
  console.log("HTTP request", req.username, req.method, req.url, req.body);
  next();
});

APP.get('/eligibility', (req, res) => {
  const interchange = parse271(req.body.edi);

  const coverage = extractCoverage(interchange);
  const copay = extractCopay(interchange);
  const pharma = extractPharmacy(interchange);

  return res.json({ coverage, copay, pharma });
});

APP.listen(PORT, () => {
  console.log(`Server listening on PORT ${PORT}`)
});