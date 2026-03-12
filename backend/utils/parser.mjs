import { X12Parser, X12QueryEngine } from "node-x12";
import { strToDate } from "./utils.mjs";

const BENEFIT_CODE_NAMES = {
  '1': 'Active Coverage'
}

const COPAY_CODE_NAMES = {
  '86': 'Emergency Services',
  '98': 'Professional (Physician) Visit - Office',
  'AL': 'Vision (Optometry)',
  'UC': 'Urgent Care'
}

// Takes a 271 response as a string and returns an interchange object
export function parse271(ediStr) {
  const parser = new X12Parser(true);
  const interchange = parser.parse(ediStr);
  return interchange;
}

// Takes an interchange object and a string to search,
// returns an array of values matching the search
export function queryInterchange(interchange, search) {
  const query = new X12QueryEngine(true);
  const result = query.query(interchange, search);
  return result.map(res => res.value);
}

// Takes interchange and returns coverage data
export function extractCoverage(interchange) {
  const benefitCode = queryInterchange(interchange, 'EB01:EB03["30"]');
  if (benefitCode.length === 0)
    return null;
  const type = BENEFIT_CODE_NAMES[benefitCode[0]];
  const startDate = queryInterchange(interchange, 'DTP03:DTP01["291"]')[0];
  return { type, 'startDate': strToDate(startDate) };
}

// Takes interchange and returns copay data
export function extractCopay(interchange) {
  const copays = queryInterchange(interchange, 'EB03:EB01["B"]');
  return copays.map(code => {
    const name = COPAY_CODE_NAMES[code];
    const amount = queryInterchange(interchange, `EB05:EB03["${code}"]`)[0];
    return { name, amount };
  });
}

// Takes interchange and returns pharmacy data (if exists)
export function extractPharmacy(interchange) {
  const pharmCode = queryInterchange(interchange, 'EB03:EB03["88"]');
  if (pharmCode.length === 0) 
    return null;
  const bin = queryInterchange(interchange, 'REF02:REF01["6P"]')[0];
  const pcn = queryInterchange(interchange, 'REF02:REF01["HJ"]')[0];
  const group = queryInterchange(interchange, 'REF02:REF01["CE"]')[0];
  return { bin, pcn, group };
}
