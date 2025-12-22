# BaP Framework - v1.2.0
The idea is not to use any framework (JS, CSS, or whatever), just HTML, CSS, and Vanilla Javascript. The main concept is to test new ideas quickly and easily. It is not intended to be a full-featured framework, but a tool to help you develop your ideas. However, it is a robust and scalable framework that can be used to develop simple applications and perform even in production environments.

## Support 
This framework is developed to be supported by Google Firebase. 
- Hosting: Firebase Hosting
- Database: Firebase Realtime Database
- Analytics: Firebase Analytics
- Auth: Firebase Auth
- Recaptcha: Firebase AppCheck / Google cloud reCAPTCHA

You must to create a Firebase project and configure these values in the `src/_main/constants.js` file, and set de `CONSTANT.FIREBASE_AVAILABLE` with `true` value

## File structure
```
  |-cdn
  |-public
  |-src
  |  |-style
  |  |-_components
  |  |  |-bap-chip
  |  |  |-bap-spinner
  |  |  |-bap-header
  |  |  |-bap-svg-image
  |  |  |-bap-loading-state
  |  |  |-bap-notification
  |  |  |-bap-footer
  |  |-_main
  |  |  |-i18n
  |  |-assets
  |  |  |-favicon
  |  |-wip-page
  |-pages
```
### Main folders and files
- `cdn`: Parallel hosting in the same firebase project to host the static files.
- `public`: Files and folders to deploy
- `src`: Main code
    - `_components`: Javascript custom components. One folder by component.
        - `bap-header`: Simple header to use in every page.
        - `bap-footer`: Simple footer to use in every page.
        - `bap-chip`: Clasic chip.
        - `bap-loading-state`: Loading state.
        - `bap-notification`: custom BaP notification (Toast and Snackbar).
        - `bap-spinner`: Simple spinner.
        - `bap-svg-image`: Custom component to display SVG images.
        - `customComponentsRegistration.js`: Function to register custom components.
    - `_main`: Main files for setting up the app
        - `i18n`: Internationalization. One file by language.
        - `analytics.js`: Analytics events
        - `auth.js`: Authentication
        - `constants.js`: Constants, including Firebase config, recaptcha, environment, and other ones.
        - `firebaseInit.js`: Firebase initialization and custom wrappers.
        - `i18n.js`: Internationalization.
        - `router.js`: Routing.
        - `routerPaths.js`: Routing paths.
        - `storage.js`: Storage (LocalStorage, SessionStorage, Firebase Realtime Database).
        - `util.js`: Utility functions (generateUUID, setStringIntoBoolean, isCSSIncluded, isMobile).
    - `assets`: Assets
    - `pages`: One folder by page 
    - `style`: Frameworks styles
        - `colors.css`: Colors considering light and dark mode.
        - `forms.css`: Forms styles.
        - `main.css`: Main styles.
        - `titles.css`: Titles styles.
    - `wip-page`: Work in progress page to use in the middle of replacing a page.

## Styles
Just CSS - No other frameworks.

### Breakpoints
- +1200px: Desktop
- +900px: Tablet or Laptop

## Develop and Deploy
This framework use GULP to optimize the code and generate the `public` folder with the optimized code before to deploy in QA or Production.

0. `npm run server`: To start the local server with livereload and hotreload.
1. `npm run optimize`: Mandatory to optimize the code and generate the `public` folder with the optimized code before to deploy in QA or Production.
2. `npm run deploy-qa`: to deploy the app in the QA environment (Remember to change the constants values for this environment).
3. `npm run deploy-prod`: to deploy the app in the production environment (Remember to change the constants values for this environment).