// const graphile = require('./postgraphql')

var exp               = require('express');
var app               = exp();
var chatapp           = require('http').createServer(app);
var io                = require('socket.io')(chatapp, {
  cors: {
    origin: '*',
  }
});
var jwt               = require('jsonwebtoken');
var cors              = require('cors');
var pars              = require('body-parser');
var mysql             = require('mysql');
var bcrypt            = require('bcrypt');
var compress_images   = require('compress-images');
var multer            = require('multer');
var sharp             = require('sharp');
var fs                = require('fs');
var uniqid            = require('uniqid');
var async             = require('async');
var accessTokenSecret = '_stars@secret_4520_SPLASHYTOKEN';
var format            = require('pg-format');
const slugify         = require('slugify');

const SnowflakeId = require('snowflake-id').default;
// Initialize snowflake
var snowflake = new SnowflakeId({
  mid : 42,
  offset: new Date("2020-01-01").getTime()
});

// var Snowflake = require('nodejs-snowflake');
// const generateSnowflakeId = (machineId = null) => {
//   const config = {
//     instance_id: machineId,
//     custom_epoch: new Date("2001-01-01").getTime(),
//   };
//   const uid = new Snowflake(config);
//   const snowflakeId = uid.getUniqueID();
//   return snowflakeId;
// };


var Pool = require('pg').Pool
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'mageus',
  password: '8888',
  port: 5433,
})

app.use(exp.json())
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "*" );
  res.setHeader("Access-Control-Allow-Headers", "*");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

app.use(cors())
// Body parsers
app.use(exp.json({ limit: '9000mb', extended: true }));
app.use(exp.urlencoded({ limit: '90000mb', extended: true }));

// Static files
app.use(exp.static(__dirname + '/photos/'));

// Set up Multer storage with the new naming pattern
var storage = multer.diskStorage({
  destination: function(req, file, cb) {
    // Extract the user ID from the JWT token
    let reqToken = req.headers['authorization'];
    jwt.verify(reqToken, accessTokenSecret, function(err, decoded) {
      if (err) {
        return cb(err, 'upload'); // If token verification fails, return error
      }
      let userID = decoded.username; // Extract the user ID (assuming the token contains a username)
      console.log('User ID:', userID); // For debugging
    });
    cb(null, 'upload'); // Store the file in the 'upload' directory
  },
  filename: function(req, file, cb) {
    // Get the user ID from the decoded token
    let reqToken = req.headers['authorization'];
    jwt.verify(reqToken, accessTokenSecret, function(err, decoded) {
      if (err) {
        return cb(err, 'unknown_error.jpg'); // If token verification fails, return a default filename
      }
      let userID = decoded.username; // Extract user ID from token
      let date = new Date().toISOString().split('T')[0]; // Get current date in YYYY-MM-DD format
      let uniqueID = uniqid(); // Generate unique ID
      let fileType = file.mimetype.split('/')[1]; // Extract the file type (e.g., 'image' for images)

      // Generate the filename using the new pattern
      let filename = `${date}_${userID}_${uniqueID}.${fileType === 'jpeg' ? 'jpg' : fileType}`;

      cb(null, filename); // Final filename format
    });
  }
});

// var storage = multer.diskStorage({
//   destination: function(req, file, res){
//     let reqToken = req.headers['authorization'];
//     jwt.verify(reqToken, accessTokenSecret, function(err, decoded) {
//       let uid = decoded.username;
//       console.log('pic', uid)
//     })
//     res(null, 'upload')
//   },
//   filename: function(req, file, res){
//     if (file.mimetype == 'image/png') {
//       res(null, "DS_"+Date.now()+"."+uniqid()+".png")
//     } else if(file.mimetype == 'image/jpeg') {
//       res(null, "DS_"+Date.now()+"."+uniqid()+".jpg")
//     } else if(file.mimetype == 'image/gif') {
//       res(null, "DS_"+Date.now()+"."+uniqid()+".gif")
//     }

//   }
// });

var upload  = multer({storage: storage});


module.exports = app;

app.post('/create/magazine', upload.single("file"), (req, res) => {
  let reqToken = req.headers['authorization'];
  let magazineTitle   = (req.body.magazineTitle).toString();
  
  jwt.verify(reqToken, accessTokenSecret, function(err, decoded) {
    let uid = decoded.userID;

    let oldPath  = req.file.path;
    let newPath  = "photos/"+req.file.filename;
    let fileName = req.file.filename;

    if(req.file.mimetype == "image/jpeg" || req.file.mimetype == "image/png"){
      var inStream  = fs.createReadStream(oldPath);
      var outStream = fs.createWriteStream(newPath, {flags: "w"});
      var transform = sharp()
      .resize({ width: 2500, height: 2500, fit: sharp.fit.inside })
      .webp({ quality: 90 })
      .rotate()
      .on('info', function(fileInfo) { sentPicture(); });
      inStream.pipe(transform).pipe(outStream);
    }else if(req.file.mimetype == "image/gif"){
      var cccc = "photos/";
      var old  = "upload/"+ req.file.filename;
      compress_images(old, cccc,
        {compress_force: false, statistic: true, autoupdate: true}, false,
        {jpg: { engine: false, command: false }},
        {png: { engine: false,  command: false }},
        {svg: { engine: false,  command: false }},
        {gif: { engine: 'gifsicle', command: ['--colors', '64', '--use-col=web']}},
        function(error, completed, statistic){
          if(!error){ sentPicture(); } })
    }else{
      res.status(200).json([]);
    }

    function sentPicture(){
      var date      = new Date();
      var timestamp = date.getTime();
      const magazineID = snowflake.generate(timestamp);

      pool.query(`INSERT INTO magazines (mag_id, user_id, title, cover, time) VALUES ($1, $2, $3, $4, NOW()) RETURNING *`,
      [magazineID, uid, magazineTitle, fileName], (err, d) => { 
        console.log(d.rows);
        res.status(200).json([]);
      })
    }

  })

})


