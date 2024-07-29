# var=$( [ "prod" != "prod" ] && echo "sit3.yml" || echo "prod.yml" )
# echo $var


echo $([ "prod" != "prod" ] && echo "sit3.yml" || echo "prod.yml")