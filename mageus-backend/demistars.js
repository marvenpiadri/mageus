const exp               = require('express');
const app               = exp();
var chatapp             = require('http').createServer(app);
var options             = {
  allowUpgrades: true,
  transports: [ 'polling', 'websocket' ],
  pingTimeout: 9000,
  pingInterval: 3000,
  cookie: 'mycookie',
  httpCompression: true,
  cors: '*:*'
};
var io                  = require('socket.io')(chatapp, options);
const jwt               = require('jsonwebtoken');
const cors              = require('cors');
const pars              = require('body-parser');
const bcrypt            = require('bcrypt');
const compress_images   = require('compress-images');
const multer            = require('multer');
const sharp             = require('sharp');
const fs                = require('fs');
const uniqid            = require('uniqid');
const async             = require('async');
// const graphile          = require('./postgraphql')
const axios             = require('axios');
const requestIp         = require('request-ip');

const format            = require('pg-format');
const useragent = require('useragent'); // Use the 'useragent' library to parse User-Agent
const bowser = require('bowser');
const UAParser = require('ua-parser-js');

const SnowflakeId = require('snowflake-id').default;
// Initialize snowflake
var snowflake = new SnowflakeId({
  mid : 42,
  offset : (2019-1970)*31536000*1000
});

chatapp.listen(3000, ()=>{
  console.log('server is online at port: ', 3000);
})

app.use('/', require('./uploader'));
app.use(requestIp.mw());
app.use(exp.json())
app.use(cors())
app.use(exp.static(__dirname + '/photos/'));
app.use(pars.json({limit: '9000mb', extended: true}))
app.use(pars.urlencoded({limit: '90000mb', extended: true}))

const accessTokenSecret = '_stars@secret_4520_SPLASHYTOKEN';

io.on('connection', function(socket){
  var date      = new Date();
  var timestamp = date.getTime();
  socket.on('disconnect', (user, handleError) => {
    console.log('disconnected')
  });

});


var Pool = require('pg').Pool
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'mageus',
  password: '8888',
  port: 5433,
})

let username = 'marwan'
// select and return a single user name from id:
pool.query(`SELECT count(*) AS total FROM users WHERE username = $1`,
[username], (err, d) => {

})

var storage = multer.diskStorage({
  destination: function(req, file, res){
    res(null, 'upload')
  },
  filename: function(req, file, res){
    if (file.mimetype == 'image/png') {
      res(null, "DEMI_"+Date.now()+"."+uniqid()+"_STAR.png")
    } else if(file.mimetype == 'image/jpeg') {
      res(null, "DEMI_"+Date.now()+"."+uniqid()+"_STAR.jpg")
    } else if(file.mimetype == 'image/gif') {
      res(null, "DEMI_"+Date.now()+"."+uniqid()+"_STAR.gif")
    }

  }
});

async function notifications(id, userID, sender, type) {
  try {
    const notif_id = snowflake.generate(Date.now());

    await pool.query(
      `INSERT INTO notifications (notif_id, id, user_id, sender_id, type_id, seen, time) 
       VALUES ($1, $2, $3, $4, $5, $6, NOW())
       ON CONFLICT (id, type_id, sender_id) DO NOTHING`,
      [notif_id, id, userID, sender, type, false]
    );

  } catch (err) {
    console.error("Notification insert error:", err);
  }
}


async function delNotifs(id, sender) {
  try {
    const result = await pool.query(
      `DELETE FROM notifications WHERE sender_id = $1 AND id = $2 RETURNING notif_id`,
      [sender, id]
    );

    if (result.rowCount > 0) {
      console.log(`Deleted ${result.rowCount} notification(s).`);
    } else {
      console.log("No notification found to delete.");
    }

    return result.rowCount;
  } catch (err) {
    console.error("Delete notification error:", err);
    throw err;
  }
}


var upload  = multer({storage: storage});

function getDeviceInfos(userAgentString) {
  const parser = new UAParser(userAgentString);
  const result = parser.getResult();

  const os = result.os.name + ' ' + result.os.version;     // e.g., "Windows 10"
  const browser = result.browser.name + ' ' + result.browser.version; // e.g., "Chrome 123.0.0"
  const deviceType = result.device.type || 'desktop';      // mobile | tablet | smarttv | wearable | embedded | desktop

  return { os, browser, deviceType };
}

app.get('/api/ipinfo', async (req, res) => {
   let clientIp = requestIp.getClientIp(req);

  const realClientIP = (clientIp === '::ffff:127.0.0.1' || clientIp === '::1') ? '197.146.193.140' : clientIp;

  try {
    const geoRes = await axios.get(`https://get.geojs.io/v1/ip/geo/${realClientIP}.json`);
    console.log('Geo Information:', geoRes.data);
    res.json(geoRes.data);
  } catch (err) {
    console.error('Error fetching geo info:', err);
    res.status(500).json({ error: 'Failed to fetch geo info' });
  }
});

app.post('/username/check', (req, res) => {
  let { username } = req.body;
  console.log(req.body);
  username = username?.trim().toLowerCase();

  if (!username) {
    return res.status(400).json({ error: 'Username required' });
  }

  pool.query(
    `SELECT EXISTS (SELECT 1 FROM users WHERE username = $1) AS exists`,
    [username],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Database error' });
      }
      res.status(200).json([{ exists: result.rows[0].exists }]);
    }
  );
});

app.post('/email/check', (req, res) => {
  let { email } = req.body;
  console.log(req.body);
  email = email?.trim().toLowerCase();

  if (!email) {
    return res.status(400).json({ error: 'Email required' });
  }

  pool.query(
    `SELECT EXISTS (SELECT 1 FROM users WHERE email = $1) AS exists`,
    [email],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Database error' });
      }
      res.status(200).json([{ exists: result.rows[0].exists }]);
    }
  );
});