app.post('/post/upload', upload.array("upload", 12), (req, res) => {
  let reqToken        = req.headers['authorization'];
  let data            = JSON.parse(req.body.data)
  let files           = req.files;
  let userID          = data.userID;
  let includeArticle  = data.includeArticle;


  jwt.verify(reqToken, accessTokenSecret, function(err, decoded) {
    let uid = decoded.userID;
    let media = [];
     
    async.forEachOf(files, (data, index, callback) => {

      let oldPath  = data.path;
      let newPath  = "photos/"+data.filename;
      let fileName = data.filename;

      if(data.mimetype == "image/jpeg" || data.mimetype == "image/png"){
        var inStream  = fs.createReadStream(oldPath);
        var outStream = fs.createWriteStream(newPath, {flags: "w"});
        var transform = sharp()
        .resize({ width: 1200, height: 1200, fit: sharp.fit.inside })
        .webp({ quality: 90 }) .rotate() .on('info', function(fileInfo) { });
        inStream.pipe(transform).pipe(outStream);
      }

      const date      = new Date();
      const timestamp = date.getTime();
      const media_id = snowflake.generate(timestamp);

      media.push({'m':fileName, 'old': data.originalname, media_id: media_id, ind: index+1})
      callback();
      
    }, function (err) {
      if (err) console.error(err.message);
      uploadPosts(uid, media, includeArticle);
      res.status(200).json({status: true})
    })
      
  })

})

app.post('/article/upload', upload.array("upload", 12), (req, res) => {
  let reqToken = req.headers['authorization'];
  let data = JSON.parse(req.body.data);
  let files = req.files;
  let includeArticle = data.includeArticle;
  let articleContent = req.body.article;
  let userID = data.userID;
  let title = data.title.toString();
  let cover = data.cover.toString();
  let subtitle = data.sub_title?.toString() || "";

  jwt.verify(reqToken, accessTokenSecret, async function(err, decoded) {
    if (err) return res.status(403).json({ error: 'Invalid token' });

    let uid = decoded.userID;
    
    try {
      const media = [];
    
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const newPath = `photos/${file.filename}`;
    
        if (file.mimetype.startsWith("image/")) {
          await sharp(file.path)
            .resize({ width: 1200, height: 1200, fit: "inside" })
            .webp({ quality: 90 })
            .rotate()
            .toFile(newPath);
        }

        const media_id  = snowflake.generate();
        media.push({media: file.filename, old: file.originalname, media_id: media_id, position: i+1})

      }
    
      const article = await createArticle(uid, title, subtitle, cover, articleContent);
      await uploadArticleMedia(article.article_id, media);

      res.status(200).json({
        success: true,
        article_id: article.article_id,
        slug: article.slug,
        message: "Article uploaded successfully"
      });
    
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to upload article' });
    }

  })
});

async function createArticle(userID, title, subtitle, coverImage, articleContent) {
  const slug = slugify(title, { lower: true, strict: true });

  const article_id  = snowflake.generate();

  console.log(decodeSnowflakeId(article_id), ' ', article_id); // → 2025-05-08T...

  const { rows } = await pool.query(`
    INSERT INTO articles (article_id, user_id, title, slug, subtitle, cover_image, article)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING article_id
  `, [article_id, userID, title, slug, subtitle, coverImage, articleContent]);
  return {article_id : rows[0].article_id, slug: slug};
}

async function uploadArticleMedia(articleID, mediaList) {
  if (mediaList.length === 0) return;

  const dataToInsert = mediaList.map(m => [m.media_id, articleID, m.position, m.media]);
  const query = format('INSERT INTO article_media (media_id, article_id, postion, media) VALUES %L', dataToInsert);

  try {
    await pool.query(query);
  } catch (err) {
    console.error("Error inserting media:", err);
    throw err;
  }
}

function decodeSnowflakeId(id) {
  const offset = new Date("2001-01-01").getTime(); // your custom epoch
  const timestampPart = BigInt(id) >> 22n; // 41 bits for timestamp
  const timestamp = Number(timestampPart) + offset;
  const date = new Date(timestamp);
  return date.toISOString(); // or date.toLocaleString()
}

