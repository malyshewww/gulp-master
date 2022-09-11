// СТРУКТУРА ПРОЕКТА:
// Исходники : "./app/" :
/*
  - "./app/pug/" - папка pug файлов блоков и страниц
  - "./app/scss/" - папка scss файлов
  - "./app/fonts/" - папка fonts файлов проекта
  - "./app/images/" - папка неоптимизированных изображений
  - "./app/scripts/" - папка скриптов
*/
// Продакшен: "./dist/"
/*	
  - "./dist/" - корень сайта с html и папками
  - "./dist/fonts/" - папка шрифтов файлов проекта
  - "./dist/styles/" - папка с минифицированными стилями
  - "./dist/scripts/" - папка минифицированных скриптов
  - "./dist/images/" - папка оптимизированных изображений
*/

import pkg from 'gulp'
const { gulp, src, dest, parallel, series, watch: gulpWatch } = pkg

import browserSync from 'browser-sync'
import bssi from 'browsersync-ssi'
import pug from 'gulp-pug'
import webpackStream from 'webpack-stream'
import webpack from 'webpack'
import named from 'vinyl-named'
import TerserPlugin from 'terser-webpack-plugin'
import gulpSass from 'gulp-sass'
import dartSass from 'sass'
import sassglob from 'gulp-sass-glob'
const sass = gulpSass(dartSass)
import postCss from 'gulp-postcss'
import cssnano from 'cssnano'
import autoprefixer from 'autoprefixer' // Добавление вендорных префиксов
import imagemin, { gifsicle, mozjpeg, optipng, svgo } from 'gulp-imagemin'
import changed from 'gulp-changed'
import concat from 'gulp-concat'
import del from 'del'
import versionNumber from "gulp-version-number"; // Обновление версии css и js файлов
import rename from 'gulp-rename'; // Переименование файла
import groupCssMediaQueries from 'gulp-group-css-media-queries'; // Групировка медиа запросов
import svgSprite from "gulp-svg-sprite"; // SVG sprite
import newer from "gulp-newer"; // Проверка обновления изображений
import plumber from "gulp-plumber"; // Обработка ошибок
import notify from "gulp-notify"; // Сообщения (подсказки)
import sourcemaps from "gulp-sourcemaps"; // Карта файлов
import ifPlugin from "gulp-if"; // Условное ветвление

const buildFolder = `./dist`; // Также можно использовать rootFolder
const srcFolder = `./app`;

// Раскомментировать, если нужна верстка под MODX
const pathCurrent = process.cwd();
const pathModx = `${pathCurrent}.local/`;
const pathModxTemplate = `${pathModx}assets/template/`;

function browsersync() {
  browserSync.init({
    server: {
      baseDir: `${buildFolder}`,
      middleware: bssi({ baseDir: `${buildFolder}`, ext: '.html' })
    },
    // ghostMode: { clicks: false },
    notify: false,
    online: true,
    // tunnel: 'yousutename', // Attempt to use the URL https://yousutename.loca.lt
    ghostMode: false,

    // Для подключения к проекту на OpenServer
    // proxy: "project.local",
    // open: "external",
  })
}

function buildPug() {
  return src([`${srcFolder}/pug/*.pug`, `!${srcFolder}/pug/layout.pug`, `!${srcFolder}/pug/variables.pug`])
    .pipe(plumber(
      notify.onError({
        title: "PUG",
        message: "Error: <%= error.message %>"
      }))
    )
    .pipe(newer(`${buildFolder}`))
    .pipe(pug({
      // Cжатие HTML файла
      pretty: true,
      // Показывать в терминале какой файл обработан
      verbose: true
    }))
    .pipe(
      versionNumber({
        'value': '%DT%',
        'append': {
          'key': '_v',
          'cover': 0,
          'to': [
            'css',
            'js',
          ]
        },
        'output': {
          'file': 'version.json'
        }
      })
    )
    .pipe(dest(`${buildFolder}`))
    // Раскомментировать, если нужно добавлять в папку assets/template
    // .pipe(dest(pathModxTemplate))
    .pipe(browserSync.stream())
}

function styles() {
  return src([`${srcFolder}/scss/**/main.scss`], { sourcemaps: true })
    .pipe(plumber(
      notify.onError({
        title: "SCSS",
        message: "Error: <%= error.message %>"
      })))
    .pipe(sassglob())
    .pipe(sass({
      'include css': true,
      outputStyle: 'expanded'
    }))
    .pipe(groupCssMediaQueries())
    .pipe(postCss([
      autoprefixer({
        grid: true,
        overrideBrowserslist: ['last 3 versions'],
        cascade: false
      }),
    ]))
    // Раскомментировать, если нужен неминифицированный файл стилей
    .pipe(dest(`${buildFolder}/styles/`))
    // Раскомментировать, если нужно добавлять в папку assets/template
    // .pipe(dest(`${pathModxTemplate}styles/`))
    .pipe(postCss([
      cssnano({ preset: ['default', { discardComments: { removeAll: true } }] })
    ]))
    .pipe(concat('main.min.css'))
    .pipe(dest(`${buildFolder}/styles/`))
    // Раскомментировать, если нужно добавлять в папку assets/template
    // .pipe(dest(`${pathModxTemplate}styles/`))
    .pipe(browserSync.stream())
}

