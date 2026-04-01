@echo off
echo Inicializando Git...
git init
git add .
git commit -m "Initial commit: LGPD System Complete and Production Ready"
git branch -M main
git remote add origin https://github.com/DalmoVieira/lgpd-rioclaro
echo Enviando para o GitHub...
git push -u origin main
echo Pronto! Codigo no GitHub.
pause
