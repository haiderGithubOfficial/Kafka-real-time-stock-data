View this readme file in code mode not in preview mode

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

**Step:3**
Set Kafka Environment variables
where KAFKA_PRIVATE_IP is same as your <PRIVATE_IP>
where KAFKA_PORT is your port where kafka is running 

KAFKA_PRIVATE_IP=172.17.0.1
KAFKA_PORT=9092

**Step:4**

npm install
npm start
