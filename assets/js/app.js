import { supabase } from './supabase.js'
/* ======================================================
   ELEMENTS
====================================================== */
const deliveriesSection =
  document.getElementById(
    'deliveries-section'
  )
const zonesSection =
  document.getElementById(
    'zones-section'
  )
const tbody =
  document.getElementById(
    'delivery-table-body'
  )
const searchInput =
  document.getElementById(
    'search-input'
  )
const startDate =
  document.getElementById(
    'start-date'
  )
const endDate =
  document.getElementById(
    'end-date'
  )
const deliveryModal =
  document.getElementById(
    'delivery-modal'
  )
const deliveryForm =
  document.getElementById(
    'delivery-form'
  )
const qrModal =
  document.getElementById(
    'qr-modal'
  )
const qrBox =
  document.getElementById(
    'qrcode'
  )
const detailModal =
  document.getElementById(
    'detail-modal'
  )
const kecamatanSelect =
  document.getElementById(
    'kecamatan'
  )
const kelurahanSelect =
  document.getElementById(
    'kelurahan'
  )
const ongkirDisplay =
  document.getElementById(
    'ongkir-display'
  )
const zoneModal =
  document.getElementById(
    'zone-modal'
  )
const zoneForm =
  document.getElementById(
    'zone-form'
  )
