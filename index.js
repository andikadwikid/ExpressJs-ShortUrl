require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const validUrl = require('valid-url');
const shortId = require('shortid');
const mongoose = require('mongoose');
const bodyParser = require("body-parser");

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: "false" }));
app.use(bodyParser.json());
app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));
const uri = 'mongodb+srv://freecodecamp:W5F5hB5Tf6o5MROD@cluster0.zgrqfwt.mongodb.net/?retryWrites=true&w=majority'
mongoose.connect(uri, { useNewUrlParser: true })
  .then(result => {
    console.log('Connected to MongoDB');
  })
  .catch(err => console.log(err))

const Schema = mongoose.Schema;
const urlSchema = new Schema({
  original_url: String,
  short_url: String
});
const ShortUrl = mongoose.model("ShortURL", urlSchema);

const URL = mongoose.model("URL", urlSchema)

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function (req, res) {
  res.json({ greeting: 'hello API' });
});

app.post('/api/shorturl', async function (req, res) {
  const url = req.body.url
  const urlCode = shortId.generate()

  if (!validUrl.isWebUri(url)) {
    res.json({
      error: 'invalid url'
    })
  }
  else {

    try {

      let findURL = await URL.findOne({
        original_url: url
      })

      if (findURL) {
        res.json({
          original_url: findURL.original_url,
          short_url: findURL.short_url
        })
      }

      else {
        findURL = new URL({
          original_url: url,
          short_url: urlCode
        })

        await findURL.save()
        res.json({
          original_url: findURL.original_url,
          short_url: findURL.short_url
        })
      }

    }

    catch {
      console.log(err)
      res.json({
        error: 'Server Error_'
      })
    }

  }
})

app.get('/api/shorturl/:short_url', async function (req, res) {
  const short_url = req.params.short_url

  try {
    const find = await URL.findOne({ short_url: short_url })
    if (find) {
      res.redirect(find.original_url)
    }
    else {
      res.json({
        error: 'No URL found'
      })
    }
  }
  catch (err) {
    console.log(err)
    res.json({
      error: 'Server Error'
    })
  }
})


app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
