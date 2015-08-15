var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var _ = require('lodash');

app.use(bodyParser.json());

var feedback = function(){
  var storage = {};

  var calcDecay = function(oldTime, nowTime){
    var age = (nowTime - oldTime)/10000;

    return (1 / (age + 1));
  };

  var sumDecay = function(arr){
    var nowTime = new Date();
    var sum = 0;
    _.each(
    arr,function(oldTime){
      sum += calcDecay(oldTime,nowTime);
    });
    return sum;
  };

  var store = function(item){
    storage[item] = storage[item] || [] ;
    storage[item].push(new Date());
  };

  var retrieve = function(){
    var arr = [];
    _.each(storage, function(v,k){
      arr.push({feedback:k,num:sumDecay(v)});
    });

    arr.sort(function(a,b){return b.num - a.num;});

    return arr;
  };

  return {
    store: store,
    retrieve: retrieve
  };
}();







var exphbs  = require('express-handlebars');

app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

app.get('/result', function (req, res) {
  res.render('result');
});

app.get('/result-json', function (req, res) {
  res.set('Content-Type', 'application/json');
  res.send(feedback.retrieve());
});


app.use('/public', express.static('public'));


var questions = { "speaking too slow":true, "speaking too fast":true, "volume too quiet":true};

app.get('/client', function (req, res){
 var data = {'questions': _.keys(questions)};
  res.render('client', data);
});

var filter = require('profanity-filter');
filter.setReplacementMethod('word');
filter.seed('profanity');
app.post('/question', function (req, res){
  var val = filter.clean(req.body.value.toLowerCase());
  questions[val] = true;
  feedback.store(val);

  res.send('ok');
});

app.post('/feedback', function(req, res){
  console.log(req.body);
  var val = req.body.value.toLowerCase();
  feedback.store(val);
  res.send('saved');
});


var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Example app listening at http://%s:%s', host, port);
});
