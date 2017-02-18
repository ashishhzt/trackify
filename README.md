# TalentTrack

Complete Talent tracking tool

>Warning: Make sure you're using the latest version of Node.js and NPM

### Quick start

```bash
# clone our repo
$ git clone https://github.com/rpali78/trackify.git

# change directory to your app
$ cd my-app

# install the dependencies with npm
$ npm install

# Build the application
$ gulp webpack

# To serve your application
$ npm start
```

>Warning: Follow camel case for naming your components and routes

### Create new components and router via templates

```
Create new components (By default all components are created in components under client/app folder). If you want to create your component under specific
folder then use the --parent parameter. (gulp component --name your-component --parent parent-folder-name). 

If you create a component with a name that exists before, it will overwrite it.

$ gulp component --name your-component 

Add the component to component js file

# create new routes (By default all routes are created in server/api folder)
$ gulp router --name your-router

Finally add your router to api js file

```

Go to [http://localhost:9000](http://localhost:9000) in your browser.
