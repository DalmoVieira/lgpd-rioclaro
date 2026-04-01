#!/bin/bash
echo "--- LGPD Rio Claro - Deploy Automático ---"

# 1. Clonar repositório
if [ ! -d "lgpd-rioclaro" ]; then
  git clone https://github.com/DalmoVieira/lgpd-rioclaro.git
  cd lgpd-rioclaro
else
  cd lgpd-rioclaro
  git pull origin main
fi

# 2. Subir containers
echo "Construindo e iniciando containers..."
docker compose up -d --build

echo "Deploy finalizado! Sistema rodando em dvsinformaticarc.com"
docker compose ps
