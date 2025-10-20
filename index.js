var clientID = 'c5784e0289794de89e5763a3f5d59243';
var clientSecret = 'f16bb63e71b543f39ec9bb3cff47d1d1';

async function getToken() {
  const authString = btoa(clientID + ':' + clientSecret);

  const result = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + authString
    },
    body: 'grant_type=client_credentials'
  });
  const data = await result.json();
  localStorage.setItem("token", data.access_token)
  return data.access_token;

}
async function getTracksSearched(searched) {
  const result = await fetch(`https://api.spotify.com/v1/search?q=${searched}&type=album`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Bearer ' + localStorage.getItem("token")
    },
  });
  return await result.json()
}
async function getAlbum(id) {

  const result = await fetch(`https://api.spotify.com/v1/albums/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Bearer ' + localStorage.getItem("token")
    },
  });
  return await result.json()
}
async function getAlbumTracks(id) {

  const result = await fetch(`https://api.spotify.com/v1/albums/${id}/tracks`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Bearer ' + localStorage.getItem("token")
    },
  });
  return await result.json()
}

document.getElementById("query-content").addEventListener("focusout", createTracksSearched())
document.getElementById("login").addEventListener("click", setupAuthentication())

async function init() {
  await getToken()
}

init()