/*
  # Create SREF Items Table

  1. New Tables
    - `sref_items`
      - `id` (uuid, primary key)
      - `sref_code` (text, not null)
      - `image_url` (text)
      - `title` (text, not null)
      - `description` (text)
      - `tags` (text array)
      - `created_at` (timestamptz, default now())

  2. Security
    - Enable RLS on `sref_items` table
    - Add policies for:
      - Public read access to all items
      - Authenticated users can create items
      - Authenticated users can update their own items
      - Authenticated users can delete their own items
*/

CREATE TABLE IF NOT EXISTS sref_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sref_code text NOT NULL,
  image_url text,
  title text NOT NULL,
  description text,
  tags text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users(id)
);

ALTER TABLE sref_items ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access"
  ON sref_items
  FOR SELECT
  TO public
  USING (true);

-- Allow authenticated users to insert
CREATE POLICY "Allow authenticated users to insert"
  ON sref_items
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own items
CREATE POLICY "Allow users to update own items"
  ON sref_items
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own items
CREATE POLICY "Allow users to delete own items"
  ON sref_items
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);