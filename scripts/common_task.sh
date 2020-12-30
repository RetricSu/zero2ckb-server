# below is some command script use in this project, including:
#   - a generate-password script to help make the website under limited access through nginx in development mode.
#   - a CKB dev-chain management script, to remove chain data and restart fresh at certain time.

# generate-username-password script, use in nginx
sudo sh -c "echo -n 'ckbee:' >> /etc/nginx/.webpasswd"
sudo sh -c "openssl passwd -apr1 stayhumble >> /etc/nginx/.webpasswd"

# CKB dev-chain management, use in crontab

## quick test: restart at every 1 min
*/1 * * * * ( (kill $(ps aux | grep '../ckb miner' | awk '{print $2}') >> /home/ubuntu/sites/learnCKB/chain/devnet/logs/ckb-kill-miner.log 2>&1 &); (sleep 1 && kill $(ps aux | grep '../ckb run' | awk '{print $2}') >> /home/ubuntu/sites/learnCKB/chain/devnet/logs/ckb-kill-run.log 2>&1 &); (sleep 2 && cd ~/sites/learnCKB/chain/devnet/ckb_v0.38.1_x86_64-unknown-linux-gnu/devnet && rm -rf data >> /home/ubuntu/sites/learnCKB/chain/devnet/logs/ckb-rm-data.log &) )
*/1 * * * * ( (sleep 5 && cd ~/sites/learnCKB/chain/devnet/ckb_v0.38.1_x86_64-unknown-linux-gnu/devnet && ../ckb run >> /home/ubuntu/sites/learnCKB/chain/devnet/logs/ckb-run.log 2>&1 &); (sleep 10 && cd ~/sites/learnCKB/chain/devnet/ckb_v0.38.1_x86_64-unknown-linux-gnu/devnet && ../ckb miner >> /home/ubuntu/sites/learnCKB/chain/devnet/logs/ckb-miner.log 2>&1 &) )

## longer test: restart at every 30 min
*/30 * * * * ( (kill $(ps aux | grep '../ckb miner' | awk '{print $2}') >> /home/ubuntu/sites/learnCKB/chain/devnet/logs/ckb-kill-miner.log 2>&1 &); (sleep 1 && kill $(ps aux | grep '../ckb run' | awk '{print $2}') >> /home/ubuntu/sites/learnCKB/chain/devnet/logs/ckb-kill-run.log 2>&1 &); (sleep 2 && cd ~/sites/learnCKB/chain/devnet/ckb_v0.38.1_x86_64-unknown-linux-gnu/devnet && rm -rf data >> /home/ubuntu/sites/learnCKB/chain/devnet/logs/ckb-rm-data.log &) )
*/30 * * * * ( (sleep 5 && cd ~/sites/learnCKB/chain/devnet/ckb_v0.38.1_x86_64-unknown-linux-gnu/devnet && ../ckb run >> /home/ubuntu/sites/learnCKB/chain/devnet/logs/ckb-run.log 2>&1 &); (sleep 10 && cd ~/sites/learnCKB/chain/devnet/ckb_v0.38.1_x86_64-unknown-linux-gnu/devnet && ../ckb miner >> /home/ubuntu/sites/learnCKB/chain/devnet/logs/ckb-miner.log 2>&1 &) )

## production restart at 13:00 pm everyday
0 13 * * * ( (kill $(ps aux | grep '../ckb miner' | awk '{print $2}') >> /home/ubuntu/sites/learnCKB/chain/devnet/logs/ckb-kill-miner.log 2>&1 &); (sleep 1 && kill $(ps aux | grep '../ckb run' | awk '{print $2}') >> /home/ubuntu/sites/learnCKB/chain/devnet/logs/ckb-kill-run.log 2>&1 &); (sleep 2 && cd ~/sites/learnCKB/chain/devnet/ckb_v0.38.1_x86_64-unknown-linux-gnu/devnet && rm -rf data >> /home/ubuntu/sites/learnCKB/chain/devnet/logs/ckb-rm-data.log &) )
0 13 * * * ( (sleep 5 && cd ~/sites/learnCKB/chain/devnet/ckb_v0.38.1_x86_64-unknown-linux-gnu/devnet && ../ckb run >> /home/ubuntu/sites/learnCKB/chain/devnet/logs/ckb-run.log 2>&1 &); (sleep 10 && cd ~/sites/learnCKB/chain/devnet/ckb_v0.38.1_x86_64-unknown-linux-gnu/devnet && ../ckb miner >> /home/ubuntu/sites/learnCKB/chain/devnet/logs/ckb-miner.log 2>&1 &) )