app.post('/create/account', async (req, res) => {
  try {
    let { username, email, fullname, password } = req.body;

    // Normalize inputs
    username = username?.trim();
    email    = email?.trim().toLowerCase();
    fullname = fullname?.trim();

    if (!username || !email || !fullname || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if user exists (use EXISTS instead of COUNT for speed)
    const { rows } = await pool.query(
      `SELECT EXISTS(SELECT 1 FROM users WHERE username = $1 OR email = $2) AS exists`,
      [username, email]
    );

    if (rows[0].exists) {
      return res.status(409).json({ message: 'Username or email already exists' });
    }

    // Hash password
    const hash = await bcrypt.hash(password, 12); // 12 rounds recommended for security/speed balance

    // Generate user ID
    const user_id = snowflake.generate(Date.now());

    // Insert new user
    const { rows: newUserRows } = await pool.query(
      `INSERT INTO users (user_id, name, username, email, password)
       VALUES ($1, $2, $3, $4, $5) RETURNING user_id, username, email`,
      [user_id, fullname, username, email, hash]
    );

    const newUser = newUserRows[0];

    // Create JWT token
    const token = jwt.sign(
      { userID: newUser.user_id, username: newUser.username },
      accessTokenSecret,
      { expiresIn: '300d' }
    );

    res.status(201).json({
      token,
      userID: newUser.user_id,
      username: newUser.username,
      email: newUser.email
    });

  } catch (err) {
    console.error('Create account error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});


app.post("/token/loguser", async (req, res) => {
  try {
    const user_cred = req.body.user_cred?.toString();
    const userpass = req.body.password?.toString();

    if (!user_cred || !userpass) {
      return res.status(400).json({ err: 3, message: "Username/email and password are required" });
    }

    const qe = `
      SELECT user_id, pic, username, password
      FROM users
      WHERE username = $1 OR email = $2
    `;

    const { rows } = await pool.query(qe, [user_cred, user_cred]);

    if (rows.length === 0) {
      return res.status(401).json({ err: 1, message: "User not found" });
    }

    const user = rows[0];
    const match = await bcrypt.compare(userpass, user.password);

    if (!match) {
      return res.status(401).json({ err: 2, message: "Invalid password" });
    }

    const tokenPayload = {
      userID: user.user_id,
      username: user.username
      // pic is optional; can fetch separately if needed
    };

    const token = jwt.sign(tokenPayload, accessTokenSecret, { expiresIn: '8000d' });

    res.status(200).json({ err: 0, token, userID: user.user_id, username: user.username, pic: user.pic });

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ err: 4, message: "Internal server error" });
  }
});

app.post('/social/signup', (req, res) => {
  var provider = req.body.provider;
  var tooken   = req.body.idToken;
  var socialID = req.body.id;
  var name     = req.body.name;
  
  if(provider == 'FACEBOOK'){
    var query = 'SELECT COUNT(*) AS total FROM users WHERE fb_id = $1'
    var data  = [socialID];
  }else if(provider == 'GOOGLE'){
    var query = 'SELECT COUNT(*) AS total FROM users WHERE g_id = $1'
    var data  = [socialID];
  }

  pool.query(query, data, (err, rows) => {
    if(rows[0].total > 0){
      res.status(200).json([{total: rows[0].total}]);
    }else if(rows[0].total < 1){
      res.status(200).json([{total: rows[0].total}]);
    }
  
  })

})

app.post('/user/setPassword', (req, res) => {
  var reqToken = req.headers.authorization;
  var password = req.body.password;
  jwt.verify(reqToken, accessTokenSecret, (err, decoded) => {
    bcrypt.hash(password, 10, (err, hash) => {
      pool.query('UPDATE users SET password = $1, password_s = $2 WHERE user_id = $3', 
      [hash, password, decoded.userID], (err, rows) => {
        if(!err){
          res.status(200).json([{ref: 2, pass: hash}]);
        }
      })
    })
  })
})

app.post('/articles', (req, res) => {
  var reqToken   = req.headers.authorization;
  var userID     = req.body.userID.toString();
  var path_ref   = req.body.path_ref;

  jwt.verify(reqToken, accessTokenSecret, (err, decoded) => {

    let uid = decoded.userID;
    pool.query(`SELECT
    a.article_id::BIGINT,
    json_build_object(
      'article_id', a.article_id::BIGINT,
      'title', a.title,
      'sub_title', a.subtitle,
      'image', a.cover_image,
      'slug', a.slug
    ) AS article,


    COALESCE((
      SELECT s1.stars::INTEGER 
      FROM article_votes s1 
      WHERE s1.article_id = a.article_id AND s1.user_id = $1 
      LIMIT 1
    ), 0) AS istars,

    a.voters_count::INTEGER AS voters,
    a.stars_total::INTEGER AS stars,

    a.com_count::INTEGER AS comments,

    u.user_id::BIGINT,
    u.username AS u1_username, 
    u.pic      AS u1_pic, 
    u.name     AS u1_name,

    a.created_at AS timepost

    FROM articles a
    JOIN users u ON u.user_id = a.user_id

    WHERE u.username = $2 AND a.deleted_at IS NULL

    GROUP BY a.article_id, u.user_id

    ORDER BY a.article_id DESC
    LIMIT 10`, [uid, userID], (err, d) => {
      let results = d.rows;

      const articleIDs = results.map(p => p.article_id);

      pool.query(`
      SELECT article_id, media FROM article_media 
      WHERE article_id = ANY($1::bigint[]) 
      ORDER BY media_id ASC`, 
      [articleIDs], (err2, queryResult) => {

        if (err2) {
          console.error('Query error:', err2);
          return;
        }
        
        const mediaRows = queryResult.rows; // Access the rows from the query result
        const mediaMap = {};
    
        mediaRows.forEach(row => {
          if (!mediaMap[row.article_id]) mediaMap[row.article_id] = [];
          mediaMap[row.article_id].push({media: row.media});
        });
    
        results.forEach(post => {
          post.photographs = mediaMap[post.article_id] || [];
        });

        res.status(200).json(results);
    });

    });
    
  })

}) 

app.post('/articles/more', (req, res) => {
  var reqToken   = req.headers.authorization;
  var userID     = req.body.userID.toString();
  var lastID     = req.body.lastID; // Use last article_id from previous batch

  jwt.verify(reqToken, accessTokenSecret, (err, decoded) => {
    if (err) return res.sendStatus(403);
    let uid = decoded.userID;

    pool.query(`
      SELECT
        a.article_id::BIGINT,
        json_build_object(
          'article_id', a.article_id::BIGINT,
          'title', a.title,
          'sub_title', a.subtitle,
          'image', a.cover_image,
          'slug', a.slug
        ) AS article,

        COALESCE((
          SELECT s1.stars::INTEGER 
          FROM article_votes s1 
          WHERE s1.article_id = a.article_id AND s1.user_id = $1 
          LIMIT 1
        ), 0) AS istars,

        a.voters_count::INTEGER AS voters,
        a.stars_total::INTEGER AS stars,
        a.com_count::INTEGER AS comments,

        u.user_id::BIGINT,
        u.username AS u1_username, 
        u.pic      AS u1_pic, 
        u.name     AS u1_name,

        a.created_at AS timepost

      FROM articles a
      JOIN users u ON u.user_id = a.user_id
      WHERE u.username = $2 AND a.article_id < $3

      GROUP BY a.article_id, u.user_id
      ORDER BY a.article_id DESC
      LIMIT 10
    `, [uid, userID, lastID], (err, d) => {

      if (err) {
        console.error('Main query error:', err);
        return res.sendStatus(500);
      }

      const results = d.rows;
      const articleIDs = results.map(p => p.article_id);

      if (articleIDs.length === 0) return res.status(200).json([]);

      pool.query(`
        SELECT article_id, media 
        FROM article_media 
        WHERE article_id = ANY($1::bigint[]) 
        ORDER BY media_id ASC
      `, [articleIDs], (err2, queryResult) => {
        if (err2) {
          console.error('Media query error:', err2);
          return res.sendStatus(500);
        }

        const mediaRows = queryResult.rows;
        const mediaMap = {};

        mediaRows.forEach(row => {
          if (!mediaMap[row.article_id]) mediaMap[row.article_id] = [];
          mediaMap[row.article_id].push({ media: row.media });
        });

        results.forEach(post => {
          post.photographs = mediaMap[post.article_id] || [];
        });

        res.status(200).json(results);
      });
    });
  });
});

app.post('/posts/feeds', (req, res) => {
  const reqToken = req.headers.authorization;

  jwt.verify(reqToken, accessTokenSecret, (err, decoded) => {
    if (err) return res.sendStatus(403);
    const uid = decoded.userID;

    pool.query(`
      SELECT
        a.article_id::BIGINT,
        json_build_object(
          'article_id', a.article_id::BIGINT,
          'title', a.title,
          'sub_title', a.subtitle,
          'image', a.cover_image,
          'slug', a.slug
        ) AS article,

        COALESCE((
          SELECT s1.stars::INTEGER 
          FROM article_votes s1 
          WHERE s1.article_id = a.article_id AND s1.user_id = $1 
          LIMIT 1
        ), 0) AS istars,

        a.voters_count::INTEGER AS voters,
        a.stars_total::INTEGER AS stars,
        a.com_count::INTEGER AS comments,

        u.user_id::BIGINT,
        u.username AS u1_username, 
        u.pic      AS u1_pic, 
        u.name     AS u1_name,

        a.created_at AS timepost

      FROM relations r
      JOIN articles a ON a.user_id = r.following
      JOIN users u    ON u.user_id = a.user_id

      WHERE r.user_id = $1 AND a.deleted_at IS NULL
      GROUP BY a.article_id, u.user_id 
      ORDER BY a.article_id DESC
      LIMIT 10
    `, [uid], (err, d) => {

      if (err) {
        console.error('Feeds query error:', err);
        return res.sendStatus(500);
      }

      const results = d.rows;
      const articleIDs = results.map(p => p.article_id);

      if (articleIDs.length === 0) return res.status(200).json([]);

      pool.query(`
        SELECT article_id, media 
        FROM article_media 
        WHERE article_id = ANY($1::bigint[]) 
        ORDER BY media_id ASC
      `, [articleIDs], (err2, queryResult) => {
        if (err2) {
          console.error('Feeds media query error:', err2);
          return res.sendStatus(500);
        }

        const mediaRows = queryResult.rows;
        const mediaMap = {};

        mediaRows.forEach(row => {
          if (!mediaMap[row.article_id]) mediaMap[row.article_id] = [];
          mediaMap[row.article_id].push({ media: row.media });
        });

        results.forEach(article => {
          article.photographs = mediaMap[article.article_id] || [];
        });

        res.status(200).json(results);
      });
    });
  });
});

app.post('/posts/feeds/more', (req, res) => {
  const reqToken = req.headers.authorization;
  const lastID   = req.body.lastID; // last article_id from previous batch

  jwt.verify(reqToken, accessTokenSecret, (err, decoded) => {
    if (err) return res.sendStatus(403);
    const uid = decoded.userID;

    pool.query(`
      SELECT
        a.article_id::BIGINT,
        json_build_object(
          'article_id', a.article_id::BIGINT,
          'title', a.title,
          'sub_title', a.subtitle,
          'image', a.cover_image,
          'slug', a.slug
        ) AS article,

        COALESCE((
          SELECT s1.stars::INTEGER 
          FROM article_votes s1 
          WHERE s1.article_id = a.article_id AND s1.user_id = $1 
          LIMIT 1
        ), 0) AS istars,

        a.voters_count::INTEGER AS voters,
        a.stars_total::INTEGER AS stars,
        a.com_count::INTEGER AS comments,

        u.user_id::BIGINT,
        u.username AS u1_username, 
        u.pic      AS u1_pic, 
        u.name     AS u1_name,

        a.created_at AS timepost

      FROM relations r
      JOIN articles a ON a.user_id = r.following
      JOIN users u    ON u.user_id = a.user_id

      WHERE r.user_id = $1 AND a.article_id < $2 AND a.deleted_at IS NULL
      ORDER BY a.article_id DESC
      LIMIT 10
    `, [uid, lastID], (err, d) => {
      if (err) {
        console.error('Feeds more query error:', err);
        return res.sendStatus(500);
      }

      const results = d.rows;
      const articleIDs = results.map(p => p.article_id);

      if (articleIDs.length === 0) return res.status(200).json([]);

      pool.query(`
        SELECT article_id, media 
        FROM article_media 
        WHERE article_id = ANY($1::bigint[]) 
        ORDER BY media_id ASC
      `, [articleIDs], (err2, queryResult) => {
        if (err2) {
          console.error('Feeds media query error:', err2);
          return res.sendStatus(500);
        }

        const mediaRows = queryResult.rows;
        const mediaMap = {};

        mediaRows.forEach(row => {
          if (!mediaMap[row.article_id]) mediaMap[row.article_id] = [];
          mediaMap[row.article_id].push({ media: row.media });
        });

        results.forEach(article => {
          article.photographs = mediaMap[article.article_id] || [];
        });

        res.status(200).json(results);
      });
    });
  });
});

app.post('/articles/:articleID', (req, res) => {
  const reqToken = req.headers.authorization;
  const articleID = req.body.articleID; // use body param
  const path_ref  = req.body.path_ref;  // optional, keep for logging/debug


  
  jwt.verify(reqToken, accessTokenSecret, (err, decoded) => {
    if (err) return res.sendStatus(403);
    const uid = decoded.userID;

    pool.query(`
      SELECT
        a.article_id::BIGINT,
        json_build_object(
          'article_id', a.article_id::BIGINT,
          'title', a.title,
          'sub_title', a.subtitle,
          'image', a.cover_image,
          'slug', a.slug,
          'article', a.article
        ) AS article,

        COALESCE((
          SELECT s1.stars::INTEGER 
          FROM article_votes s1 
          WHERE s1.article_id = a.article_id AND s1.user_id = $1 
          LIMIT 1
        ), 0) AS istars,

        a.voters_count::INTEGER AS voters,
        a.stars_total::INTEGER AS stars,
        a.com_count::INTEGER AS comments,

        u.user_id::BIGINT,
        u.username AS u1_username, 
        u.pic      AS u1_pic, 
        u.name     AS u1_name,

        a.created_at AS timepost

      FROM articles a
      JOIN users u ON u.user_id = a.user_id
      WHERE a.article_id = $2 AND a.deleted_at IS NULL
      GROUP BY a.article_id, u.user_id
    `, [uid, articleID], (err, d) => {

      if (err) {
        console.error('Get article query error:', err);
        return res.sendStatus(500);
      }

      const result = d.rows[0];
      if (!result) return res.status(404).json({ message: 'Article not found' });

      // Fetch media for this article
      pool.query(`
        SELECT media
        FROM article_media
        WHERE article_id = $1
        ORDER BY media_id ASC
      `, [articleID], (err2, mediaResult) => {
        if (err2) {
          console.error('Get article media error:', err2);
          return res.sendStatus(500);
        }

        result.photographs = mediaResult.rows.map(r => ({ media: r.media }));

        res.status(200).json([result]);
      });
    });
  });
});

app.post('/edit/post/get', (req, res)=>{
  var reqToken = req.headers.authorization;
  var postID   = req.body.postID;
  jwt.verify(reqToken, accessTokenSecret, (err, decoded) => {
    var uid   = decoded.userID;

    pool.query(`SELECT caption, article FROM posts WHERE user_id = $1 AND post_id = $2 GROUP BY post_id`,
    [uid, postID], (err, d) => {
      res.status(200).json(d.rows[0])
    });

  })

})

app.post('/article/vote', async (req, res) => {
  const reqToken = req.headers.authorization;
  const articleID = req.body.articleID;
  let vote = Number(req.body.vote);
  vote = vote >= 100 ? 100 : vote; // cap at 100
  const ownerID = req.body.userID;

  const client = await pool.connect();

  try {
    // Verify JWT
    const decoded = jwt.verify(reqToken, accessTokenSecret);
    const uid = decoded.userID;

    // Begin transaction
    await client.query('BEGIN');

    // Check if user has already voted
    const userVote = await client.query(`
      SELECT stars FROM article_votes 
      WHERE article_id = $1 AND user_id = $2
    `, [articleID, uid]);

    if (userVote.rows.length > 0) {
      if (vote === 0) {
        // Remove vote
        await client.query(`
          DELETE FROM article_votes WHERE article_id = $1 AND user_id = $2
        `, [articleID, uid]);
      } else {
        // Update existing vote
        await client.query(`
          UPDATE article_votes 
          SET stars = $1, voted_at = NOW() 
          WHERE article_id = $2 AND user_id = $3
        `, [vote, articleID, uid]);
      }
    } else {
      if (vote > 0) {
        // Insert new vote
        await client.query(`
          INSERT INTO article_votes (stars, article_id, user_id, voted_at)
          VALUES ($1, $2, $3, NOW())
          ON CONFLICT (article_id, user_id)
          DO UPDATE SET stars = EXCLUDED.stars, voted_at = NOW()
        `, [vote, articleID, uid]);
      }
    }

    // Recalculate article totals safely
    await client.query(`
      UPDATE articles
      SET stars_total = (SELECT COALESCE(SUM(stars),0) FROM article_votes WHERE article_id = $1),
          voters_count = (SELECT COUNT(*) FROM article_votes WHERE article_id = $1)
      WHERE article_id = $1
    `, [articleID]);

    // Commit transaction
    await client.query('COMMIT');

    // Send notifications
    if (vote > 0) {
      notifications(articleID, ownerID, uid, 1);
    } else if (vote === 0) {
      delNotifs(articleID, uid);
    }

    res.status(200).json({ message: 'Vote recorded successfully' });

  } catch (err) {
    console.error('Database error:', err);
    await client.query('ROLLBACK');
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
});

app.post("/profile/cover", (req, res)=>{
  var reqToken = req.headers['authorization'];
  var userID   = req.body['userID'].toString();
  jwt.verify(reqToken, accessTokenSecret, () => {
    pool.query(`SELECT wallpaper FROM users WHERE username = $1`,
    [userID], (err, d)=>{
      res.status(200).json(d.rows);
    });
  })
})

app.post('/profile/header', (req, res) => {
  var reqToken = req.headers['authorization'];
  var username = req.body.username.toString();

  let query = `
    SELECT t1.user_id, 
    t1.username AS username, 
    t1.name AS name, 
    t1.pic AS pic,
    t1.wallpaper AS wallpaper,
    t1.bio AS bio,

    (SELECT followers_count) AS followers,
    (SELECT following_count) AS following,

    (SELECT COUNT(*)::INTEGER FROM relations s1 WHERE s1.user_id = $1 AND s1.following = t1.user_id) AS ifollow,
    (SELECT COUNT(*)::INTEGER FROM relations s1 WHERE s1.user_id = t1.user_id AND s1.following = $2) AS heFollow

    FROM users t1 
    LEFT JOIN articles t2 ON t2.user_id = t1.user_id
    WHERE t1.username = $3 
    GROUP BY t1.user_id, t2.article_id ORDER BY t2.article_id DESC`
  jwt.verify(reqToken, accessTokenSecret, function(err, decoded) {
    let uid = decoded.userID;
    pool.query(query, [uid, uid, username], (err, d) => {
      res.status(200).json(d.rows[0]);
    })
  })

})

app.post('/profile/unfollow', (req, res) => {
  var reqToken = req.headers['authorization'];
  var userID = req.body.userID;
  jwt.verify(reqToken, accessTokenSecret, function(err, decoded) {
    let uid = decoded.userID;
    pool.query(`DELETE FROM relations WHERE user_id = $1 AND following = $2`, 
    [uid, userID], (err, d) => {
      res.status(200).json([]);
    })
  })

})

app.post('/profile/follow', (req, res) => {
  var reqToken = req.headers['authorization'];
  var userID = req.body.userID;

  jwt.verify(reqToken, accessTokenSecret, function(err, decoded) {
    let uid = decoded.userID;
    pool.query(`SELECT COUNT(t1.*) AS Following FROM relations t1 WHERE t1.user_id = $1 AND t1.following = $2`, 
    [uid, userID], (err, d) => {
      if(d.rows[0].following < 1){
        pool.query(`INSERT INTO relations (user_id, following, date) VALUES($1, $2, NOW()) RETURNING *`, 
        [uid, userID], (err2, d2) => {
          res.status(200).json(d2.rows[0]);
          notifications(d2.rows[0].user_id, d2.rows[0].following, uid, 5);
        })
      }else{
        res.status(200);
      }
    })
  })

})

app.post('/users/search', (req, res) => {
  var reqToken = req.headers['authorization'];
  var search = req.body.search;

  jwt.verify(reqToken, accessTokenSecret, function(err, decoded) {
    let uid = decoded.userID;
    pool.query(`SELECT 

    u1.username, 
    u1.name, 
    u1.pic

    FROM  users u1

    WHERE

    u1.name LIKE $1
    OR u1.name LIKE $2 
    OR u1.name LIKE $3 

    OR u1.username LIKE $4
    OR u1.username LIKE $5
    OR u1.username LIKE $6
    GROUP BY user_id LIMIT 12`, 
    ['%'+search, 
    search+'%', 
    '%'+search+'%', 

    '%'+search, 
    search+'%', 
    '%'+search+'%'], (err, d) => {
      res.status(200).json(d.rows);
    })
  })

})

function updateArticleCommentCount(articleID, delta) {
  pool.query(
    `UPDATE articles SET com_count = com_count + $1 WHERE article_id = $2`,
    [delta, articleID],
    (err) => {
      if (err) console.error("Error updating comment count:", err);
    }
  );
}

app.post('/send/comment', (req, res) => {
  const reqToken  = req.headers['authorization'];
  const articleID = req.body.articleID;
  const ownerID   = req.body.ownerID;
  const comment   = req.body.comment.toString().trim();
  
  var date      = new Date();
  var timestamp = date.getTime();
  const comment_id = snowflake.generate(timestamp);

  jwt.verify(reqToken, accessTokenSecret, (err, decoded) => {
    if (err) return res.status(401).send("Invalid token");

    const uid = decoded.userID;

    pool.query(
      `INSERT INTO comments (comment_id, user_id, article_id, comment, created_at) 
       VALUES ($1, $2, $3, $4, NOW()) RETURNING *`,
      [comment_id, uid, articleID, comment],
      (err1, d1) => {

        if (err1) return res.status(500).send(err1);

        // increment comment count
        updateArticleCommentCount(articleID, +1);

        notifications(comment_id, ownerID, uid, 2);

        // return full comment with user info
        const selectNewComment = `
        SELECT 
          c.comment_id::BIGINT,
          c.article_id::BIGINT,
          c.user_id::BIGINT,
          c.comment,
          c.created_at AS created_at,
          u.name,
          u.pic,
          u.username,
          COALESCE((SELECT COUNT(*) FROM comment_votes v WHERE v.comment_id = c.comment_id), 0)::INTEGER AS voters,
          COALESCE((SELECT COUNT(*) FROM comment_votes v WHERE v.comment_id = c.comment_id AND v.user_id = $1), 0)::INTEGER AS istars,
          COALESCE((SELECT COUNT(*) FROM comments r WHERE r.parent_id = c.comment_id), 0)::INTEGER AS replies_count
        FROM comments c
        JOIN users u ON u.user_id = c.user_id
        WHERE c.comment_id = $2
        LIMIT 1
      `;
      pool.query(selectNewComment, [uid, comment_id], (err2, d2) => {

        if (err2) return res.status(500).send(err2);
        return res.status(200).json(d2.rows[0] || null);
      });
      }
    );
  });
});

app.post('/article/comments', (req, res) => {
  const reqToken = req.headers['authorization'];
  const articleID   = req.body.articleID;

  jwt.verify(reqToken, accessTokenSecret, async (err, decoded) => {
    if (err) return res.status(401).json({ error: 'Unauthorized' });

    const uid = decoded.userID;

    try {
      // 1. Fetch top-level comments
      const topCommentsQuery = `
        SELECT 
          c.comment_id::BIGINT,
          c.article_id::BIGINT,
          c.user_id::BIGINT,
          c.comment,
          c.created_at,
          u.name,
          u.pic,
          u.username,
          COALESCE((SELECT COUNT(*) FROM comment_votes v WHERE v.comment_id = c.comment_id), 0) AS voters,
          COALESCE((SELECT COUNT(*) FROM comment_votes v WHERE v.comment_id = c.comment_id AND v.user_id = $1), 0) AS istars,
          COALESCE((SELECT COUNT(*) FROM comments r WHERE r.parent_id = c.comment_id), 0) AS replies_count
        FROM comments c
        JOIN users u ON u.user_id = c.user_id
        WHERE c.article_id = $2 AND c.parent_id IS NULL
        ORDER BY c.comment_id DESC
        LIMIT 10
      `;

      const topComments = await pool.query(topCommentsQuery, [uid, articleID]);

      if (topComments.rows.length === 0) {
        return res.status(200).json([]);
      }

      // Collect parent comment IDs
      const parentIds = topComments.rows.map(c => c.comment_id);

      // 2. Fetch replies for ALL parent comments in one query
      const repliesQuery = `
        SELECT 
          c.comment_id::BIGINT,
          c.parent_id::BIGINT,
          c.article_id::BIGINT,
          c.user_id::BIGINT,
          c.comment,
          c.created_at,
          u.name,
          u.pic,
          u.username,
          COALESCE((SELECT COUNT(*) FROM comment_votes v WHERE v.comment_id = c.comment_id), 0) AS voters,
          COALESCE((SELECT COUNT(*) FROM comment_votes v WHERE v.comment_id = c.comment_id AND v.user_id = $1), 0) AS istars
        FROM comments c
        JOIN users u ON u.user_id = c.user_id
        WHERE c.article_id = $2 AND c.parent_id = ANY($3::BIGINT[])
        ORDER BY c.comment_id DESC
      `;

      const replies = await pool.query(repliesQuery, [uid, articleID, parentIds]);

      // 3. Group replies under their parent
      const repliesByParent = {};
      replies.rows.forEach(r => {
        if (!repliesByParent[r.parent_id]) {
          repliesByParent[r.parent_id] = [];
        }
        // limit to 5 replies per parent (like your old code)
        if (repliesByParent[r.parent_id].length < 5) {
          repliesByParent[r.parent_id].push(r);
        }
      });

      // 4. Attach replies to each parent comment
      const results = topComments.rows.map(comment => ({
        ...comment,
        answers: repliesByParent[comment.comment_id] || []
      }));
      
      res.status(200).json(results);

    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  });
});

app.post('/article/comments/scroll', async (req, res) => {
  const reqToken = req.headers['authorization'];
  const articleID = req.body.articleID;
  const lastID    = req.body.lastID;

  jwt.verify(reqToken, accessTokenSecret, async (err, decoded) => {
    if (err) return res.status(401).json({ error: 'Unauthorized' });

    const uid = decoded.userID;

    try {
      // 1. Fetch top-level comments before lastID
      const topCommentsQuery = `
        SELECT 
          c.comment_id::BIGINT,
          c.article_id::BIGINT,
          c.user_id::BIGINT,
          c.comment,
          c.created_at,
          u.name,
          u.pic,
          u.username,
          COALESCE((SELECT COUNT(*) FROM comment_votes v WHERE v.comment_id = c.comment_id), 0) AS voters,
          COALESCE((SELECT COUNT(*) FROM comment_votes v WHERE v.comment_id = c.comment_id AND v.user_id = $1), 0) AS istars,
          COALESCE((SELECT COUNT(*) FROM comments r WHERE r.parent_id = c.comment_id), 0) AS replies_count
        FROM comments c
        JOIN users u ON u.user_id = c.user_id
        WHERE c.article_id = $2 AND c.comment_id < $3 AND c.parent_id IS NULL
        ORDER BY c.comment_id DESC
        LIMIT 10
      `;
      const topComments = await pool.query(topCommentsQuery, [uid, articleID, lastID]);
      if (topComments.rows.length === 0) return res.status(200).json([]);

      const parentIds = topComments.rows.map(c => c.comment_id);

      // 2. Fetch up to 5 replies per parent
      const repliesQuery = `
        SELECT *
        FROM (
          SELECT 
            c.comment_id::BIGINT,
            c.parent_id::BIGINT,
            c.article_id::BIGINT,
            c.user_id::BIGINT,
            c.comment,
            c.created_at,
            u.name,
            u.pic,
            u.username,
            COALESCE((SELECT COUNT(*) FROM comment_votes v WHERE v.comment_id = c.comment_id), 0) AS voters,
            COALESCE((SELECT COUNT(*) FROM comment_votes v WHERE v.comment_id = c.comment_id AND v.user_id = $1), 0) AS istars,
            ROW_NUMBER() OVER (PARTITION BY c.parent_id ORDER BY c.comment_id DESC) AS rn
          FROM comments c
          JOIN users u ON u.user_id = c.user_id
          WHERE c.article_id = $2 AND c.parent_id = ANY($3::BIGINT[])
        ) sub
        WHERE rn <= 5
      `;
      const replies = await pool.query(repliesQuery, [uid, articleID, parentIds]);

      // 3. Group replies under parent
      const repliesByParent = {};
      replies.rows.forEach(r => {
        if (!repliesByParent[r.parent_id]) repliesByParent[r.parent_id] = [];
        repliesByParent[r.parent_id].push(r);
      });

      // 4. Attach replies to top-level comments
      const results = topComments.rows.map(comment => ({
        ...comment,
        answers: repliesByParent[comment.comment_id] || []
      }));

      res.status(200).json(results);

    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Server error' });
    }
  });
});

app.post('/send/comment/reply', (req, res) => {
  const reqToken   = req.headers['authorization'];
  const articleID  = req.body.articleID;
  const ownerID    = req.body.ownerID;
  const parentID   = req.body.comment_id; // parent comment
  const reply      = req.body.reply.toString().trim();

  var date      = new Date();
  var timestamp = date.getTime();
  const reply_id   = snowflake.generate(timestamp);

  jwt.verify(reqToken, accessTokenSecret, (err, decoded) => {
    if (err) return res.status(401).send("Invalid token");

    const uid = decoded.userID;

    pool.query(
      `INSERT INTO comments (comment_id, user_id, article_id, parent_id, comment, created_at) 
       VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING comment_id`,
      [reply_id, uid, articleID, parentID, reply],
      (err1) => {
        if (err1) return res.status(500).send(err1);

        // increment article comment count
        updateArticleCommentCount(articleID, +1);

        // send notification
        notifications(reply_id, ownerID, uid, 4);

        // now fetch reply in SAME STRUCTURE as comments
        const replyQuery = `
          SELECT 
            c.comment_id::BIGINT,
            c.article_id::BIGINT,
            c.user_id::BIGINT,
            c.parent_id::BIGINT,
            c.comment,
            c.created_at,
            u.name,
            u.pic,
            u.username,
            COALESCE((SELECT COUNT(*) FROM comment_votes v WHERE v.comment_id = c.comment_id), 0) AS voters,
            COALESCE((SELECT COUNT(*) FROM comment_votes v WHERE v.comment_id = c.comment_id AND v.user_id = $2), 0) AS istars,
            COALESCE((SELECT COUNT(*) FROM comments r WHERE r.parent_id = c.comment_id), 0) AS replies_count
          FROM comments c
          JOIN users u ON u.user_id = c.user_id
          WHERE c.comment_id = $1
          GROUP BY c.comment_id, u.user_id
        `;

        pool.query(replyQuery, [reply_id, uid], (err2, d2) => {
          if (err2) return res.status(500).send(err2);
          res.status(200).json(d2.rows[0]);
        });
      }
    );
  });
});

app.post('/comment/replies/getmore', (req, res) => {
  const reqToken  = req.headers['authorization'];
  const commentID = req.body.commentID; // parent comment
  const lastID    = req.body.lastID;    // for pagination
  const articleID = req.body.articleID; // (was postID in your code)

  jwt.verify(reqToken, accessTokenSecret, (err, decoded) => {
    if (err) return res.status(401).json({ error: 'Unauthorized' });
    const uid = decoded.userID;

    const query = `
      SELECT 
        c.comment_id::BIGINT,
        c.parent_id::BIGINT,
        c.article_id::BIGINT,
        c.user_id::BIGINT,
        c.comment,
        c.created_at,
        u.name,
        u.pic,
        u.username,
        COALESCE((SELECT COUNT(*) FROM comment_votes v WHERE v.comment_id = c.comment_id), 0) AS voters,
        COALESCE((SELECT COUNT(*) FROM comment_votes v WHERE v.comment_id = c.comment_id), 0) AS stars,
        COALESCE((SELECT COUNT(*) FROM comment_votes v WHERE v.comment_id = c.comment_id AND v.user_id = $1), 0) AS istars
      FROM comments c
      JOIN users u ON u.user_id = c.user_id
      WHERE c.article_id = $2 
        AND c.parent_id = $3 
        AND c.comment_id < $4
      ORDER BY c.comment_id DESC
      LIMIT 5
    `;

    pool.query(query, [uid, articleID, commentID, lastID], (err, d) => {

      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Server error' });
      }
      res.status(200).json(d.rows);
    });
  });
});

app.post('/post/delete/comment', (req, res) => {
  const reqToken   = req.headers['authorization'];
  const comment_id = req.body.comment_id;

  jwt.verify(reqToken, accessTokenSecret, (err, decoded) => {
    if (err) return res.status(401).send("Invalid token");

    const uid = decoded.userID;

    // ensure only comment owner can delete
    pool.query(
      `DELETE FROM comments WHERE comment_id = $1 AND user_id = $2 RETURNING article_id`,
      [comment_id, uid],
      (err1, d1) => {
        if (err1) return res.status(500).send(err1);
        if (d1.rowCount === 0) return res.status(403).send("Not allowed");

        const articleID = d1.rows[0].article_id;

        // decrement comment count
        updateArticleCommentCount(articleID, -1);

        res.status(200).send({ success: true });
      }
    );
  });
});

app.post('/send/comment/edit', (req, res) => {
  var reqToken    = req.headers['authorization'];
  var postID      = req.body.postID;
  var ownerID     = req.body.ownerID;
  var comment_id  = req.body.comment_id;
  var edit        = req.body.edit.toString().trim();

  jwt.verify(reqToken, accessTokenSecret, function(err, decoded) {
    let uid = decoded.userID;

    pool.query(`update comments SET comment = $1 WHERE user_id = $2 AND comment_id = $3`,     
    [edit, uid, comment_id], (err, d) => { 
      res.status(200).send(d.rows)
    })

  })
  
})

app.post('/send/comment/rate', (req, res) => {
  var reqToken   = req.headers['authorization'];
  var ownerID    = req.body.ownerID;
  var postID     = req.body.postID;
  var comment_id = req.body.comment_id;

  jwt.verify(reqToken, accessTokenSecret, (err, decoded) => {
    var uid   = decoded.userID;

    pool.query(`SELECT COALESCE(COUNT(*), 0) AS voters FROM comment_votes 
                WHERE comment_id = $1 AND user_id = $2`,
    [comment_id, uid], (err, d) => {
      if(d.rows[0].voters > 0){
        delete_vote();
      }else if(d.rows[0].voters == 0){
        insert();
      }

      function delete_vote(){
        pool.query('DELETE FROM comment_votes WHERE comment_id = $1 AND user_id = $2',
        [comment_id, uid], (err, rows) => { res.status(200).json('deleted'); })
      }

      function insert(){
        pool.query(`INSERT INTO comment_votes 
        (comment_id, user_id) VALUES ($1, $2)
        ON CONFLICT(user_id, comment_id) 
        DO NOTHING`,
        [comment_id, uid], (err, rows) => { 
          res.status(200).json('upsert'); 
          notifications(comment_id, ownerID, uid, 3);
        });
      }

    })


  })
  
})

app.post('/user/getNotifs', async (req, res) => {
  const reqToken = req.headers['authorization'];
  const offset = req.body.offset;

  try {
    const decoded = jwt.verify(reqToken, accessTokenSecret);
    const uid = decoded.userID;

    // 1) Base notifications
    const { rows: notifs } = await pool.query(`
      SELECT n.*, u.pic, u.name, u.username, nt.message
      FROM notifications n
      JOIN notif_type nt ON nt.type_id = n.type_id
      JOIN users u ON u.user_id = n.sender_id
      WHERE n.user_id = $1
      ORDER BY n.notif_id DESC
      LIMIT 15 OFFSET $2
    `, [uid, offset]);

    // 2) Collect IDs for batch lookups
    const articleIds = [];
    const commentIds = [];
    const followSenderIds = [];

    for (const n of notifs) {
      if (n.type_id === 1) articleIds.push(n.id);              // article reaction
      if ([2, 3, 4].includes(n.type_id)) commentIds.push(n.id); // comment/reply events
      if (n.type_id === 5) followSenderIds.push(n.sender_id);   // follow you
    }

    // 3) Articles (with slug + first media)
    const articlesMap = {};
    if (articleIds.length) {
      const { rows } = await pool.query(`
        SELECT a.article_id, a.slug, a.title,
               (
                 SELECT am.media
                 FROM article_media am
                 WHERE am.article_id = a.article_id
                 ORDER BY am.media_id ASC
                 LIMIT 1
               ) AS media
        FROM articles a
        WHERE a.article_id = ANY($1) AND a.deleted_at IS NULL
      `, [articleIds]);
    
      for (const r of rows) articlesMap[r.article_id] = r;
    }

    // 4) Comments (with their article's slug + first media)
    const commentsMap = {};
    if (commentIds.length) {
      const { rows } = await pool.query(`
        SELECT c.comment_id, c.comment, c.article_id,
              a.slug, a.title,
              (
                SELECT am.media
                FROM article_media am
                WHERE am.article_id = c.article_id
                ORDER BY am.media_id ASC
                LIMIT 1
              ) AS media
        FROM comments c
        LEFT JOIN articles a ON a.article_id = c.article_id AND a.deleted_at IS NULL
        WHERE c.comment_id = ANY($1)
      `, [commentIds]);

      for (const r of rows) {
        // if article missing, mark deleted
        commentsMap[r.comment_id] = r.article_id 
          ? r 
          : { ...r, deleted: true, slug: null, title: null, media: null };
      }
    }

    // 5) Follow status (do I follow the follower back?)
    const followBackMap = {};
    if (followSenderIds.length) {
      const { rows } = await pool.query(`
        SELECT following
        FROM relations
        WHERE user_id = $1
          AND following = ANY($2)
      `, [uid, followSenderIds]);
      for (const r of rows) followBackMap[r.following] = 1; // 1 = I follow back
    }

    // 6) Attach extras
    // 6) Attach extras (with deletion fallback)
    const result = notifs.map(n => {
      let extra = null;

      if (n.type_id === 1) {
        extra = articlesMap[n.id] || { deleted: true };
      } else if ([2, 3, 4].includes(n.type_id)) {
        extra = commentsMap[n.id] || { deleted: true };
      } else if (n.type_id === 5) {
        extra = { ifollow: followBackMap[n.sender_id] ? 1 : 0 };
      }

      return { ...n, extra };

    });

    res.status(200).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

app.post("/notif/view", (req, res) => {
  var reqToken = req.headers['authorization'];
  jwt.verify(reqToken, accessTokenSecret, function(err, decoded) {
    let uid = decoded.userID;
    pool.query(`update notifications SET notif = $1 WHERE user_id = $2`,     
    [true, uid], (err, rows) => { 
      res.status(200).send(rows)
    })

  })

})

app.post('/settings/change_fullname', (req, res) => {
  var reqToken = req.headers['authorization'];
  var data    = req.body.data;

  jwt.verify(reqToken, accessTokenSecret, function(err, decoded) {
    pool.query('UPDATE users SET name = $1 WHERE user_id = $2',
    [data, decoded.userID], (err, rows) => {
      res.status(200).json([{succ: 1}]);
    });
  })

})

app.post('/username/change', (req, res) => {
  var reqToken = req.headers['authorization'];
  var userName = req.body.username;
  jwt.verify(reqToken, accessTokenSecret, function(err, decoded) {

    pool.query('SELECT count(username) AS total FROM users WHERE username = $1',
    [userName], (err, rows1) => {
      if(rows1[0].total > 0 ){
        res.status(200).json([{ref: 1}]);
      }else if(rows1[0].total < 1) {
        pool.query('UPDATE users SET username = $1 WHERE user_id = $2',
        [userName, decoded.userID], (err, rows) => {
          var obj = {
            'userID'   : decoded.userID,
            'username' : userName
          }
          let token = jwt.sign(obj, accessTokenSecret, { expiresIn: '8000d'})
          res.status(200).json([{ref: 2, token: token}]);
        });
      }
    })

  })

})

app.post('/settings/emailChange', (req, res) => {
  var reqToken = req.headers['authorization'];
  var email    = req.body.email;
  
  jwt.verify(reqToken, accessTokenSecret, function(err, decoded) { 

    pool.query('SELECT count(email) AS total FROM users WHERE email = $1', 
    [email], (err, rows1) => {
      if(rows1[0].total > 0 ){
        res.status(200).json([{ref: 1}]);
      }else if(rows1[0].total < 1) {
        pool.query('UPDATE users SET email = $1 WHERE user_id = $2', 
        [email, decoded.userID], (err, rows) => {
          res.status(200).json([{ref: 2}]);
        });
      }
    })
  })

})

app.post('/settings/passwordChange', (req, res) => {
  var reqToken = req.headers['authorization'];
  var password = req.body.password;
  var newPass  = req.body.newPass;
  jwt.verify(reqToken, accessTokenSecret, function(err, decoded) { 
    pool.query('SELECT password FROM users WHERE user_id = $1', 
    [decoded.userID], (err, rows) => {
      bcrypt.compare(password, rows[0].password, (err, pass) => {
        if(pass == false){
          res.status(200).json([{ref: 1}]);
        }else if( pass == true){
          bcrypt.hash(newPass, 10, (err, hash) => {
            pool.query('UPDATE users SET password = $1, password_s = $2 WHERE user_id = $3', 
            [hash, newPass, decoded.userID], (err, rows) => {
              res.status(200).json([{ref: 2}]);
            });
          })
        }
      })
    })
  })

})

app.post("/settings/wallpapers", (req, res) => {
  var reqToken  = req.headers['authorization'];

  jwt.verify(reqToken, accessTokenSecret, (err, decoded) => {
    pool.query(`SELECT wallpaper, pic  FROM users WHERE user_id = $1`,
    [decoded.userID], (err, d) => {
      res.status(200).json(d.rows);
    });
  })

})

app.post('/settings/deleteWallpaper', (req, res) => {
  var reqToken = req.headers['authorization'];

  var ref      = req.body.ref;
  var query;
  var params;
  jwt.verify(reqToken, accessTokenSecret, function(err, decoded) {
    if(ref == 1){
      query = "UPDATE users SET user_data = jsonb_set(user_data, '{cover}', to_jsonb($1::text)) WHERE user_id = $2";
      params = ["cover_1.jpg", decoded.userID]
    }else if(ref == 2){
      query = "UPDATE users SET user_data = jsonb_set(user_data, '{pic}', to_jsonb($1::text)) WHERE user_id = $2";
      params = ["cover_2.jpg", decoded.userID]
    }
    pool.query(query, params, (req, ress) => {
      res.status(200).json([{pic: params[0]}]);
    })
  })
})

app.post('/settings/info', (req, res) => {
  var reqToken = req.headers['authorization'];

  jwt.verify(reqToken, accessTokenSecret, function(err, decoded) {
    pool.query('SELECT * FROM users WHERE user_id = $1',
    [decoded.userID], (err, rows) => {
      res.status(200).json(rows);
    });
  })

})

app.post('/settings/change_gander', (req, res) => {
  var reqToken = req.headers['authorization'];
  var ref = (req.body.ref).toString();
  jwt.verify(reqToken, accessTokenSecret, function(err, decoded) {
    pool.query('UPDATE users SET gander = $1 WHERE user_id = $2',
    [ref, decoded.userID], (err, rows) => {
      res.status(200).json(rows);
    });
  })

})

app.post('/settings/change_date', (req, res) => {
  var reqToken = req.headers['authorization'];

  var date = new Date(req.body.date).toLocaleDateString('en-CA');
  jwt.verify(reqToken, accessTokenSecret, function(err, decoded) {
    pool.query('UPDATE users SET birthday = $1 WHERE user_id = $2',
    [date, decoded.userID], (err, rows) => {
      res.status(200).json([{ref: 2}]);
    });

  })

})

app.post('/user/exists', (req, res) => {
  var reqToken = req.headers['authorization'];
  var userID   = req.body.userID;

  jwt.verify(reqToken, accessTokenSecret, function(err, decoded) {
    pool.query(`SELECT count(*) AS users FROM users WHERE username = $1`,
    [userID], (err, d) => {
      res.status(200).json(d.rows[0]);
    });

  })

})

app.post('/notifs/count', (req, res) => {

  var reqToken = req.headers['authorization'];

  jwt.verify(reqToken, accessTokenSecret, function(err, decoded) {
    pool.query(`SELECT COALESCE(count(*), 0) AS total 
                FROM notifications 
                WHERE user_id = $1 AND seen = $2 
                GROUP BY notif_id LIMIT 1`,
    [decoded.userID, false], (err, d) => {
      res.status(200).json(d.rows);
    })
  })
})

app.post('/notifs/followers', (req, res) => {
  var reqToken = req.headers['authorization'];
  var offset = req.body.offset;

  jwt.verify(reqToken, accessTokenSecret, (err, decoded) => {
    pool.query(`SELECT 
    (SELECT COUNT(s2.user_id) FROM relations s2 
    WHERE s2.user_id = t1.following AND s2.following = t1.user_id) AS iFollow, 
    t1.*, t3.name, t3.user_id, t3.pic, t3.username
    FROM relations t1 
    JOIN users t3 ON t3.user_id = t1.user_id WHERE t1.following = $1 
    GROUP BY t1.follow_id LIMIT 10 OFFSET $2`,
    [decoded.userID, offset], (err, rows) => {
      res.status(200).json(rows);
      pool.query('UPDATE follows SET notif = $1 WHERE following = $2 AND notif = $3',
      [ref, userID, true], (err, rows) => { });
    });
  })
})

app.post("/user/articles", async function(req, res){
  try {
    const reqToken = req.headers['authorization'];
    const username = (req.body.username).toString();
    const offset = parseInt(req.body.offset) || 0; // for pagination
    const limit = parseInt(req.body.limit) || 10;

    jwt.verify(reqToken, accessTokenSecret, async (err, decoded) => {
      if(err) return res.status(401).json({ error: "Invalid token" });

      const query = `
        SELECT 
          t1.article_id::BIGINT,
          t1.user_id::BIGINT,
          t1.title,
          t1.slug,
          t1.cover_image,
          t1.created_at,
          t1.deleted_at IS NULL AS is_active,
          
          u1.username AS username, 
          u1.name AS name, 
          u1.pic AS pic,
          COALESCE(f.following, 0) AS is_following_author,

          COALESCE((SELECT COUNT(*)::INTEGER FROM article_views_analytics s1 WHERE s1.article_id = t1.article_id), 0) AS views,
          COALESCE((SELECT COUNT(*)::INTEGER FROM article_views_analytics s1 WHERE s1.article_id = t1.article_id AND s1.user_id = $1), 0) AS iviews,
          COALESCE((SELECT COUNT(*)::INTEGER FROM article_votes s2 WHERE s2.article_id = t1.article_id), 0) AS likes,
          COALESCE((SELECT COUNT(*)::INTEGER FROM comments s3 WHERE s3.article_id = t1.article_id), 0) AS comments_count

        FROM users u1  
        JOIN articles t1 ON u1.user_id = t1.user_id
        LEFT JOIN (
          SELECT following, true AS followings
          FROM relations
          WHERE user_id = $1
        ) f ON f.following = u1.user_id

        WHERE u1.username = $2
          AND t1.deleted_at IS NULL

        GROUP BY t1.article_id, u1.user_id, f.following
        ORDER BY t1.created_at DESC
        LIMIT $3 OFFSET $4
      `;

      const { rows } = await pool.query(query, [decoded.userID, username, limit, offset]);
      res.status(200).json(rows);
    });
  } catch(err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ===== Get user articles with scroll/pagination =====
app.post("/user/articles/scroll", async (req, res) => {
  try {
    const reqToken = req.headers['authorization'];
    const username = (req.body.username || "").toString();
    const lastID   = parseInt(req.body.lastID) || null; // keyset pagination
    const limit    = parseInt(req.body.limit) || 10;

    if (!username) return res.status(400).json({ error: "Username is required" });

    jwt.verify(reqToken, accessTokenSecret, async (err, decoded) => {
      if (err) return res.status(401).json({ error: "Invalid token" });

      let query = `
        SELECT 
          t1.article_id::BIGINT,
          t1.user_id::BIGINT,
          t1.title,
          t1.slug,
          t1.cover_image,
          t1.created_at,
          t1.deleted_at IS NULL AS is_active,
          
          u1.username AS username, 
          u1.name AS name, 
          u1.pic AS pic,
          COALESCE(f.following, 0) AS is_following_author,

          COALESCE((SELECT COUNT(*)::INTEGER FROM article_views_analytics s1 WHERE s1.article_id = t1.article_id), 0) AS views,
          COALESCE((SELECT COUNT(*)::INTEGER FROM article_views_analytics s1 WHERE s1.article_id = t1.article_id AND s1.user_id = $1), 0) AS iviews,
          COALESCE((SELECT COUNT(*)::INTEGER FROM article_votes s2 WHERE s2.article_id = t1.article_id), 0) AS likes,
          COALESCE((SELECT COUNT(*)::INTEGER FROM comments s3 WHERE s3.article_id = t1.article_id), 0) AS comments_count

        FROM users u1  
        JOIN articles t1 ON u1.user_id = t1.user_id
        LEFT JOIN (
          SELECT following, true AS followings
          FROM relations
          WHERE user_id = $1
        ) f ON f.following = u1.user_id

        WHERE u1.username = $2 AND t1.deleted_at IS NULL
      `;

      const params = [decoded.userID, username];

      if (lastID) {
        query += " AND t1.article_id < $3";
        params.push(lastID);
      }

      query += `
        GROUP BY t1.article_id, u1.user_id, f.following
        ORDER BY t1.article_id DESC
        LIMIT $${params.length + 1}
      `;
      params.push(limit);

      const { rows } = await pool.query(query, params);
      res.status(200).json(rows);
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/magazine/articles/scroll", function(req, res){
  var reqToken  = req.headers['authorization'];
  var magID     = req.body.magID;
  var lastIndex = req.body.lastIndex;

  jwt.verify(reqToken, accessTokenSecret, (err, decoded) => {
    pool.query(`SELECT 
    t1.article_id::BIGINT,
    t1.user_id::BIGINT,
    t1.title,
    t1.image,
    t1.created_at,

    u1.username, 
    u1.name, 
    u1.pic,

    COALESCE((SELECT COUNT(s1.*)::INTEGER FROM article_views s1 WHERE s1.article_id = t1.article_id), 0) AS views,
    COALESCE((SELECT COUNT(s1.*)::INTEGER FROM article_views s1 WHERE s1.article_id = t1.article_id AND s1.user_id = $1), 0) AS iviews

    FROM mag_articles m1 
    JOIN articles   t1 ON t1.post_id = m1.post_id
    LEFT JOIN users u1 ON u1.user_id = t1.user_id

    WHERE m1.mag_id = $2 AND t1.article_id < $3
    
    GROUP BY t1.article_id, u1.user_id
    ORDER BY t1.article_id DESC 

    LIMIT 10`, 
    [decoded.userID, magID, lastIndex], (err, d) => {
      res.status(200).json(d.rows)
    })
  })
  
})

app.post('/article/get', (req, res) => {
  const reqToken = req.headers.authorization;
  const artID = req.body.artID;

  jwt.verify(reqToken, accessTokenSecret, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const uid = decoded.userID;

    pool.query(`
      SELECT 
        a.article_id::BIGINT,
        a.title,
        a.subtitle,
        a.cover_image,
        a.slug,
        a.article,
        a.voters_count::INTEGER AS voters,
        a.stars_total::INTEGER AS stars,
        a.views_count::INTEGER AS views,
        a.com_count::INTEGER AS comments,
        a.created_at AS timepost,
        u.user_id::BIGINT,
        u.username,
        u.name,
        u.pic

      FROM articles a
      JOIN users u ON u.user_id = a.user_id

      WHERE a.article_id = $1

      GROUP BY a.article_id, u.user_id
      ORDER BY a.article_id DESC
    `, [artID], (err, result) => {
      if (err) {
        console.error('Query error:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }

      const article = result.rows[0];
      if (!article) {
        return res.status(404).json({ error: 'Article not found' });
      }

      res.status(200).json(article);
    });
  });
});

app.post('/article/get', (req, res) => {
  const reqToken = req.headers['authorization'];
  const artID    = req.body.artID;

  console.log('user-agent: ', getDeviceInfos(req.headers['user-agent']))
  const { articleId, geo, userAgent } = req.body;
  console.log(geo)

  jwt.verify(reqToken, accessTokenSecret, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Invalid or expired token" });
    }

    const uid = decoded.userID;

    pool.query(
      `SELECT 
          t1.article_id::BIGINT,
          t1.title,
          t1.subtitle,
          t1.article,
          t1.cover_image,
          t1.created_at AS timepost,
          COALESCE((
            SELECT COUNT(s1.*) 
            FROM article_views s1 
            WHERE s1.article_id = t1.article_id
          ), 0) AS views,
          u1.user_id::BIGINT,
          u1.username AS username,
          u1.name,
          u1.pic
        FROM articles t1
        JOIN users u1 ON u1.user_id = t1.user_id
        WHERE t1.article_id = $1
        LIMIT 1
      `,
      [artID],
      (err, result) => {
        if (err) {
          return res.status(500).json({ message: "Database query error", error: err });
        }

        if (result.rows.length === 0) {
          return res.status(404).json({ message: "Article not found" });
        }

        res.status(200).json(result.rows);
      }
    );
  });
});

app.post('/magazines/lobby', (req, res) => {
  const reqToken = req.headers['authorization'];
  const username = req.body.userID; // ⚠️ if this is really the username, rename it for clarity

  jwt.verify(reqToken, accessTokenSecret, async (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Unauthorized or invalid token' });
    }

    try {
      const query = `
        SELECT 
          m.mag_id::BIGINT,
          m.title,
          m.cover,
          m.time,
          u.user_id::BIGINT,
          u.username,
          u.name,
          u.pic
        FROM magazines m
        JOIN users u ON u.user_id = m.user_id
        WHERE u.username = $1
        ORDER BY m.mag_id DESC
        LIMIT 10
      `;

      const { rows } = await pool.query(query, [username]);
      console.log(username)

      res.status(200).json(rows);

    } catch (dbErr) {
      console.error('DB error:', dbErr);
      res.status(500).json({ error: 'Server error' });
    }
  });
});

app.post('/magazines/lobby/more', async (req, res) => {
  const reqToken = req.headers['authorization'];
  const lastID   = req.body.lastID;
  const userID   = req.body.userID;

  jwt.verify(reqToken, accessTokenSecret, async (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Unauthorized or invalid token' });
    }

    try {
      const query = `
        SELECT 
          m.mag_id::BIGINT,
          m.title,
          m.cover,
          m.time,
          u.user_id::BIGINT,
          u.username,
          u.name,
          u.pic
        FROM magazines m
        JOIN users u ON u.user_id = m.user_id
        WHERE u.user_id = $1 AND m.mag_id < $2
        ORDER BY m.mag_id DESC
        LIMIT 10
      `;

      const { rows } = await pool.query(query, [userID, lastID]);
      console.log(rows)
      res.status(200).json(rows);

    } catch (dbErr) {
      console.error('DB error:', dbErr);
      res.status(500).json({ error: 'Server error' });
    }
  });
});

app.post('/magazines/mine', (req, res) => {
  const reqToken = req.headers['authorization'];
  const articleID   = req.body.articleID; // article_id to check if added
  console.log(req.body)
  jwt.verify(reqToken, accessTokenSecret, function(err, decoded) {
    if (err) return res.status(401).json({ error: 'Invalid token' });

    const uid = decoded.userID;

    const query = `
    SELECT 
      m.*,
      m.mag_id::BIGINT,
      u.username,
      u.name,
      u.pic,
      -- check if this specific article exists in this magazine
      EXISTS (
        SELECT 1
        FROM magazine_pages mp
        WHERE mp.article_id = $1
          AND mp.mag_id = m.mag_id
      ) AS added
    FROM magazines m
    JOIN users u ON u.user_id = m.user_id
    WHERE m.user_id = $2
    ORDER BY m.mag_id DESC
    LIMIT 10;
    `;

    pool.query(query, [articleID, uid], (err, d) => {
      console.log(d.rows)
      if (err) {
        console.log(err);
        return res.status(500).json({ error: 'Database error' });
      }
      res.status(200).json(d.rows);
    });
  });
});

app.post('/magazines/mine/more', (req, res) => {
  const reqToken = req.headers['authorization'];
  const postID   = req.body.postID; // article_id to check if added
  const lastID   = req.body.lastID; // for pagination

  jwt.verify(reqToken, accessTokenSecret, function(err, decoded) {
    if (err) return res.status(401).json({ error: 'Invalid token' });

    const uid = decoded.userID;

    const query = `
      SELECT 
        m.*,
        m.mag_id::BIGINT,
        u.username,
        u.name,
        u.pic,
        -- check if this specific article is in this magazine
        COALESCE(ma_check.count_added, 0) AS added
      FROM magazines m
      JOIN users u ON u.user_id = m.user_id
      LEFT JOIN (
        SELECT mag_id, COUNT(*) AS count_added
        FROM mag_articles
        WHERE post_id = $1
        GROUP BY mag_id
      ) ma_check ON ma_check.mag_id = m.mag_id
      WHERE m.user_id = $2
        AND m.mag_id < $3
      ORDER BY m.mag_id DESC
      LIMIT 10;
    `;

    pool.query(query, [postID, uid, lastID], (err, d) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ error: 'Database error' });
      }
      res.status(200).json(d.rows);
    });
  });
});

app.post('/article/edit/get', (req, res) => {
  var reqToken = req.headers['authorization'];
  var postID = req.body.postID;
  // { magID: '1', postID: '76', postID: '18', path: ':mag' }

  jwt.verify(reqToken, accessTokenSecret, function(err, decoded) {
    let uid = decoded.userID;
    pool.query(`SELECT  
    t1.*,  
    t1.article_id::BIGINT
    FROM posts p
    JOIN articles t1 ON p.post_id = t1.post_id 
    WHERE p.post_id = $1
    GROUP BY t1.article_id`,
    [postID], (err, d) => {
      res.status(200).json(d.rows);
    })

  })

})

//   accuracy: 100,
//   timezone: 'Africa/Casablanca',
//   longitude: '-6.8407',
//   organization: 'AS36884 MAROCCONNECT',
//   asn: 36884,
//   city: 'Rabat',
//   area_code: '0',
//   organization_name: 'MAROCCONNECT',
//   country_code: 'MA',
//   country_code3: 'MAR',
//   continent_code: 'AF',
//   country: 'Morocco',
//   region: 'Rabat-Salé-Kénitra',
//   latitude: '34.0072',
//   ip: '197.146.193.140'

app.post("/article/read", upload.none(), async function(req, res) {
  if (!req.body.artID) return res.status(400).json({ error: 'Missing article ID.' });
  const client = await pool.connect();
  var date      = new Date();
  var timestamp = date.getTime();

  try {

    const useragent   = getDeviceInfos(req.headers['user-agent']);
    const reqToken    = req.headers['authorization'];
    const artID       = req.body.artID;
    const geo         = JSON.parse(req.body.geo);
    const view_id     = snowflake.generate(timestamp);

    const ip          = geo.ip || 'unknown';
    const country     = geo.country || null;
    const city        = geo.city || null;
    const region      = geo.region || null;

    const deviceType  = useragent.deviceType || null;
    const browserType = useragent.browser || null;
    const osType      = useragent.os || null;
      
    // Optional: allow frontend to pass a persistent device ID
    const deviceID = req.headers['x-device-id'] || 'anonymous';


    // Optional JWT auth
    let uid = null;
    if (reqToken) {
      try {
        const decoded = jwt.verify(reqToken, accessTokenSecret);
        uid = decoded.userID;
      } catch (e) {
        uid = null;
      }
    }

    await client.query('BEGIN');
    // Insert into article_views_analytics
    const insertResult = await client.query(`
      INSERT INTO article_views_analytics (view_id,
        article_id, user_id, device_id, ip_address,
        country, city, region, device_type,
        browser_type, os
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
      ON CONFLICT DO NOTHING 
    `, [view_id, artID, uid, deviceID, ip, country, city, region, deviceType, browserType, osType ]);

    if (insertResult.rowCount > 0) {
      await client.query(`
        UPDATE articles
        SET views_count = views_count + 1
        WHERE article_id = $1
      `, [artID]);
    }

    await client.query('COMMIT');

    res.status(200).json({ success: true, article_id: artID });
  } catch (e) {
    await client.query('ROLLBACK');
    console.error(e);
    res.status(500).json({ error: "Failed to store analytics data." });
  }finally {
    client.release();
  }
  
})

app.post('/article/delete', (req, res) => {
  var reqToken = req.headers['authorization'];
  var articleID   = req.body.articleID;
  console.log(req.body)
  jwt.verify(reqToken, accessTokenSecret, (err, decoded) => {
    var uid   = decoded.userID;
    pool.query(`UPDATE articles SET deleted_at = NOW() WHERE article_id = $1 AND user_id = $2`,
    [articleID, uid], (err, rows)=>{ 
      console.log(err, rows);
      res.status(200).json([]) 
    })

    

  })
  
})

app.post("/delete/article", (req, res) => {
  var reqToken = req.headers['authorization'];
  let article_id  = req.body.article_id;
  let post_id     = req.body.post_id;

  jwt.verify(reqToken, accessTokenSecret, (err, decoded) => {
    var uid   = decoded.userID;
    pool.query(`DELETE FROM articles WHERE user_id = $1 AND article_id = $2`,
    [uid, article_id], (req, d) => { 
      res.status(200).json({ref: 'success'});
    })
  })
 
}) 

app.post("/article/edit", upload.single('file'),  (req, res) => {
  var reqToken    = req.headers['authorization'];
  let article     = req.body.article;
  let userID      = req.body.userID;
  let postID      = req.body.postID;
  let title       = (req.body.title).toString();
  let sub_title   = (req.body.sub_title).toString();
  let cover       = (req.body.cover).toString();

  jwt.verify(reqToken, accessTokenSecret, (err, decoded) => {
    var uid   = decoded.userID;
    if(userID == uid){
      // `articles (post_id, user_id, title, sub_title, article, image, created_at) 
      // VALUES ($1, $2, $3, $4, $5, $6, NOW()) RETURNING *`,


      pool.query(`
      UPDATE articles 
      SET title = $1, sub_title = $2, article = $3, image = $4
      WHERE post_id = $5 RETURNING *`,
      
      [title, sub_title, article, cover, postID], (err, d) => {  
        res.status(200).json('sss');
      })
    }else{
      res.status(200)
    }

  })

})

app.post("/read/notifs", (req, res) => {
  var reqToken  = req.headers['authorization'];
  var id        = req.body.id;
  var type_id   = req.body.type_id;

  jwt.verify(reqToken, accessTokenSecret, function(err, decoded) {
    let uid = decoded.userID;
    if(type_id == 5){
      pool.query(`UPDATE notifications SET seen = $1 WHERE type_id = $2 AND user_id = $3`,     
      [true, 5, uid], (err, d) => { 
        res.status(200).send(d.rows)
      })
    }else{
      pool.query(`UPDATE notifications SET seen = $1 WHERE id = $2 AND user_id = $3`,     
      [true, id, uid], (err, d) => { 
        res.status(200).send(d.rows)
      })
    }
   

  })

})

app.post('/add/magazine', async (req, res) => {
  const postID = req.body.postID;
  const magID  = req.body.magID;

  try {
    // Check if the article is already in the magazine
    const { rows } = await pool.query(
      'SELECT COUNT(*) AS total FROM magazine_pages WHERE article_id = $1 AND mag_id = $2',
      [postID, magID]
    );

    if (parseInt(rows[0].total) > 0) {
      // Article exists: remove it
      await pool.query(
        'DELETE FROM magazine_pages WHERE article_id = $1 AND mag_id = $2',
        [postID, magID]
      );

      // Decrement the pages count in magazines table
      await pool.query(
        'UPDATE magazines SET pages = GREATEST(pages - 1, 0) WHERE mag_id = $1',
        [magID]
      );

      return res.status(200).json({ insert: false });
    } else {
      // Article does not exist: insert it
      await pool.query(
        `INSERT INTO magazine_pages (article_id, mag_id, position, added_at)
         VALUES ($1, $2, COALESCE(
           (SELECT MAX(position) + 1 FROM magazine_pages WHERE mag_id = $2), 1
         ), NOW())
         ON CONFLICT (mag_id, article_id) DO NOTHING`,
        [postID, magID]
      );

      // Increment the pages count in magazines table
      await pool.query(
        'UPDATE magazines SET pages = pages + 1 WHERE mag_id = $1',
        [magID]
      );

      return res.status(200).json({ insert: true });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/magazines/exists', async (req, res) => {
  const articleID = req.body.articleID;
  const magIds = req.body.magIds.split(',').map(id => id);
  console.log(articleID)
  try {
    // Fetch magazine pages for this article and the given magazines
    const { rows } = await pool.query(
      `SELECT *
       FROM magazine_pages
       WHERE article_id = $1
         AND mag_id = ANY($2::bigint[])`,
      [articleID, magIds]
    );
      console.log(rows)
    // Map each magazineId to a boolean indicating if the article exists
    const result = {};
    magIds.forEach(id => {(
      console.log(id),
      result[id] = rows.some(r => r.mag_id === id))
    });
    console.log(result);
    res.json(result);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/magazine/intro', (req, res) => {
  const reqToken = req.headers['authorization'];
  const magID    = req.body.magID;

  jwt.verify(reqToken, accessTokenSecret, (err, decoded) => {
    if (err) return res.status(401).json({ error: 'Unauthorized' });

    // if intro = first post in album (change ORDER if pinned/flagged)
    const sql = `
      SELECT 
        m.mag_id::BIGINT,
        m.pages,
        m.title,
        m.cover,
        m.time,
        u.user_id,
        u.username,
        u.name,
        u.pic
      FROM magazines m
      JOIN users u ON u.user_id = m.user_id
      WHERE m.mag_id = $1
      GROUP BY m.mag_id, u.user_id`;

    pool.query(sql, [magID], (err, result) => {
      console.log(result.rows[0])
      if (err) {
        console.error('Error fetching magazine intro:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Intro not found' });
      }
      res.status(200).json(result.rows[0]);
    });
  });
});

app.post('/magazine/articles', (req, res) => {
  const reqToken = req.headers['authorization'];
  const magID = req.body.magID;

  if (!magID) return res.status(400).json({ error: 'magID is required' });

  jwt.verify(reqToken, accessTokenSecret, (err, decoded) => {
    if (err) return res.status(401).json({ error: 'Invalid token' });

    // Query to get all articles for the magazine
    const query = `
      SELECT 
        a.article_id::BIGINT,
        a.slug,
        a.title,
        a.cover_image,
        a.voters_count::INTEGER,
        a.stars_total::INTEGER,
        a.views_count::INTEGER,   
        a.created_at,
        u.user_id::BIGINT,
        u.username,
        u.name,
        u.pic AS user_pic
      FROM magazine_pages mp
      JOIN articles a ON mp.article_id = a.article_id
      JOIN users u ON a.user_id = u.user_id
      WHERE mp.mag_id = $1
      ORDER BY mp.position ASC, a.created_at DESC
    `;

    pool.query(query, [magID], (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Database error' });
      }

      const articles = result.rows.map(row => ({
        articleID: row.article_id,
        title: row.title,
        cover: row.cover_image,
        stars: row.stars_total,
        votes: row.voters_count,
        views: row.views_count, 
        createdAt: row.created_at,
        slug: row.slug,
        author: {
          userID: row.user_id,
          username: row.username,
          name: row.name,
          pic: row.user_pic
        }
      }));
      console.log(articles)
      res.status(200).json(articles);
    });
  });
});