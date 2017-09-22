"use strict";
import gulp from "gulp";
import browserify from "browserify";
import rename from "gulp-rename";
import source from "vinyl-source-stream";
import uglify from "gulp-uglify";
import pump from "pump";
import dest from "gulp-dest";
import del from "del";

gulp.task("clean", () => {
  return del("build/*");
});


gulp.task("compile", () => {
  return browserify("src/main.js")
    .transform("babelify")
    .bundle()
    .pipe(source("async-request.js"))
    .pipe(gulp.dest("dist"))
});


gulp.task("minify", () => {
  pump([
    gulp.src("dist/async-request.js"),
    uglify(), 
    rename({
      dirname: "dist/",
      basename: "async-request.min",
      extname: ".js"
    }),
    gulp.dest(".")
  ]);
});


gulp.task("default", ["clean"], () => {
  gulp.start(["compile", "minify"]);
});
