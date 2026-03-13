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

export async function getEligibility(data) {
  const res = await send("POST", "/eligibility", data);
  return await res.text();
}

export async function publish271(edi) {
  const res = await send("POST", "/publish271", { edi });
  return await res.json();
}

export function updateRole(username, newRole) {
  return send("PATCH", "/role", { username, newRole });
}

export function deleteUser(username) {
  return send("DELETE", "/user", { username });
}