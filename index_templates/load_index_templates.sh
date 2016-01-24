curl -XPOST http://$ES_HOST1/_template/shard_wn -u $ES_USER1:$ES_PASSWORD1 -d @shard_wn.json
curl -XPOST http://$ES_HOST1/_template/shard_nn -u $ES_USER1:$ES_PASSWORD1 -d @shard_nn.json
curl -XPOST http://$ES_HOST2/_template/shard_wn -u $ES_USER2:$ES_PASSWORD2 -d @shard_wn.json
curl -XPOST http://$ES_HOST2/_template/shard_nn -u $ES_USER2:$ES_PASSWORD2 -d @shard_nn.json