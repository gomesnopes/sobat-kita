import { supabase } from './supabase.js'

async function testDatabase() {

  const { data, error } = await supabase
    .from('couriers')
    .select('*')

  console.log(data)
  console.log(error)
}

testDatabase()
