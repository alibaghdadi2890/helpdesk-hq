# Short commands for the course. Every target loads .env if it exists.
-include .env
export

.PHONY: up down db-migrate db-seed db-reset test typecheck dev build psql hello export-tickets close-solved

up:            ## Start PostgreSQL and Phoenix, and wait until the database is ready
	docker compose up -d --wait

down:          ## Stop the services (data is kept in a Docker volume)
	docker compose down

db-migrate:    ## Apply new files in migrations/ in order
	npm run db:migrate

db-seed:       ## Load the deterministic seed data
	npm run db:seed

db-reset:      ## Drop everything, migrate and seed again
	npm run db:reset

test:          ## Unit, integration and API tests against a real test database
	npm test

typecheck:
	npm run typecheck

dev:           ## Run the app on http://localhost:3000
	npm run dev

build:
	npm run build

psql:          ## Open psql as the table owner (sees every tenant)
	docker compose exec db psql -U helpdesk helpdesk

hello:         ## Exercise 0.4
	npm run hello

export-tickets: ## Regenerate data/tickets/*.json from the seeded database
	npm run data:export

close-solved:  ## Close tickets that have been solved for 7 days
	npm run jobs:close-solved
