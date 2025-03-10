# Custom Code Injector
> Custom Code Injector Chrome Extension

[![Build Status](https://github.com/CharltonC/chrome-custom-code-injector/actions/workflows/main.yml/badge.svg)](https://github.com/CharltonC/chrome-custom-code-injector/actions/workflows/main.yml)
[![Coverage Status](https://coveralls.io/repos/github/CharltonC/chrome-custom-code-injector/badge.svg?branch=master)](https://coveralls.io/github/CharltonC/chrome-custom-code-injector?branch=master)

#### Table of Contents:
* About
* Setup (Mac based) 
* CLI Command
* Folder Structure

---

## About
Primary Tech Stack: 
* SCSS (CSS)
* JADE (HTML)
* TypeScript 3.8.3
* Node 13.12.0 | Npm 6.14.4
* React 16.13.1
* Jest (Unit Testing)


## Setup (Mac based) 
#### VisualStudio Code Editor (if any)
* Go to Menu: `Preference > Settings`, in your user settings, make sure the settings has the following set: 
```javascript
{
    ...
    "typescript.tsdk": "node_modules/typescript/lib",
    "files.trimTrailingWhitespace": true,
    "[markdown]": {
        "files.trimTrailingWhitespace": false
    }        
}
```


## CLI Command
* Generate Compnents (dev):
```
npm run cmp-[s|b|g|w|c|v]
```

* Start a Server to View All UI Components (dev):
```
npm run sb
```

* Build
```
npm run build[:dev]?
``` 

* Unit Test Typescript:
```
npm run test
```    


## Folder Structure
    .storybook/                 // setting for Storybook (doc generation tool)
        base.story.tsx          // hack for importing the common css file
        main.js                 // webpack config to be merged with storybook's default config
        preview-head.html       // content to be included in the UI component index page's <head> tag (used for loading css)

    .vscode/                    // vscode editor setting (contains unit test debug settings)

    dist/                       // output files
        build/                  // unzipped files used for test
            asset/              // common assets for different pages
            option/             // option page
            popup/              // popup page
            bg/                 // background script (service worker)
            manifest.json       // copy of `src/manifest.json`
        <name>.zip              // zipped file for uploading to chrome store

    doc/                        // Documentation
        chrome-store/           // for chrome web store
        design/                 // wireframe, ui design files, notes and diagram (on separate repo)
        user-guide/             // tutorial/how-to  (separate repo)
        test-report/            // unit test report
        ui-component/           // output for doc generated by storybook (if any)
        TODO.md                 // todo list in general
        
    node_modules/               // dev dependencies

    gulp/                       // gulp plugin config
        <category-name>/
            config.js           // task config
            task.js             // task logic

    schematic/                  // based template files used for generating different types of component

    src/                        // source code
        asset/                  // common/shared assets
            font/
            icon/
            img/                
            ts/ 
                type/           // typings
                test-util/      // Unit Test Utility/Helper Module for simplifying testing                
            scss/    
                mixin/          // scss reusable extendables and mixins
                var/            // scss variables
                vendor/         // css generated by or from vendor/site

        component/              // various categories of components (presentation only)
            base/               // presentation component
            group/              // presentation component group
            widget/             // presentation composition components (i.e. complex/full functionalities)
            structural/         // structural wrapper component only
            static/             // static component (fixed html)
            view/               // view (for used with router)
            app/                // app root (i.e. multiple apps)

        constant/               // immutatable object or literal value
            <name>/

        handle/                 // generic class/modular services/handle
            <handle-name>/      // `app-state/<handler-name>/` is state handler for specific group such as modal, view
                index.ts
                index.spec.ts
                type.ts

        mock/                   // mocked data or function that generates mock data, e.g. state, json
            <mock-group>/
                index.ts
                
        model/                  // model class for data, root state, partial state etc
            <model-name>/       
                index.ts
                index.spec.ts
                type.ts
        
        page/
            <page-name>/        // bg-script (background script), ct-script (context script), option page, popup page
                main.ts         // if the page doesnt just run a script (e.g. background script)
                main.spec.ts?   // test file
                index.pug?      // index page (if the pages doesn't just run a script)
                style.scss?     // style for index page                

        manifest.json           // manifest ("config") for the chrome extension 

    .eslintrc.json              // Typescript/js linting config
    tsconfig.json               // TypeScript config 
    typedoc.json                // TypeScript documentation config
    babel.config.js             // Babel config - transform TS and new Js features into ES5/Standard JavaScript
    jest.config.js              // Jest config - unit test
    webpack.config.js           // webpack config file for bundling typescript

    gulpfile.js                 // build task registrations, corresp. to `gulp` folder   
    package.json                // dev-dependencies, dependencies for the project    
    .gitignore                  // git ignored (source control)
    README.md                   // entry readme file


