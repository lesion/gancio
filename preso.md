# Gancio
_a shared agenda for local communities_  

<small>
lesion / underscore hacklab / hackmeeting 0x19
</small>


--

- a brief history, where we come from
- where are we at
- where we are going

note: se qualcuno si sta chiedendo giustamente "ma ancora?"

--

## Intro

- is technology neutral? (hint: nope)
- there are choices based on values...
- ...and consequences
 
note: essendo uno dei primi talk rimarchero' un concetto che proprio la
comunita' di hackmeeting mi ha spiegato e non vorrei darlo per assodato in
questo contesto, ovvero che la tecnologia non e' neutrale ma facilita dei casi
d'uso, modifica l'ambito del possibile, quello che facilita e quello che
complica. gli strumenti sono formati dalla visione di chi li ha pensati,
progettati e costruiti e ne propagano i valori. nello sviluppo di strumenti ci
sono quindi scelte progettuali e ci sono delle conseguenze sulle scelte che
vengono fatte, questa e' la teoria. in pratica parliamo di quali sono le
impostazioni di default, quali sono le funzionalita' che scegliamo di
implementare o meno, quali sono i casi d'uso che vogliamo agevolare o meno.
sono domande importanti da farsi quando si sviluppa e quando si usa uno
strumento e cerchero' di spiegare un po' le scelte che sono state fatte su
gancio e perche'. ovviamente queste scelte sono ridiscutibili, siamo qui anche
per questo.

--

<blockquote><small>
... choices many of us in the social movements/left/activist scene make to be present in certain social networks, or to use certain technologies due to pragmatism - <strong>everybody is there</strong>, we need to reach 'common people', and so on. This is totally ok, but I feel we lack spaces to imagine which tools we need, which tech we would want to have if anything was possible? Do we want a FLOSS version of Instagram? Or do we want something completely different? Perhaps pragmatism allows the big tech tools to shape us and how we do our activism? What if we could shape the tools?
</small>
<span>absorto @ hackit_desiderata pad</span></blockquote>

note: tra le idee di tavole rotonde di quest'anno nel pad c'era questa serie di domande centrali.
questo non lo dico perche' penso che gancio sia chissa' che strumento
rivoluzionario, anzi. lo dico invece piu' che altro per spronarci tutti a farci
di questi ragionamenti e non solo per quanto riguarda gli strumenti tecnici.
dobbiamo chiederci cosa ci serve e perche'! non servono competenze per sognare e
desiderare, serve immaginarci dei modi altri, dei mondi altri. e questo sognare
lo ribadisco non si puo' lasciare ai nerd e basta.

--- 
### where we come from

- born from needs

note: carta canta, sgombero asilo 2019

--

## small & Local

- size matters
- small tech does not scale and it's ok
- local (no timezone)

note: progettando strumenti che devono scalare verso l'alto
costruiamo fondamentalmente centri di potere.
non e' solo una questione di software libero o della proprieta' del software...
se fb fosse nostro sarebbe comunque un problema, se il parlamento
fosse nostro sarebbe comunque un problema.
gancio non e' pensato per scalare, anzi, il caso d'uso facilitato
e' quello di un nodo legato ad un territorio e questa scelta
ha poi conseguenze sulla progettazione del sw e sulle conseguenze
nel suo utilizzo. ad es. una delle cons. di questa idea e' il fatto che
il fuso orario degli eventi e' uno per nodo, non per evento.
il caso d'uso poteva essere tematico ad esempio, nazionale, per posto....
conseguenze sull'uso > gli utenti sanno dove trovarti nella vita vera,
c'e' un rapporto, se domani gancio ha problemi c'e' un canale privilegiato
per comunicare.

--
## focus on content

nowhere on gancio appears the identity of who published the event, not even under a nickname, not even to administrators (except in the db).
This is not an ego-friendly platform.

note: altre scelte, non c'e' scritto da nessuna parte chi ha postato l'evento..

--

## random people first
We do not want logged user to get more features than random visitor.
People don't have to register to use it, not even to publish events.

note: eventi anonimi, gli eventi vanno confermati, possibilita' di modificare gli eventi?
--
## fuck walled garden 
We are not interested in making hits, monitor user activities, sell data or ads: we export events in many ways, via RSS feeds, via global or individual ics, incorporating lists of events or single event via iframe on other websites, via h-event (microformat), via microdata, via ActivityPub, via API.

---

### 3 years later...

--

### Status & Last Updates

- 25 instances
- 11 languages
- 16k events (3k from gancio.cisti.org) 

-- 

- https://gancio.cisti.org - Torino
- https://lapunta.org - Firenze
- https://sapratza.in - Sardegna
- https://ponente.rocks - Ponente Ligure
- https://bcn.convoca.la/ - Barcellona
- https://lubakiagenda.net/ - Bilbao
- https://bonn.jetzt/ - Bonn
- https://impending.events - Minneapolis

ma anche istanze tematiche:

- https://quest.livellosegreto.it - livello segreto
- https://events.osm.lat - OSM latino america

--
### Maintainance
>    Another flaw in the human character 
    is that everybody wants to build 
    and nobody wants to do maintenance.<br/>
        - Kurt Vonnegut       
          
note: debito tecnico, la roba viene aggiornata, si scoprono bugs frequentemente e aggiornando di scoprono altri bug!


--
Flyer download

note: anche qui sono scelte, [il componente](https://vuetifyjs.com/en/components/images/) della libreria che sto usando ha fatto altre scelte.

--
new time selection widget

--

- tag page
- place page

--

### collection page

--

### restrict new tag entropy

--

### Improve Recurrent events

--

### Redirect based on content-type

note: feed rss, ics, AP
--

- Add microdata support
- sitemap

---
### Admin side

- CLI!

--

- Add MariaDB supports
--

- Improve SMTP configuration
- footer links reordering
- Unit Testing
- lot of fixes!!


---

### Dev side

--

### API

--
### Webcomponent
<gancio-events baseurl='https://gancio.cisti.org' title='eventi' maxlength=4 theme='dark'/>

--
### WPGancio

---

## where we are going

--
### Plugins!

---

### Wanna help?

  - let's think about what serves the community we want to build
  - let's maintain the tools we already have

---

### References
  - SITE: https://gancio.org
  - DEMO: https://demo.gancio.org
