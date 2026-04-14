@echo off
title IDP Core Academic Monitor 🎓
echo ==========================================
echo    IDP CORE ACADEMIC MONITOR v2.0
echo ==========================================
echo.

echo [1/3] Verificando dependencias...
python -m pip install -r requirements.txt --quiet

echo [2/3] Verificando arquivo .env...
if not exist .env (
    echo [!] Erro: Arquivo .env nao encontrado.
    echo [!] Por favor, renomeie o .env.example para .env e preencha suas chaves.
    pause
    exit
)

echo [3/3] Iniciando o Orquestrador...
echo.
python orchestrator.py

echo.
echo ==========================================
echo    Monitoramento concluido ou encerrado.
echo ==========================================
pause
