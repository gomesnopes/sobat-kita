import { supabase } from './supabase.js'

console.log('Sobat Kita Running 🚀')

/* ======================================================
   ELEMENTS
====================================================== */

const tbody = document.getElementById(
  'delivery-table-body'
)

const searchInput = document.getElementById(
  'search-input'
)

const dateFilter = document.getElementById(
  'date-filter'
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

/* ======================================================
   LOAD DELIVERIES
====================================================== */

async function loadDeliveries() {

  let query = supabase
    .from('deliveries')
    .select('*')
    .order('created_at', {
      ascending: false
    })

  // SEARCH
  if(searchInput && searchInput.value) {

    query = query.ilike(
      'patient_name',
      `%${searchInput.value}%`
    )
  }

  // DATE FILTER
  if(dateFilter && dateFilter.value) {

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

/* ======================================================
   RENDER TABLE
====================================================== */

function renderDeliveries(data) {

  tbody.innerHTML = ''

  if(data.length === 0) {

    tbody.innerHTML = `
      <tr>
        <td colspan="5" class="text-center py-10 text-slate-400">
          Belum ada data pengantaran
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
              class="bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-lg text-sm"
            >
              QR
            </button>

            <button
              onclick="deleteDelivery('${item.id}')"
              class="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-2 rounded-lg text-sm"
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
   LOAD COURIERS
====================================================== */

async function loadCouriers() {

  const select = document.getElementById(
    'courier-select'
  )

  const { data, error } = await supabase
    .from('couriers')
    .select('*')

  if(error) {
    console.log(error)
    return
  }

  select.innerHTML = `
    <option value="">
      Pilih Kurir
    </option>
  `

  data.forEach(courier => {

    select.innerHTML += `
      <option value="${courier.nama}">
        ${courier.nama}
      </option>
    `
  })
}

/* ======================================================
   OPEN MODAL
====================================================== */

document
.getElementById('btn-new-delivery')
.addEventListener('click', async () => {

  deliveryModal.classList.remove('hidden')
  deliveryModal.classList.add('flex')

  await loadCouriers()
})

/* ======================================================
   CLOSE DELIVERY MODAL
====================================================== */

document
.getElementById('close-delivery-modal')
.addEventListener('click', () => {

  deliveryModal.classList.add('hidden')
})

/* ======================================================
   CLOSE QR MODAL
====================================================== */

document
.getElementById('close-qr-modal')
.addEventListener('click', () => {

  qrModal.classList.add('hidden')
})

/* ======================================================
   CREATE DELIVERY
====================================================== */

if(deliveryForm) {

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

      const courierName =
        document.getElementById('courier-select').value

      const qrToken = crypto.randomUUID()

      const { error } = await supabase
        .from('deliveries')
        .insert([
          {
            patient_name: patientName,
            patient_phone: patientPhone,
            kelurahan: kelurahan,
            address: address,
            courier_name: courierName,
            qr_token: qrToken,
            status: 'pending'
          }
        ])

      if(error) {

        alert(error.message)
        return
      }

      alert('Pengantaran berhasil dibuat 🎉')

      deliveryForm.reset()

      deliveryModal.classList.add('hidden')

      loadDeliveries()
  })
}

/* ======================================================
   SHOW QR
====================================================== */

window.showQR = (token) => {

  qrModal.classList.remove('hidden')
  qrModal.classList.add('flex')

  qrBox.innerHTML = ''

  new QRCode(qrBox, {
    text: `${window.location.origin}/tracking.html?token=${token}`,
    width: 220,
    height: 220
  })
}

/* ======================================================
   DELETE DELIVERY
====================================================== */

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

/* ======================================================
   FILTER EVENTS
====================================================== */

if(searchInput) {

  searchInput.addEventListener(
    'input',
    loadDeliveries
  )
}

if(dateFilter) {

  dateFilter.addEventListener(
    'change',
    loadDeliveries
  )
}

/* ======================================================
   INITIAL LOAD
====================================================== */

loadDeliveries()
