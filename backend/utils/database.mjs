let DB = [{
  username: 'admin',
  password: '$2b$10$w.DyyElEBhpM.0.hYskSgOfN8FMxSMgUTLwy34q1TQzEdBlZJSA7G',
  salt: '$2b$10$w.DyyElEBhpM.0.hYskSgO',
  organization: 'ORG',
  role: 'admin'
}];

export function createRecord(record) {
  console.log(record);
  return DB.push(record);
}

export function readRecord(filterFunc) {
  DB = DB.filter(filterFunc);
  return DB;
}

export function updateRecord(newRecord, filterFunc) {
  let changes = 0;
  DB = DB.map(record => {
    if (filterFunc(readRecord)) {
      changes++;
      return newRecord;
    }
    return record;
  });
  return changes;
}

export function deleteRecord(filterFunc) {
  const prevLen = DB.length;
  DB = DB.filter(record => !filterFunc(record));
  return prevLen - DB.length;
}