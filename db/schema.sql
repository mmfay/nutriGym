drop table if exists users cascade;
drop table if exists auth_sessions cascade;
drop table if exists weight cascade;
drop table if exists food cascade;
drop table if exists food_tracker cascade;
drop table if exists macro_goals cascade;
drop table if exists ai_daily_usage cascade;
drop table if exists recipe_items cascade;
drop table if exists recipes cascade;

-- Users table
create table if not exists users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,          -- unique email
    name VARCHAR(120) NOT NULL,                  -- full name
    password_hash TEXT NOT NULL,                 -- hashed password
	is_enabled BOOLEAN NOT NULL DEFAULT true,    -- whether user account is active
	is_sys_admin BOOLEAN NOT NULL DEFAULT false,
	email_verified BOOLEAN NOT NULL DEFAULT false,    -- whether user account has verified email
	email_verified_at TIMESTAMP NULL,                   -- when email was verified
    email_verification_token_hash TEXT NULL,            -- hashed verification token
    email_verification_expires_at TIMESTAMP NULL,       -- verification token expiration
    timezone VARCHAR(100) NOT NULL DEFAULT 'UTC', -- user timezone
    created_at TIMESTAMP DEFAULT NOW(),           -- record created timestamp

    CONSTRAINT chk_users_timezone
    CHECK (
        timezone IN (
            'America/Los_Angeles',
            'America/Denver',
            'America/Chicago',
            'America/New_York',
            'America/Phoenix',
            'America/Anchorage',
            'Pacific/Honolulu',
            'UTC',
            'Europe/London',
            'Europe/Paris',
            'Asia/Tokyo',
            'Australia/Sydney'
        )
    )
);

-- Sessions 
create table if not exists auth_sessions (
    id         text primary key,                                        -- opaque sid (e.g., nanoid)
    user_id    uuid not null references users(id) on delete cascade,    -- match users.id
    data       jsonb not null default '{}',                             -- tiny bag: roles, company_id
    created_at timestamptz not null default now(),
    expires_at timestamptz not null
);

create table if not exists weight (
	id					bigserial primary key,
    user_id 			uuid not null references users(id) on delete cascade,
    measured_at 		date not null,             
    weight 				numeric(6,2) not null,          
    unit 				text check (unit in ('lb','kg')) default 'lb',
    constraint 			uq_weight_user_date unique (user_id, measured_at)
);

create table if not exists food (
	id                bigserial primary key,
	name              text not null,            -- apple
	brand             text,                     -- generic or 'orchard ..'
	barcode           text unique,              -- optional (UPC/EAN)
	serving_size      numeric(7,2) not null default 0,
	serving_unit      text,
	serving_type      text not null,
	count_name        text,
	protein           numeric(7,2) not null default 0,
	carbs             numeric(7,2) not null default 0,
	fat               numeric(7,2) not null default 0,
	calories          numeric(7,2) not null default 0,  -- label calories, not computed
	created_at        timestamptz not null default now(),
	updated_at        timestamptz not null default now(),
	is_verified		  boolean not null default false,
	constraint chk_food_macros_nonneg
		check (
		protein >= 0 and carbs >= 0 and fat >= 0 and calories >= 0
		)
);

create table if not exists food_tracker (
	id                	bigserial primary key,
	meal 				int not null, 
	user_id             uuid not null references users(id) on delete cascade,
	food_id             bigserial not null references food(id),
	recorded_at         date not null,        
	carbs               numeric(6,2) not null, 
	fat                 numeric(6,2) not null,    
	protein             numeric(6,2) not null,   
	calories            numeric(6,2) not null,          
	serving_size        numeric(6,2) not null,
	serving_unit        text
);

create table if not exists macro_goals (
	id                	bigserial primary key,
    user_id 			uuid not null references users(id) on delete cascade,
    date_from 			date not null,   
    date_to 			date,     
    carbs 				numeric(6,2) not null, 
    fat 				numeric(6,2) not null,    
    protein 			numeric(6,2) not null,
    calories 			numeric(6,2) not null
);

CREATE OR REPLACE VIEW food_log_v AS
	SELECT
		ft.id,
		ft.user_id,
		ft.meal,
		CASE ft.meal
			WHEN 0 THEN 'breakfast'
			WHEN 1 THEN 'lunch'
			WHEN 2 THEN 'dinner'
			WHEN 3 THEN 'snack'
			ELSE 'unknown'
		END                      AS meal_name,
		ft.recorded_at,
		-- logged amounts (what the user actually tracked)
		ft.serving_size          AS serving_size,
		ft.serving_unit          AS serving_unit,
		ft.protein               AS protein,
		ft.carbs                 AS carbs,
		ft.fat                   AS fat,
		ft.calories              AS calories,

		-- food catalog details
		f.id                     AS food_id,
		f.name                   AS food_name,
		f.brand,
		f.barcode,
		f.serving_size           AS food_serving_size,
		f.serving_unit           AS food_serving_unit,
		f.protein                AS food_protein_per_serving,
		f.carbs                  AS food_carbs_per_serving,
		f.fat                    AS food_fat_per_serving,
		f.calories               AS food_calories_per_serving,

		-- how many label servings the logged serving represents
		CASE
			WHEN f.serving_size > 0 THEN ft.serving_size / f.serving_size
			ELSE NULL
		END                      AS servings_equivalent
		,f.is_verified
	FROM food_tracker ft
	JOIN food f ON f.id = ft.food_id;

create table if not exists recipes (
	id           bigserial primary key,
	user_id      uuid not null references users(id) on delete cascade,
	name         text not null,
	yield_size   numeric(7,2) not null,
	yield_unit   text not null,
	created_at   timestamptz not null default now()
);

create table if not exists recipe_items (
	id           bigserial primary key,
	recipe_id    bigint not null references recipes(id) on delete cascade,
	food_id      bigint not null references food(id),
	serving_size numeric(7,2) not null default 1,
	serving_unit text,
	protein      numeric(7,2) not null default 0,
	carbs        numeric(7,2) not null default 0,
	fat          numeric(7,2) not null default 0,
	calories     numeric(7,2) not null default 0
);

create table ai_daily_usage (
	user_id     		uuid not null,
	usage_date  		date not null,
	used_count  		int not null default 0,
	pending_count 		int not null default 0,
	updated_at  		timestamptz not null default now(),
	primary key (user_id, usage_date),
	check (used_count >= 0)
);

CREATE TABLE password_reset_tokens (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash text NOT NULL,
    expires_at timestamptz NOT NULL,
    used_at timestamptz NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);