
echo "Start shard sizing tests"

TIMESTAMP=$(date +%s)
./run_single_shard_sizing_test_1.sh shard_wn_724 $TIMESTAMP 35
./run_single_shard_sizing_test_1.sh shard_nn_724 $TIMESTAMP 35

echo "Completed shard sizing tests"