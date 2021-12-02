<script>
  export let baseurl = 'https://dev.gancio.org'
  export let title = 'Gancio events'
  export let maxlength = false
  export let tags = false 

  let events = []
  function update (v) {

    const params = []
    if (maxlength) {
      params.push(`max=${maxlength}`)
    }

    if(tags) {
      params.push(`tags="${tags}"`)
    }

    
    fetch(`${baseurl}/api/events${maxlength ? '?max=' + maxlength : '' }`)
    .then(res => res.json())
    .then(e => events = e)
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
  // update()
  $: update(maxlength && title)

</script>
<svelte:options tag="gancio-events"/>
{#if events.length}
<div id='gancioEvents'>
  <a href='{baseurl}' target='_blank'>
    <div class='content'>
      <span id='headerTitle'>{title || 'Gancio'}</span>
      <img id='logo' alt='logo' src='{baseurl}/logo.png'/>
    </div>
  </a>
  {#each events as event}
    <a href='{baseurl}/event/{event.slug || event.id}' target='_blank'>
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
  color: #ccc;
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

a:nth-child(odd) {
  background-color: #161616;
}

a:nth-child(even) {
  background-color: #222;
}


a:first-child {
  border-radius: 5px 5px 0px 0px;
}

a:last-child {
  border-radius: 0px 0px 5px 5px;
  padding-bottom: 5px;
}

a:hover {
  background-color: #333 !important;
  padding-left: 23px;
}

.place {
  font-weight: 600;
  color: #ff6e40;
}

.title {
  color: white;
}

</style>
