const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function fetchLineValues() {
  const { data, error } = await supabase.rpc('get_line_counts');

  if (error) {
    console.error('Error fetching line values:', error);
    throw error;
  }

  return data;
}

module.exports = { fetchLineValues }; 