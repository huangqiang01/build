var gulp = require("gulp"),
	less = require("gulp-less"),
	// 压缩css
	minifyCss = require("gulp-minify-css"),
	// sourcemaps 
	sourcemaps = require("gulp-sourcemaps"),
	//当发生异常时提示错误 确保本地安装gulp-notify和gulp-plumber
    notify = require("gulp-notify"), // 输出错误
    plumber = require("gulp-plumber"), // 不终止，继续编译
    //压缩js
    uglify = require("gulp-uglify"),
    // html 文件处理
    htmlmin = require("gulp-htmlmin"),
    // 自动添加css前缀
    autoprefixer = require("gulp-autoprefixer"),
    //清理目录
    clean = require("gulp-clean"),
    
    replace = require("gulp-replace");
    
    // 获取命令参数 npm install --save yargs
var argv = require('yargs').argv,
	setting = require("./setting.json"),
	// 构建环境
	env = argv.d,
	// 环境地址
	_ENV = env === "pro" ? setting._URL_._PRO_ : setting._URL_._DVE_;
	

/**************全局配置参数*************************/
var minHtmlOption = {
	removeComments: true, //清除HTML注释
    collapseWhitespace: true, //压缩HTML
    collapseBooleanAttributes: false, //省略布尔属性的值 <input checked="true"/> ==> <input />
    removeEmptyAttributes: true, //删除所有空格作属性值 <input id="" /> ==> <input />
    removeScriptTypeAttributes: false, //删除<script>的type="text/javascript"
    removeStyleLinkTypeAttributes: false, //删除<style>和<link>的type="text/css"
    minifyJS: false,// 压缩页面JS
    minifyCSS: false// 压缩页面CSS
}

// 处理文件的路径
var filePath = {
	img: "src/img/**/*",
	js: ["src/js/**/*.js", "!src/js/libs/*.js"],
	jsLibs: "src/js/libs/**/*",
	less: "src/less/**/*.less",
	html: "src/**/*.html"
}

/**
 * 清除dist文件
 */
function cleanFile(){
	gulp.src("dist/", {read: false})
		.pipe(clean({force: true}));
}
gulp.task("clean", function(){
	cleanFile();
});

/**
 * 拷贝图片
 */
function imgCopy(){
	gulp.src(filePath.img)
    	.pipe(gulp.dest("dist/img/"));
}
gulp.task("imgcopy", function () {//图片拷贝
    imgCopy();
});

/**
 * js文件压缩
 */
function buildJs(){
	gulp.src(filePath.js)
    	// 输出编译时的错误
		.pipe(plumber({libsCopyerrorHandler: notify.onError("Error: <%= error.message %>")}))
		// 按照对应的环境，替换不同的接口路径
		.pipe(replace("_ENV", _ENV))
		.pipe(sourcemaps.init())
        .pipe(uglify({
        	// mangle: true, // 类型：Boolean 默认：true 是否修改变量名
            mangle: {except: ["require", "exports", "module", "$"]} // 排除混淆关键字
        }))
        .pipe(sourcemaps.write("../maps/js/"))
        .pipe(gulp.dest("dist/js/"));
}

gulp.task("js", function () {
    buildJs();
});

/**
 * 复制libs 文件
 */
function libsCopy(){
	gulp.src(filePath.jsLibs)
		.pipe(gulp.dest("dist/js/libs/"));
}

gulp.task("libscopy", function(){
	libsCopy();
});

/**
 * 编译less 并压缩css
 */
function buildLess(){
	gulp.src(filePath.less)
		// 输出编译时的错误
		.pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
		.pipe(sourcemaps.init())
		.pipe(less())
		// 根据设置浏览器版本自动处理浏览器前缀
		.pipe(autoprefixer({
//			browsers: ["last 2 versions", "Android >= 4.0"]
			browsers: "Android >= 4.0"
		}))
		.pipe(minifyCss()) // 兼容IE7及以下需设置compatibility属性 .pipe(minifyCss({compatibility: 'ie7'}))
		.pipe(sourcemaps.write("../maps/css/"))
		.pipe(gulp.dest("dist/css"));
}

gulp.task("less", function(){
	buildLess();
});

/**
 * 压缩html
 */
function buildHtml(){
	gulp.src(filePath.html)
		.pipe(htmlmin(minHtmlOption))
		.pipe(gulp.dest("dist/"));
}
gulp.task("html", function(){
	buildHtml();
});

/**
 * 启动监听任务
 */
gulp.task("start", function(){
	var watcherLess = gulp.watch(filePath.less, ["less"]);
	var watcherJs = gulp.watch(filePath.js, ["js"]);
	var watcherJsLibs = gulp.watch(filePath.jsLibs, ["libscopy"]);
	var watcherHtml = gulp.watch(filePath.html, ["html"]);
	var watcherImg = gulp.watch(filePath.img, ["imgcopy"]);
	watcherLess.on("change", function(event){
		delFile(event, "css");
	});
	watcherJs.on("change", function(event){
		delFile(event);
	});
	watcherJsLibs.on("change", function(event){
		delFile(event);
	});
	watcherHtml.on("change", function(event){
		delFile(event);
	});
	watcherImg.on("change", function(event){
		delFile(event);
	});
});

/**
 * 重置
 */
gulp.task("reset", function(){
	console.log("******************* TIPS: Need to clean before the reset **************");
	buildJs();
	buildLess();
	buildHtml();
	imgCopy();
	libsCopy();
});

/**
 * 删除delete 的文件
 * @param {Object} event
 */
function delFile(event, mark){
	if (event.type === "deleted"){
		var path = event.path,
			_filePath = path.replace("\\src\\", "\\dist\\"),
			filePath = mark ? _filePath.replace(/less/g, "css") : _filePath;
		gulp.src(filePath, {read: false}).pipe(clean({force: true}));
	}
}




