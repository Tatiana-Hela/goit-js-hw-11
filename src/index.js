import { Notify } from 'notiflix';
import { Loading } from 'notiflix/build/notiflix-loading-aio';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

import { refs } from './js/refs';
import { createGallery } from './js/createGallery';
import { PixabayAPI } from './js/PixabayAPI';
import { formToJSON } from 'axios';

const pixabayApi = new PixabayAPI();

refs.loadMoreBtn.setAttribute('disabled', true);

let page = 1;

refs.searchForm.addEventListener('submit', onFormSubmit);
refs.loadMoreBtn.addEventListener('click', onLoadMore);

async function onFormSubmit(e) {
  e.preventDefault();

  setTimeout(() => {
    refs.submitBtn.blur();
  }, 200);

  const {
    elements: { searchQuery },
  } = e.currentTarget;

  const searchValue = searchQuery.value.trim().toLowerCase();

  if (!searchValue) {
    Notify.failure('What would you like to see?');
    return;
  }
  page = 1;
  pixabayApi.query = searchValue;
  const data = await pixabayApi.getImagesByQuery(page);

  if (data.hits.length === 0) {
    Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
    return;
  }

  if (data.hits.length > 6) {
  }
  Loading.standard('Loading...', {
    backgroundColor: 'rgba(0,0,0,0.8)',
  });
  Notify.success(`Hooray! We found ${data.totalHits} images.`);

  const markup = createGallery(data.hits);
  refs.gallery.innerHTML = markup;

  lightbox.refresh();
  Loading.remove();
  if (page < Math.ceil(data.totalHits / 40)) {
    refs.loadMoreBtn.removeAttribute('disabled');
  }
  if (page >= Math.ceil(data.totalHits / 40)) {
    refs.loadMoreBtn.setAttribute('disabled', true);
  }
  refs.searchForm.reset();
  refs.searchInput.blur();
}

async function onLoadMore(e) {
  page += 1;

  setTimeout(() => {
    refs.loadMoreBtn.blur();
  }, 200);

  Loading.standard('Loading...', {
    backgroundColor: 'rgba(0,0,0,0.8)',
  });

  const data = await pixabayApi.getImagesByQuery(page);
  lightbox.refresh();
  Loading.remove();
  const markup = createGallery(data.hits);
  refs.gallery.insertAdjacentHTML('beforeend', markup);
  page += 1;

  const totalPage = (await data.totalHits) / 40;
  if (page >= totalPage) {
    Notify.info("We're sorry, but you've reached the end of search results.");
    refs.loadMoreBtn.setAttribute('disabled', true);
  }
  // await smoothScroll();
}

// async function smoothScroll() {
//   const { height: cardHeight } =
//     refs.gallery.firstElementChild.getBoundingClientRect();

//   window.scrollBy({
//     top: cardHeight * 2,
//     behavior: 'smooth',
//   });
// }

const lightbox = new SimpleLightbox('.gallery a', {
  captionsData: 'alt',
  captionPosition: 'bottom',
  captionDelay: 250,
});
