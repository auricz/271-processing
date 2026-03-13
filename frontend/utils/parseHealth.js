export function parseHealthCard(text) {

  const firstNameLine = text.match(/\n[A-Z]+ [A-Z]+ /)
  const secNameLine = text.match(/\n[A-Z]+ [A-Z] /)
  const planId = text.match(/\d+-\d+-\d/)
  const memberId = text.match(/Member ID: \d+/)
  const groupNum = text.match(/Group Number: \d+/)

  return {
    name: firstNameLine && secNameLine ? 
      firstNameLine[0].trim() + ' ' + secNameLine[0].trim() 
      : null,
    planId: planId ? planId[0].trim(): null,
    memberId: memberId ? memberId[0].match(/\d+/)[0] : null,
    groupNum: groupNum ? groupNum[0].match(/\d+/)[0] : null,
    // rawText: text
  }
}