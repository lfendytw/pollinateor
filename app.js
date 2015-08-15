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


app.get('/', function (req, res) {
    res.send('Hello World! ' +
      JSON.stringify(feedback.retrieve(), null, 2));
});

app.use('/client', express.static('public'));

app.post('/feedback', function(req, res){
  console.log(req.body);
  feedback.store(req.body.value);
  res.send('saved');
})


var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Example app listening at http://%s:%s', host, port);
});
