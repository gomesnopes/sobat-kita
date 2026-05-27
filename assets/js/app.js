import { supabase } from './supabase.js'

const tbody = document.getElementById(
  'delivery-table-body'
)

const searchInput = document.getElementById(
  'search-input'
)

const dateFilter = document.getElementById(
  'date-filter'
)

async function loadDeliveries() {

  let query = supabase
    .from('deliveries')
    .select('*')
    .order('created_at', {
      ascending: false
    })

  // SEARCH
  if(searchInput.value) {

    query = query.ilike(
      'patient_name',
      `%${searchInput.value}%`
    )
  }

  // DATE FILTER
  if(dateFilter.value) {

    query = query.gte(
      'created_at',
      dateFilter.value
    )
  }

  const { data, error } = await query

  if(error) {
    console.log(error)
    return
  }

  renderDeliveries(data)
}

function renderDeliveries(data) {

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
      <tr class="border-b hover:bg-slate-50">

        <td class="px-6 py-4">

          <p class="font-semibold">
            ${item.patient_name}
          </p>

          <p class="text-sm text-slate-500">
            ${item.patient_phone || '-'}
          </p>

        </td>

        <td class="px-6 py-4">

          <p class="font-medium">
            ${item.kelurahan}
          </p>

          <p class="text-sm text-slate-500">
            ${item.address || '-'}
          </p>

        </td>

        <td class="px-6 py-4">

          ${item.courier_name || '-'}

        </td>

        <td class="px-6 py-4">

          ${badge}

        </td>

        <td class="px-6 py-4">

          <div class="flex gap-2">

            <button
              onclick="showQR('${item.qr_token}')"
              class="bg-slate-100 px-3 py-2 rounded-lg text-sm"
            >
              QR
            </button>

            <button
              onclick="deleteDelivery('${item.id}')"
              class="bg-red-100 text-red-700 px-3 py-2 rounded-lg text-sm"
            >
              Hapus
            </button>

          </div>

        </td>

      </tr>
    `
  })
}

window.showQR = (token) => {

  const modal = document.getElementById(
    'qr-modal'
  )

  modal.classList.remove('hidden')
  modal.classList.add('flex')

  const qrBox = document.getElementById(
    'qrcode'
  )

  qrBox.innerHTML = ''

  new QRCode(qrBox, {
    text: `${window.location.origin}/tracking.html?token=${token}`,
    width: 220,
    height: 220
  })
}

document
.getElementById('close-qr-modal')
.addEventListener('click', () => {

  document
  .getElementById('qr-modal')
  .classList.add('hidden')

})

window.deleteDelivery = async (id) => {

  const confirmDelete = confirm(
    'Hapus data pengantaran?'
  )

  if(!confirmDelete) return

  const { error } = await supabase
    .from('deliveries')
    .delete()
    .eq('id', id)

  if(error) {
    alert(error.message)
    return
  }

  loadDeliveries()
}

searchInput.addEventListener(
  'input',
  loadDeliveries
)

dateFilter.addEventListener(
  'change',
  loadDeliveries
)

loadDeliveries()
