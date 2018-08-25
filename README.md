# Critical CSS example (using PostCSS Critical Split)
This is a basic example to show how I set up my critical CSS and how I use the `postcss-critical-spit` plugin (located at https://www.npmjs.com/package/postcss-critical-split).

## Install
* Clone the repository
* Open a Terminal window in the main project folder
* run `npm install`

## Usage

### Cleaning the build
* run `gulp clean` to empty the build directory. This comes in handy when trying the seperate setups

### PostCSS-only example
* run `gulp css:sass` first (this is to generate the input CSS file)
* run `node postcss.js` to run the Node task that runs the direct PostCSS task without Gulp.

### Gulp example
* Run `npm run gulp` to generate the files and run a local server with development setup
* Run 'gulp --release' to generate the files and run a local server with release (aka critically-rendered) assets
* Check out the `Gulpfile` and the `main-critical.css` file in the `build/css` folder to see what happens

### Webpack example
* Run `npm run webpack` to generate the files
* There is no fully embedded CSS in the HTML file now but that shouldn't stop you :)
* Check out the `webpack.config.file` to see how the multiple CSS files are generated in a single go! Thanks to [Vladimir Kuznetsov](https://github.com/mistakster) for helping out!


