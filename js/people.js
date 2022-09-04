let day = document.getElementById('day');
day.addEventListener('click', get);

let week = document.getElementById('week');
week.addEventListener('click', getWeek);

let previous = document.getElementById('previous');
previous.addEventListener('click', getPrevious);

let next = document.getElementById('next');
next.addEventListener('click', getNext);

let populate = document.querySelector('.populate');

let base_url = 'https://image.tmdb.org/t/p/w500';

let allCards = document.getElementsByClassName('card');

let popup_btn = document.getElementById('popup-btn');

let title = document.querySelector(".modal-title");
let body = document.querySelector(".modal-body");
let img = document.querySelector(".modal-img");
let known_for = document.querySelector(".modal-known-for");
let ratings = document.querySelector(".modal-ratings");
let runtime = document.querySelector(".modal-runtime");
let castText = document.querySelector(".castText");
let form = document.getElementById('form');
let search = document.getElementById('search');
let search_btn = document.getElementById('search-btn');
let totalSearchPages;

let cast = document.querySelector(".cast");
let allCast = document.querySelector(".allCast");

let dayPage = 1;
let weekPage = 1;
let searchPage = 1;

get()

async function get() {
  day.focus();
  (week.classList.contains('btn-active')) ? week.classList.remove('btn-active') : day.classList.add('btn-active');
  (search_btn.classList.contains('search-active')) ? search_btn.classList.remove('search-active') : day.classList.add('btn-active');
  day.classList.add('btn-active');

  resetSearchText();

  const response = await fetch(`https://api.themoviedb.org/3/trending/person/day?api_key=${apikey}&page=${dayPage}`);
  const data = await response.json();
  show(data.results);
}

async function getWeek() {
  week.focus();
  (day.classList.contains('btn-active')) ? day.classList.remove('btn-active') : week.classList.add('btn-active');
  (search_btn.classList.contains('search-active')) ? search_btn.classList.remove('search-active') : week.classList.add('btn-active');
  week.classList.add('btn-active');

  resetSearchText();

  const response = await fetch(`https://api.themoviedb.org/3/trending/person/week?api_key=${apikey}&page=${weekPage}`);
  const data = await response.json();
  show(data.results);
}

async function show(data) {
  (day.classList.contains('btn-active')) ? toggleDisableDay() : toggleDisableWeek();

  movie_cards = "";
  data.forEach((e, index) => {
    card = `<div onclick= 'showMovies(${e.id}), popup_btn.click()' class="card" style="width: 18rem;">
        <img src = "${data[index].profile_path ? base_url + data[index].profile_path : "images/profile (1).png"}" class="card-img-top" alt="${data[index].name}">
        <div class="card-body">
          <h5 id="title">${data[index].name}</h5>
        </div>
      </div>`
    movie_cards += card;
  });

  populate.innerHTML = movie_cards;

}


async function showDetails(id, popup_show) {
  cast.innerHTML = ""

  const dataById = await fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=${apikey}&language=en-US`)
    .then((response) => response.json())
    .then((modalData) => {

      castText.innerText = "Cast";
      known_for.innerText = "";
      ratings.innerText = "Ratings: " + modalData.vote_average.toFixed(2) + " " + `(${modalData.vote_count})`;
      runtime.innerText = "Duration: " + Math.floor(modalData.runtime / 60) + "h " + modalData.runtime % 60 + "m";
      title.innerText = modalData.title;
      body.innerText = modalData.overview;
      img.innerHTML = `<img src= '${modalData.poster_path ? base_url + modalData.poster_path : "images/profile (1).png"}' alt="">`
    });

  const castDetailsById = await fetch(`https://api.themoviedb.org/3/movie/${id}/credits?api_key=${apikey}`)
    .then((response) => response.json())
    .then((castDetails) => {

      castDetails.cast.forEach(e => {
        castCard = `<div onclick= 'showMovies(${e.id})' style="margin: 0px 5px">
        <img src="${e.profile_path ? base_url + e.profile_path : "images/profile (1).png"}" class="card-img-top" alt="${e.title}">
          <h5 id="title">${e.name}</h5>
      </div>`
        cast.innerHTML += castCard;
      });

    });

  allCast.innerHTML = cast.innerHTML;
  if (popup_show) {
    popup_btn.click()
  }

}

