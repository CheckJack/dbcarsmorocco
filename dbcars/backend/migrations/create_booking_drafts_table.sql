-- Create booking_drafts table
CREATE TABLE IF NOT EXISTS booking_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  draft_data JSONB NOT NULL,
  customer_name VARCHAR(255),
  vehicle_name VARCHAR(255),
  total_price DECIMAL(10, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_booking_drafts_updated_at ON booking_drafts(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_booking_drafts_customer_name ON booking_drafts(customer_name);

-- Create trigger to automatically update updated_at
CREATE OR REPLACE FUNCTION update_booking_drafts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_booking_drafts_updated_at_trigger
BEFORE UPDATE ON booking_drafts
FOR EACH ROW
EXECUTE FUNCTION update_booking_drafts_updated_at();