app.post("/image/upload", upload.single('file'), (req, res) => {
  let oldPath  = req.file.path;
  let newPath  = "photos/"+req.file.filename;
  let fileName = req.file.filename;

  if(req.file.mimetype == "image/jpeg" || req.file.mimetype == "image/png"){
    var inStream = fs.createReadStream(oldPath);
    var outStream = fs.createWriteStream(newPath, {flags: "w"});
    var transform = sharp()
    .resize({ width: 1200, height: 1200, fit: sharp.fit.inside })  
    .webp({ quality: 90 })
    .rotate()
    .on('info', function(fileInfo) { sentPicture(); });
    inStream.pipe(transform).pipe(outStream);
  }else if(req.file.mimetype == "image/gif"){
    var cccc = "photos/";
    var old  = "upload/"+ req.file.filename;
    compress_images(old, cccc, 
      {compress_force: false, statistic: true, autoupdate: true}, false,
      {jpg: {engine: false, command: false}},
      {png: {engine: false, command: false}},
      {svg: {engine: false, command: false}},
      {gif: {engine: 'gifsicle', command: ['--colors', '64', '--use-col=web']}}, 
      function(error, completed, statistic){ if(!error){ sentPicture(); } })
  }

  function sentPicture(){
    res.status(200).json({imageUrl:fileName});
  }
    
})


app.post('/settings/uploadPics', upload.single('file'), (req, res) => {
  var reqToken = req.headers['authorization'];
  var oldPath  = req.file.path;
  var newPath  = "photos/"+req.file.filename;
  var fileName = req.file.filename;
  var ref      = req.body.ref;
  var query;

  if(ref == 1){
    query = "UPDATE users SET wallpaper = $1 WHERE user_id = $2";
  }else if(ref == 2){
    query = "UPDATE users SET pic = $1 WHERE user_id = $2";
  }

  jwt.verify(reqToken, accessTokenSecret, function(err, decoded) {
    var sessionID = decoded.userID;
    if(req.file.mimetype == "image/jpeg" || req.file.mimetype == "image/png"){
      var inStream  = fs.createReadStream(oldPath);
      var outStream = fs.createWriteStream(newPath, {flags: "w"});
      var transform = sharp()
      .resize({ width: 2500, height: 2500, fit: sharp.fit.inside })
      .webp({ quality: 90 })
      .rotate()
      .on('info', function(fileInfo) { sentPicture(); });
      inStream.pipe(transform).pipe(outStream);
    }else if(req.file.mimetype == "image/gif"){
      var cccc = "photos/";
      var old  = "upload/"+ req.file.filename;
      compress_images(old, cccc,
        {compress_force: false, statistic: true, autoupdate: true}, false,
        {jpg: { engine: false, command: false }},
        {png: { engine: false,  command: false }},
        {svg: { engine: false,  command: false }},
        {gif: { engine: 'gifsicle', command: ['--colors', '64', '--use-col=web']}},
        function(error, completed, statistic){
          if(!error){ sentPicture(); } })
    }

    function sentPicture(ref){
      pool.query(query, [fileName, sessionID], (err, rows) => {
        res.status(200).json([{pic: fileName}]);
      })
    }

  })
})


app.post("/article/edit/picture", upload.single('file'),  (req, res) => {
  var reqToken     = req.headers['authorization'];
  let article_id   = req.body.article_id;
  let user_id      = req.body.user_id;
  
  let oldPath  = req.file.path;
  let newPath  = "photos/"+req.file.filename;
  let fileName = req.file.filename;


  jwt.verify(reqToken, accessTokenSecret, function(err, decoded) {
    let uid = decoded.userID;
    if(uid == user_id){
       
      if(req.file.mimetype == "image/jpeg" || req.file.mimetype == "image/png"){
        var inStream  = fs.createReadStream(oldPath);
        var outStream = fs.createWriteStream(newPath, {flags: "w"});
        var transform = sharp()
        .resize({ width: 1200, height: 1200, fit: sharp.fit.inside })  
        .webp({ quality: 90 })
        .rotate()
        .on('info', function(fileInfo) { sentPicture(); });
        inStream.pipe(transform).pipe(outStream);
      }else if(req.file.mimetype == "image/gif"){
        var cccc = "photos/";
        var old  = "upload/"+ req.file.filename;
        compress_images(old, cccc, 
          {compress_force: false, statistic: true, autoupdate: true}, false,
          {jpg: {engine: false, command: false}},
          {png: {engine: false, command: false}},
          {svg: {engine: false, command: false}},
          {gif: {engine: 'gifsicle', command: ['--colors', '64', '--use-col=web']}}, 
          function(error, completed, statistic){ 
            if(!error){ 
              sentPicture(); 
            }else{
              res.status(200);
            } 
          })
      }
  
      function sentPicture(){
        pool.query(`UPDATE articles SET image = $1 WHERE article_id = $2 RETURNING *`,
        [fileName, article_id], (r, d) => {
          res.status(200).json(fileName)
        })
            
      }
        
    }
  })

})