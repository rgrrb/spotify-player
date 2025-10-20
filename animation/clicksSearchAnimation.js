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