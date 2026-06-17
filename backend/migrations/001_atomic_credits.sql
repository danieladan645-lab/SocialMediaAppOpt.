-- Run once in Supabase SQL Editor (Dashboard → SQL Editor → New query → paste → Run)
-- Makes credit deduction and addition atomic so concurrent requests can't race.

CREATE OR REPLACE FUNCTION deduct_credit_atomic(p_user_id TEXT)
RETURNS INT
LANGUAGE plpgsql
AS $$
DECLARE
  v_new INT;
BEGIN
  UPDATE credits
    SET balance = GREATEST(balance - 1, 0)
  WHERE user_id = p_user_id
  RETURNING balance INTO v_new;
  RETURN COALESCE(v_new, 0);
END;
$$;

CREATE OR REPLACE FUNCTION add_credits_atomic(p_user_id TEXT, p_amount INT)
RETURNS INT
LANGUAGE plpgsql
AS $$
DECLARE
  v_new INT;
BEGIN
  INSERT INTO credits (user_id, balance)
  VALUES (p_user_id, p_amount)
  ON CONFLICT (user_id)
  DO UPDATE SET balance = credits.balance + EXCLUDED.balance
  RETURNING balance INTO v_new;
  RETURN COALESCE(v_new, 0);
END;
$$;
