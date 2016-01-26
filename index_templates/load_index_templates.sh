curl -XPOST https://$ES_HOST1/_template/shard_wn -u $ES_USER:$ES_PASSWORD -d @shard_wn.json
curl -XPOST https://$ES_HOST1/_template/shard_nn -u $ES_USER:$ES_PASSWORD -d @shard_nn.json
curl -XPOST https://$ES_HOST2/_template/shard_wn -u $ES_USER:$ES_PASSWORD -d @shard_wn.json
curl -XPOST https://$ES_HOST2/_template/shard_nn -u $ES_USER:$ES_PASSWORD -d @shard_nn.json