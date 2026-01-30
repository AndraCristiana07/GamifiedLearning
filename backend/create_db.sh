#! /usr/bin/bash 

rm -rf Migrations gamifiedlearning.db  

dotnet dotnet-ef database update

dotnet dotnet-ef migrations add init

dotnet dotnet-ef database update