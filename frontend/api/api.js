const backendDomain = "http://localhost:4000";

let creds = {};

async function send(method, url, data) {
  console.log(method, backendDomain+url, data);
  const res = await fetch(backendDomain+url, {
    method: method,
    headers: { 
      "Content-Type": "application/json",
      username: creds.username,
      password: creds.password,
      organization: creds.organization
    },
    credentials: "include",
    body: (data) ? JSON.stringify(data) : null,
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(body);
  }
    
  return res;
}

export function setCreds(newCreds) {
  creds = newCreds;
}

export async function signup(username, password, organization) {
  const res = await send("POST", "/signup", { username, password, organization });
  return await res.json();
}

export function getEligibility(data) {
  return send("POST", "/eligibility", data);
}

export function updateRole(username, newRole) {
  return send("PATCH", "/role", { username, newRole });
}

export function deleteUser(username) {
  return send("DELETE", "/user", { username });
}