$RANKIN_PATH/rankin -h $ES_HOST -D ./results -r max_indexing_test_500_4 -c $ES_USER:$ES_PASSWORD -p https -f ./configs/shard_wn_724_index_max.json -i 0 -d 2
$RANKIN_PATH/rankin -h $ES_HOST -D ./results -r max_indexing_test_500_4 -c $ES_USER:$ES_PASSWORD -p https -f ./configs/shard_nn_724_index_max.json -i 0 -d 2
$RANKIN_PATH/rankin -h $ES_HOST -D ./results -r max_indexing_test_500_4 -c $ES_USER:$ES_PASSWORD -p https -f ./configs/shard_wn_286_index_max.json -i 0 -d 2
$RANKIN_PATH/rankin -h $ES_HOST -D ./results -r max_indexing_test_500_4 -c $ES_USER:$ES_PASSWORD -p https -f ./configs/shard_nn_286_index_max.json -i 0 -d 2