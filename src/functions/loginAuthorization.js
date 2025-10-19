const CLIENT_ID = 'c5784e0289794de89e5763a3f5d59243'; 
const REDIRECT_URI = "http://127.0.0.1:5500/index.html";
const SCOPES = [
  "user-read-private", 
  "user-read-email",
  "streaming", 
  "user-modify-playback-state" 
].join(" ");

function generateRandomString(length) {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}


function base64encode(str) {
  return btoa(String.fromCharCode.apply(null, new Uint8Array(str)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function generateCodeChallenge(codeVerifier) {
  const data = new TextEncoder().encode(codeVerifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return base64encode(digest);
}


async function redirectToAuthCodeFlow() {
  const codeVerifier = generateRandomString(128);
  const codeChallenge = await generateCodeChallenge(codeVerifier);

  localStorage.setItem("code_verifier", codeVerifier);

  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientID,
    scope: SCOPES,
    redirect_uri: REDIRECT_URI,
    code_challenge_method: "S256",
    code_challenge: codeChallenge,
  });

  window.location = `https://accounts.spotify.com/authorize?${params.toString()}`;
}

async function exchangeToken(code) {
  const codeVerifier = localStorage.getItem("code_verifier");

  const body = new URLSearchParams({
    client_id: clientID,
    grant_type: "authorization_code",
    code,
    redirect_uri: REDIRECT_URI,
    code_verifier: codeVerifier,
  });

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body,
  });

  const data = await response.json();
  localStorage.setItem("access_token", data.access_token);
  console.log("Access Token:", data.access_token);
  return data.access_token;
}

async function fetchProfile(token) {
  const response = await fetch("https://api.spotify.com/v1/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await response.json();
  console.log("Perfil do usuário:", data);
}

function setupAuthentication() {

  const loginButton = document.getElementById("login");
  
  if (loginButton) {
    loginButton.addEventListener("click", () => {
      redirectToAuthCodeFlow();
    });
  } else {
    console.error("Elemento de login não encontrado. Verifique o ID.");
  }

  (async () => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");

    if (code) {

      const token = await exchangeToken(code);
      await fetchProfile(token);

      initializeSpotifyPlayer(token);

      window.history.pushState({}, document.title, window.location.pathname);
    }
  })();
}