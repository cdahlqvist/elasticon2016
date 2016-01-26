#/bin/bash

INDEXNAME=$1
RUNTIMESTAMP=$2
ITERATIONS=$3
RUNID=$RUNTIMESTAMP\_$INDEXNAME

curl -XDELETE https://$ES_HOST1/shard* -u $ES_USER:$ES_PASSWORD

echo "\n"

for (( i = 1; i <= $ITERATIONS; i+= 1 ))
do
  $RANKIN_PATH/rankin -h $ES_HOST1 -c $ES_USER:$ES_PASSWORD -p https -r $RUNID\_index -i 0 -d 10 -f ./configs/$INDEXNAME\_index_2_5k.json -f ./config/cluster.json  -a 2  -D ./results
  
  curl https://$ES_HOST1/shard*/_optimize -u $ES_USER:$ES_PASSWORD

  echo "\n"

  sleep 5

  $RANKIN_PATH/rankin -h $ES_HOST1 -c $ES_USER:$ES_PASSWORD -p https -r $RUNID\_query -i 0 -d 3 -f ./configs/$INDEXNAME\_query.json -f ./configs/stats_retrieval.json  -f ./config/cluster.json -a 2  -D ./results
done
