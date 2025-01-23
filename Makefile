# 定義
CONTRACT_DIR = ./contract
FRONTEND_DIR = ./frontend
SUPABASE_DIR = ./supabase

HARDHAT = bun hardhat
CONTRACT_NETWORK ?= localhost
BUN = bun
SUPABASE = supabase

.PHONY: help dev contract-compile contract-deploy contract-test frontend-dev frontend-build supabase-start supabase-migrate supabase-seed clean

help: ## 利用可能なコマンド一覧を表示
	@echo "Usage: make [COMMAND]"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

### 全体操作 ###
dev: ## 全体の開発環境を起動 (Hardhat Node, Next.js, Supabase)
	make supabase-start &
	make contract-node &
	make frontend-dev

clean: ## 全体のキャッシュとビルド成果物を削除
	rm -rf $(CONTRACT_DIR)/artifacts $(CONTRACT_DIR)/cache
	rm -rf $(FRONTEND_DIR)/.next $(FRONTEND_DIR)/node_modules
	rm -rf $(SUPABASE_DIR)/.supabase

### contract 操作 ###
contract-compile: ## スマートコントラクトをコンパイル
	cd $(CONTRACT_DIR) && $(HARDHAT) compile

contract-deploy: ## スマートコントラクトをデプロイ
	cd $(CONTRACT_DIR) && $(HARDHAT) run scripts/deploy.ts --network $(CONTRACT_NETWORK)

contract-interact: ## スマートコントラクトの操作
	cd $(CONTRACT_DIR) && $(HARDHAT) run scripts/interact.ts --network $(CONTRACT_NETWORK)

contract-simulation: ## スマートコントラクトのシミュレーション
	cd $(CONTRACT_DIR) && $(HARDHAT) run scripts/simulation.ts --network $(CONTRACT_NETWORK)

contract-test: ## スマートコントラクトのテストを実行
	cd $(CONTRACT_DIR) && $(HARDHAT) test

contract-node: ## Hardhat ノードを起動
	cd $(CONTRACT_DIR) && $(HARDHAT) node

### frontend 操作 ###
frontend-dev: ## Next.js 開発サーバーを起動
	cd $(FRONTEND_DIR) && $(BUN) dev

frontend-build: ## Next.js をビルド
	cd $(FRONTEND_DIR) && $(BUN) build

frontend-lint: ## フロントエンドのコードをリント
	cd $(FRONTEND_DIR) && $(BUN) lint

frontend-clean: ## フロントエンドのキャッシュ削除
	rm -rf $(FRONTEND_DIR)/.next $(FRONTEND_DIR)/node_modules

### supabase 操作 ###
supabase-start: ## Supabase ローカルデータベースを起動
	cd $(SUPABASE_DIR) && $(SUPABASE) start

supabase-migrate: ## Supabase マイグレーションを実行
	cd $(SUPABASE_DIR) && $(SUPABASE) db push

supabase-seed: ## Supabase シードデータを適用
	cd $(SUPABASE_DIR) && $(SUPABASE) db seed
