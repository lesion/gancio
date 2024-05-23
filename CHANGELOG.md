# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [1.16.1](https://framagit.org/les/gancio/compare/v1.16.0...v1.16.1) (2024-05-23)


### Bug Fixes

* do not expose application actor if federation is not enabled ([5f43ab0](https://framagit.org/les/gancio/commit/5f43ab002eb20b2109235ddba70a8fb77f1c6623))
* get collection when collection_in_home in SSR ([53171d2](https://framagit.org/les/gancio/commit/53171d2c7efd60e3bca387a9780626e6eaa06e05))
* places param validation in ics/rss feed ([731b334](https://framagit.org/les/gancio/commit/731b334a43bb6f3a2fdcfa21e556e996b69d0f50))

## [1.16.0](https://framagit.org/les/gancio/compare/v1.15.5...v1.16.0) (2024-05-20)


### Features

* add Exclusion filters in collections, fix [#393](https://framagit.org/les/gancio/issues/393) ([dc8294d](https://framagit.org/les/gancio/commit/dc8294d15efad68e9805738a033634f1c605091e))
*  Disable/enable Download of Flyer-Images? fix [#389](https://framagit.org/les/gancio/issues/389) ([93fd6a8](https://framagit.org/les/gancio/commit/93fd6a8748ca050c1505e4d7492b729e947fe90a))
* Add option to transfer anon event ownership, fix [#394](https://framagit.org/les/gancio/issues/394) ([7b748bd](https://framagit.org/les/gancio/commit/7b748bd49ca8bdd011e9755309f871237685793b))
* Allow admins to add past events [#396](https://framagit.org/les/gancio/issues/396) ([bbad9d1](https://framagit.org/les/gancio/commit/bbad9d127d1a55a85174a289b5b7722b266d9ca0))
* **WP:** release 1.12 ([b40bef4](https://framagit.org/les/gancio/commit/b40bef4fea5536bc73c04e96f62da7d53e1e8cb2))


### Bug Fixes

* better editor support, fix [#376](https://framagit.org/les/gancio/issues/376) ([cfd6dd8](https://framagit.org/les/gancio/commit/cfd6dd8ab7d59beb90ba57092ca58dcfce57137c))
* **fedi:** better remote AP instance display, help address [#387](https://framagit.org/les/gancio/issues/387) ([c38e5d9](https://framagit.org/les/gancio/commit/c38e5d984e52f55a1ea6aba29e86493cfb86d7e3))
* improve loading time from 0.8s to 0.2s ([ecab6d4](https://framagit.org/les/gancio/commit/ecab6d482137474a097658017ad553702f76d1db))
* keepAlive, ,add some cache time to "static" img ([63086de](https://framagit.org/les/gancio/commit/63086de9f053a3c058d951664284670e458cda73))
* open moderation panel when coming from moderation email ([e0765dc](https://framagit.org/les/gancio/commit/e0765dcf2b03af855d437920ac5a02dcf28a97f3))
* prepare Swedish locale ([35cddce](https://framagit.org/les/gancio/commit/35cddcec6f86cdc0901ece4f13afdfdbc963bca1))
* show number of fediverse 'followers on main site', fix [#359](https://framagit.org/les/gancio/issues/359) ([1a45247](https://framagit.org/les/gancio/commit/1a45247a1e4cc91e5795946f6f405f918f121832))
* too big image msg, fix [#378](https://framagit.org/les/gancio/issues/378) ([e750331](https://framagit.org/les/gancio/commit/e7503314730b2bc01da98d69d3fd3b93d307a297))
* use href for navbar /about link enable to make a redirect, fix [#385](https://framagit.org/les/gancio/issues/385) ([e17ee49](https://framagit.org/les/gancio/commit/e17ee4982cf76cb4414205ffa3b9e426bf39fbb8))
* **UX:** Improve collections interactions, fix [#375](https://framagit.org/les/gancio/issues/375) ([bb371b5](https://framagit.org/les/gancio/commit/bb371b55f5b8bf522ad3f12a1db096b648af8204))

### [1.15.5](https://framagit.org/les/gancio/compare/v1.15.4...v1.15.5) (2024-04-21)


### Bug Fixes

* correctly set AP name, fix [#351](https://framagit.org/les/gancio/issues/351) ([620fa29](https://framagit.org/les/gancio/commit/620fa29b096cbc0d25ae780466a53db0156dd0ba))
* do not linkify email addresses in event description, fix [#373](https://framagit.org/les/gancio/issues/373) ([c7ef359](https://framagit.org/les/gancio/commit/c7ef35912cf6d1c806c673503f9b4b6090cf0d5f))
* Editor users cannot confirm anonymous events, fix [#376](https://framagit.org/les/gancio/issues/376) ([a1f1e02](https://framagit.org/les/gancio/commit/a1f1e02b97e9b9274124d7f16a22197caf1747df))
* missing get import ([49dd717](https://framagit.org/les/gancio/commit/49dd7175fc30b468556f5173a904df71a2c1d5af))
* use 'en' as fallback locale in email, fix [#374](https://framagit.org/les/gancio/issues/374) ([80efc69](https://framagit.org/les/gancio/commit/80efc69946e319f4ea06b1b87083675c2895fba1))
* use bcc for admin emails, fix [#371](https://framagit.org/les/gancio/issues/371) ([4ba5645](https://framagit.org/les/gancio/commit/4ba5645ebf3ec71be6df5ee7559ac128cb534718))

### [1.15.4](https://framagit.org/les/gancio/compare/v1.15.3...v1.15.4) (2024-04-04)


### Bug Fixes

* set admin role during installation setup ([334b6cd](https://framagit.org/les/gancio/commit/334b6cd6867e63285a22a99fb37d3b98ebfe89dc))
* update docs, fix [#370](https://framagit.org/les/gancio/issues/370) ([674ca3c](https://framagit.org/les/gancio/commit/674ca3cad537e648d79a3ecec24dbb18d34d7d65))

### [1.15.3](https://framagit.org/les/gancio/compare/v1.15.2...v1.15.3) (2024-04-02)


### Bug Fixes

* restore migrations log and return a promise ([65f87ad](https://framagit.org/les/gancio/commit/65f87ad81cb4eaa303dde448fa0142a99956bed9))

### [1.15.2](https://framagit.org/les/gancio/compare/v1.15.1...v1.15.2) (2024-04-02)


### Bug Fixes

* maintain compatibility with node 16, fix [#366](https://framagit.org/les/gancio/issues/366) ([3f944c3](https://framagit.org/les/gancio/commit/3f944c3807bbac12fb7214b03a32176947be62d7))

## [1.15.1](https://framagit.org/les/gancio/compare/v1.14.1...v1.15.1) (2024-04-01)


### Features

* new Report and Moderation feature, fix [#221](https://framagit.org/les/gancio/issues/221), fix [#350](https://framagit.org/les/gancio/issues/350), fix [#220](https://framagit.org/les/gancio/issues/220) ([b40b4ba](https://framagit.org/les/gancio/commit/b40b4ba3b438f3baaffda91816e7ffd9b2836652)), ([22c2735](https://framagit.org/les/gancio/commit/22c2735e93be7ca0f912fd3fda2845c6dbcf1499)) [documentation](https://gancio.org/usage/moderation)
* new Editor role feature, fix [#278](https://framagit.org/les/gancio/issues/221) [#38](https://framagit.org/les/gancio/-/merge_requests/38)
* allow admins to disable event's author ([ca3ed0b](https://framagit.org/les/gancio/commit/ca3ed0b0d1eb14ecc33b830d3ca3baf26e27756d))
* fedi stats api ([6ce0128](https://framagit.org/les/gancio/commit/6ce01287e4c676ebb0b3372ff40e344da0e18018))
* new `users setrole` CLI subcommand ([40ca01c](https://framagit.org/les/gancio/commit/40ca01c48932e96b3480b3972977b730133cc96e))
* new Albanian locale ([9b1d102](https://framagit.org/les/gancio/commit/9b1d1023f6a01559309a0f63c3f76aa7f6f770ca))
* new follow trusted instance UI, fedi stats, fix [#353](https://framagit.org/les/gancio/issues/353) ([8188d0b](https://framagit.org/les/gancio/commit/8188d0b4a018013bcdecd8ec9f8973d99e0881de))


### Bug Fixes

* **AP:** add clean unused ap users task ([ac958b0](https://framagit.org/les/gancio/commit/ac958b0e4bacae47af5c7e9893ad6f9b3d095021))
* **AP:** add index to trusted flag ap_users, fix [#361](https://framagit.org/les/gancio/issues/361) ([fa6a7f4](https://framagit.org/les/gancio/commit/fa6a7f46a9529f8252883b5f9420dd6fe3163678))
* **AP:** use instance name as display name, fix [#351](https://framagit.org/les/gancio/issues/351) ([1573cb9](https://framagit.org/les/gancio/commit/1573cb967c26ffe23a083c28f9fb87f6a1507628))
* **AP:** do not get new ap actor or instance in case of delete ([d749061](https://framagit.org/les/gancio/commit/d749061251c87cd07c125f06691448a34e0973a6))
* **AP:** do not share followers ([85264fa](https://framagit.org/les/gancio/commit/85264faa85de04362a7756c3eaf12848d2a50990))
* **AP:** support Gone actor Deleted when pub key is in cache ([edd3aa7](https://framagit.org/les/gancio/commit/edd3aa72a0ddbcd21f1196f49f84e203af430364))
* **collection:** allow to specify recurrent events visibility ([4af2b63](https://framagit.org/les/gancio/commit/4af2b63bee779287ab51f4b63778d88f98cdca5d))
* **collection:** do not limit events by default ([91d8fea](https://framagit.org/les/gancio/commit/91d8fea7c1df404bedca57b62053293c8ab6596d))
* edit role from admin ([7daaad2](https://framagit.org/les/gancio/commit/7daaad2d582b020ffe1d1239e25367707c27184a))
* reduce the space between icon and text and lower icon opacity, [#360](https://framagit.org/les/gancio/issues/360) ([0e3e045](https://framagit.org/les/gancio/commit/0e3e045d3faade610a59882b4ef58f2b0d7007ee))
* rel me ([e135092](https://framagit.org/les/gancio/commit/e135092ddaffbff4411d0e70e3ee330cc4d5817d))
* remove instance_place meta from federation ([3fcc6f7](https://framagit.org/les/gancio/commit/3fcc6f7ef22503395a450c8e69f8f2d409f774c7))
* update deps ([793f2b9](https://framagit.org/les/gancio/commit/793f2b90718eb4db3f394371dfb655afd5e8e222))
* **WP:** allow collection and maxlength attribute in wp plugin ([c132b6e](https://framagit.org/les/gancio/commit/c132b6ed1b702bcc6d8d7276ea12c80febcff8ef))
* **WP:** wpgancio add php8.2 compatibility ([1718941](https://framagit.org/les/gancio/commit/17189414fdecf9c0b7cbdf50d3a7f9f2164c7f7e))

### [1.14.1](https://framagit.org/les/gancio/compare/v1.14.0...v1.14.1) (2024-02-04)


### Bug Fixes

* avoid useless sort by recurrent, fix [#340](https://framagit.org/les/gancio/issues/340) ([1d794c0](https://framagit.org/les/gancio/commit/1d794c0784d58479a34437dd65f3575629886f73))
* edit mine event permission ([b917bc6](https://framagit.org/les/gancio/commit/b917bc6ae08aaf660f7f507b6752a279c4f67429))

## [1.14.0](https://framagit.org/les/gancio/compare/v1.13.1...v1.14.0) (2024-01-31)


### Features

* user events page view, fix [#340](https://framagit.org/les/gancio/issues/340) and [#156](https://framagit.org/les/gancio/issues/156) ([2492f6b](https://framagit.org/les/gancio/commit/2492f6b545a87bd5eb9820e17cd74147bfd36379))


### Bug Fixes

* allow <em> tag in html sanitization, fix [#343](https://framagit.org/les/gancio/issues/343) ([fb9a9fb](https://framagit.org/les/gancio/commit/fb9a9fba998953144d20db7c0e62eaa978a84557))
* allow default page redirection for content-type ([3a9a132](https://framagit.org/les/gancio/commit/3a9a13291067658f14ebf55d5736da4099761754))
* minor on style ([61b796e](https://framagit.org/les/gancio/commit/61b796efd61cba49f70eaae15a68c07dfab7f0e8))
* refactoring clean past federated events ([8910b13](https://framagit.org/les/gancio/commit/8910b1390df2db8771ba86753c30a1fc413b4480))
* remove instance  title from ics event title, fix [#339](https://framagit.org/les/gancio/issues/339) ([9be6fbc](https://framagit.org/les/gancio/commit/9be6fbc19c7d965b244cc349a8946cfd3db303d4))
* tags with a dollar characters cause problem saving event, fix [#344](https://framagit.org/les/gancio/issues/344) ([90b9a47](https://framagit.org/les/gancio/commit/90b9a479caf1af85814d2cbaa8c44a663a31f4f5))

### [1.13.1](https://framagit.org/les/gancio/compare/v1.13.0...v1.13.1) (2024-01-23)


### Bug Fixes

* import event ([1d74903](https://framagit.org/les/gancio/commit/1d749039c07626eb6c7e06e5a6602a51e72296ab))
* minor on hidden resources ([770c638](https://framagit.org/les/gancio/commit/770c638d03f513b539eaadf345f32dbb5e8bde96))
* tags selection ([3f896a1](https://framagit.org/les/gancio/commit/3f896a106f0e0c91aea98bc85350eec280b95d87))

## [1.13.0](https://framagit.org/les/gancio/compare/v1.12.0...v1.13.0) (2024-01-23)


### Features

* **AP:** implement AP parser ([a46c202](https://framagit.org/les/gancio/commit/a46c202ac96f46b7189a43797a8ed42a282231e2))
* **AP:** improve online events format ([975c752](https://framagit.org/les/gancio/commit/975c752ba2ba21a36b2208e62f9ff430d46a4115))
* remove theme view fome homepage ([3d3a6e7](https://framagit.org/les/gancio/commit/3d3a6e7c76a8ab4f511f6985fd2ad9b2971f163f))
* **UI:** announcement style ([843d0a9](https://framagit.org/les/gancio/commit/843d0a9953df253da15ad5c85095926e31c76c87))


### Bug Fixes

* About label not translated on About page, fix [#328](https://framagit.org/les/gancio/issues/328) ([dad65e1](https://framagit.org/les/gancio/commit/dad65e140e4101e21bcab506b6cb4368990052ea))
* **AP:** improve outbox collection ([67b738f](https://framagit.org/les/gancio/commit/67b738f7f9e5d35e128fed6eace313248aab1a67))
* avoid using 'online' as a place name (case insensitive) ([e5bbb18](https://framagit.org/les/gancio/commit/e5bbb181569cf8ad228f8852e13d302a25b3d729))
* dark mode icon in navbar ([c0907fe](https://framagit.org/les/gancio/commit/c0907fe6d6ef5f073d93fef8cebe64d7f5d5681c))
* do not export federated events in general rss / ics  feed ([3844a6b](https://framagit.org/les/gancio/commit/3844a6ba51550982addf712d23214719cdf0fb23))
* do not leak userId but return isMine flag ([1a865ae](https://framagit.org/les/gancio/commit/1a865aefbb0bed2f746f190009ee8b3e4a803e1b))
* improve AP Event parsing ([8ebfad6](https://framagit.org/les/gancio/commit/8ebfad651ef94e83f8381e825bbac2132330cfe3))
* improve footer trusted nodes view ([3f027a2](https://framagit.org/les/gancio/commit/3f027a2fe276c83142c898d4b6aea3c7159ae501))
* improve search events api ([f83bc7f](https://framagit.org/les/gancio/commit/f83bc7f7804a139fcc56caa0ab36113710e6d615))
* make events AP indexable by default ([d5620ac](https://framagit.org/les/gancio/commit/d5620ac8e97f7c42a2d07d84437e019965b569ac))
* minor on tag editing, [#326](https://framagit.org/les/gancio/issues/326) ([5e967e4](https://framagit.org/les/gancio/commit/5e967e4d37ebbe72b79c759b36e293a3cf099f46))
* refactoring event page ([5a7f3a5](https://framagit.org/les/gancio/commit/5a7f3a5ace0f76a7a312d3a2773b74a53aa39559))
* refactoring Search export component ([5fdd9bc](https://framagit.org/les/gancio/commit/5fdd9bcc2effff1b0bb12060cbebd8db5cca488d))
* remote events removal ([742ed44](https://framagit.org/les/gancio/commit/742ed445348d38acde0a75aa982269d16c938a26))
* reverse and older parameter for collections ([d6a9a7f](https://framagit.org/les/gancio/commit/d6a9a7f00b6d42c122ac71eeb0c5dd522f18e6e4))
* simplify local dark theme selection and fix [#332](https://framagit.org/les/gancio/issues/332) ([223437f](https://framagit.org/les/gancio/commit/223437f9c1f372ef6951c9f89f3a96b7508ae65b))
* Tags with non-ascii characters cannot be resolved, [#329](https://framagit.org/les/gancio/issues/329) ([7eec86e](https://framagit.org/les/gancio/commit/7eec86e43c2c3d030c7910d1cf469a6db413b8dd))
* ui color theme wrong selection [#332](https://framagit.org/les/gancio/issues/332) ([841e2b6](https://framagit.org/les/gancio/commit/841e2b69c06125c72adc4eeb1b40316787f1cc3a))
* **UI:** minimalism ([d31ef55](https://framagit.org/les/gancio/commit/d31ef5545432477e075456de3e70eb8ef37a5538))
* **UI:** remove home link from tabbar, minimalism ([3768fa2](https://framagit.org/les/gancio/commit/3768fa226c506fa605ce0742066bb5c84bdcbb84))

## [1.12.0](https://framagit.org/les/gancio/compare/v1.11.0...v1.12.0) (2024-01-14)


### Features

* add lat/lng to federated events ([a26fb80](https://framagit.org/les/gancio/commit/a26fb80a8fd9b1ec71ba4104b19f470042ac794b))

### Bug Fixes

* **AP** improve @context (https://framagit.org/context) ([452aa6e](https://framagit.org/les/gancio/commit/452aa6eaa1b7eea45d66af8ca14b9f7abf18804a))
* restore vuetify defaultAssets in the right place! ([80276a1](https://framagit.org/les/gancio/commit/80276a16e49abea514ca3d442df33c0f75cb7a20))

## [1.11.0](https://framagit.org/les/gancio/compare/v1.10.3...v1.11.0) (2024-01-10)


### Features

* add `reverse` and `older` flag to collection API ([cccb670](https://framagit.org/les/gancio/commit/cccb670cc76ba336f4d459f1da68748289cb2ff0))


### Bug Fixes

* **AP:** allow to follow trusted actor from url ([35c7888](https://framagit.org/les/gancio/commit/35c78882a251f1a739721bd0c946303c25405f22))
* **AP:** delete federated events ([9de5773](https://framagit.org/les/gancio/commit/9de5773f0a96614e13b6b9e9f3ed20e71285bbdc))
* display user URL in federated event ([567531b](https://framagit.org/les/gancio/commit/567531b2c546e29049cf85e0c0ef61635f2dc0b7))
* fix host-meta RFC6415 Content-Type ([550ee5c](https://framagit.org/les/gancio/commit/550ee5c317c18c6bb923e90d5281b005d4b996a9))
* minor getting actors and instances ([5d0970a](https://framagit.org/les/gancio/commit/5d0970aad7f3d183816b60a912cf369e55b7c19b))
* remove related comments/resources when an event is deleted ([cf5bc1b](https://framagit.org/les/gancio/commit/cf5bc1b6210d6c9a6a44e445a49b55c2be4e8383))

## [1.10.3](https://framagit.org/les/gancio/compare/v1.10.2...v1.10.3) (2024-01-09)


### Bug Fixes

* sequelize does not really support mariadb@3 ([3d5ab85](https://framagit.org/les/gancio/commit/3d5ab85de60ddfe19ebb92ccf04a500fe1c4ea01))
* use nodejs 18 in Docker image ([329a6bd](https://framagit.org/les/gancio/commit/329a6bd5c3e09f751f6b398b1a74c745cb219d1d))

## [1.10.2](https://framagit.org/les/gancio/compare/v1.10.0...v1.10.2) (2024-01-08)


### Bug Fixes

* admin tag editing without blur, fix [#326](https://framagit.org/les/gancio/issues/326) ([9f8d137](https://framagit.org/les/gancio/commit/9f8d137d3033a0b0a667ac15a672bc016bb2cf2d))
* **AP:** add whole jsonLD object to events ([cb7932c](https://framagit.org/les/gancio/commit/cb7932c09dde83bb876419488592e4cdd926ffea))
* **AP:** follow trusted node ([8b54ed1](https://framagit.org/les/gancio/commit/8b54ed179a6305a5a7f849ee1a892bdf493d7a81))
* **AP:** return a 201 on Create/Update/Delete ([4868c0a](https://framagit.org/les/gancio/commit/4868c0af580296ec71a5cf3d799aed5fa316c94e))
* **AP:** improve fedi events validation ([07a0ea0](https://framagit.org/les/gancio/commit/07a0ea01463dd6a0b56181a3f9d03caef4b661c9))
* **AP:** improve trusted node display in Admin>Collection ([dcb7498](https://framagit.org/les/gancio/commit/dcb7498c675ddb96fc974146a7e0d12e30d7dd33))
* **AP:** improve validation on event's update ([90deb79](https://framagit.org/les/gancio/commit/90deb79d6b70f9b10cb24aadf6ef59319f134d07))
* **AP:** update instances ([f7d4824](https://framagit.org/les/gancio/commit/f7d4824349932ad6d427613ad946176067739bee))
* **AP:** re-add followers ([2971956](https://framagit.org/les/gancio/commit/29719569a1c97b9d6cfadcd7bff427e578850852))
* dedup tags, minor with [#169](https://framagit.org/les/gancio/issues/169) ([44daa90](https://framagit.org/les/gancio/commit/44daa901dc3a95a2e1eefab41cf9a8114d8d18bd))
* event exports when collection_in_home and tags or places are selected ([f160430](https://framagit.org/les/gancio/commit/f1604306259f8a4e09a0356ae7604ec4a44cdcb4))
* export collection's feeds (ics/rss) ([04403e0](https://framagit.org/les/gancio/commit/04403e0a345ebb8932883926273ac59c7cec5242))
* recalculate end date ([6c2840a](https://framagit.org/les/gancio/commit/6c2840a7fa4be6f50ca1ad51877b3436c9663b40)) thanks @sedum
* improve unit testing ([9482ba9](https://framagit.org/les/gancio/commit/9482ba9e394d1e05615386e98b2085c202b922bc))
* include description into rss/ics ([4f99a5d](https://framagit.org/les/gancio/commit/4f99a5df30cc2914932d0b04b4dbfd48e9d0f526))
* update deps ([16a0695](https://framagit.org/les/gancio/commit/16a06959f488b504e1cb726f6664a45427a27fca))
* use online_locations instead of place address for online events in rss feed ([0f047a2](https://framagit.org/les/gancio/commit/0f047a264ea36d9226231aede410cf8034c780e7))

## [1.10.0](https://framagit.org/les/gancio/compare/v1.8.0...v1.10.0) (2023-12-29)

This release is a big step toward interoperability with ActivityPub, look at the [documentation](https://gancio.org/federation) for the details.  
Thanks to @linos from [event-federation.eu](https://event-federation.eu/) and @tcit from [mobilizon](https://joinmobilizon.org/)


### Features

* **AP:**  implement FEP-2677 in nodeinfo ([07fcbbd](https://framagit.org/les/gancio/commit/07fcbbd4ce6727817812b9c71903ca1bf61d394e))
* **AP:** implement application Actor retrieval FEP-2677 ([9c74f51](https://framagit.org/les/gancio/commit/9c74f5198d7c2c360fdb70ebbd0d4bfc2e6999b4))
* **AP:** improve logging and interoperability ([ca1bd24](https://framagit.org/les/gancio/commit/ca1bd2487cd2c42af096dd9cd1b8f07beceb90eb))
* **AP:** retrieve instance info via nodeinfo ([1e0665d](https://framagit.org/les/gancio/commit/1e0665dc3d2de8f0f459d8941403ce1276269b39))
* **AP:** support Note/Event update and removal ([f1158db](https://framagit.org/les/gancio/commit/f1158dba73501e98918d7fa499289554743832b9))
* **AP:** improve interaction with AP, [#322](https://framagit.org/les/gancio/issues/322) ([340d503](https://framagit.org/les/gancio/commit/340d50301f1b76ebc17dd4fe6d419c2afc5fb556))
* **AP:** init unit test ([12c0f21](https://framagit.org/les/gancio/commit/12c0f21a8984acd9d10f2fb86e6dc6b7b8d25aef))
* **AP:** minor with unfollow ([a70529d](https://framagit.org/les/gancio/commit/a70529d771f4cb70b9c0946e97810ba85b4242f1))
* **collections:** add instances as potential filter in collections ([7a6101b](https://framagit.org/les/gancio/commit/7a6101be7ba4990bd0c0cf32344e8ca59c4de8c2))
* **collections:** a collection could be used as homepage ([3fd9f5a](https://framagit.org/les/gancio/commit/3fd9f5a8cbc5766c8c6e65fc1ff97ed69cf7edf9))
* **locale** add Românesc ([bdc6b39](https://framagit.org/les/gancio/commit/bdc6b3925a68314d75a3c3ca4fd1af72149d1199))


### Bug Fixes

* use .splat in production too ([5dcae0d](https://framagit.org/les/gancio/commit/5dcae0d9755726553974b32338187bf3b8a01067))
* body parse ld+json coming from fediverse ([f96c826](https://framagit.org/les/gancio/commit/f96c8261d778bc2b9dc3b9e9a4446bda459bd6c3))


## [1.8.0](https://framagit.org/les/gancio/compare/v1.7.1...v1.8.0) (2023-12-15)


### Features

* add Turkish language ([c99772e](https://framagit.org/les/gancio/commit/c99772e0b5d8f92fabad9f24ecab5f1ad48053f0))
* improve collections export adding max, start_at parameter ([c472e87](https://framagit.org/les/gancio/commit/c472e876760f172be7246a0aa5e1bc8a7610f7eb))


### Bug Fixes

* do not allow /admin rendering when normal user ([906dca2](https://framagit.org/les/gancio/commit/906dca2b100aa7308790c5948620a4ca3f3fa955))
* hide event being edited in "on same day" area, fix [#318](https://framagit.org/les/gancio/issues/318) ([04c88a4](https://framagit.org/les/gancio/commit/04c88a468b53a8155942d44766b822f6c2beb2dd))
* location name and description not correctly set in microdata ([9811d39](https://framagit.org/les/gancio/commit/9811d395540ca6c7e0f3e2d0caa9295dd4d9308e)), closes [#316](https://framagit.org/les/gancio/issues/316) [#315](https://framagit.org/les/gancio/issues/315)
* missing some style in detail collection page ([185b8bd](https://framagit.org/les/gancio/commit/185b8bd75e3cf9dddb160100d601951b60ab379e))

### [1.7.1](https://framagit.org/les/gancio/compare/v1.7.0...v1.7.1) (2023-11-10)

## [1.7.0](https://framagit.org/les/gancio/compare/v1.6.19...v1.7.0) (2023-11-10)


### Features

* **Collection:** allow to show/hide a collection from homepage ([f60ff37](https://framagit.org/les/gancio/commit/f60ff37a7024bde67e9ee7fd661bb234fbc77882))


### Bug Fixes

* **Admin:** Move the events tab to the left in the admin panel ([3658ee2](https://framagit.org/les/gancio/commit/3658ee26581cb4c34cee6efb0e16f2c4894eb6b5)), closes [#312](https://framagit.org/les/gancio/issues/312)
* make title word-break, fix [#196](https://framagit.org/les/gancio/issues/196) ([e37d190](https://framagit.org/les/gancio/commit/e37d190eae1d3ff6bfc4681174a5d5c5e037fbb9))
* **plugin-telegram-bridge:** fix infinite loop bug ([d1204a0](https://framagit.org/les/gancio/commit/d1204a093e5cde475c11310f7fc00c863b79f96a))
* **recurrent:** clean due date when recurrent type is selected ([54af7c6](https://framagit.org/les/gancio/commit/54af7c662d97414b08ca2366eef77c28c6bf02de))

### [1.6.19](https://framagit.org/les/gancio/compare/v1.6.18...v1.6.19) (2023-11-04)


### Bug Fixes

* issue displaying recurrent event string ([a94ccda](https://framagit.org/les/gancio/commit/a94ccda049f7571a9caa90507141a0aac30331a9))

### 1.6.18 - 3 Nov '23
  - [feat] allow to specify password while create new user via CLI to [support yunohost](https://github.com/YunoHost-Apps/gancio_ynh/pull/2#discussion_r1364285417)
  - [feat] check if I'm reachable to myself to help in [#298](https://framagit.org/les/gancio/-/issues/298)
  - [feat] improve recover and user_confirm error messages
  - [feat] improve export and allow to export `collections` in rss/ics/widget
  - [fix] fix postgres image version in docker-compose [#303](https://framagit.org/les/gancio/-/issues/303)
  - [fix] Improve json-ld representation of events [#33](https://framagit.org/les/gancio/-/merge_requests/33)
  - [fix] Add description field to admin's new user form, closes [#307](https://framagit.org/les/gancio/-/issues/307)
  - [fix] use tls SSLv3 to send email, fix [#192](https://framagit.org/les/gancio/-/issues/192)
  - [fix] notify user when accepted, fix [#308](https://framagit.org/les/gancio/-/issues/308)
  - [fix] forgot password on active user only
  - [fix] make search case insensitive, fix [#301](https://framagit.org/les/gancio/-/issues/301)

### 1.6.17 - 4 Oct '23
  - [fix] typo

### 1.6.16 - 4 Oct '23
  - [feat] add Czech locale
  - [fix] improve datetime validation

### 1.6.15 - 3 Oct '23
  - [feat] clone event
  - [feat] am/pm / 24hr support, fix [#294](https://framagit.org/les/gancio/-/issues/294) [#264](https://framagit.org/les/gancio/-/issues/264)
  - [feat] update telegram plugin bridge to v1.0.3, [#299](https://framagit.org/les/gancio/-/issues/299)
  - [feat] include Brazilian Portuguese (pt-br) and Portugual Portuguese (pt-pt) [#292](https://framagit.org/les/gancio/-/issues/292)
  - [fix] MariaDB JSON fields manual fix
  - [fix] improve some corner case with SMTP From field [#297](https://framagit.org/les/gancio/-/issues/297)
  - [fix] CLI has to fail when configuration not present [#284](https://framagit.org/les/gancio/-/issues/284)
  - [minor] remove html2text dep from client
  - [minor] RSS item's title format is now YYYY-MM-DD, [#300](https://framagit.org/les/gancio/-/issues/300)

### 1.6.14 - 30 June '23
  - improve CLI accounts operations ([documentation](https://gancio.org/usage/cli))
  - allow plugins to expose API ([documentation](http://gancio.org/dev/plugins))
  - allow plugins to access DB ([documentation](http://gancio.org/dev/plugins))
  - show map on the places page, #276 #30
  - add node v18 support, #278
  - fix media update, #285
  - fix nodejs v14 compatibility in export
  - fix invalid event microdata, #277
  - fix recurrent event, #280
  - update deps and locales

### 1.6.13 - 16 may '23
  - fix feed, ics, json exports

### 1.6.12 - 12 may '23
  - Fixed a bad bug in end time calculation that would sometimes hide the event from the homepage the day it occurred
  - map marker is now draggable
  - update locales (Basque, Galician, Italian, Spanish, Catalan)
  - [fix multiline event description breaks ICS export](https://framagit.org/les/gancio/-/issues/234)
  - adds online locations and geo coords to ICS export
  - do not allow duplicate or empty tags in UI
  - [fix wrong week calculation in recurrent events](https://framagit.org/les/gancio/-/issues/266)
  - [show full media on upload / add a switch to show preview](https://framagit.org/les/gancio/-/issues/257)
  - [update image alt text when modified](https://framagit.org/les/gancio/-/issues/267)
  - [check if place or tag exists](https://framagit.org/les/gancio/-/issues/268)
  - fix export microformat / microdata events
  - plugins improvements:
    - [reload plugins when its settings change](https://framagit.org/les/gancio/-/issues/262)
    - [allow plugins to use native log system](https://framagit.org/bcn.convocala/gancio-plugin-telegram-bridge/-/issues/6)
    - [adds a way to test plugins settings from admin](https://framagit.org/bcn.convocala/gancio-plugin-telegram-bridge/-/issues/3)
    - avoid loading the same plugin twice
    - update [gancio-plugin-telegram-bridge](https://framagit.org/bcn.convocala/gancio-plugin-telegram-bridge)

### 1.6.11 - 21 apr '23
  - update deps
  - update locales (polish, spanish, catalan, galician)
  - really fix #259
  - fix #258 without setting TZ env
  - minor fix with events starting or ending at 00:00

### 1.6.10 - 14 apr '23
  - add support to online events (thanks @sedum) #26
  - show past events in tag and place pages #259
  - fix import from URL for guest, #256
  - fix ics export timezone, #258
  - fix autocomplete address when geocoding, #216

### 1.6.8 - 30 mar '23
  - use new $time in admins table, fix #252
  - fix some WPGancio issues
  - new custom color feature!
  - update locales (durch, spanish, galician)
  - improve index, tag, place page layout
  - use luxon instead of dayjs server side, fix #254

### 1.6.7 - 22 mar '23
  - node is not Intl ready, fix #250
  - fix old smultidate events without an end_datetime!
  - fix a small issue during setup

### 1.6.5 - 21 mar '23
  - optimize home page using lazy loading
  - add support for server side http proxy (thanks @sedum)
  - add Duch (nl) locale (thanks @jeoenepraat)
  - fix #244, dark theme user / admin preference merge issue
  - fix some issues with recurrent events, #247
  - improve search flow (order by, press enter or icon...)
  - filters / helpers refactoring
  - tag and place pages list all events (past too)
  - show boosts/bookmarks, fix #241
  - go to event on save/update
  - use luxon instead of dayjs, new $time plugin
  - fix event import from URL
  - remove an annoying warning from logs

### 1.6.4 - 22 feb '23
  - add missing i18n during setup
  - really fix #232
  - downgrade mariadb as sequelize is not ready yet
  - location saving not working when geocoding is disabled, fix #238

### 1.6.3 - 17 feb '23
  - visitors could now choose to view images or not / dark theme or not
  - i18n refactoring, locale loaders, custom strings, fix #231
  - introduce a new instance api limiter
  - hide search filters when none is allowed
  - add instance timezone and AP actor to nodeinfo
  - event api path is now /api/event/detail/
  - fix tag in rss export
  - fix fbclid param removal in url sanitizer
  - fix ics validation
  - rows now breaks correctly in description, fix #237
  - do not use hash as tags separator, fix #210
  - do not use end time when not used, fix #233
  - use timezone on selection, fix #232
  - fix ics link

### 1.6.2 - 12 jan '23
  - add swipe gesture to move to next/prev event
  - fix refresh collections, fix #219
  - add russian translation (thanks @drunkod)
  - refactor search / filter / selection fix #225, 227, #224
  - models initialization refactored, better dev experience, fix backend HMR

### 1.6.1 - 15 dec '22
  - allow edit tags in admin panel, fix #170
  - fix header / fallback image upload, fix #222
  - fix WPGancio MU
  - fix recurrent events label
  - update translations (de, es, eu, gl)

### 1.6.0 - 11 dec '22
  - new plugin system - fix #177
    - new "publish on telegram" plugin: (thanks @fadelkon)
  - people can now choose the language displayed - fix #171
  - admin could choose a custom fallback image - fix #195
  - it is now possible NOT to enter the end time of an event - fix #188
  - live search
  - improve event import
  - add Apple touch icon - fix #200
  - add nominatim / openstreetmap search feature (thanks @sedum)
  - new hide calendar option
  - new hide thumbs from homepage option
  - linkable admin tab
  - friendly instances label is now customizable (thanks @sedum)
  - i18n refactoring
  - Wordpress plugin now supports MU installation
  - new chinese translation
  - new portuguese translation
  - improved navbar layout
  - improved event layout
  - complete oauth2 refactoring
  - fix ics unique uuid
  - fix place "[Object]" issue - #194
  - fix random restart while downloading random media
  - fix mobile dialog layout
  - urlencode place and tag urls


### 1.5.6 - 22 set '22
  - update linkifyjs, sequelizem, nuxt deps
  - improve homepage loading time
  - restore removed icons

### 1.5.5 - 21 set '22
  - fix #185 - wrong res.download api usage
  - fix some dialog background on light theme
  - update sequelize and remove live patch
  - improve events filtering on selected day
  - allow tags complete removals
  - improve homepage performance
  - docs: add scheme to nginx proxy configuration

### 1.5.4 - 6 set '22
  - Update webcomponent deps
  - Refactor datime display in webcomponent
  - Force flyer download
  - Restore range events on calendar
  - Fix limit/max events for mariadb #183
  - Fix endtime selection
  - Fix microdata address

### 1.5.3 - 30 aug '22
  - Fix end time selection when it's in the next day

### 1.5.2 - 26 aug '22
  - fix Editor background color

### 1.5.1 - 14 aug '22
  - fix regression with hidden recurrent events

### 1.5.0 - 8 aug '22
##### :warning:  **BREAKING CHANGES**:
- supported nodejs version >=14 <=16 (nodejs 12 reached End-of-Life on 30 April 2022)
- minimum mariadb supported version >= 10.5.2

##### **CHANGES**:
  - new Tag page
  - new Place page
  - new search flow
  - new meta-tag-place / group / collection page
  - new time selection widget
  - allow footer links reordering
  - new Docker image (smaller and faster)
  - add GANCIO_DB_PORT environment
  - restrict new tag entropy (trim, merge case insensitive)
  - add dynamic sitemap.xml
  - calendar attributes refactoring (a dot each day, colors represents n. events)
  - fix event mime type response
  - fix mariadb JSON fields
  - new gancio CLI accounts management (list / create / remove / modify accounts)
  - improve smtp setup, allow local sendmail, smpt port, tls/starttls
  - redirect to path based on content type request
  - add Slovak translation
  - lot of fixes

### 1.4.4 - 10 may '22
  - better img rendering, make it easier to download flyer #153
  - avoid place and tags duplication (remove white space, match case insensitive)
  - show date and place to unconfirmed events
  - add warning when visiting from different hostname or protocol #149
  - add tags and fix html description in ics export
  - add git dependency in Dockerfile #148
  - add external_style param to gancio-events webcomponent
  - add GANCIO_HOST and GANCIO_PORT environment vars
  - fix place and address when importing from url #147
  - fix user account removal
  - fix timezone issue #151
  - fix scrolling behavior
  - fix adding event on disabled anon posting
  - fix plain description meta
  - fix recurrent events always shown #150
  - remove `less` and `less-loader` dependency

### 1.4.3 - 10 mar '22
  - fix [#140](https://framagit.org/les/gancio/-/issues/140) - Invalid date
  - fix [#141](https://framagit.org/les/gancio/-/issues/141) - Cannot change logo
  - fix same day events
  - add missing icons in admin
  - prepare multisite settings
  - improve initialization
  - start unit testing API (it's never too late)

### 1.4.1 - 4 mar '22
  - add gl/galego locale, thanks @xosem
  - fix import redirect loop
  - add missing icons (close, repeat, arrows ...)
  - turn rss icon into a real link to improve a11y
  - force seconds to 0 for each events, fix recurring events starting date issue
  - fix next/prev selection on same datetime events
  - improve moderation UI (add author and event link + format creation date)
  - refactoring resource UI from fedi

### 1.4.0 - 9 feb '22
  - improve Cumulative Layout Shift
  - remove filename as default media label to avoid leak metadata
  - add endData to microdata
  - security fix with filtering settings, avoid sharing SMTP pass with front-end
  - fix broken SMTP
  - remove global materialicons / vuetify css, use threeshake and @nuxt/vuetify (really improve lighthouse score)
  - new Dockerfile using node:17.4-slim as base img (from 1.5Gb to ~800Mb)
  - add XSS and path traversal mitigation
  - improve a11y
  - update deps

### 1.3.3 - 1 feb '22
  - security fix, avoid sharing smtp pass with front-end

### 1.3.2 - 1 feb '22
  - fix webcomponent for event without img

### 1.3.1 - 1 feb '22
  - inherits tags in recurring events [#138](https://framagit.org/les/gancio/-/issues/138)
  - you can now skip an occurrence of a recurring event
  - fix `show_recurrent` event in webcomponent and API
  - add new webcomponent `sidebar` attribute and a [`fullwith` layout](https://gancio.org/usage/embed#embed-event-lists)

### 1.3.0 - 26 gen '22
  - add mariadb support
  - add [microdata](https://developer.mozilla.org/en-US/docs/Web/HTML/Microdata) support
  - support db setup via environment variables (used in updated `docker-compose.yml` files)
  - improve rss feed:
    - fix validation
    - add enclusure media for featured image
    - add categories
  - fix typo in export code
  - add theme attribute to gancio-events webcomponent (dark/light)
  - increase thumbs quality
  - improve logo for light theme
  - improve [wordpress plugin](https://wordpress.org/plugins/wpgancio/)
    - add \[gancio-event\] and \[gancio-events\] shortcode
    - allow gancio-events / gancio-event tags in editor
    - automatically enqueue webcomponent script
  - tags/places filters are now inclusive not exclusive
  - fix image undefined alternative text
  - update documentation, dependencies, translations

### 1.2.2 - 7 dic '21
  - shiny new gancio-event\[s\] webcomponents => [docs](https://gancio.org/usage/embed)
  - new backend plugin system => [docs](https://gancio.org/dev/plugins)
  - improve media focal point selection
  - improve non-js experience (load img, use native lazy loading)
  - improve user_confirm / recover code flow
  - permit admins to choose user password (usefull on instance without SMTP configuration)
  - fix task manager exception
  - fix db initialization when a custom setup is used, #131
  - remove vue-clipboard2 dependency due to [this](https://github.com/euvl/v-clipboard/issues/18) bug and using a [native with fallback mixin instead](./assets/clipboard.js)
  - fix a regression to support old CPU, #130
  - makes dialog use fullscreen on mobile
  - fix Delete AP Actor Action from fediverse when remote Actor is gone
  - add `max` param to /events API

### 1.2.1 - 11 nov '21
  - fix `Note` remove from fediverse
  - AP Actor is now `Application`, was `Person`
  - better handling event AP representations

  this release is a step forward to improve AP compatibility with other platforms, thanks @tcit

### 1.2.0 - 9 nov '21
  - do not overwrite event slug when title is modified to preserve links
  - add public cache to events images
  - fix baseurl in initial setup configuration
  - fix user removal
  - load settings during startup and not for each request
  - refactoring user custom locale
  - published AP event's type is not `Note` anymore but `Event`

### 1.1.1 - 29 ott '21
  - fix issue adding event with dueHour resulting in `bad request`
  - fix restart during setup
  - do not use @nuxt/vuetify module, manually preload vuetify via plugin
  - remove deprecated nuxt-express-module and use serverMiddleware directly

### 1.1.0 - 26 ott '21

  - a whole new setup via web! fix #126
  - new SMTP configuration dialog, fix #115
  - re-order general settings in admin panel
  - new dark/light theme setting
  - move quite all configuration into db
  - fix some email recipients
  - fix hidden events when not ended
  - update translations
  - improve install documentation
  - add systemd gancio.service
  - allow italic and span tags inside editor
  - remove moment-timezone, consola, config, inquirer dependencies
  - update deps

### 1.0.6 (alpha)
  - fix Dockerfile yarn cache issue on update, #123
  - fix overflow on event title @homepage
  - better import dialog on mobile
  - re-add attachment to AP
  - fix max event export
  - update deps

### 1.0.5 (alpha)
  - fix/improve debian install docs
  - fix ics export, use new ics package
  - use slug url everywhere (rss feed, embedded list)
  - use i18n in event confirmation email
  - remove lot of deps warning and remove some unused dependencies
  - fix show_recurrent in embedded list
  - remove old to-ico dep, use png favicon instead

### 1.0.4 (alpha)
  - shows a generic img for events without it

### 1.0.3 (alpha)
  - 12 hour clock selection, #119
  - improve media management
    - add alt-text to featured image, fix #106
    - add focalPoint support, fix #116
  - improve a11y
  - improve node v16 compatibility
  - fix #122 ? (downgrade prettier)

### 1.0.2 (alpha)
  - improve oauth flow UI
  - [WordPress plugin](https://wordpress.org/plugins/wpgancio/)
  - fix h-event import
  - improve error logging (add stack trace to exception)
  - choose start date for recurreing events (#120)
  - fix user delete from admin

### 1.0.1 (alpha)

  - fix AP resource removal
  - improve AP resource UI
  - fix Docker setup
  - update deps

### 1.0 (alpha)
This release is a complete rewrite of frontend UI and many internals, main changes are:

- Switch UI framework from [element](https://element.eleme.io/) to [vuetify](https://vuetifyjs.com/)
- Distribute package directly from site instead of using npm registry
- Improve docker setup (run as user, fix some data export)
- New logging system (based on [winston](https://github.com/winstonjs/winston))
- Slugify event URL (keeping old one valid)
- Import events from ics and external website using h-event (microformat) improving [`h-event`](https://microformats.org/wiki/h-event) export
- Hide unconfirmed tags and places
- Clean unused places and tags
- Fix tons of issues


### 0.24.0
- New Euskara language from Basque Country, thanks @hacklabkelo
- fix feed with filters
- cleaner homepage
- fix next/prev for recurrent events
- fix some history navigation issue
- fix blank lines in description
- upgrade deps
- better custom logo management
- fix settings update

### 0.23.0
- send AP Event Object instead of Note
- show only future unconfirmed events in admin panel
- new polish locale
- add friendly instances (an additional menu is shown)
- use user's logo not project's logo in federation
- start WPGancio plugin
- support media upload via url (API only)
- confirm before remove a resource
- confirm before remove a friendly instance
- event description supports some html tag
- fix redirect after login

### 0.22.0
- add admin announcement support (fix #74)
- each instance has a specific timezone you can choose from admin's panel
- refactoring language management (you can choose a default instance's language):
  usually UX language is choosen looking at Accepted-Language header but there
  are messages not generated from an http request (eg. sending events via AP).
  In those cases a default instance's language is choosen (default 'en').
- use lazy loaded images
- better mobile experience for admins
- single day only recurring events
- fix user block in fediverse moderation
- filter and linkify content from fediverse
- add a lot of help strings in admin panel
- use html2text for event description in og: meta
- update deps
- fix a moment.js typo from/to issue
- fix #73

### 0.21.0
- a new recurring events logic (a la taskwarrior):
  - each occurrence of a recurring event could be personalized.
  - occurrence of recurring events are skippable.
  - occurrence generation could be paused.
- support `h-event` microformats! in homepage and in any single event's page
- add a background task manager (email, recurring events creation)
- sanitize html content coming from fediverse and event description with dompurify
  - also remove `fbclid` params in links
- front end search optimization
- use oauth2 for everything, password flow for webclient, this also fix
  some issue with authentication
- clickable tags / places @ home (to add them as filters)
- use a cleaner menububble for the new editor
- add local smtp and sendmail options on configuration setup
- check permission for resource removal request from fediverse
- add resource from fediverse also when inReplyTo is another resource
- automatic API documentation inclusion in docs
- split moderation in another tab inside admin panel
- use axios instead of fetch everywhere
- lot of ux improvements & error handling
- search links in event description with linkifyjs while add/edit events
- remove text templates for emails and use html2text instead
- fix email unique index for users!


### 0.20.0
  - New layout (navbar/footer/visible filters)
  - two month calendar on large display
  - admin could edit title, description, about, favicon & logo directly form admin panel
  - new add event layout => https://demo.gancio.org/add
  - new editor to describe events (bold, italic, link) supported also using copy/paste
  - the editor also support live markdown (try using ### at line start)
  - start oauth2 server implementation (documentation: https://gancio.org/dev/oauth)
  - add fediverse moderation
  - fix embedding an event via iframe
  - images converted in .webp
  - new catalan translation, thanks @fadelkon

### 0.17.14
- [locale] add catalan
- [fix] fedi outbox

### 0.17.12
- [ui] add admin section on event page in mobile #63
- [fix] remove username from users

### 0.17.11
- [refactor] s/fed_user/ap_user
- [fedi] admin moderation

### 0.17.10
- [refactor] s/comment/resource/
- [refactor] remove `username` field
- [doc] about and federation

### 0.17.8
- [fix] use thumb in head og:img only

### 0.17.7
- [fix] #58 wrong url for RSS feed

### 0.17.5
- [fedi] comments moderation
- [fedi] user moderation
- [fedi] instance moderation
- [hotfix] cli setup
- [doc] fix debian upgrade
- [fix] comment ap_id key length
- [fix] fediverse signature
- [fedi] better /inbox /followers response

### 0.17.0
- [feat] add rss link @homepage
- [ui] add lot of explanation text
- [ui] show copied messages
- [admin] show n of unconfirmed users/events
- [ui] spinner while event image is loading
- [fedi] add follow me dialog in event
- [fix] do not add reminders in full ics export
- [fix] remove spaces from hashtags sent via AP
- [fix] #56 unconfirmed event sent via ap
- [fix] localPosts/comments in fediverse stats

### 0.16.0
- [feat] embed event as widget in external website
- [fedi] instances moderation in admin
- [fix] toggle event visibility by owner
- [fedi] manage unboost
- [refactoring] auth as middleware

### 0.15.7
- [fix] minor

### 0.15.6
- [fix] tags in event

### 0.15.5
- [model] migrations setup
- [feat] embeddable event widget/iframe

### 0.15.2
- [fix] delete event
- [fix] wrong html hierarchy

### 0.15.0
- [fix] backtop icon on mobile
- [fix] webfinger nodeinfo return real node info
- [fix] register email confirmation
- [feat] add federation settings (enable comments/boost/like)
- [feat] new event page layout
- [feat] could download .ics of event
- [feat] add cors to feed requests
- [refactoring] settings middleware, cleaning codebase

### 0.14.18
- [improve] better quality for images
- [fix] password recovery email
- [feat] new action field for notification
- [feat] add DEBUG env variable in docker-compose.yml
- [style] fixed width in confirmation events table
- [fix] #38 timezone issue in rss export and using tor...

### 0.14.17
- [fix] image previews from external website
- [fix] docker-compose postgresql docs
- [improve] export white logo to fediverse
