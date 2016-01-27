#/bin/bash

INDEXNAME=$1
RUNTIMESTAMP=$2
ITERATIONS=$3
RUNID=$RUNTIMESTAMP\_$INDEXNAME

curl -XDELETE https://$ES_HOST/shard* -u $ES_USER:$ES_PASSWORD

echo ""

for (( i = 1; i <= $ITERATIONS; i+= 1 ))
do
  $RANKIN_PATH/rankin -h $ES_HOST -c $ES_USER:$ES_PASSWORD -p https -r $RUNID\_index -i 0 -d 5 -f ./configs/$INDEXNAME\_index_5k.json -f ./configs/cluster.json -a 2 -D ./results
  
  curl https://$ES_HOST/shard*/_optimize -u $ES_USER:$ES_PASSWORD

  echo ""

  sleep 60

  $RANKIN_PATH/rankin -h $ES_HOST -c $ES_USER:$ES_PASSWORD -p https -r $RUNID\_query -i 0 -d 3 -f ./configs/$INDEXNAME\_query.json -f ./configs/stats_retrieval.json -f ./configs/cluster.json -a 2  -D ./results
done
