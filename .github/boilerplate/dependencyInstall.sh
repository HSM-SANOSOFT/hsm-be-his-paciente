#!/bin/bash

# Add runtime dependencies
pnpm add class-validator@latest
pnpm add class-transformer@latest  
pnpm add dotenv@latest  
pnpm add @nestjs/microservices@latest  
pnpm add oracledb@latest 
pnpm add pg@latest 
pnpm add @nestjs/typeorm@latest typeorm@latest
pnpm add globals@latest  
pnpm add joi@latest  
pnpm add @hsm-sanosoft/hsm-database@latest

# Add dev dependencies
pnpm add -D @nestjs/config@latest  
pnpm add -D @nestjs/mapped-types@latest  
pnpm add -D @typescript-eslint/eslint-plugin@latest  
pnpm add -D @typescript-eslint/parser@latest  
pnpm add -D typescript-eslint@latest  
pnpm add -D @eslint/js@latest  
pnpm add -D eslint-config-prettier@latest  
pnpm add -D eslint-plugin-prettier@latest  
pnpm add -D eslint-plugin-simple-import-sort@latest  
pnpm add -D eslint-plugin-unused-imports@latest  
pnpm add -D prettier@latest  
pnpm add -D eslint@latest  
pnpm add -D @types/oracledb@latest

echo "✅ All packages installed successfully."
