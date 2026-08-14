
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build

WORKDIR /src


COPY AssignmentManagement.Api/AssignmentManagement.Api.csproj AssignmentManagement.Api/


RUN dotnet restore AssignmentManagement.Api/AssignmentManagement.Api.csproj


COPY AssignmentManagement.Api/ AssignmentManagement.Api/

WORKDIR /src/AssignmentManagement.Api


RUN dotnet publish AssignmentManagement.Api.csproj \
    -c Release \
    -o /app/publish \
    --no-restore


FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final

WORKDIR /app

COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://+:8080

EXPOSE 8080

ENTRYPOINT ["dotnet", "AssignmentManagement.Api.dll"]