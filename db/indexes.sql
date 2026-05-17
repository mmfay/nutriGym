-- auth_sessions
create index if not exists auth_sessions_user_idx    on auth_sessions(user_id);
create index if not exists auth_sessions_expires_idx on auth_sessions(expires_at);

-- weight
create unique index if not exists idx_weights_user_date on weight (user_id, measured_at)
    include (weight, unit);

-- food
create index if not exists idx_foods_barcode on food (barcode);

-- food_tracker
create index if not exists food_tracker_user_idx on food_tracker(user_id);

-- macro_goals
create index if not exists macro_goal_user_idx on macro_goals(user_id);

-- meals
create index if not exists idx_meals_user on meals(user_id);

-- password_reset_tokens
create index        if not exists idx_password_reset_tokens_user_id    on password_reset_tokens(user_id);
create index        if not exists idx_password_reset_tokens_expires_at  on password_reset_tokens(expires_at);
create unique index if not exists idx_password_reset_tokens_token_hash  on password_reset_tokens(token_hash);
