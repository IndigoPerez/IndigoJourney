/*
  # Add RLS policies for sref_items table

  1. Security Changes
    - Enable RLS on sref_items table
    - Add policies for:
      - Inserting new items (authenticated users only)
      - Selecting items (authenticated users can read their own items)
      - Updating items (users can update their own items)
      - Deleting items (users can delete their own items)
*/

-- Enable RLS
ALTER TABLE sref_items ENABLE ROW LEVEL SECURITY;

-- Policy for inserting new items
CREATE POLICY "Users can insert their own items"
ON sref_items
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Policy for reading items
CREATE POLICY "Users can view their own items"
ON sref_items
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Policy for updating items
CREATE POLICY "Users can update their own items"
ON sref_items
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy for deleting items
CREATE POLICY "Users can delete their own items"
ON sref_items
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);