mkdir -p AutoPostGPT/src/{bot/{commands,handlers},config,db,services,utils} AutoPostGPT/tests
mkdir -p AutoPostGPT/logs
mkdir -p AutoPostGPT/backups
mkdir -p AutoPostGPT/src/api
mkdir -p AutoPostGPT/src/middleware
mkdir -p AutoPostGPT/src/db/models
mkdir -p AutoPostGPT/config
cd AutoPostGPT
npm init -y
touch .env
touch config/google-cloud-key.json