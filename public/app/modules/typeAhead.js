import { $, $$ } from './bling';
import dompurify from 'dompurify';

const typeAheadApp =  {
  init () {
    this.searchInput = $('#search');
    this.searchResults = $('.search__results-box');
    if(!this.searchInput || !this.searchResults)
      return;
    this.searchResultsUl = this.searchResults.querySelector('.search__results');
    
    this.setupEventListeners();
  },

  setupEventListeners () {
    const fetchResults = this.fetchResults.bind(this);
    const handleKeyboardInputs = this.handleKeyboardInputs.bind(this);
    this.searchInput.on('input', fetchResults);
    this.searchInput.on('keyup', handleKeyboardInputs);
  },
  
  fetchResults(e) {
    if (!e.target.value) {
        this.searchResults.style.display = 'none';
        return; // stop!
    }
    
    this.searchResults.style.display = 'block';

    fetch(`/api/v1/search?q=${e.target.value}`)
      .then(res => res.json())
      .then(data => {
        if (data.length) {
          this.searchResultsUl.innerHTML = dompurify.sanitize(this.searchResultsHTML(data));
          return;
        }
        // tell them nothing came back
        this.searchResultsUl.innerHTML = dompurify.sanitize(`<li class="search__result" style="padding: .25em .5em">No results for ${e.target.value}</li>`);
      })
      .catch(err => {
        console.error(err);
      });
    
  },
  
  searchResultsHTML(stores) {
    return stores.map(store => {
      return `
      <li class="search__result">
        <a class="search__link" href="/store/${store.slug}" class="search__result">
          <strong>${store.name}</strong>
        </a>
       </li>
      `;
    }).join('');
  },
   
  // handle keyboard inputs
  handleKeyboardInputs (e) {
    if (![38, 40, 13, 27].includes(e.keyCode)) {
      return; // nah
    }
    const activeClass = 'search__result--active';
    const current = this.searchResults.querySelector(`.${activeClass}`);
    const items = this.searchResults.querySelectorAll('.search__result');
    let next;
    if (e.keyCode === 40 && current) {
      next = current.nextElementSibling || items[0];
    } else if (e.keyCode === 40) {
      next = items[0];
    } else if (e.keyCode === 38 && current) {
      next = current.previousElementSibling || items[items.length - 1]
    } else if (e.keyCode === 38) {
      next = items[items.length - 1];
    } else if (e.keyCode === 13 && current.querySelector('.search__link').href) {
      window.location = current.querySelector('.search__link').href;
      return;
    } else if (e.keyCode === 27){
      e.target.value = '';
      this.searchResults.style.display = 'none';
      return;
    }
    if (current) {
      current.classList.remove(activeClass);
    }
    next.classList.add(activeClass);
  }
} 

export default typeAheadApp;