let selectedOngkir = 0
let currentPage = 1
const limit = 5
/* ======================================================
   NAVIGATION
====================================================== */
document
.getElementById(
  'menu-deliveries'
)
.addEventListener(
  'click',
  () => {
    deliveriesSection
      .classList
      .remove('hidden')
    zonesSection
      .classList
      .add('hidden')
})
document
.getElementById(
  'menu-zones'
)
.addEventListener(
  'click',
  () => {
    zonesSection
      .classList
      .remove('hidden')
    deliveriesSection
      .classList
      .add('hidden')
    loadZones()
})
/* ======================================================
   LOAD DELIVERIES
====================================================== */
async function loadDeliveries() {
  const from =
    (currentPage - 1) * limit
  const to =
    from + limit - 1
  let query = supabase
    .from('deliveries')
    .select('*')
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
  // FILTER DATE
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
  // DEFAULT TODAY
  if(
    !startDate.value &&
    !endDate.value
  ) {
    const today = new Date()
    const startToday =
      today
      .toISOString()
      .split('T')[0] + 'T00:00:00'
    const endToday =
      today
      .toISOString()
      .split('T')[0] + 'T23:59:59'
    query = query
      .gte('created_at', startToday)
      .lte('created_at', endToday)
  }
  const {
    data,
    error
  } = await query
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
   RENDER DELIVERIES
====================================================== */
function renderDeliveries(data) {
  tbody.innerHTML = ''
  if(data.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td
          colspan="5"
          class="text-center py-10 text-slate-400"
        >
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
   LOAD KECAMATAN
====================================================== */
async function loadKecamatan() {
  const { data, error } =
    await supabase
    .from('delivery_zones')
    .select('kecamatan')
  if(error) {
    console.log(error)
    return
  }
  const uniqueKecamatan =
    [...new Set(
      data.map(
        item => item.kecamatan
      )
    )]
  kecamatanSelect.innerHTML = `
    <option value="">
      Pilih Kecamatan
    </option>
  `
  uniqueKecamatan.forEach(item => {
    kecamatanSelect.innerHTML += `
      <option value="${item}">
        ${item}
      </option>
    `
  })
}
/* ======================================================
   LOAD KELURAHAN
====================================================== */
async function loadKelurahan(
  kecamatan
) {
  const { data, error } =
    await supabase
    .from('delivery_zones')
    .select('*')
    .eq('kecamatan', kecamatan)
  if(error) {
    console.log(error)
    return
  }
  kelurahanSelect.innerHTML = `
    <option value="">
      Pilih Kelurahan
    </option>
  `
  data.forEach(item => {
    kelurahanSelect.innerHTML += `
      <option
        value="${item.kelurahan}"
        data-ongkir="${item.ongkir}"
      >
        ${item.kelurahan}
      </option>
    `
  })
}
/* ======================================================
   LOAD ZONES
====================================================== */
async function loadZones() {
  const tbody =
    document.getElementById(
      'zones-table-body'
    )
  const { data, error } =
    await supabase
    .from('delivery_zones')
    .select('*')
    .order('kecamatan')
  if(error) {
    console.log(error)
    return
  }
  tbody.innerHTML = ''
  data.forEach(item => {
    tbody.innerHTML += `
      <tr class="border-b">
        <td class="px-6 py-4">
          ${item.kecamatan}
        </td>
        <td class="px-6 py-4">
          ${item.kelurahan}
        </td>
        <td class="px-6 py-4 font-semibold text-green-700">
          Rp ${parseInt(
            item.ongkir
          ).toLocaleString()}
        </td>
        <td class="px-6 py-4">
          <button
            onclick="deleteZone('${item.id}')"
            class="bg-red-100 text-red-700 px-3 py-2 rounded-lg text-sm"
          >
            Hapus
          </button>
        </td>
      </tr>
    `
  })
}
/* ======================================================
   AUTO ASSIGN DRIVER
====================================================== */
async function getAvailableCourier() {
  const { data, error } =
    await supabase
    .from('couriers')
    .select('*')
    .order(
      'last_assigned_at',
      {
        ascending: true,
        nullsFirst: true
      }
    )
    .limit(1)
  if(error) {
    console.log(error)
    return null
  }
  if(!data || data.length === 0) {
    return null
  }
  return data[0]
}
/* ======================================================
   OPEN DELIVERY MODAL
====================================================== */
document
.getElementById(
  'btn-new-delivery'
)
.addEventListener(
  'click',
  async () => {
    deliveryModal
      .classList
      .remove('hidden')
    deliveryModal
      .classList
      .add('flex')
    await loadKecamatan()
})
/* ======================================================
   CLOSE MODALS
====================================================== */
document
.getElementById(
  'close-delivery-modal'
)
.addEventListener(
  'click',
  () => {
    deliveryModal
      .classList
      .add('hidden')
})
document
.getElementById(
  'close-qr-modal'
)
.addEventListener(
  'click',
  () => {
    qrModal
      .classList
      .add('hidden')
})
document
.getElementById(
  'close-detail-modal'
)
.addEventListener(
  'click',
  () => {
    detailModal
      .classList
      .add('hidden')
})
document
.getElementById(
  'btn-add-zone'
)
.addEventListener(
  'click',
  () => {
    zoneModal
      .classList
      .remove('hidden')
    zoneModal
      .classList
      .add('flex')
})
document
.getElementById(
  'close-zone-modal'
)
.addEventListener(
  'click',
  () => {
    zoneModal
      .classList
      .add('hidden')
})
/* ======================================================
   KECAMATAN CHANGE
====================================================== */
kecamatanSelect.addEventListener(
  'change',
  () => {
    loadKelurahan(
      kecamatanSelect.value
    )
})
/* ======================================================
   KELURAHAN CHANGE
====================================================== */
kelurahanSelect.addEventListener(
  'change',
  () => {
    const selectedOption =
      kelurahanSelect.options[
        kelurahanSelect.selectedIndex
      ]
    selectedOngkir =
      selectedOption
      .dataset
      .ongkir || 0
    ongkirDisplay.innerText =
      `Rp ${parseInt(
        selectedOngkir
      ).toLocaleString()}`
})
/* ======================================================
   CREATE DELIVERY
====================================================== */
deliveryForm.addEventListener(
  'submit',
  async (e) => {
    e.preventDefault()
    const patientName =
      document.getElementById(
        'patient-name'
      ).value
    const patientPhone =
      document.getElementById(
        'patient-phone'
      ).value
    const kelurahan =
      kelurahanSelect.value
    const address =
      document.getElementById(
        'address'
      ).value
    const qrToken =
      crypto.randomUUID()
    const courier =
      await getAvailableCourier()
    const courierName =
      courier?.nama ||
      'Belum Ada Kurir'
    const { error } =
      await supabase
      .from('deliveries')
      .insert([
        {
          patient_name:
            patientName,
          patient_phone:
            patientPhone,
          kelurahan,
          address,
          courier_name:
            courierName,
          qr_token:
            qrToken,
          ongkir:
            selectedOngkir,
          status:
            'pending'
        }
      ])
    if(error) {
      alert(error.message)
      return
    }
    // UPDATE DRIVER
    if(courier) {
      await supabase
        .from('couriers')
        .update({
          last_assigned_at:
            new Date()
            .toISOString()
        })
        .eq(
          'id',
          courier.id
        )
    }
    // SHOW DETAIL
    showDetailModal({
      patientName,
      patientPhone,
      kelurahan,
      address,
      courierName,
      qrToken,
      ongkir:
        selectedOngkir
    })
    deliveryForm.reset()
    deliveryModal
      .classList
      .add('hidden')
    loadDeliveries()
})
/* ======================================================
   CREATE ZONE
====================================================== */
zoneForm.addEventListener(
  'submit',
  async (e) => {
    e.preventDefault()
    const kecamatan =
      document.getElementById(
        'zone-kecamatan'
      ).value
    const kelurahan =
      document.getElementById(
        'zone-kelurahan'
      ).value
    const ongkir =
      document.getElementById(
        'zone-ongkir'
      ).value
    const { error } =
      await supabase
      .from('delivery_zones')
      .insert([
        {
          kecamatan,
          kelurahan,
          ongkir
        }
      ])
    if(error) {
      alert(error.message)
      return
    }
    zoneForm.reset()
    zoneModal
      .classList
      .add('hidden')
    loadZones()
})
/* ======================================================
   DETAIL MODAL
====================================================== */
function showDetailModal(data) {
  detailModal
    .classList
    .remove('hidden')
  detailModal
    .classList
    .add('flex')
  document.getElementById(
    'detail-content'
  ).innerHTML = `
    <div class="space-y-4">
      <div>
        <p class="text-sm text-slate-500">
          Pasien
        </p>
        <p class="font-semibold text-lg">
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
          Kelurahan
        </p>
        <p class="font-semibold">
          ${data.kelurahan}
        </p>
      </div>
      <div>
        <p class="text-sm text-slate-500">
          Ongkir
        </p>
        <p class="font-semibold text-green-700">
          Rp ${parseInt(
            data.ongkir
          ).toLocaleString()}
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
      <div
        id="detail-qr"
        class="flex justify-center py-4"
      ></div>
    </div>
  `
  new QRCode(
    document.getElementById(
      'detail-qr'
    ),
    {
      text:
`${window.location.origin}/sobat-kita/tracking.html?token=${data.qrToken}`,
      width: 220,
      height: 220
    }
  )
}
/* ======================================================
   SHOW QR
====================================================== */
window.showQR = (token) => {
  qrModal
    .classList
    .remove('hidden')
  qrModal
    .classList
    .add('flex')
  qrBox.innerHTML = ''
  new QRCode(
    qrBox,
    {
      text:
`${window.location.origin}/sobat-kita/tracking.html?token=${token}`,
      width: 220,
      height: 220
    }
  )
}
/* ======================================================
   DELETE DELIVERY
====================================================== */
window.deleteDelivery =
  async (id) => {
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
   DELETE ZONE
====================================================== */
window.deleteZone =
  async (id) => {
  const yes = confirm(
    'Hapus wilayah?'
  )
  if(!yes) return
  await supabase
    .from('delivery_zones')
    .delete()
    .eq('id', id)
  loadZones()
}
/* ======================================================
   EDIT DELIVERY
====================================================== */
window.editDelivery =
  async (id) => {
  const newStatus =
    prompt(
      'Update status:\n\npending\non_delivery\ncompleted'
    )
  if(!newStatus) return
  const { error } =
    await supabase
    .from('deliveries')
    .update({
      status: newStatus
    })
    .eq('id', id)
  if(error) {
    alert(error.message)
    return
  }
  loadDeliveries()
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
.getElementById(
  'next-page'
)
.addEventListener(
  'click',
  () => {
    currentPage++
    loadDeliveries()
})
document
.getElementById(
  'prev-page'
)
.addEventListener(
  'click',
  () => {
    if(currentPage > 1) {
      currentPage--
      loadDeliveries()
    }
})
/* ======================================================
   PRINT
====================================================== */
document
.getElementById(
  'print-delivery'
)
.addEventListener(
  'click',
  () => {
    const printContent =
      document.getElementById(
        'detail-content'
      ).innerHTML
    const newWindow =
      window.open(
        '',
        '',
        'width=800,height=600'
      )
    newWindow.document.write(`
      <html>
        <head>
          <title>
            Print Pengantaran
          </title>
        </head>
        <body>
          ${printContent}
        </body>
      </html>
    `)
    newWindow.document.close()
    newWindow.print()
})
/* ======================================================
   INITIAL
====================================================== */
loadDeliveries()
