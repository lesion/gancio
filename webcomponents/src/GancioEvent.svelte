<script>
  import { onMount } from 'svelte'
  export let baseurl = 'https://demo.gancio.org'
  export let id

  let mounted = false
  let event

  function update (id, baseurl) {
    if (mounted) {
      fetch(`${baseurl}/api/event/${id}`)
        .then(res => res.json())
        .then(e => event = e)
    }
  }

  onMount(() => {
    mounted = true
    update(id, baseurl)
  })
  $: update(id, baseurl)

  function when (event) {
    return new Date(event.start_datetime*1000)
      .toLocaleDateString(undefined,
        {
          weekday: 'long',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
  }

  function thumbnail(event) {
    return `${baseurl}/media/thumb/${event.media[0].url}`
  }

  function position(event) {
    if (event.media[0].focalpoint) {
        const focalpoint = event.media[0].focalpoint
        return `${(focalpoint[0] + 1) * 50}% ${(focalpoint[1] + 1) * 50}%`
      }
      return 'center center'    
  }

</script>
<svelte:options tag="gancio-event"/>
{#if event}
<a href='{baseurl}/event/{event.slug || event.id}' class='card' target='_blank'>
  {#if event.media.length}
  <img src="{thumbnail(event)}" alt="{event.media[0].name}" style="object-position: {position(event)}; aspect-ratio=1.7778;">
  {/if}
  <div class="container">
    <strong>{event.title}</strong>
    <div>{when(event)}</div>
    <div class='place'>@{event.place.name}</div>
  </div>
</a>
{/if}
<style>
.card {
  display: block;
  font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;
  box-shadow: 0 4px 8px 0 rgba(0,0,0,0.2);
  transition: 0.3s;
  border-radius: 5px; /* 5px rounded corners */
  max-width: 500px;
  text-decoration: none;
  color: white;
  background-color: #1e1e1e;
  overflow: hidden;
}

/* Add rounded corners to the top left and the top right corner of the image */
img {
  border-radius: 5px 5px 0 0;
  max-height: 250px;
  min-height: 160px;
  width: 100%;
  object-fit: cover;
  object-position: top;
}

.card:hover .container {
  padding-left: 20px;
}

/* On mouse-over, add a deeper shadow */
.card:hover {
  box-shadow: 0 8px 16px 0 rgba(0,0,0,0.2);
}

/* Add some padding inside the card container */
.container {
  transition: padding-left .2s;
  padding: 16px;
}

.place {
  font-weight: 600;
  color: #ff6e40;
}
</style>
