# vite-plugin-kit-routes

## 0.2.12

### Patch Changes

- Updated dependencies
  [[`34dfde6`](https://github.com/jycouet/kitql/commit/34dfde6ac2c590cc77d600f9ea963e48dc92d199)]:
  - @kitql/helpers@0.8.7
  - @kitql/internals@0.9.3
  - vite-plugin-watch-and-run@1.5.1

## 0.2.11

### Patch Changes

- [#559](https://github.com/jycouet/kitql/pull/559)
  [`c162424`](https://github.com/jycouet/kitql/commit/c16242441d1fcd9628e1fb9948685c5b45320a8f)
  Thanks [@jycouet](https://github.com/jycouet)! - detect export function (not only export const) in
  +server.ts files

## 0.2.10

### Patch Changes

- Updated dependencies
  [[`86e6594`](https://github.com/jycouet/kitql/commit/86e65946ca7dfdba60cb31689b9fdd8f080a7181)]:
  - @kitql/internals@0.9.2
  - @kitql/helpers@0.8.6
  - vite-plugin-watch-and-run@1.5.0

## 0.2.9

### Patch Changes

- Updated dependencies
  [[`365743e`](https://github.com/jycouet/kitql/commit/365743ec5f8b2fbbc5648e172c7352d672f1eaaa)]:
  - @kitql/internals@0.9.1

## 0.2.8

### Patch Changes

- [`47d9f4d`](https://github.com/jycouet/kitql/commit/47d9f4d80d8f57556ace922b73d3a771d2e09e1c)
  Thanks [@jycouet](https://github.com/jycouet)! - tweak readme to explain that "KitQL is nothing"

- Updated dependencies
  [[`47d9f4d`](https://github.com/jycouet/kitql/commit/47d9f4d80d8f57556ace922b73d3a771d2e09e1c),
  [`54b4912`](https://github.com/jycouet/kitql/commit/54b491295df780ed30f5a039e4c78c95660fc87b),
  [`635dc31`](https://github.com/jycouet/kitql/commit/635dc312e13404afc8527289a242ed7e2d5a71b8)]:
  - vite-plugin-watch-and-run@1.5.0
  - @kitql/internals@0.9.0
  - @kitql/helpers@0.8.6

## 0.2.7

### Patch Changes

- Updated dependencies
  [[`dcc5b46`](https://github.com/jycouet/kitql/commit/dcc5b46c6142636258d56036193d29183d66bce9)]:
  - @kitql/helpers@0.8.5
  - vite-plugin-watch-and-run@1.4.5

## 0.2.6

### Patch Changes

- [#537](https://github.com/jycouet/kitql/pull/537)
  [`81fb90a`](https://github.com/jycouet/kitql/commit/81fb90ad0bd50782ad35b633c13b17fa4f270a77)
  Thanks [@jycouet](https://github.com/jycouet)! - add formats `route(path) & object[path]` AND
  `route(symbol) & object[symbol]` exporting everything

## 0.2.5

### Patch Changes

- [#535](https://github.com/jycouet/kitql/pull/535)
  [`f68f150`](https://github.com/jycouet/kitql/commit/f68f15000afeaddbca2a9c1adb39799e8c4353df)
  Thanks [@jycouet](https://github.com/jycouet)! - feat: infer route parameter type from matcher's
  guard check if applicable (https://github.com/sveltejs/kit/pull/10755, thx @LorisSigrist)

## 0.2.4

### Patch Changes

- [#533](https://github.com/jycouet/kitql/pull/533)
  [`91e4b65`](https://github.com/jycouet/kitql/commit/91e4b65877638216db275982d9f97153974289f3)
  Thanks [@jycouet](https://github.com/jycouet)! - handle nested groups properly

## 0.2.3

### Patch Changes

- [#529](https://github.com/jycouet/kitql/pull/529)
  [`3971fc3`](https://github.com/jycouet/kitql/commit/3971fc3b8dbe72f4d475bedf64ac753e4f387ad4)
  Thanks [@jycouet](https://github.com/jycouet)! - manage path starting with a group

## 0.2.2

### Patch Changes

- [#523](https://github.com/jycouet/kitql/pull/523)
  [`99f6ed1`](https://github.com/jycouet/kitql/commit/99f6ed1066c7205041a513160fba8f237d9b9d50)
  Thanks [@kran6a](https://github.com/kran6a)! - fix: symbol format with a path having a "." is now
  handle

## 0.2.1

### Patch Changes

- [`3f511c6`](https://github.com/jycouet/kitql/commit/3f511c6d9b263c643bc503c796407fb28d8959ab)
  Thanks [@jycouet](https://github.com/jycouet)! - fix: stats are now shown only at start if turned
  on

## 0.2.0

### Minor Changes

- [#502](https://github.com/jycouet/kitql/pull/502)
  [`b161ae8`](https://github.com/jycouet/kitql/commit/b161ae850841341e7bdfce86de3db40a7ebf678a)
  Thanks [@jycouet](https://github.com/jycouet)! - BREAKING: remove optional params in the key

- [#502](https://github.com/jycouet/kitql/pull/502)
  [`b161ae8`](https://github.com/jycouet/kitql/commit/b161ae850841341e7bdfce86de3db40a7ebf678a)
  Thanks [@jycouet](https://github.com/jycouet)! - action "default" needs to be specified, we want
  to be explicite (will help the route() function & avoid collision)

### Patch Changes

- [#506](https://github.com/jycouet/kitql/pull/506)
  [`66a1590`](https://github.com/jycouet/kitql/commit/66a1590e4288661bf3650619c3d5459365f4713d)
  Thanks [@jycouet](https://github.com/jycouet)! - fix required search param is now handled

- [#506](https://github.com/jycouet/kitql/pull/506)
  [`66a1590`](https://github.com/jycouet/kitql/commit/66a1590e4288661bf3650619c3d5459365f4713d)
  Thanks [@jycouet](https://github.com/jycouet)! - add shorten_args_if_one_required flag

- [`779a76b`](https://github.com/jycouet/kitql/commit/779a76b1d036dc6414f68efcd37a956ea6087c73)
  Thanks [@jycouet](https://github.com/jycouet)! - stats only at start

- [#511](https://github.com/jycouet/kitql/pull/511)
  [`24a6fda`](https://github.com/jycouet/kitql/commit/24a6fdae6454db2978082a270ae0fa019d74136e)
  Thanks [@jycouet](https://github.com/jycouet)! - fix: manage well "//" in values

- [#517](https://github.com/jycouet/kitql/pull/517)
  [`e1dd657`](https://github.com/jycouet/kitql/commit/e1dd65716a6b93117648208662a7f7dd9b1ce2a1)
  Thanks [@jycouet](https://github.com/jycouet)! - in format_short, recalculate optionality of
  params

- [`47abb03`](https://github.com/jycouet/kitql/commit/47abb0398df655636335e25ed9abbdce9ae1265a)
  Thanks [@jycouet](https://github.com/jycouet)! - fix generate route function

- [#517](https://github.com/jycouet/kitql/pull/517)
  [`e1dd657`](https://github.com/jycouet/kitql/commit/e1dd65716a6b93117648208662a7f7dd9b1ce2a1)
  Thanks [@jycouet](https://github.com/jycouet)! - add util currentSp() function

- [#500](https://github.com/jycouet/kitql/pull/500)
  [`e43bb98`](https://github.com/jycouet/kitql/commit/e43bb98c3763f413edb1c571c690da6ccd802f61)
  Thanks [@jycouet](https://github.com/jycouet)! - fix: type when there is no element in the Record

- [#517](https://github.com/jycouet/kitql/pull/517)
  [`e1dd657`](https://github.com/jycouet/kitql/commit/e1dd65716a6b93117648208662a7f7dd9b1ce2a1)
  Thanks [@jycouet](https://github.com/jycouet)! - update logs params (with no stats by default)

- [#517](https://github.com/jycouet/kitql/pull/517)
  [`e1dd657`](https://github.com/jycouet/kitql/commit/e1dd65716a6b93117648208662a7f7dd9b1ce2a1)
  Thanks [@jycouet](https://github.com/jycouet)! - rename shorten_args_if_one_required to
  format_short

- [#517](https://github.com/jycouet/kitql/pull/517)
  [`e1dd657`](https://github.com/jycouet/kitql/commit/e1dd65716a6b93117648208662a7f7dd9b1ce2a1)
  Thanks [@jycouet](https://github.com/jycouet)! - explicit params has now a higher priority than sp

## 0.2.0-next.5

### Patch Changes

- [#517](https://github.com/jycouet/kitql/pull/517)
  [`e1dd657`](https://github.com/jycouet/kitql/commit/e1dd65716a6b93117648208662a7f7dd9b1ce2a1)
  Thanks [@jycouet](https://github.com/jycouet)! - in format_short, recalculate optionality of
  params

- [#517](https://github.com/jycouet/kitql/pull/517)
  [`e1dd657`](https://github.com/jycouet/kitql/commit/e1dd65716a6b93117648208662a7f7dd9b1ce2a1)
  Thanks [@jycouet](https://github.com/jycouet)! - add util currentSp() function

- [#517](https://github.com/jycouet/kitql/pull/517)
  [`e1dd657`](https://github.com/jycouet/kitql/commit/e1dd65716a6b93117648208662a7f7dd9b1ce2a1)
  Thanks [@jycouet](https://github.com/jycouet)! - update logs params (with no stats by default)

- [#517](https://github.com/jycouet/kitql/pull/517)
  [`e1dd657`](https://github.com/jycouet/kitql/commit/e1dd65716a6b93117648208662a7f7dd9b1ce2a1)
  Thanks [@jycouet](https://github.com/jycouet)! - rename shorten_args_if_one_required to
  format_short

- [#517](https://github.com/jycouet/kitql/pull/517)
  [`e1dd657`](https://github.com/jycouet/kitql/commit/e1dd65716a6b93117648208662a7f7dd9b1ce2a1)
  Thanks [@jycouet](https://github.com/jycouet)! - explicit params has now a higher priority than sp

## 0.2.0-next.4

### Patch Changes

- [#511](https://github.com/jycouet/kitql/pull/511)
  [`24a6fda`](https://github.com/jycouet/kitql/commit/24a6fdae6454db2978082a270ae0fa019d74136e)
  Thanks [@jycouet](https://github.com/jycouet)! - fix: manage well "//" in values

## 0.2.0-next.3

### Patch Changes

- [`47abb03`](https://github.com/jycouet/kitql/commit/47abb0398df655636335e25ed9abbdce9ae1265a)
  Thanks [@jycouet](https://github.com/jycouet)! - fix generate route function

## 0.2.0-next.2

### Patch Changes

- [#506](https://github.com/jycouet/kitql/pull/506)
  [`66a1590`](https://github.com/jycouet/kitql/commit/66a1590e4288661bf3650619c3d5459365f4713d)
  Thanks [@jycouet](https://github.com/jycouet)! - fix required search param is now handled

- [#506](https://github.com/jycouet/kitql/pull/506)
  [`66a1590`](https://github.com/jycouet/kitql/commit/66a1590e4288661bf3650619c3d5459365f4713d)
  Thanks [@jycouet](https://github.com/jycouet)! - add format_short flag

## 0.2.0-next.1

### Patch Changes

- [`779a76b`](https://github.com/jycouet/kitql/commit/779a76b1d036dc6414f68efcd37a956ea6087c73)
  Thanks [@jycouet](https://github.com/jycouet)! - stats only at start

## 0.2.0-next.0

### Minor Changes

- [#502](https://github.com/jycouet/kitql/pull/502)
  [`b161ae8`](https://github.com/jycouet/kitql/commit/b161ae850841341e7bdfce86de3db40a7ebf678a)
  Thanks [@jycouet](https://github.com/jycouet)! - BREAKING: remove optional params in the key

- [#502](https://github.com/jycouet/kitql/pull/502)
  [`b161ae8`](https://github.com/jycouet/kitql/commit/b161ae850841341e7bdfce86de3db40a7ebf678a)
  Thanks [@jycouet](https://github.com/jycouet)! - action "default" needs to be specified, we want
  to be explicite (will help the route() function & avoid collision)

### Patch Changes

- [#500](https://github.com/jycouet/kitql/pull/500)
  [`e43bb98`](https://github.com/jycouet/kitql/commit/e43bb98c3763f413edb1c571c690da6ccd802f61)
  Thanks [@jycouet](https://github.com/jycouet)! - fix: type when there is no element in the Record

## 0.1.4

### Patch Changes

- [#497](https://github.com/jycouet/kitql/pull/497)
  [`429f71b`](https://github.com/jycouet/kitql/commit/429f71b154d6d5aaa18bef36e01a6b05fa29fad0)
  Thanks [@jycouet](https://github.com/jycouet)! - fix: append search params on named action is now
  working

- [#497](https://github.com/jycouet/kitql/pull/497)
  [`429f71b`](https://github.com/jycouet/kitql/commit/429f71b154d6d5aaa18bef36e01a6b05fa29fad0)
  Thanks [@jycouet](https://github.com/jycouet)! - add warning on using named actions & default
  action at the same time.

## 0.1.3

### Patch Changes

- [#492](https://github.com/jycouet/kitql/pull/492)
  [`63c74f4`](https://github.com/jycouet/kitql/commit/63c74f443706cdb04e9509b5e18de412a9e52e3c)
  Thanks [@jycouet](https://github.com/jycouet)! - fix: actions with or without satisfies are now
  detected well

## 0.1.2

### Patch Changes

- [#488](https://github.com/jycouet/kitql/pull/488)
  [`80b4138`](https://github.com/jycouet/kitql/commit/80b4138724971e3768304df9b1f02dc557a3b2e6)
  Thanks [@jycouet](https://github.com/jycouet)! - Handle special layout coded in
  +page@LAYOUT.svelte

- [#489](https://github.com/jycouet/kitql/pull/489)
  [`205c592`](https://github.com/jycouet/kitql/commit/205c5929ea46f34aeb8e1fbe7518a2bd571e9baa)
  Thanks [@jycouet](https://github.com/jycouet)! - add path_base management with a boolean to use
  $app/paths as a prefix or not

- [#486](https://github.com/jycouet/kitql/pull/486)
  [`418f989`](https://github.com/jycouet/kitql/commit/418f9898e8aed6f303745246386ab020264de050)
  Thanks [@jycouet](https://github.com/jycouet)! - working with node >=18

## 0.1.1

### Patch Changes

- [#475](https://github.com/jycouet/kitql/pull/475)
  [`ada65e2`](https://github.com/jycouet/kitql/commit/ada65e2ce1c3c6f1865768b1c6f6f64fe2ea51e7)
  Thanks [@jycouet](https://github.com/jycouet)! - manage [...rest] routes

- [#477](https://github.com/jycouet/kitql/pull/477)
  [`0e2e67d`](https://github.com/jycouet/kitql/commit/0e2e67d69a31989c675be0cc8a9bd5a0982dde22)
  Thanks [@jycouet](https://github.com/jycouet)! - add new format: variables

- [#475](https://github.com/jycouet/kitql/pull/475)
  [`ada65e2`](https://github.com/jycouet/kitql/commit/ada65e2ce1c3c6f1865768b1c6f6f64fe2ea51e7)
  Thanks [@jycouet](https://github.com/jycouet)! - Add logs options to display more of less things
  (by default you have everything)

- Updated dependencies
  [[`d52c197`](https://github.com/jycouet/kitql/commit/d52c19735a4702398dab9dc5592ce0b4cf98a939)]:
  - vite-plugin-watch-and-run@1.4.4

## 0.1.1-next.2

### Patch Changes

- [#477](https://github.com/jycouet/kitql/pull/477)
  [`0e2e67d`](https://github.com/jycouet/kitql/commit/0e2e67d69a31989c675be0cc8a9bd5a0982dde22)
  Thanks [@jycouet](https://github.com/jycouet)! - add new format: variables

## 0.1.1-next.1

### Patch Changes

- [#475](https://github.com/jycouet/kitql/pull/475)
  [`ada65e2`](https://github.com/jycouet/kitql/commit/ada65e2ce1c3c6f1865768b1c6f6f64fe2ea51e7)
  Thanks [@jycouet](https://github.com/jycouet)! - manage [...rest] routes

- [#475](https://github.com/jycouet/kitql/pull/475)
  [`ada65e2`](https://github.com/jycouet/kitql/commit/ada65e2ce1c3c6f1865768b1c6f6f64fe2ea51e7)
  Thanks [@jycouet](https://github.com/jycouet)! - Add logs options to display more of less things
  (by default you have everything)

## 0.1.1-next.0

### Patch Changes

- Updated dependencies
  [[`d52c197`](https://github.com/jycouet/kitql/commit/d52c19735a4702398dab9dc5592ce0b4cf98a939)]:
  - vite-plugin-watch-and-run@1.4.4-next.0

## 0.1.0

### Minor Changes

- [#453](https://github.com/jycouet/kitql/pull/453)
  [`ac6e5aa`](https://github.com/jycouet/kitql/commit/ac6e5aa4a1cd27249ea504bff9fa1d72fa2c6ae9)
  Thanks [@jycouet](https://github.com/jycouet)! - Add LINKS

### Patch Changes

- [#451](https://github.com/jycouet/kitql/pull/451)
  [`4312432`](https://github.com/jycouet/kitql/commit/4312432d915a9f50f78d87c67623a941bb86db8a)
  Thanks [@jycouet](https://github.com/jycouet)! - fix when route is starting with group

- [#448](https://github.com/jycouet/kitql/pull/448)
  [`9e087ba`](https://github.com/jycouet/kitql/commit/9e087ba1ad9060409ca8eafc58212f4ccb162bb1)
  Thanks [@jycouet](https://github.com/jycouet)! - BREAKING: without a param, it's not a function
  anymore

- [`6f6b0d1`](https://github.com/jycouet/kitql/commit/6f6b0d1e172b8a696e1e35ced9d4db61a58c05f6)
  Thanks [@jycouet](https://github.com/jycouet)! - update readme on npm (this needs a publish of a
  new version)

- [#448](https://github.com/jycouet/kitql/pull/448)
  [`9e087ba`](https://github.com/jycouet/kitql/commit/9e087ba1ad9060409ca8eafc58212f4ccb162bb1)
  Thanks [@jycouet](https://github.com/jycouet)! - BREAKING: change default format to '/'

- [#448](https://github.com/jycouet/kitql/pull/448)
  [`9e087ba`](https://github.com/jycouet/kitql/commit/9e087ba1ad9060409ca8eafc58212f4ccb162bb1)
  Thanks [@jycouet](https://github.com/jycouet)! - internal: remove ensurePrefix

- [#455](https://github.com/jycouet/kitql/pull/455)
  [`d20fed5`](https://github.com/jycouet/kitql/commit/d20fed5b428e5b0d964eb734773a230ac6e6dace)
  Thanks [@jycouet](https://github.com/jycouet)! - rename object_keys_format to format

- [#463](https://github.com/jycouet/kitql/pull/463)
  [`9d0dfd9`](https://github.com/jycouet/kitql/commit/9d0dfd960df4841052d63d83cfd42a651f3abf25)
  Thanks [@jycouet](https://github.com/jycouet)! - update readme

- [#461](https://github.com/jycouet/kitql/pull/461)
  [`a076ea5`](https://github.com/jycouet/kitql/commit/a076ea5dc6dc297f5560a6a1cd5956cd478b5ac5)
  Thanks [@jycouet](https://github.com/jycouet)! - fix: default params in LINKS are now taken into
  account

- [#448](https://github.com/jycouet/kitql/pull/448)
  [`9e087ba`](https://github.com/jycouet/kitql/commit/9e087ba1ad9060409ca8eafc58212f4ccb162bb1)
  Thanks [@jycouet](https://github.com/jycouet)! - rmv groups from key (as it's not possible to have
  2 matching)

- [#455](https://github.com/jycouet/kitql/pull/455)
  [`d20fed5`](https://github.com/jycouet/kitql/commit/d20fed5b428e5b0d964eb734773a230ac6e6dace)
  Thanks [@jycouet](https://github.com/jycouet)! - remove exdend in the config to reduce the file
  nesting

## 0.1.0-next.6

### Patch Changes

- [`6f6b0d1`](https://github.com/jycouet/kitql/commit/6f6b0d1e172b8a696e1e35ced9d4db61a58c05f6)
  Thanks [@jycouet](https://github.com/jycouet)! - update readme on npm (this needs a publish of a
  new version)

## 0.1.0-next.5

### Patch Changes

- [#463](https://github.com/jycouet/kitql/pull/463)
  [`9d0dfd9`](https://github.com/jycouet/kitql/commit/9d0dfd960df4841052d63d83cfd42a651f3abf25)
  Thanks [@jycouet](https://github.com/jycouet)! - update readme

## 0.1.0-next.4

### Patch Changes

- [#461](https://github.com/jycouet/kitql/pull/461)
  [`a076ea5`](https://github.com/jycouet/kitql/commit/a076ea5dc6dc297f5560a6a1cd5956cd478b5ac5)
  Thanks [@jycouet](https://github.com/jycouet)! - fix: default params in LINKS are now taken into
  account

## 0.1.0-next.3

### Patch Changes

- [#455](https://github.com/jycouet/kitql/pull/455)
  [`d20fed5`](https://github.com/jycouet/kitql/commit/d20fed5b428e5b0d964eb734773a230ac6e6dace)
  Thanks [@jycouet](https://github.com/jycouet)! - rename object_keys_format to format

- [#455](https://github.com/jycouet/kitql/pull/455)
  [`d20fed5`](https://github.com/jycouet/kitql/commit/d20fed5b428e5b0d964eb734773a230ac6e6dace)
  Thanks [@jycouet](https://github.com/jycouet)! - remove exdend in the config to reduce the file
  nesting

## 0.1.0-next.2

### Minor Changes

- [#453](https://github.com/jycouet/kitql/pull/453)
  [`ac6e5aa`](https://github.com/jycouet/kitql/commit/ac6e5aa4a1cd27249ea504bff9fa1d72fa2c6ae9)
  Thanks [@jycouet](https://github.com/jycouet)! - Add LINKS

## 0.0.15-next.1

### Patch Changes

- [#451](https://github.com/jycouet/kitql/pull/451)
  [`4312432`](https://github.com/jycouet/kitql/commit/4312432d915a9f50f78d87c67623a941bb86db8a)
  Thanks [@jycouet](https://github.com/jycouet)! - fix when route is starting with group

- [#448](https://github.com/jycouet/kitql/pull/448)
  [`9e087ba`](https://github.com/jycouet/kitql/commit/9e087ba1ad9060409ca8eafc58212f4ccb162bb1)
  Thanks [@jycouet](https://github.com/jycouet)! - BREAKING: without a param, it's not a function
  anymore

- [#448](https://github.com/jycouet/kitql/pull/448)
  [`9e087ba`](https://github.com/jycouet/kitql/commit/9e087ba1ad9060409ca8eafc58212f4ccb162bb1)
  Thanks [@jycouet](https://github.com/jycouet)! - BREAKING: change default format to '/'

- [#448](https://github.com/jycouet/kitql/pull/448)
  [`9e087ba`](https://github.com/jycouet/kitql/commit/9e087ba1ad9060409ca8eafc58212f4ccb162bb1)
  Thanks [@jycouet](https://github.com/jycouet)! - internal: remove ensurePrefix

- [#448](https://github.com/jycouet/kitql/pull/448)
  [`9e087ba`](https://github.com/jycouet/kitql/commit/9e087ba1ad9060409ca8eafc58212f4ccb162bb1)
  Thanks [@jycouet](https://github.com/jycouet)! - rmv groups from key (as it's not possible to have
  2 matching)

## 0.0.15-next.0

### Patch Changes

- [#448](https://github.com/jycouet/kitql/pull/448)
  [`9e087ba`](https://github.com/jycouet/kitql/commit/9e087ba1ad9060409ca8eafc58212f4ccb162bb1)
  Thanks [@jycouet](https://github.com/jycouet)! - BREAKING: without a param, it's not a function
  anymore

- [#448](https://github.com/jycouet/kitql/pull/448)
  [`9e087ba`](https://github.com/jycouet/kitql/commit/9e087ba1ad9060409ca8eafc58212f4ccb162bb1)
  Thanks [@jycouet](https://github.com/jycouet)! - BREAKING: change default format to '/'

- [#448](https://github.com/jycouet/kitql/pull/448)
  [`9e087ba`](https://github.com/jycouet/kitql/commit/9e087ba1ad9060409ca8eafc58212f4ccb162bb1)
  Thanks [@jycouet](https://github.com/jycouet)! - internal: remove ensurePrefix

- [#448](https://github.com/jycouet/kitql/pull/448)
  [`9e087ba`](https://github.com/jycouet/kitql/commit/9e087ba1ad9060409ca8eafc58212f4ccb162bb1)
  Thanks [@jycouet](https://github.com/jycouet)! - rmv groups from key (as it's not possible to have
  2 matching)

## 0.0.14

### Patch Changes

- [`113eb68`](https://github.com/jycouet/kitql/commit/113eb68bb59650cd112106c6440482ec176ed9d2)
  Thanks [@jycouet](https://github.com/jycouet)! - fix: some +page.server can have no action (a load
  only), not it's managed.

## 0.0.13

### Patch Changes

- [#445](https://github.com/jycouet/kitql/pull/445)
  [`d79866f`](https://github.com/jycouet/kitql/commit/d79866f178b016b2db0d9dcba63fe01d5d7ce1b2)
  Thanks [@jycouet](https://github.com/jycouet)! - add override for types

- [#445](https://github.com/jycouet/kitql/pull/445)
  [`d79866f`](https://github.com/jycouet/kitql/commit/d79866f178b016b2db0d9dcba63fe01d5d7ce1b2)
  Thanks [@jycouet](https://github.com/jycouet)! - add specifiers management

- [#445](https://github.com/jycouet/kitql/pull/445)
  [`d79866f`](https://github.com/jycouet/kitql/commit/d79866f178b016b2db0d9dcba63fe01d5d7ce1b2)
  Thanks [@jycouet](https://github.com/jycouet)! - fix: double search params is now working well

## 0.0.12

### Patch Changes

- [#442](https://github.com/jycouet/kitql/pull/442)
  [`9f047fd`](https://github.com/jycouet/kitql/commit/9f047fdb99073cd1d1b2f02727330759b1dc25df)
  Thanks [@jycouet](https://github.com/jycouet)! - add types in package.json for cjs

- Updated dependencies
  [[`9f047fd`](https://github.com/jycouet/kitql/commit/9f047fdb99073cd1d1b2f02727330759b1dc25df)]:
  - vite-plugin-watch-and-run@1.4.3
  - @kitql/helpers@0.8.4

## 0.0.11

### Patch Changes

- [#432](https://github.com/jycouet/kitql/pull/432)
  [`8e75e6d`](https://github.com/jycouet/kitql/commit/8e75e6d8f649e183d96577ed0280a9960ec13c0c)
  Thanks [@jycouet](https://github.com/jycouet)! - add cjs option

- Updated dependencies
  [[`94dc048`](https://github.com/jycouet/kitql/commit/94dc0487f5777535292b462bda514900e4a02578),
  [`c056a39`](https://github.com/jycouet/kitql/commit/c056a395d118b0882fe8f3981b7f49532b0101b1),
  [`8e75e6d`](https://github.com/jycouet/kitql/commit/8e75e6d8f649e183d96577ed0280a9960ec13c0c)]:
  - @kitql/helpers@0.8.3
  - vite-plugin-watch-and-run@1.4.2

## 0.0.11-next.2

### Patch Changes

- Updated dependencies
  [[`c056a39`](https://github.com/jycouet/kitql/commit/c056a395d118b0882fe8f3981b7f49532b0101b1)]:
  - @kitql/helpers@0.8.3-next.2
  - vite-plugin-watch-and-run@1.4.2-next.2

## 0.0.11-next.1

### Patch Changes

- Updated dependencies
  [[`94dc048`](https://github.com/jycouet/kitql/commit/94dc0487f5777535292b462bda514900e4a02578)]:
  - @kitql/helpers@0.8.3-next.1
  - vite-plugin-watch-and-run@1.4.2-next.1

## 0.0.11-next.0

### Patch Changes

- [#432](https://github.com/jycouet/kitql/pull/432)
  [`8e75e6d`](https://github.com/jycouet/kitql/commit/8e75e6d8f649e183d96577ed0280a9960ec13c0c)
  Thanks [@jycouet](https://github.com/jycouet)! - add cjs option

- Updated dependencies
  [[`8e75e6d`](https://github.com/jycouet/kitql/commit/8e75e6d8f649e183d96577ed0280a9960ec13c0c)]:
  - vite-plugin-watch-and-run@1.4.2-next.0
  - @kitql/helpers@0.8.3-next.0

## 0.0.10

### Patch Changes

- [#429](https://github.com/jycouet/kitql/pull/429)
  [`fd9f8a7`](https://github.com/jycouet/kitql/commit/fd9f8a78c3b306beae03ce45030645e7946ad7c3)
  Thanks [@jycouet](https://github.com/jycouet)! - fix returned path of multi param

- [#429](https://github.com/jycouet/kitql/pull/429)
  [`fd9f8a7`](https://github.com/jycouet/kitql/commit/fd9f8a78c3b306beae03ce45030645e7946ad7c3)
  Thanks [@jycouet](https://github.com/jycouet)! - add kitRoute (store)

- [#429](https://github.com/jycouet/kitql/pull/429)
  [`fd9f8a7`](https://github.com/jycouet/kitql/commit/fd9f8a78c3b306beae03ce45030645e7946ad7c3)
  Thanks [@jycouet](https://github.com/jycouet)! - add Storage option (beta, waiting for Runes to
  have something even better!)

## 0.0.9

### Patch Changes

- [#424](https://github.com/jycouet/kitql/pull/424)
  [`cda7f9c`](https://github.com/jycouet/kitql/commit/cda7f9c4cd4fd90997716111016e1059afcafb1e)
  Thanks [@jycouet](https://github.com/jycouet)! - fix ensurePrefix on ROOT

- [#424](https://github.com/jycouet/kitql/pull/424)
  [`cda7f9c`](https://github.com/jycouet/kitql/commit/cda7f9c4cd4fd90997716111016e1059afcafb1e)
  Thanks [@jycouet](https://github.com/jycouet)! - add generic types to the plugin

## 0.0.8

### Patch Changes

- [#421](https://github.com/jycouet/kitql/pull/421)
  [`3680a40`](https://github.com/jycouet/kitql/commit/3680a404652c16464a6e211d7f8cb42f9fe7ebef)
  Thanks [@jycouet](https://github.com/jycouet)! - feat - Add defaults to params

- [#421](https://github.com/jycouet/kitql/pull/421)
  [`3680a40`](https://github.com/jycouet/kitql/commit/3680a404652c16464a6e211d7f8cb42f9fe7ebef)
  Thanks [@jycouet](https://github.com/jycouet)! - fix optional param not at the start of the path
  are working as well

## 0.0.7

### Patch Changes

- [#419](https://github.com/jycouet/kitql/pull/419)
  [`82ed37d`](https://github.com/jycouet/kitql/commit/82ed37d73eeef5495d8656036650f95e195c9a8c)
  Thanks [@jycouet](https://github.com/jycouet)! - fix optional param not set

## 0.0.6

### Patch Changes

- [#416](https://github.com/jycouet/kitql/pull/416)
  [`dbb1ad9`](https://github.com/jycouet/kitql/commit/dbb1ad9f6298d7403ba6f67eabb9eecc19e8fca2)
  Thanks [@jycouet](https://github.com/jycouet)! - fix windows paths

- [#417](https://github.com/jycouet/kitql/pull/417)
  [`9ef8103`](https://github.com/jycouet/kitql/commit/9ef8103516094b71fea1e9f0ea04cbc72f9182c2)
  Thanks [@jycouet](https://github.com/jycouet)! - add searchParam config & type setting

## 0.0.5

### Patch Changes

- [#412](https://github.com/jycouet/kitql/pull/412)
  [`f568350`](https://github.com/jycouet/kitql/commit/f568350fe1262db6eec73dbf98beb3fa1c04f990)
  Thanks [@jycouet](https://github.com/jycouet)! - fix group routes management

- [#412](https://github.com/jycouet/kitql/pull/412)
  [`f568350`](https://github.com/jycouet/kitql/commit/f568350fe1262db6eec73dbf98beb3fa1c04f990)
  Thanks [@jycouet](https://github.com/jycouet)! - manage optional params

- [#412](https://github.com/jycouet/kitql/pull/412)
  [`f568350`](https://github.com/jycouet/kitql/commit/f568350fe1262db6eec73dbf98beb3fa1c04f990)
  Thanks [@jycouet](https://github.com/jycouet)! - manage matchers

## 0.0.4

### Patch Changes

- [#408](https://github.com/jycouet/kitql/pull/408)
  [`3b3c4eb`](https://github.com/jycouet/kitql/commit/3b3c4ebe68b2d1103c58d456c43b4061aef317c6)
  Thanks [@jycouet](https://github.com/jycouet)! - when we have only 1 method, let's not add the arg

- [#408](https://github.com/jycouet/kitql/pull/408)
  [`3b3c4eb`](https://github.com/jycouet/kitql/commit/3b3c4ebe68b2d1103c58d456c43b4061aef317c6)
  Thanks [@jycouet](https://github.com/jycouet)! - using nicer keys by default

## 0.0.3

### Patch Changes

- [#406](https://github.com/jycouet/kitql/pull/406)
  [`70e652a`](https://github.com/jycouet/kitql/commit/70e652a5e2b5448eb63752cb86c63b1884e9a0b5)
  Thanks [@jycouet](https://github.com/jycouet)! - add method & action

## 0.0.2

### Patch Changes

- [#403](https://github.com/jycouet/kitql/pull/403)
  [`3d4c5bc`](https://github.com/jycouet/kitql/commit/3d4c5bcaa1950489d029a8d3859c7ede85b4edc3)
  Thanks [@jycouet](https://github.com/jycouet)! - init plugin

- Updated dependencies
  [[`3d4c5bc`](https://github.com/jycouet/kitql/commit/3d4c5bcaa1950489d029a8d3859c7ede85b4edc3)]:
  - vite-plugin-watch-and-run@1.4.1
