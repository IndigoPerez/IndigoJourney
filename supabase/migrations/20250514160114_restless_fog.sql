/*
  # Update RLS policies for sref_items table

  1. Security Changes
    - Enable RLS on sref_items table if not already enabled
    - Add policies for authenticated users to:
      - Insert their own items
      - View their own items
      - Update their own items
      - Delete their own items
*/

-- Enable RLS if not already enabled
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'sref_items' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE sref_items ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Policy for inserting new items
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'sref_items' 
    AND policyname = 'Users can insert their own items'
  ) THEN
    CREATE POLICY "Users can insert their own items"
    ON sref_items
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Policy for reading items
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'sref_items' 
    AND policyname = 'Users can view their own items'
  ) THEN
    CREATE POLICY "Users can view their own items"
    ON sref_items
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);
  END IF;
END $$;

-- Policy for updating items
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'sref_items' 
    AND policyname = 'Users can update their own items'
  ) THEN
    CREATE POLICY "Users can update their own items"
    ON sref_items
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Policy for deleting items
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'sref_items' 
    AND policyname = 'Users can delete their own items'
  ) THEN
    CREATE POLICY "Users can delete their own items"
    ON sref_items
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);
  END IF;
END $$;