let DB = [
  {
    username: 'admin',
    password: '$2b$10$w.DyyElEBhpM.0.hYskSgOfN8FMxSMgUTLwy34q1TQzEdBlZJSA7G',
    organization: 'ORG',
    role: 'admin'
  },
  {
    username: 'user',
    password: '$2b$10$WRthTy4g4pymQ/WlWfIEruZQjVS.yRSjkSEPTGpwXQ/q.hdNHX0cS',
    organization: 'ORG',
    role: 'user'
  }
];

export function createRecord(record) {
  return DB.push(record);
}

export function readRecord(filterFunc) {
  return DB.filter(filterFunc);
}

export function updateRecord(newRecord, filterFunc) {
  DB = DB.map(record => filterFunc(readRecord) ? newRecord : record);
  return newRecord;
}

export function deleteRecord(filterFunc) {
  const prevLen = DB.length;
  DB = DB.filter(record => !filterFunc(record));
  return prevLen - DB.length;
}