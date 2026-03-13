export function parseLicense(text) {

  const nameMatch = text.match(/\n[A-Z]+\n[A-Z]+/)
  const shortName = text.match(/\n[A-Z]+[\n\s][A-Z][\n\s]/)
  const dateMatch = text.match(/\d+\/\d+\/\d+/g)
  const licenseMatch = text.match(/[\n\s]\d+\s\d+\s\d+[\n\s]/)
  const addressMatch = text.match(/\n\d+\s[A-Z]+\s[A-Z]+[\n\s][A-Z\s]+,\s[A-Z]+\s\d+\n/)

  return {
    name: nameMatch ? 
      nameMatch[0].trim().replace('\n', ' ') 
      : shortName ? 
      shortName[0].trim().replace('\n', ' ') 
      : null,
    dateOfBirth: dateMatch ? dateMatch[0] : null,
    licenseNumber: licenseMatch ? licenseMatch[0].trim().replace('\n', ' ') : null,
    address: addressMatch ? addressMatch[0].trim().replace('\n', ', ') : null,
    expiryDate: dateMatch ? dateMatch[1] : null,
    // rawText: text
  }
}