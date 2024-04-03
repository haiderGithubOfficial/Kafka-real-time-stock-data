**Step:1** 
docker run -p 2181:2181 zookeeper

**Step:2**
**if using powershell then use this command
windows power shell command**

docker run -p 9092:9092 `
-e KAFKA_ZOOKEEPER_CONNECT=<PRIVATE_IP>:2181 `
-e KAFKA_ADVERTISED_LISTENERS=PLAINTEXT://<PRIVATE_IP>:9092 `
-e KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR=1 `
confluentinc/cp-kafka

**if using linux then use this command**
docker run -p 9092:9092 \
-e KAFKA_ZOOKEEPER_CONNECT=<PRIVATE_IP>:2181 \
-e KAFKA_ADVERTISED_LISTENERS=PLAINTEXT://<PRIVATE_IP>:9092 \
-e KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR=1 \
confluentinc/cp-kafka

where <PRIVATE_IP> = your wifi IPv4 address
