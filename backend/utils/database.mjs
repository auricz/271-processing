let DB = [{
  username: 'admin',
  password: '$2b$10$w.DyyElEBhpM.0.hYskSgOfN8FMxSMgUTLwy34q1TQzEdBlZJSA7G',
  organization: 'ORG',
  role: 'admin'
  },
  {
    username: 'admina',
    password: '$2b$10$QQf.WUbBStO76vqpTk39qOuJ6iWMgAqrtlCd39FjbnQXmDD2PBUoG',
    organization: 'ORG',
    role: 'pending'
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