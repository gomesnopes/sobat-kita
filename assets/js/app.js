import { supabase } from './supabase.js'

/* ======================================================
   ELEMENTS
====================================================== */

const tbody = document.getElementById(
  'delivery-table-body'
)

const searchInput = document.getElementById(
  'search-input'
)

const startDate = document.getElementById(
  'start-date'
)

const endDate = document.getElementById(
  'end-date'
)

const deliveryModal = document.getElementById(
  'delivery-modal'
)

const deliveryForm = document.getElementById(
  'delivery-form'
)

const qrModal = document.getElementById(
  'qr-modal'
)

const qrBox = document.getElementById(
  'qrcode'
)

const detailModal = document.getElementById(
  'detail-modal'
)

let currentPage = 1
const limit = 5

/* ======================================================
   LOAD DELIVERIES
====================================================== */

async function loadDeliveries() {

  const from = (currentPage - 1) * limit
  const to = from + limit - 1

  let query = supabase
    .from('deliveries')
    .select('*', { count: 'exact' })
    .order('created_at', {
      ascending: false
    })
    .range(from, to)

  // SEARCH
  if(searchInput.value) {

    query = query.ilike(
      'patient_name',
      `%${searchInput.value}%`
    )
  }

  // FILTER TANGGAL
  if(startDate.value) {

    query = query.gte(
      'created_at',
      startDate.value
    )
  }

  if(endDate.value) {

    query = query.lte(
      'created_at',
      endDate.value + 'T23:59:59'
    )
  }

  // DEFAULT HARI INI
  if(!startDate.value && !endDate.value) {

    const today = new Date()
      .toISOString()
      .split('T')[0]

    query = query.gte(
      'created_at',
      today
    )
  }

  const { data, error, count } = await query

  if(error) {
    console.log(error)
    return
  }

  renderDeliveries(data)

  document.getElementById(
    'page-info'
  ).innerText =
    `Halaman ${currentPage}`
}

/* ======================================================
   RENDER
====================================================== */

function renderDeliveries(data) {

  tbody.innerHTML = ''

  if(data.length === 0) {

    tbody.innerHTML = `
      <tr>
        <td colspan="5" class="text-center py-10 text-slate-400">
          Tidak ada data
        </td>
      </tr>
    `

    return
  }

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
              onclick="editDelivery('${item.id}')"
              class="bg-blue-100 text-blue-700 px-3 py-2 rounded-lg text-sm"
            >
              Edit
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

/* ======================================================
   AUTO ASSIGN DRIVER
====================================================== */

async function getAvailableCourier() {

  const { data, error } = await supabase
    .from('couriers')
    .select('*')
    .order('last_assigned_at', {
      ascending: true,
      nullsFirst: true
    })
    .limit(1)

  if(error || !data.length) {

    return null
  }

  return data[0]
}

/* ======================================================
   OPEN MODAL
====================================================== */

document
.getElementById('btn-new-delivery')
.addEventListener('click', () => {

  deliveryModal.classList.remove('hidden')
  deliveryModal.classList.add('flex')
})

/* ======================================================
   CLOSE MODAL
====================================================== */

document
.getElementById('close-delivery-modal')
.addEventListener('click', () => {

  deliveryModal.classList.add('hidden')
})

document
.getElementById('close-qr-modal')
.addEventListener('click', () => {

  qrModal.classList.add('hidden')
})

document
.getElementById('close-detail-modal')
.addEventListener('click', () => {

  detailModal.classList.add('hidden')
})

/* ======================================================
   CREATE DELIVERY
====================================================== */

deliveryForm.addEventListener(
  'submit',
  async (e) => {

    e.preventDefault()

    const patientName =
      document.getElementById('patient-name').value

    const patientPhone =
      document.getElementById('patient-phone').value

    const kelurahan =
      document.getElementById('kelurahan').value

    const address =
      document.getElementById('address').value

    const qrToken = crypto.randomUUID()

    // AUTO DRIVER
    const courier =
      await getAvailableCourier()

    const courierName =
      courier?.nama || 'Belum Ada Kurir'

    const { error } = await supabase
      .from('deliveries')
      .insert([
        {
          patient_name: patientName,
          patient_phone: patientPhone,
          kelurahan,
          address,
          courier_name: courierName,
          qr_token: qrToken,
          status: 'pending'
        }
      ])

    if(error) {

      alert(error.message)
      return
    }

    // UPDATE LAST ASSIGNED
    if(courier) {

      await supabase
        .from('couriers')
        .update({
          last_assigned_at:
            new Date().toISOString()
        })
        .eq('id', courier.id)
    }

    // SHOW DETAIL MODAL
    showDetailModal({
      patientName,
      patientPhone,
      kelurahan,
      address,
      courierName,
      qrToken
    })

    deliveryForm.reset()

    deliveryModal.classList.add('hidden')

    loadDeliveries()
})

/* ======================================================
   DETAIL MODAL
====================================================== */

function showDetailModal(data) {

  detailModal.classList.remove('hidden')
  detailModal.classList.add('flex')

  document.getElementById(
    'detail-content'
  ).innerHTML = `

    <div class="space-y-3">

      <div>
        <p class="text-sm text-slate-500">
          Pasien
        </p>

        <p class="font-semibold">
          ${data.patientName}
        </p>
      </div>

      <div>
        <p class="text-sm text-slate-500">
          Kurir
        </p>

        <p class="font-semibold">
          ${data.courierName}
        </p>
      </div>

      <div>
        <p class="text-sm text-slate-500">
          Alamat
        </p>

        <p class="font-semibold">
          ${data.address}
        </p>
      </div>

      <div class="flex justify-center py-4">
        <div id="detail-qr"></div>
      </div>

    </div>
  `

  new QRCode(
    document.getElementById('detail-qr'),
    {
      text:
        `${window.location.origin}/tracking.html?token=${data.qrToken}`,
      width: 200,
      height: 200
    }
  )
}

/* ======================================================
   QR MODAL
====================================================== */

window.showQR = (token) => {

  qrModal.classList.remove('hidden')
  qrModal.classList.add('flex')

  qrBox.innerHTML = ''

  new QRCode(qrBox, {
    text:
      `${window.location.origin}/tracking.html?token=${token}`,
    width: 220,
    height: 220
  })
}

/* ======================================================
   DELETE
====================================================== */

window.deleteDelivery = async (id) => {

  const yes = confirm(
    'Hapus pengantaran?'
  )

  if(!yes) return

  await supabase
    .from('deliveries')
    .delete()
    .eq('id', id)

  loadDeliveries()
}

/* ======================================================
   EDIT
====================================================== */

window.editDelivery = async (id) => {

  alert(
    'Fitur edit next step 😄'
  )
}

/* ======================================================
   FILTER
====================================================== */

searchInput.addEventListener(
  'input',
  () => {

    currentPage = 1
    loadDeliveries()
})

startDate.addEventListener(
  'change',
  () => {

    currentPage = 1
    loadDeliveries()
})

endDate.addEventListener(
  'change',
  () => {

    currentPage = 1
    loadDeliveries()
})

/* ======================================================
   PAGINATION
====================================================== */

document
.getElementById('next-page')
.addEventListener('click', () => {

  currentPage++
  loadDeliveries()
})

document
.getElementById('prev-page')
.addEventListener('click', () => {

  if(currentPage > 1) {

    currentPage--
    loadDeliveries()
  }
})

/* ======================================================
   PRINT
====================================================== */

document
.getElementById('print-delivery')
.addEventListener('click', () => {

  window.print()
})

/* ======================================================
   INITIAL
====================================================== */

loadDeliveries()
