#/bin/bash

INDEXNAME=$1
RUNTIMESTAMP=$2
ITERATIONS=$3
RUNID="$RUNTIMESTAMP_$INDEXNAME"

curl -XDELETE https://$ES_HOST2/shard* -u $ES_USER:$ES_PASSWORD

for (( i = 1; i <= $ITERATIONS; i+= 1 ))
do
  $RANKIN_PATH/rankin -h $ES_HOST2 -c $ES_USER:$ES_PASSWORD -r $RUNID_index -i 0 -d 10 -f ./configs/$INDEXNAME_index_2.5k.json -a 2
  
  curl -XDELETE https://$ES_HOST2/shard*/_optimize -u $ES_USER:$ES_PASSWORD

  $RANKIN_PATH/rankin -h $ES_HOST2 -c $ES_USER:$ES_PASSWORD -r $RUNID_query -i 0 -d 3 -f ./configs/$INDEXNAME_query.json -f ./configs/stats_retrieval.json -a 2
done
