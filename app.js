var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var _ = require('lodash');

app.use(bodyParser.json());

var feedback = function(){
  var storage = {};

  var store = function(item){
    storage[item] = storage[item] || 0;
    storage[item]++;
  };

  var retrieve = function(){
    var arr = [];
    _.each(storage, function(v,k){
      arr.push({feedback:k,num:v});
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
  var data = {'feedbacks':feedback.retrieve()};
  res.render('home', data);
});


app.use('/public', express.static('public'));


var questions = ["Speaking Too slow", "Speaking Too Fast", "Volume Too Quiet"];

app.get('/client', function (req, res){
 var data = {'questions': questions};
  res.render('client', data);
});

app.post('/question', function (req, res){
  questions.push(req.body.value);
  feedback.store(req.body.value);

  res.send('{location: "/client"}');
});

app.post('/feedback', function(req, res){
  console.log(req.body);
  feedback.store(req.body.value);
  res.send('saved');
});


var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Example app listening at http://%s:%s', host, port);
});
