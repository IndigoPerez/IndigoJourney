/*
  # Create SREF items table

  1. New Tables
    - `sref_items`
      - `id` (uuid, primary key)
      - `sref_code` (text, not null)
      - `image_url` (text)
      - `title` (text, not null)
      - `description` (text)
      - `tags` (text array)
      - `created_at` (timestamptz)
      - `user_id` (uuid, references auth.users)

  2. Security
    - Enable RLS on `sref_items` table
    - Add policies for authenticated users to:
      - Read all items
      - Create their own items
      - Update their own items
      - Delete their own items
*/

CREATE TABLE IF NOT EXISTS sref_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sref_code text NOT NULL,
  image_url text,
  title text NOT NULL,
  description text,
  tags text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users NOT NULL
);

ALTER TABLE sref_items ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read all items
CREATE POLICY "Anyone can read sref items"
  ON sref_items
  FOR SELECT
  TO public
  USING (true);

-- Allow authenticated users to create their own items
CREATE POLICY "Users can create their own items"
  ON sref_items
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own items
CREATE POLICY "Users can update their own items"
  ON sref_items
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own items
CREATE POLICY "Users can delete their own items"
  ON sref_items
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);