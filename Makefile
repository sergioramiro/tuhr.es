.PHONY: check test build install hooks typecheck

check: ## Verificación completa (tests + build)
	npm run check

test: ## Solo tests
	npm test

build: ## Solo build
	npm run build

typecheck: ## Typecheck de plantillas .astro (deuda: aún con errores)
	npx astro check

install: ## Instala dependencias tal cual el lockfile
	npm ci

hooks: ## Activa los hooks de git del repo
	git config core.hooksPath .githooks
	chmod +x .githooks/*
	@echo "Hooks activados desde .githooks/"
