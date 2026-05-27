import { supabase } from './supabase.js'

async function loadDeliveries() {

  const { data, error } = await supabase
    .from('deliveries')
    .select('*')
    .order('created_at', {
      ascending: false
    })

  if(error) {
    console.log(error)
    return
  }

  renderDeliveries(data)
}

function renderDeliveries(data) {

  const tbody = document.getElementById(
    'delivery-table-body'
  )

  tbody.innerHTML = ''

  data.forEach(item => {

    let badge = `
      <span class="px-3 py-1 rounded-full text-xs bg-slate-100">
        Pending
      </span>
    `

    if(item.status === 'on_delivery') {
      badge = `
        <span class="px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-700">
          Diantar
        </span>
      `
    }

    if(item.status === 'completed') {
      badge = `
        <span class="px-3 py-1 rounded-full text-xs bg-green-100 text-green-700">
          Selesai
        </span>
      `
    }

    tbody.innerHTML += `
      <tr class="border-b">

        <td class="px-6 py-4 font-semibold">
          ${item.patient_name}
        </td>

        <td class="px-6 py-4">
          ${item.kelurahan}
        </td>

        <td class="px-6 py-4">
          ${badge}
        </td>

      </tr>
    `
  })
}

loadDeliveries()
