var ogs = require('open-graph-scraper');

var Lokka = require('lokka').Lokka;
var Transport = require('lokka-transport-http').Transport;

var client = new Lokka({
  transport: new Transport('https://api.graph.cool/simple/v1/cipb111pw5fgt01o0e7hvx2lf', {Authorization: "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE0NzA1Nzc5MzcsImNsaWVudElkIjoiY2lvcTk1b2VjMDJrajAxbzBvbmpvcHBmOSIsInByb2plY3RJZCI6ImNpcGIxMTFwdzVmZ3QwMW8wZTdodngybGYiLCJzeXN0ZW1Ub2tlbklkIjoiY2lya280dXJtMG1udTAxMjRjMGgzZ3M0cyJ9.W_gizkkXVZ56hPqS9MZB6fzA5Ti15UP8q9pADoMEk60"})
});

module.exports = function (context, cb) {
  console.log(context)

  function fetchMetaData(url, cb) {
    ogs({'url': url}, function (err, results) {
    console.log('err:', err);
    console.log('results:', results);
      var metaData = {
        title: results.data.ogTitle || "n/a",
        image: results.data.ogImage || "n/a"
      }

      cb(metaData)
    });
  }

  fetchMetaData(context.data.createdNode.url, function(metaData) {
    client.mutate(`{
      setMetaInfo: updateLink(
        id: "${context.data.createdNode.id}",
        title: "${metaData.title}) {
          id
        }
    }`)
    .then(function(){
      cb(null, metaData)
    })
  })
}