function scripts() {
  return src([`${srcFolder}/scripts/*.js`])
    .pipe(plumber(
      notify.onError({
        title: "JS",
        message: "Error: <%= error.message %>"
      })))
    .pipe(named())
    .pipe(webpackStream({
      mode: 'production',
      performance: { hints: false },
      // plugins: [
      //   new webpack.ProvidePlugin({ $: 'jquery', jQuery: 'jquery', 'window.jQuery': 'jquery' }), // jQuery (npm i jquery)
      // ],
      module: {
        rules: [
          {
            test: /\.m?js$/,
            exclude: /(node_modules)/,
            use: {
              loader: 'babel-loader',
              options: {
                presets: ['@babel/preset-env'],
                plugins: ['babel-plugin-root-import']
              }
            }
          }
        ]
      },
      optimization: {
        minimize: true,
        minimizer: [
          new TerserPlugin({
            terserOptions: { format: { comments: false } },
            extractComments: false
          })
        ],

      },
      output: {
        filename: '[name].min.js',
      },
    }, webpack)).on('error', (err) => {
      this.emit('end')
    })
    // .pipe(concat('main.min.js'))
    .pipe(dest(`${buildFolder}/scripts/`))
    // Раскомментировать, если нужно добавлять в папку assets/template
    // .pipe(dest(`${pathModxTemplate}scripts/`))
    .pipe(browserSync.stream())
}

function images() {
  return src(`${srcFolder}/images/**/*.{jpg,jpeg,png,gif,svg,webp,ico}`)
    .pipe(plumber(
      notify.onError({
        title: "IMAGES",
        message: "Error: <%= error.message %>"
      })))
    .pipe(newer(`${buildFolder}/images/**/*`))
    // .pipe(changed(`${buildFolder}/images/`))
    .pipe(imagemin([
      gifsicle({ interlaced: true }),
      mozjpeg({
        progressive: true,
        quality: 80
      }),
      optipng({ optimizationLevel: 3 }),
      svgo({
        plugins: [
          {
            name: 'removeViewBox',
            active: false
          },
          {
            name: 'cleanupIDs',
            active: false
          }
        ]
      })
    ], {
      verbose: true
    }))
    .pipe(dest(`${buildFolder}/images/`))
    // Раскомментировать, если нужно добавлять в папку assets/template
    // .pipe(dest(`${pathModxTemplate}images/`))
    .pipe(browserSync.stream())
}

function fonts() {
  return src([`${srcFolder}/fonts/*.*`])
    .pipe(plumber(
      notify.onError({
        title: "FONTS",
        message: "Error: <%= error.message %>"
      })))
    .pipe(dest(`${buildFolder}/fonts/`))
    // Раскомментировать, если нужно добавлять в папку assets/template
    // .pipe(dest(`${pathModxTemplate}fonts/`))
    .pipe(browserSync.stream())
}

function sprite() {
  return src([`${srcFolder}/svgicons/*.svg`])
    .pipe(plumber(
      notify.onError({
        title: "SVG",
        message: "Error: <%= error.message %>"
      })))
    .pipe(svgSprite({
      mode: {
        symbol: {
          sprite: '../icons/icons.svg',
          // example: true
        }
      },
      shape: {
        id: {
          separator: '',
          generator: 'svg-'
        },
        transform: [
          {
            svgo: {
              plugins: [
                { removeXMLNS: true },
                { convertPathData: false },
                { removeViewBox: false },
              ]
            }
          }
        ]
      },
      svg: {
        rootAttributes: {
          style: 'display: none;',
          'aria-hidden': true
        },
        xmlDeclaration: false
      }
    }))
    .pipe(dest(`${buildFolder}/images/`))
    // Раскомментировать, если нужно добавлять в папку assets/template
    // .pipe(dest(`${pathModxTemplate}images/`))
    .pipe(browserSync.stream())
  // .pipe(dest(`${srcFolder}/images/`))
}

async function cleandist() {
  del([`${buildFolder}/**/*`], { force: true })
}

function startwatch() {
  gulpWatch([`${srcFolder}/pug/**/*.pug`], { usePolling: true }, buildPug)
  gulpWatch([`${srcFolder}/scss/**/*.scss`], { usePolling: true }, styles)
  gulpWatch([`${srcFolder}/scripts/**/*.js`], { usePolling: true }, scripts)
  gulpWatch([`${srcFolder}/images/**/*.{jpg,jpeg,png,svg,gif,ico,webp}`], { usePolling: true }, images)
  gulpWatch([`${srcFolder}/fonts/**/*`], { usePolling: true }, fonts)
  gulpWatch([`${buildFolder}/**/*.*`], { usePolling: true }).on('change', browserSync.reload)
}

const build = series(cleandist, parallel(images, scripts, buildPug, styles, sprite, fonts))
const watch = series(parallel(images, scripts, buildPug, styles, fonts, sprite), parallel(browsersync, startwatch))


export { build, watch }
export default watch;