async function showMovies(id) {
  const resp = await fetch(`https://api.themoviedb.org/3/person/${id}/movie_credits?api_key=${apikey}`);
  const movieList = await resp.json();

  actorCards = "";

  const actorInfo = await fetch(`https://api.themoviedb.org/3/person/${id}?api_key=${apikey}&language=en-US`)
  const actorDetails = await actorInfo.json();

  castText.innerText = "Seen in"
  known_for.innerText = "Known for: " + actorDetails.known_for_department;
  ratings.innerText = "";
  runtime.innerText = "";
  title.innerText = actorDetails.name;
  body.innerText = actorDetails.biography.includes('\n') ? actorDetails.biography.substr(0, actorDetails.biography.indexOf('\n')) : actorDetails.biography;
  img.innerHTML = `<img src= '${actorDetails.profile_path ? base_url + actorDetails.profile_path : "images/profile (1).png"}' alt="">`

  movieList.cast.forEach(e => {
    actorCard = `<div onclick = 'showDetails(${e.id}, false)' class="dump-card" style="margin: 0px 5px" > 
          <img src="${e.poster_path ? base_url + e.poster_path : "images/profile (1).png"}" class="card-img-top" alt="${e.title}">
          <div class="card-body">
          <h5 id="title">${e.title}</h5>
          </div>
          </div>`
    actorCards += actorCard;
  });

  allCast.innerHTML = actorCards
}

async function getNext() {
  if (search_btn.classList.contains("search-active")) {
    searchPage++;
    searchByText(search.value);
  }
  else if (day.classList.contains("btn-active")) {
    dayPage++;
    get();
  }
  else {
    weekPage++;
    getWeek();
  }
}

async function toggleDisableDay() {
  (dayPage > 1) ? previous.disabled = false : previous.disabled = true;
}

async function toggleDisableWeek() {
  (weekPage > 1) ? previous.disabled = false : previous.disabled = true;
}

async function toggleDisableSearch() {
  (searchPage > 1) ? previous.disabled = false : previous.disabled = true;
  (searchPage >= totalSearchPages) ? next.disabled = true : next.disabled = false;
}

async function getPrevious() {
  if (search_btn.classList.contains("search-active")) {
    searchPage--;
    searchByText(search.value);
  }
  else if (day.classList.contains("btn-active")) {
    dayPage--;
    get(dayPage);
  }
  else {
    weekPage--;
    getWeek(weekPage);
  }
}
function resetSearchText() {
  search.value = "";
  searchPage = 1;
}


form.addEventListener('submit', (e) => {
  e.preventDefault();

  if (search.value) {
    (day.classList.contains("btn-active")) ? day.classList.remove("btn-active") : search_btn.classList.add("search-active");
    (week.classList.contains("btn-active")) ? week.classList.remove("btn-active") : search_btn.classList.add("search-active");
    search_btn.classList.add("search-active")
  }

  const searchText = search.value;
  searchPage = 1;
  searchByText(searchText);
});

async function searchByText(searchText) {
  const moviesBySearch = await fetch(`
  https://api.themoviedb.org/3/search/person?api_key=${apikey}&language=en-US&query=${searchText}&page=${searchPage}`);
  const searchDetails = await moviesBySearch.json();
  totalSearchPages = (searchDetails.total_pages);

  toggleDisableSearch();

  searchDetails.results.forEach(e => {
    showMoviesBySearch(`${e.id}`);
  });
}

async function showMoviesBySearch(id) {
  populate.innerHTML = "";

  const dataById = await fetch(`https://api.themoviedb.org/3/person/${id}?api_key=${apikey}&language=en-US`);
  const modalData = await dataById.json();

  card = `<div onclick= 'showMovies(${modalData.id}), popup_btn.click()' class="card" style="width: 18rem;">
  <img src = "${modalData.profile_path ? base_url + modalData.profile_path : "images/profile (1).png"}" class="card-img-top" alt="${modalData.name}">
  <div class="card-body">
    <h5 id="title">${modalData.name}</h5>
  </div>
</div>`

  populate.innerHTML += card;
}
