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
  //https://api.spotify.com/v1/search?q=${searched}&type=album
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


const aside = document.getElementById('aside');
const searchBar = document.getElementById('search-bar');
const queryInput = document.getElementById('query-content');


queryInput.addEventListener('focus', () => {
  aside.classList.add('onclick');
  searchBar.classList.add('onclick');
  queryInput.classList.add('onclick');
});

document.addEventListener('click', (event) => {

  const isClickInsideAside = aside.contains(event.target);
  const isClickInsideSearchBar = searchBar.contains(event.target);


  if (!isClickInsideAside && !isClickInsideSearchBar) {
    aside.classList.remove('onclick');
    searchBar.classList.remove('onclick');
    queryInput.classList.remove('onclick');
  }
});

async function createTracksSearched() {


  const searchedTrack = document.getElementById("query-content").value
  const result = await getTracksSearched(searchedTrack)

  const songsFoundList = document.getElementById("songs-found-list")

  let items = result.albums['items']

  songsFoundList.replaceChildren()

  items.forEach(function (item) {

    const songsFound = document.createElement("div")
    songsFound.classList.add("song-found")

    songsFound.addEventListener('click', async function () {
      document.getElementById("container-content").replaceChildren()


      const albumsResult = await getAlbum(item.id)

      let containerContent = document.getElementById("container-content")

      let leftContent = document.createElement("div")
      leftContent.classList.add("left-content")

      let topContent = document.createElement("div")
      topContent.classList.add("top-content")

      let contentMusicTitle = document.createElement("div")
      contentMusicTitle.classList.add("content-music-title")

      let gradientImg = document.createElement("div")
      gradientImg.classList.add("gradient-img")

      let topSpan = document.createElement("span")
      topSpan.textContent = albumsResult['artists'][0].name

      let topP = document.createElement("p")
      topP.textContent = "Músicas"


      let imgAlbum = document.createElement("img")
      imgAlbum.src = albumsResult['images'][0].url

      let gradient = document.createElement("div")
      gradient.classList.add("gradient")

      gradientImg.append(imgAlbum, gradient)

      contentMusicTitle.append(topSpan, topP)
      topContent.append(contentMusicTitle, gradientImg)
      leftContent.append(topContent)

      containerContent.prepend(leftContent)

      let bottomContent = document.createElement("div")
      bottomContent.classList.add("bottom-content")

      let tracksResult = await getAlbumTracks(item.id)

      for (const content of tracksResult.items) {

        let songsList = document.createElement("div")
        songsList.classList.add("songs-list")

        let displaySong = document.createElement("div")
        displaySong.classList.add("display-song")

        displaySong.addEventListener('click', (e) => {

          e.stopPropagation();

          const userToken = localStorage.getItem("access_token");

          if (!userToken) {
            alert("Por favor, faça o login para tocar músicas.");
            return;
          }


          console.log("Tocando:", content.uri);

          playTrack(content.uri, userToken);
        });

        let descriptionStyle = document.createElement("div")
        descriptionStyle.classList.add("description-style")

        let imgSong = document.createElement("img")
        let dominantColor = await getDominantColorFromImage(albumsResult['images'][0].url);

        let gradiente = `linear-gradient(90deg, rgb(${dominantColor.r}, ${dominantColor.g}, ${dominantColor.b}) 0%, rgba(0, 0, 0, 1) 79%)`;

        contentMusicTitle.style.background = gradiente;
        imgSong.src = albumsResult['images'][0].url

        let trackP = document.createElement("p")
        trackP.textContent = content.name

        let trackSpan = document.createElement("span")
        trackSpan.textContent = formatMilliseconds(content.duration_ms)

        songsList.append(displaySong)
        descriptionStyle.append(trackP, trackSpan)
        displaySong.append(imgSong, descriptionStyle)
        bottomContent.appendChild(displaySong)
        leftContent.appendChild(bottomContent)
      }
    });

    const img = document.createElement("img")
    img.classList.add("artist-icon-search-bar")

    const media_details = document.createElement("div")
    media_details.classList.add("media-details")

    const title = document.createElement("p")


    const timer = document.createElement("span")

    if (item.images?.length > 0)
      img.src = item.images[0].url

    title.textContent = item.name

    if (item.total_tracks > 0)
      timer.textContent = `${item.total_tracks} SONGS`

    if (item.duration_ms > 0)
      timer.textContent = formatMilliseconds(item.duration_ms)

    media_details.append(title, timer)
    songsFound.append(img, media_details)
    songsFoundList.appendChild(songsFound)
  });

}

document.getElementById("query-content").addEventListener("focusout", createTracksSearched())

async function init() {
  await getToken()
}

document.getElementById("login").addEventListener("click", setupAuthentication())

init()