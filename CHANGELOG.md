## [1.20.1](https://github.com/fivaz/fit-v2/compare/v1.20.0...v1.20.1) (2026-05-07)

### 🧹 Chores

* add a coderabbit cursor rule ([93af9a0](https://github.com/fivaz/fit-v2/commit/93af9a0027f0f0332097f5e44bdf0a34274ce40d))
* add a sign up test ([58a05c0](https://github.com/fivaz/fit-v2/commit/58a05c0df8e0eb33206ba9f1867862fec1c5ce03))
* add cursorrules ([9e57512](https://github.com/fivaz/fit-v2/commit/9e57512ea869c710abf5a8ea3302d9daf003d4bd))
* add test for auth and add programs ([9316045](https://github.com/fivaz/fit-v2/commit/93160456ea78adae76c615a8737615325693e613))
* add test for CRUD exercise and bodyStats ([b2d1c6f](https://github.com/fivaz/fit-v2/commit/b2d1c6febff8e6ff66d5268a4d8b7368b56fac85))
* add test to associating programs to exercises and reordering them ([bc2bdd1](https://github.com/fivaz/fit-v2/commit/bc2bdd19862d1ad04466bd4eb822a619b17c1adc))
* add workout logging test ([39e739d](https://github.com/fivaz/fit-v2/commit/39e739df51f088b2cef6417fcacc3b427daa7119))
* apply new test rules ([d1d0fc8](https://github.com/fivaz/fit-v2/commit/d1d0fc89e83cee478921ac956b8392c34ba977c0))
* apply small changes in tests ([2db0bf6](https://github.com/fivaz/fit-v2/commit/2db0bf698f729a088432ba4dfa83567b7d379461))
* delete data created by test ([c841849](https://github.com/fivaz/fit-v2/commit/c841849153632ec2d09e4701b51bb5de6e9c9658))
* improve test organization by files ([711a011](https://github.com/fivaz/fit-v2/commit/711a01142973845eab2869a86f20d483a7c440ee))
* increase test coverage on marginal features ([19e6907](https://github.com/fivaz/fit-v2/commit/19e6907bf36ed7eb4b27a8ef94f1c266cfd959e7))
* make CRUD test for program and exercise ([b07ff3f](https://github.com/fivaz/fit-v2/commit/b07ff3f544438ca86b4b35253f347f40ae179517))
* make seed more complet ([1b70055](https://github.com/fivaz/fit-v2/commit/1b70055641792ecbe20d0d5e1372075b3aeacf48))
* make tests fully parallel by using api driven login ([ad90fc7](https://github.com/fivaz/fit-v2/commit/ad90fc74f6af5d5b4be7ef5fa4130ad9698a171f))
* use cursor rules new format ([e9a6ec3](https://github.com/fivaz/fit-v2/commit/e9a6ec3d22db9cad63405c9ce68a4b65891d9036))

### 🔨 Code Refactoring

* use date-fns lib to manage dates ([79e35ac](https://github.com/fivaz/fit-v2/commit/79e35acb93e8c99f648d1c5a0161fc5f93ac4f01))

## [1.20.0](https://github.com/fivaz/fit-v2/compare/v1.19.0...v1.20.0) (2026-03-22)

### ✨ Features

* add more consistent error treatment when updating timezone ([a42ab2c](https://github.com/fivaz/fit-v2/commit/a42ab2ca106be13842cfce10a48cd65a65c4f45d))
* make new workout sets with previous sets or this or other workouts ([e6fd4ab](https://github.com/fivaz/fit-v2/commit/e6fd4ab6ee3e872a8e06779844c59edf2be7455d))
* replace the name "Delete" with "Confirm" as the default confirm label ([ca44310](https://github.com/fivaz/fit-v2/commit/ca443104bc5720ab8e290e66fec22a81afa5c5ed))

### 🐛 Bug Fixes

* remove user db in seed script ([8a06be4](https://github.com/fivaz/fit-v2/commit/8a06be41b5176fe52623b8f94fc56eb7c7244ac1))

### 🧹 Chores

* add timezone to user and sync it automatically with browser's one ([f6797f2](https://github.com/fivaz/fit-v2/commit/f6797f272ee80a719af68a195f9148f8037fe214))
* lint files before commit ([ec05a09](https://github.com/fivaz/fit-v2/commit/ec05a0983b8f58f95fae9f7db64bf0a2525b1c1c))
* remove useless information in .env.example ([de19e2d](https://github.com/fivaz/fit-v2/commit/de19e2d86194e8353c5e6cde84e4e29e8365c5bb))
* update vulnerable nextjs version and remove onlyBuiltDependecies ([dd41c99](https://github.com/fivaz/fit-v2/commit/dd41c99db78f92176266518cf8730f55db79097f))

### 🔨 Code Refactoring

* simplify logging ([48d4e1c](https://github.com/fivaz/fit-v2/commit/48d4e1c5a204e75fca77fa4b8cb1bc12ca595587))
* small refactoring ([90e2847](https://github.com/fivaz/fit-v2/commit/90e2847cce470ad0151ca08d1ff2a64d0d6a49c7))

## [1.19.0](https://github.com/fivaz/fit-v2/compare/v1.18.0...v1.19.0) (2026-02-08)

### ✨ Features

* change the confirm button name in workout finish button ([2732028](https://github.com/fivaz/fit-v2/commit/27320284e252799f2ae3f6d41c11826c8dd9aa5c))
* change toast notification position from button to top right ([f86855d](https://github.com/fivaz/fit-v2/commit/f86855d86704483b33442ec1fd2a529115ee84e1))
* remove unnecessary bottom padding in workout page ([270aedb](https://github.com/fivaz/fit-v2/commit/270aedb41564cf26b93a74bf4243ea8c2d14aad1))

### 🐛 Bug Fixes

* remove unnecessary command in pre-push script, that will eventually fail in husky v10 ([c24ddf2](https://github.com/fivaz/fit-v2/commit/c24ddf20f8b78a4cb926dab41ce12ada25ead8bf))

## [1.18.0](https://github.com/fivaz/fit-v2/compare/v1.17.1...v1.18.0) (2026-02-07)

### ✨ Features

* show ExerciseDetails also in Program page ([ff46857](https://github.com/fivaz/fit-v2/commit/ff468577f435b588a66facae66505db27a85737a))
* show ExerciseDetails also in Workout page ([2e882a6](https://github.com/fivaz/fit-v2/commit/2e882a68f77dc9195a5dcc88748628f7537c8453))

### 🐛 Bug Fixes

* fix tailwind groups ([8e832ab](https://github.com/fivaz/fit-v2/commit/8e832ab3f2552621c3a21a1b3007c41e65d94bd2))

### 🔨 Code Refactoring

* remove replaceDomain ([c558a0c](https://github.com/fivaz/fit-v2/commit/c558a0c6528ba0e34ba3491c7abeda9a1ea5028d))

## [1.17.1](https://github.com/fivaz/fit-v2/compare/v1.17.0...v1.17.1) (2026-01-25)

### 🧹 Chores

* add some error handling ([f6ad96d](https://github.com/fivaz/fit-v2/commit/f6ad96dd078d2c64b4eca00b024dcb3860808bb5))

## [1.17.0](https://github.com/fivaz/fit-v2/compare/v1.16.0...v1.17.0) (2026-01-25)

### ✨ Features

* add a tooltip to inform about the warm up sets ([78c262b](https://github.com/fivaz/fit-v2/commit/78c262ba1e2b3ac2e8091f450b275f4a024ef50d))
* add option to toggle set as warmup ([7c8e316](https://github.com/fivaz/fit-v2/commit/7c8e316a8cde46ad0ad99d8cdb730964b76c3d80))
* improve experience using input type button in set ([affe1f5](https://github.com/fivaz/fit-v2/commit/affe1f54a4e7331af885c5d0504cc59ac249f737))
* make set toggle prettier ([00f7a72](https://github.com/fivaz/fit-v2/commit/00f7a7243449e5ac121c8ce5b6809597ca5c3e23))
* show icons to represent when user change set isWarmup ([5153b38](https://github.com/fivaz/fit-v2/commit/5153b38e9939d77901618d2a55ab440892eb9468))
* use client navigation to redirect after workout ends to show a toast message ([64c5895](https://github.com/fivaz/fit-v2/commit/64c58956e5a85cda1d81f0191afc6e45942a044d))

### 🐛 Bug Fixes

* fix isWarmup was not persisting as it was not part of the sync function ([5a1007d](https://github.com/fivaz/fit-v2/commit/5a1007d4a356c74e8e7b782b0e052dc4bae98395))

### 🔨 Code Refactoring

* keep set.time as a Date object ([dd8f589](https://github.com/fivaz/fit-v2/commit/dd8f589a33bbbd020e973d100d3b785ce6ae0bb4))
* move time input from set row to its own component ([a90bf0c](https://github.com/fivaz/fit-v2/commit/a90bf0c7f7694b30245aae55682638e11fe36119))
* simplify set-row ([bfda4ad](https://github.com/fivaz/fit-v2/commit/bfda4ad9766af9351f6426d1ea45030cb84bc616))
* split work-detail component into two ([b5fb673](https://github.com/fivaz/fit-v2/commit/b5fb673f1966b3c4d5b452a14cdf0eff301c226a))

## [1.16.0](https://github.com/fivaz/fit-v2/compare/v1.15.2...v1.16.0) (2026-01-18)

### ✨ Features

* make program exercise row also clickable ([dc89148](https://github.com/fivaz/fit-v2/commit/dc89148da093ddac0168317cb12e8c3025ca4cfd))
* make replaceDomain conditional on feature flags ([69b33ee](https://github.com/fivaz/fit-v2/commit/69b33eec1bea574dfeb71ce7fda4d97864b74d50))
* search for exercises with individual words ([b7a6132](https://github.com/fivaz/fit-v2/commit/b7a6132a586c61583affc2a65f745440bebd3049))

### 🐛 Bug Fixes

* change environment variable that checks for production for sentry ([d341ef6](https://github.com/fivaz/fit-v2/commit/d341ef6933e133dd557cc309d1ed659a37bb6acd))
* prevent keyboard from making the drawer slide up ([ebbae95](https://github.com/fivaz/fit-v2/commit/ebbae95a5a8c88b84c4ce3a04a456511c5b956ee))
* time wasn't being synced in workout ([92eb7fe](https://github.com/fivaz/fit-v2/commit/92eb7fe261ccca0cb5131038c401b4141de0b84c))

### 🔨 Code Refactoring

* lint files ([2bde84c](https://github.com/fivaz/fit-v2/commit/2bde84c365c8a9a65ec3374145398e955a9a5abb))

## [1.15.2](https://github.com/fivaz/fit-v2/compare/v1.15.1...v1.15.2) (2026-01-18)

### 🔨 Code Refactoring

* allow sentry only in production ([469e089](https://github.com/fivaz/fit-v2/commit/469e08906ae00300df423b9fcd1b177a2a164874))
* install sentry ([78c7919](https://github.com/fivaz/fit-v2/commit/78c7919fda224970e2173e1176e082368dd1c184))

## [1.15.1](https://github.com/fivaz/fit-v2/compare/v1.15.0...v1.15.1) (2026-01-18)

### 🔨 Code Refactoring

* refactor replaceDomain ([b8a9025](https://github.com/fivaz/fit-v2/commit/b8a902581bbdfbe8f003bcbfb97559a0786d655f))

## [1.15.0](https://github.com/fivaz/fit-v2/compare/v1.14.0...v1.15.0) (2026-01-18)

### ✨ Features

* only show exercises of selected muscles ([b9a2b5f](https://github.com/fivaz/fit-v2/commit/b9a2b5ff0e7750dbec985e5fd120b2a52d09e3b8))
* truncate name in ProgramExerciseRow ([9fd0922](https://github.com/fivaz/fit-v2/commit/9fd092251864f211d1a0151edf0c542c30165028))

### 🐛 Bug Fixes

* form errors weren't preventing the submission ([2631052](https://github.com/fivaz/fit-v2/commit/26310529dca2efc26d6f8a7a4069d3bc2d0c05c9))
* prevent form from being submitted with errors ([4a57c52](https://github.com/fivaz/fit-v2/commit/4a57c5206876cf31c77f7f3a3c83e7fb2e5cc08c))
* program exercises were checked on private using user's userId instead of the exercises one ([f0c1786](https://github.com/fivaz/fit-v2/commit/f0c1786e24fc0deeaeeb4ef45e652dfccfc0228d))

### 🧹 Chores

* change bucket url for the seed ([79f4e8c](https://github.com/fivaz/fit-v2/commit/79f4e8cd8ed74b11444e59e015956b2036c12757))
* check seed json ([6d71805](https://github.com/fivaz/fit-v2/commit/6d71805ff9254e55d11bffa3c30748d163b1c01b))
* remove localPath ([a191bfa](https://github.com/fivaz/fit-v2/commit/a191bfa567be1ad315036afe3e8e9b5463dc6002))
* update seed script ([18dee76](https://github.com/fivaz/fit-v2/commit/18dee76fd447c5ea670c9ac6306c277064af48de))

### 👷 Build System

* remove .idea files from repo ([a8f4711](https://github.com/fivaz/fit-v2/commit/a8f47111a41f587aebe27da14bf9d4eb3cadde5a))

## [1.14.0](https://github.com/fivaz/fit-v2/compare/v1.13.1...v1.14.0) (2026-01-18)

### ✨ Features

* add a page to show public exercises details ([2ae367f](https://github.com/fivaz/fit-v2/commit/2ae367f3444e4454fcf631c6a3c6a600cf315aa1))
* add all muscles button to filter in all cases ([3461e56](https://github.com/fivaz/fit-v2/commit/3461e5606bfa63d690543c2b9aab2b11f1d36c45))
* add button all muscle groups to filter ([bad2545](https://github.com/fivaz/fit-v2/commit/bad2545452356aa1d52fc2d015e1d50ca3518a3b))
* add infinite list in exercises page ([33f3719](https://github.com/fivaz/fit-v2/commit/33f37198fb3852d3cf6cf36507ee8db71c618b72))
* fetch exercises that don't have a userId too in exercises page ([392c89d](https://github.com/fivaz/fit-v2/commit/392c89d51dcc560fa113b8b00eb1adacc24c2873))
* implement fetch while searching exercises by name ([d6d0d33](https://github.com/fivaz/fit-v2/commit/d6d0d334564f5c474b0b59b08c0001b268995937))
* integrate filter component with optimistic list ([1f23d7a](https://github.com/fivaz/fit-v2/commit/1f23d7a6237073276c84490473b342f6a211e3ff))
* search indefinitely exercises in add exercise form ([b2468e0](https://github.com/fivaz/fit-v2/commit/b2468e0ab660533bf2e7ee15bef5e32f44de9e5b))
* show instructions in exercise details ([ec6fcfd](https://github.com/fivaz/fit-v2/commit/ec6fcfd9632c7efc4dc89f79d1050531ed864f1e))
* update design of exercise row ([c0f559a](https://github.com/fivaz/fit-v2/commit/c0f559a513d3c02ba5cbc86abf4b832acbe23773))

### 🐛 Bug Fixes

* sort not working in the first render ([0d5131d](https://github.com/fivaz/fit-v2/commit/0d5131df8e919706c77c2cf8d9e8118989efec50))

### 🧹 Chores

* add more fields to exercise table and seed ([a4e8546](https://github.com/fivaz/fit-v2/commit/a4e8546474badb263678db1d08df1053c7cd5549))
* add pagination to getExercises ([1aca367](https://github.com/fivaz/fit-v2/commit/1aca367d9cb097beca1ab9b1245027cdcfc7abf5))
* add unstable state tracking in use-store ([a39811b](https://github.com/fivaz/fit-v2/commit/a39811b4b5c57c7a7c79a43e545f22a511cd5a4f))
* allow exercises not to have a user ([d8b0751](https://github.com/fivaz/fit-v2/commit/d8b0751ad1fba55d757f447586ae3f60aefe9fd5))
* use localPath as fallback of imageUrl of exercises ([37ffd0c](https://github.com/fivaz/fit-v2/commit/37ffd0cd996f8436253be5a1814232c35e7e6eb0))

### 💄 Styles

* end each server action function with Action ([3a9270e](https://github.com/fivaz/fit-v2/commit/3a9270e10d66412b64b06107070e920097f4be82))
* rename optimistic store to optimistic manager ([1d9157d](https://github.com/fivaz/fit-v2/commit/1d9157dbc24a9ebe876e83af9b97cd5f70669e5f))

### 🔨 Code Refactoring

* remove generic extend from optimistic context ([fceebe9](https://github.com/fivaz/fit-v2/commit/fceebe9935a08b48648587974414fa8e6d5faf96))
* remove list ordering from use-optimistic-manager and let the view take care of it ([084a096](https://github.com/fivaz/fit-v2/commit/084a09621e8ddcdf07a8ef344c68f32bba150d87))
* replace legacy optimist mutation hook for all entities ([8124579](https://github.com/fivaz/fit-v2/commit/8124579d2707dbb7750e64b6a3408866c2910192))
* split program optimistic hook into 2 hooks ([8ad9cc0](https://github.com/fivaz/fit-v2/commit/8ad9cc06fc31214b0798df5eb236031ecc8a8755))
* use new optimistic hook in exercises ([63f765a](https://github.com/fivaz/fit-v2/commit/63f765ad2460b43e9abfc262eb1742c4cb65cdc4))

## [1.13.1](https://github.com/fivaz/fit-v2/compare/v1.13.0...v1.13.1) (2026-01-16)

### 👷 Build System

* remove conflicting cache directories from act ([17a1574](https://github.com/fivaz/fit-v2/commit/17a1574585279d0d0ccdb2cb329e36ee5b762b99))

### 🔧 Continuous Integration

* remove unnecessary cache from semantic release ([3481f32](https://github.com/fivaz/fit-v2/commit/3481f32914ef002db56c6d1be08694be519d2cc3))
* update design of releases ([089d612](https://github.com/fivaz/fit-v2/commit/089d6121eeebe7af633ed08e6c7b5b19b8c7c27a))

## [1.13.0](https://github.com/fivaz/fit-v2/compare/v1.12.0...v1.13.0) (2026-01-15)

### ✨ Features

* improve design of loading state for exercises page ([6c0777b](https://github.com/fivaz/fit-v2/commit/6c0777ba3b5247b3a237c56ae681101f243ca3cb))
* improve design of loading state for programs page ([deb7622](https://github.com/fivaz/fit-v2/commit/deb7622d9a6f884c050b4fe8614d5f9e28e4ce29))
* show the amount of exercises in exercise page ([e62bd4c](https://github.com/fivaz/fit-v2/commit/e62bd4c4eda31754225c340d7680c31a298e433f))
* update program exercises optimistically, and prevent start workout while it's pending ([400eb61](https://github.com/fivaz/fit-v2/commit/400eb61492b45a3fec4f851098ece0f7cff51f63))

### 💄 Style

* move exercise components related to a page, to inside the page ([5850fb6](https://github.com/fivaz/fit-v2/commit/5850fb6b66c7699e195c657028f64d4b696d6643))
* move program components related to a page, to inside the page ([a60b0bb](https://github.com/fivaz/fit-v2/commit/a60b0bba5407421fd1ba7808b39455c812ec9131))
* move program-form to inside program-form-button ([38e184c](https://github.com/fivaz/fit-v2/commit/38e184cce3864a400d94035914b2f25cf8b1d1d6))

### ♻️ Refactoring

* add small checks ([b5bc12a](https://github.com/fivaz/fit-v2/commit/b5bc12ae059a464aad642490d645ea56c4a346af))
* move start-workout to its own button ([9fdd3aa](https://github.com/fivaz/fit-v2/commit/9fdd3aab05f68447239c55205cd86373ed698903))
* use exercises in AddExerciseForm instead of a list of exercise ids ([f2bd011](https://github.com/fivaz/fit-v2/commit/f2bd011944285e5f0c4ed109f654fba0c72d1790))

### 🧹 Chores

* export pending state from use-optimistic-store ([2a6981e](https://github.com/fivaz/fit-v2/commit/2a6981e7c6370aa5bae684ae7a271e95003b2029))

## [1.12.0](https://github.com/fivaz/fit-v2/compare/v1.11.0...v1.12.0) (2026-01-14)

### ✨ Features

* add error handling for logout button ([180dfb6](https://github.com/fivaz/fit-v2/commit/180dfb61440d2183be94379c4c74ed96e313d5a9))
* add more space for the navigation buttons ([52ed6ce](https://github.com/fivaz/fit-v2/commit/52ed6ce42b8335f936d6258796bf53be6ef948b8))
* show mode toggle only for the demo user ([ccdfe98](https://github.com/fivaz/fit-v2/commit/ccdfe98d68b8480a726960d1b5aabcb35ef4c734))

### 🐛 Bug Fixes

* hydration mismatch ([8b0700a](https://github.com/fivaz/fit-v2/commit/8b0700a11a583ad385251ea21f24fa53e196b5cd))
* set body metrics date to midnight in UTC timezone ([4a906d2](https://github.com/fivaz/fit-v2/commit/4a906d24f95070818f743e2e24a40bc3f7e11eff))
* typo in onClose invocation ([f1f582f](https://github.com/fivaz/fit-v2/commit/f1f582f76832008272ffd16fba62d725187fbc6d))

### ♻️ Refactoring

* fix semantics of empty weight ([6c59679](https://github.com/fivaz/fit-v2/commit/6c596797f9068d44a1ee348c69982ef180340873))
* make weight nullable in db ([1c650de](https://github.com/fivaz/fit-v2/commit/1c650dedae90672491bfab31ba15b3dfe4a9b200))
* remove unnecessary lib ([db83082](https://github.com/fivaz/fit-v2/commit/db830822a19c0b4d70db267f66b935a899f039c5))

### 📝 Documentation

* add TODO ([43f5df8](https://github.com/fivaz/fit-v2/commit/43f5df8c175a08a939e922fa7ad06959b77e525e))
* update docs ([7de7d09](https://github.com/fivaz/fit-v2/commit/7de7d09d196d018b7c1a4f9b5e1f4a83930a0521))

## [1.11.0](https://github.com/fivaz/fit-v2/compare/v1.10.0...v1.11.0) (2026-01-14)

### ✨ Features

* add settings page with 3 theme modes options ([d20fa34](https://github.com/fivaz/fit-v2/commit/d20fa34baac3c416a4ad9c8b98c313cd9d9d4c4e))
* implement log out ([729138f](https://github.com/fivaz/fit-v2/commit/729138f4fd8efafa7b555ed1925c616c9e83757e))
* implement update body stats in settings ([d28e4c4](https://github.com/fivaz/fit-v2/commit/d28e4c4229c2030f7134bf8866a1f67dbe90a637))
* make settings-detail fetch current body metrics ([48295a6](https://github.com/fivaz/fit-v2/commit/48295a683b040d729691f6b9e446cb22816a1418))
* replace version hard coded with true value ([55bdb34](https://github.com/fivaz/fit-v2/commit/55bdb342f26802892575160d199a737b82142f42))
* separate user and metrics forms in settings ([0a025bf](https://github.com/fivaz/fit-v2/commit/0a025bf7c82b5fc13d287e2812efb6b19bcbb849))

### ♻️ Refactoring

* remove unnecessary imports ([0e53a8d](https://github.com/fivaz/fit-v2/commit/0e53a8db1eceb2c9d2970bd558c5309be7a0c7d0))

### 🧹 Chores

* add body metrics table ([9af6535](https://github.com/fivaz/fit-v2/commit/9af65354d1140f6e30abaa98725fa72f752794b3))
* add settings page ([4496cf0](https://github.com/fivaz/fit-v2/commit/4496cf077487eed32b44417eea2482d1a47163c4))
* log errors in use-optimistic-store, and allow optional update and delete ([db1c8fe](https://github.com/fivaz/fit-v2/commit/db1c8fe56042dd083965831295fc09c4f2ae4df9))
* modify user and body stats form ([afc4282](https://github.com/fivaz/fit-v2/commit/afc4282704079a5a4219560ead5e9031e53cccc2))
* remove any type ([5297800](https://github.com/fivaz/fit-v2/commit/529780075122f2fe6da34b7263df705714d4f0a7))
* rename body metrics table ([aa637f6](https://github.com/fivaz/fit-v2/commit/aa637f619910a899bbbac2de891a529bd49153e9))
* update files to test release locally ([e2178e5](https://github.com/fivaz/fit-v2/commit/e2178e57313c823848124a73e0f6b7ac38151e28))

## [1.10.0](https://github.com/fivaz/fit-v2/compare/v1.9.0...v1.10.0) (2026-01-14)

### ✨ Features

* add a redirect in home page back to the active workout ([526251c](https://github.com/fivaz/fit-v2/commit/526251cc5956167f0101651c2c55acddc504d13d))
* add a timer for workout ([47fe32d](https://github.com/fivaz/fit-v2/commit/47fe32de0d054460f9d115bb2f453c800690fbd5))
* add confirm prompts to delete set and end workout ([2a09b33](https://github.com/fivaz/fit-v2/commit/2a09b338b841055df67ee40cc28d41f1625b78fd))

## [1.9.0](https://github.com/fivaz/fit-v2/compare/v1.8.0...v1.9.0) (2026-01-14)

### ✨ Features

* implement workout page ([d270a51](https://github.com/fivaz/fit-v2/commit/d270a51a45016d84c8077112565ff6ee1f46d26d))

### ♻️ Refactoring

* replace hardcoded types with prisma generated types ([0c66add](https://github.com/fivaz/fit-v2/commit/0c66addea9bd4867c5dced55a88beff213f0c047))
* simplify conditional layout ([2971e35](https://github.com/fivaz/fit-v2/commit/2971e351a2112f25345d6685f99e5c890d81c3be))

### ⚡ Performance

* reduce the number of attributes sent from the db ([c107b4b](https://github.com/fivaz/fit-v2/commit/c107b4b4a6d822678702d1737c5d7f84d06d9c62))

### 🧹 Chores

* add functions to create and fetch workout ([738915d](https://github.com/fivaz/fit-v2/commit/738915d9821c1638686ee7d150a29f2a5af00786))
* add imageUrl to program ([56de60c](https://github.com/fivaz/fit-v2/commit/56de60c58e65e4fb5935c27d9f21211685edf042))
* add workout and related tables ([29d4cb1](https://github.com/fivaz/fit-v2/commit/29d4cb1dbe1b5ad9edda8f6c1f0a6947e9740a79))
* create design for workout page ([0482600](https://github.com/fivaz/fit-v2/commit/0482600cb085ac4afd48cc3410196b16f7a2d20f))

## [1.8.0](https://github.com/fivaz/fit-v2/compare/v1.7.0...v1.8.0) (2026-01-14)

### ✨ Features

* change primary color ([435335f](https://github.com/fivaz/fit-v2/commit/435335faaba8d583cda4b461d821d78284bd6ff3))
* rework layout ([58df88a](https://github.com/fivaz/fit-v2/commit/58df88a03ebd67b6d34bb4990ff6867afc49d8a4))
* update program page design ([8062d1c](https://github.com/fivaz/fit-v2/commit/8062d1c9a0b5966f65fb4904a2abfceb0905872c))
* update programs design ([cf73c9d](https://github.com/fivaz/fit-v2/commit/cf73c9d9b9650b2674aa7c5adac4005758ec68ca))
* upgrade program exercise row design ([44af27e](https://github.com/fivaz/fit-v2/commit/44af27ebd708dc1b34bbd79ee4b2ce17391af954))

### 🧹 Chores

* add design for exercises ([316af3b](https://github.com/fivaz/fit-v2/commit/316af3b5645bba9b6defad7249a60a48e8e3d007))
* add design for progress bar ([43ecc61](https://github.com/fivaz/fit-v2/commit/43ecc615541ab54fdcaefe5d7270a181aa1c153f))

## [1.7.0](https://github.com/fivaz/fit-v2/compare/v1.6.0...v1.7.0) (2026-01-14)

### ✨ Features

* add debounce to reorder items ([efde887](https://github.com/fivaz/fit-v2/commit/efde88763b6db6ff84e73ea20b3de2085642c471))
* implement add exercises to program ([b0cd1fb](https://github.com/fivaz/fit-v2/commit/b0cd1fb3bc6abb377c80c3521294842b5f764310))
* implement drag and drop for program's exercises ([95ef747](https://github.com/fivaz/fit-v2/commit/95ef7470fe36f010a073307631fcb85e42e57958))
* show exercises in program page ([fd89a7a](https://github.com/fivaz/fit-v2/commit/fd89a7a4d108114ef6f9d1a5fad940044e12ea8f))

### 🐛 Bug Fixes

* add exercise form was not closing on submit ([89bff27](https://github.com/fivaz/fit-v2/commit/89bff27043752103c65b5a85de063e487bfc5b45))

### ♻️ Refactoring

* modify table program to exercise relationship ([92430cb](https://github.com/fivaz/fit-v2/commit/92430cbfb66b92b4a0890c849730feac51736dc5))
* move sort programs to use useOptimisticStore ([a35a6c7](https://github.com/fivaz/fit-v2/commit/a35a6c7d8b021c9042d17472ec0529eca36cf8e9))

### 🧹 Chores

* add page of exercises in program page ([3a0d8df](https://github.com/fivaz/fit-v2/commit/3a0d8df6b8f4112cc0d0b53337444c1f55cb1c33))

## [1.6.0](https://github.com/fivaz/fit-v2/compare/v1.5.0...v1.6.0) (2026-01-14)

### ✨ Features

* implement create exercise ([217f1b6](https://github.com/fivaz/fit-v2/commit/217f1b69e6f398fe22fed43d59841779a65b63dc))
* implement exercise search and filtering ([34145a7](https://github.com/fivaz/fit-v2/commit/34145a7a07842dc3d63faef030485daf408c5172))
* implement update and delete exercise ([2bf1ac3](https://github.com/fivaz/fit-v2/commit/2bf1ac3f2526198e5a7214e43a74e27c6603808d))

### 🏗️ Build

* improve detection of out of sync pnpm-lock ([36fbcf8](https://github.com/fivaz/fit-v2/commit/36fbcf8d2cbf09be7cb6190859fb11c3a0285544))
* modify script to check the pnpm-lock after installing dependencies ([8616111](https://github.com/fivaz/fit-v2/commit/8616111e55ca9eaae6d234d0e45459ade723cef8))

### 🧹 Chores

* move exercise search and muscle filtering to client component ([2420f72](https://github.com/fivaz/fit-v2/commit/2420f7265586ba7df9c4ea2bfef3c9f5f773d644))
* wip - creat exercise components ([1b80878](https://github.com/fivaz/fit-v2/commit/1b80878b496b125b47dce5c2f3f06050e27928e5))

## [1.5.0](https://github.com/fivaz/fit-v2/compare/v1.4.0...v1.5.0) (2026-01-14)

### ✨ Features

* add delete program ([5cff15c](https://github.com/fivaz/fit-v2/commit/5cff15ccad8336d4330e2448172ede9dde411e91))
* add edit program ([fe61ec3](https://github.com/fivaz/fit-v2/commit/fe61ec3206385fbdd6346aec3df3604868f6058f))
* add images for each muscle in program form ([cb22991](https://github.com/fivaz/fit-v2/commit/cb22991f89fdf45498914568dedfe0e09af33dc4))
* return user to programs page after deleting the current program ([5417157](https://github.com/fivaz/fit-v2/commit/54171578d8512c7de6bd411955cad75a34091749))

### 🐛 Bug Fixes

* assets were not appearing ([28085f5](https://github.com/fivaz/fit-v2/commit/28085f5ce8cde579e8b50ce7731a6447725f85ec))

### ♻️ Refactoring

* move hooks, context and provider entangled to specific folders ([710ad5d](https://github.com/fivaz/fit-v2/commit/710ad5def01d6f9dd53f802c9ee71926729f9fc5))
* simplify hook create-optimistic-list ([cdda70a](https://github.com/fivaz/fit-v2/commit/cdda70af6d544cd70092b1ee7b6f73a21a23ded2))
* simplify program add using optimistic store hook ([30229b6](https://github.com/fivaz/fit-v2/commit/30229b6b29efe2cd0c2512e9024beb3a43283294))
* simplify program update and delete using optimistic store hook ([a980b23](https://github.com/fivaz/fit-v2/commit/a980b238de4ba9b03e5ca016ee150450665ed4a7))
* simplify types of use optimistic list ([b61edbe](https://github.com/fivaz/fit-v2/commit/b61edbe80ea63b29c3351d6124745a4b722a791a))

### 🏗️ Build

* sync pnpm-lock ([42564db](https://github.com/fivaz/fit-v2/commit/42564db1d53dd988414f2650b553acef907502f9))

### 🧹 Chores

* centralize logging ([0127a2c](https://github.com/fivaz/fit-v2/commit/0127a2c8cb7a39d099fa480c6af0e59c4a861e6d))
* wip - add optimistic-store ([b4cbff7](https://github.com/fivaz/fit-v2/commit/b4cbff765e6eaa489792826b60cc354ed1b745ab))

## [1.4.0](https://github.com/fivaz/fit-v2/compare/v1.3.0...v1.4.0) (2026-01-14)

### ✨ Features

* add exercise page ([385213f](https://github.com/fivaz/fit-v2/commit/385213f0285738db14b781e7fece7daa36820346))
* add icons for pwa ([be2cc89](https://github.com/fivaz/fit-v2/commit/be2cc8943fd22ee8b1e0bcf325ef493a4217d4e8))
* add program page ([a68eb05](https://github.com/fivaz/fit-v2/commit/a68eb05be28276405a128a005a28586ace22134c))
* recreate design for programs list ([2ec4e28](https://github.com/fivaz/fit-v2/commit/2ec4e286d4f43333145b147cfd80e6b71ba38beb))

## [1.3.0](https://github.com/fivaz/fit-v2/compare/v1.2.0...v1.3.0) (2026-01-14)

### ✨ Features

* implement sort programs ([cd64da2](https://github.com/fivaz/fit-v2/commit/cd64da293392f76bdce7d83e607039da1cc98539))

### 🏗️ Build

* sync pnpm-lock before push ([6a38164](https://github.com/fivaz/fit-v2/commit/6a381642778b8752846704b4e4136545003b37de))
* try to build app locally before pushing it ([290d789](https://github.com/fivaz/fit-v2/commit/290d7896f170fd30abad4dc91b9b906f1cb46d9c))

### 🧹 Chores

* add seed ([e9e25f2](https://github.com/fivaz/fit-v2/commit/e9e25f26de81d0936320008b7505404c641f16bc))

## [1.2.0](https://github.com/fivaz/fit-v2/compare/v1.1.0...v1.2.0) (2026-01-14)

### ✨ Features

* implement add program ([c2cffaa](https://github.com/fivaz/fit-v2/commit/c2cffaa4070bcafbb97f2803e758d123d0135f59))

### ♻️ Refactoring

* run prettier ([afc07b1](https://github.com/fivaz/fit-v2/commit/afc07b1c97806f3bd43ce0ac65b6eaa053a79d86))

### 👷 CI

* fix ci by updating pnpm-lock ([6168813](https://github.com/fivaz/fit-v2/commit/6168813608f9e9d8b8ba441fd9a83431ad16ceb9))

### 🧹 Chores

* add muscles images to program form ([91cdb04](https://github.com/fivaz/fit-v2/commit/91cdb04a9037092a7d04e065a213e4b501fd4931))
* add optimistic list, program table and fetch programs ([822d2c7](https://github.com/fivaz/fit-v2/commit/822d2c7cdfd004ba24ed1161d4282b6b55ca0ef2))
* add program form ([90fb10f](https://github.com/fivaz/fit-v2/commit/90fb10f93f1dcd1c2b22a3d0bdc9c7481052d2d5))

## [1.1.0](https://github.com/fivaz/fit-v2/compare/v1.0.0...v1.1.0) (2026-01-14)

### ✨ Features

* add complete authentication ([a5e883b](https://github.com/fivaz/fit-v2/commit/a5e883b0de57ef1bdf23bd1bf87fbfba4eb7a74f))

### 🧹 Chores

* add dashboard navigation ([44ee226](https://github.com/fivaz/fit-v2/commit/44ee2262118d604afb7bc1addc8fcfcf95724c13))
* add prisma and better auth ([b458f27](https://github.com/fivaz/fit-v2/commit/b458f2768716379b85ce37de19e45acf706e9039))
* add shadcn with theme ([46001b7](https://github.com/fivaz/fit-v2/commit/46001b737efc6fcbcfff9410ec3517ed27f3e1ed))
* add theme provider, confirm-dialog and mode-toggle ([99e8e51](https://github.com/fivaz/fit-v2/commit/99e8e51c7a0beb4a5ceda44c7c2657c9c2502193))

## 1.0.0 (2026-01-14)

### 🏗️ Build

* add conventional commit and semantic release ([5228b38](https://github.com/fivaz/fit-v2/commit/5228b38cacd31fb55ed08c5f924f3dac585d4ca8))
* add prettier and eslint libs ([03df006](https://github.com/fivaz/fit-v2/commit/03df006cfc1815f71e4a74c4ff34c79242251bbc))

### 👷 CI

* add more commits to generate releases ([55853e8](https://github.com/fivaz/fit-v2/commit/55853e839787a639405a2b19c1b1b8207c426017))
* change release branch ([c687ff2](https://github.com/fivaz/fit-v2/commit/c687ff202efb578fce4537a3da7d3fe53e3d5654))

### 🧹 Chores

* add .ide files ([d1d0345](https://github.com/fivaz/fit-v2/commit/d1d034551f0e3c60f050e6b73f3888ad9708e2f4))
* update files to test release locally ([57e3fbc](https://github.com/fivaz/fit-v2/commit/57e3fbc28623bc36a5de4cde2953a8c7d89f6999))
