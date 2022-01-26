<script>
  import { onMount } from 'svelte'
  export let baseurl = ''
  export let title = 'Gancio events'
  export let maxlength = false
  export let tags = ''
  export let places = ''
  export let theme = 'light'

  let mounted = false
  let events = []

  function update (v) {
    if (!mounted) return
    const params = []
    if (maxlength) {
      params.push(`max=${maxlength}`)
    }

    if(tags) {
      params.push(`tags=${tags}`)
    }

    if (places) {
      params.push(`places=${places}`)
    }
    
    fetch(`${baseurl}/api/events?${params.join('&')}`)
    .then(res => res.json())
    .then(e => {
      events = e
    })
    .catch(e => {
      console.error('Error loading Gancio API -> ', e)
    })
  }

  
  function when (timestamp) {
    return new Date(timestamp*1000)
            .toLocaleDateString(undefined,
              {
                weekday: 'long',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })
  }


  onMount(() => {
    mounted = true
    update()
  })
  $: update(maxlength && title && places && tags && theme)

</script>
<svelte:options tag="gancio-events"/>
{#if events.length}
<div id='gancioEvents' class='{theme}'>
  <a href='{baseurl}' target='_blank'>
    <div class='content'>
      <span id='headerTitle'>{title || 'Gancio'}</span>
      <img id='logo' alt='logo' src='{baseurl}/logo.png'/>
    </div>
  </a>
  {#each events as event}
    <a href='{baseurl}/event/{event.slug || event.id}' title='{event.title}' target='_blank'>
      <div class='content'>
        <div class='subtitle'>
          {when(event.start_datetime)}
          <span class='place'>@{event.place.name}</span>
        </div>
        <div class='title'>
          {event.title}
        </div>
      </div>
    </a>
    {/each}
</div>
{/if}
<style>

#gancioEvents {
  font-family:'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;
  overflow-x: hidden;
  font-size: 1rem;
  width: 100%;
  max-width: 500px;
  box-sizing: content-box;
  box-shadow: rgba(60, 64, 67, 0.4) 0px 1px 2px 0px, rgba(60, 64, 67, 0.25) 0px 1px 3px 1px;
  border-radius: 5px;
}

#logo {
  position: absolute;
  top: 10px;
  right: 10px;
  height: 40px;
}

#headerTitle {
  line-height: 45px;
  font-size: 1.3rem;
  font-weight: 600;
}

a {
  text-decoration: none;
  color: var(--text-color);
  display: flex;
  flex-direction: column;
  flex: 1 1 100%;
  padding: 8px 20px;
  margin: 0;
  line-height: 1.275rem;
  font-weight: 400;
  font-size: .875rem;
  position: relative;
  transition: background-color .3s cubic-bezier(.25,.8,.5,1), padding-left .3s;
  box-sizing: content-box;
}

.dark {
  --bg-odd-color: #161616;
  --bg-even-color: #222;
  --bg-hover-color: #333;
  --text-color: white;
  --title-color: white;
}

.light {
  --bg-odd-color: #f5f5f5;
  --bg-even-color: #FAFAFA;
  --bg-hover-color: #EEE;
  --text-color: #222;
  --title-color: black;
}
a:nth-child(odd) {
  background-color: var(--bg-odd-color);
}

a:nth-child(even) {
  background-color: var(--bg-even-color);
}

a:first-child {
  border-radius: 5px 5px 0px 0px;
}

a:last-child {
  border-radius: 0px 0px 5px 5px;
  padding-bottom: 5px;
}

a:hover {
  background-color: var(--bg-hover-color);
  padding-left: 23px;
}

.place {
  font-weight: 600;
  color: #ff6e40;
}

.title {
  color: var(--title-color);
  font-weight: bold;
}

</style>
