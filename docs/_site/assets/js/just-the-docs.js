// Event handling

function addEvent (el, type, handler) {
  if (el.attachEvent) { el.attachEvent('on' + type, handler) } else { el.addEventListener(type, handler) }
}
function removeEvent (el, type, handler) {
  if (el.detachEvent) { el.detachEvent('on' + type, handler) } else { el.removeEventListener(type, handler) }
}

// Show/hide mobile menu

function toggleNav () {
  const nav = document.querySelector('.js-main-nav')
  const auxNav = document.querySelector('.js-aux-nav')
  const navTrigger = document.querySelector('.js-main-nav-trigger')
  const search = document.querySelector('.js-search')

  addEvent(navTrigger, 'click', function () {
    const text = navTrigger.textContent
    let textToggle = navTrigger.getAttribute('data-text-toggle')

    nav.classList.toggle('nav-open')
    auxNav.classList.toggle('nav-open')
    navTrigger.classList.toggle('nav-open')
    search.classList.toggle('nav-open')
    navTrigger.textContent = textToggle
    navTrigger.setAttribute('data-text-toggle', text)
    textToggle = text
  })
}

// Site search

function initSearch () {
  const index = lunr(function () {
    this.ref('id')
    this.field('title', { boost: 20 })
    this.field('content', { boost: 10 })
    this.field('url')
  })

  // Get the generated search_data.json file so lunr.js can search it locally.

  sc = document.getElementsByTagName('script')
  source = ''

  for (idx = 0; idx < sc.length; idx++) {
    s = sc.item(idx)

    if (s.src && s.src.match(/just-the-docs\.js$/)) { source = s.src }
  }

  jsPath = source.replace('just-the-docs.js', '')

  jsonPath = jsPath + 'search-data.json'

  const request = new XMLHttpRequest()
  request.open('GET', jsonPath, true)

  request.onload = function () {
    if (request.status >= 200 && request.status < 400) {
      // Success!
      const data = JSON.parse(request.responseText)
      const keys = Object.keys(data)

      for (const i in data) {
        index.add({
          id: data[i].id,
          title: data[i].title,
          content: data[i].content,
          url: data[i].url
        })
      }
      searchResults(data)
    } else {
      // We reached our target server, but it returned an error
      console.log('Error loading ajax request. Request status:' + request.status)
    }
  }

  request.onerror = function () {
    // There was a connection error of some sort
    console.log('There was a connection error')
  }

  request.send()

  function searchResults (dataStore) {
    const searchInput = document.querySelector('.js-search-input')
    const searchResults = document.querySelector('.js-search-results')
    const store = dataStore

    function hideResults () {
      searchResults.innerHTML = ''
      searchResults.classList.remove('active')
    }

    addEvent(searchInput, 'keyup', function (e) {
      const query = this.value

      searchResults.innerHTML = ''
      searchResults.classList.remove('active')

      if (query === '') {
        hideResults()
      } else {
        const results = index.search(query)

        if (results.length > 0) {
          searchResults.classList.add('active')
          const resultsList = document.createElement('ul')
          searchResults.appendChild(resultsList)

          for (const i in results) {
            const resultsListItem = document.createElement('li')
            const resultsLink = document.createElement('a')
            const resultsUrlDesc = document.createElement('span')
            const resultsUrl = store[results[i].ref].url
            const resultsRelUrl = store[results[i].ref].relUrl
            const resultsTitle = store[results[i].ref].title

            resultsLink.setAttribute('href', resultsUrl)
            resultsLink.textContent = resultsTitle
            resultsUrlDesc.textContent = resultsRelUrl

            resultsList.classList.add('search-results-list')
            resultsListItem.classList.add('search-results-list-item')
            resultsLink.classList.add('search-results-link')
            resultsUrlDesc.classList.add('fs-2', 'text-grey-dk-000', 'd-block')

            resultsList.appendChild(resultsListItem)
            resultsListItem.appendChild(resultsLink)
            resultsLink.appendChild(resultsUrlDesc)
          }
        }

        // When esc key is pressed, hide the results and clear the field
        if (e.keyCode == 27) {
          hideResults()
          searchInput.value = ''
        }
      }
    })

    addEvent(searchInput, 'blur', function () {
      setTimeout(function () { hideResults() }, 300)
    })
  }
}

function pageFocus () {
  const mainContent = document.querySelector('.js-main-content')
  mainContent.focus()
}

// Document ready

function ready () {
  toggleNav()
  pageFocus()
  if (typeof lunr !== 'undefined') {
    initSearch()
  }
}

// in case the document is already rendered
if (document.readyState != 'loading') { ready() }
// modern browsers
else if (document.addEventListener) { document.addEventListener('DOMContentLoaded', ready) }
// IE <= 8
else {
  document.attachEvent('onreadystatechange', function () {
    if (document.readyState == 'complete') { ready() }
  })
}
