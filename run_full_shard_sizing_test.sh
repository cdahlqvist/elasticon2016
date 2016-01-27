
echo "Start shard sizing tests"

TIMESTAMP=$(date +%s)
./run_single_shard_sizing_test_1.sh shard_wn_724 $TIMESTAMP 35
./run_single_shard_sizing_test_1.sh shard_nn_724 $TIMESTAMP 35
./run_single_shard_sizing_test_2.sh shard_wn_286 $TIMESTAMP 60
./run_single_shard_sizing_test_2.sh shard_nn_286 $TIMESTAMP 60

echo "Completed shard sizing tests"