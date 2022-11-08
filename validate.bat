@echo off
dir /b | findstr "\.zip$"> arquivoszip.txt

for /f %%s in (arquivoszip.txt) do call :validate %%s

:validate
	set /p trueHash=<%1.sha512
	certutil -hashfile %1 sha512 | findstr /v "^S | ^C" > temp
	set /p hashToVerify=<temp
	if %trueHash:~0,128% EQU %hashToVerify% (echo %1 Validado com sucesso!) else ( echo %1 Nao esta valido!)
 
