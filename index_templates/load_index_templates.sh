curl -XPOST https://$ES_HOST/_template/shard_wn -u $ES_USER:$ES_PASSWORD -d @shard_wn.json
curl -XPOST https://$ES_HOST/_template/shard_nn -u $ES_USER:$ES_PASSWORD -d @shard_nn.json