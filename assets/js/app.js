import { supabase } from './supabase.js'
/* ======================================================
   ADMIN SESSION
====================================================== */
const adminSession =
JSON.parse(
  localStorage.getItem(
    'sobatkita_admin'
  )
)
if(!adminSession) {
  window.location.href =
    './login-admin.html'
}
const isSuperAdmin =
adminSession.role ===
'superadmin'
/* ======================================================
   ELEMENTS
====================================================== */
const sidebar =
document.getElementById(
  'sidebar'
)
const toggleSidebar =
document.getElementById(
  'toggle-sidebar'
)
const deliverySection =
document.getElementById(
  'deliveries-section'
)
const zonesSection =
document.getElementById(
  'zones-section'
)
const couriersSection =
document.getElementById(
  'couriers-section'
)
const deliveryTable =
document.getElementById(
  'delivery-table-body'
)
const courierTable =
document.getElementById(
  'couriers-table-body'
)
const zonesTable =
document.getElementById(
  'zones-table-body'
)
const deliveryModal =
document.getElementById(
  'delivery-modal'
)
const courierModal =
document.getElementById(
  'courier-modal'
)
const zoneModal =
document.getElementById(
  'zone-modal'
)
const detailModal =
document.getElementById(
  'detail-modal'
)
const qrModal =
document.getElementById(
  'qr-modal'
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
const deliveryForm =
document.getElementById(
  'delivery-form'
)
const courierForm =
document.getElementById(
  'courier-form'
)
const zoneForm =
document.getElementById(
  'zone-form'
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
let currentPage = 1
const limit = 10
let selectedOngkir = 0
/* ======================================================
   ROLE SYSTEM
====================================================== */
if(!isSuperAdmin) {
  document
  .querySelectorAll(
    '.superadmin-only'
  )
  .forEach((el) => {
    el.style.display =
      'none'
  })
}
/* ======================================================
   SIDEBAR TOGGLE
====================================================== */
if(toggleSidebar) {
  toggleSidebar.addEventListener(
    'click',
    () => {
      sidebar.classList.toggle(
        'w-72'
      )
      sidebar.classList.toggle(
        'w-24'
      )
  })
}
/* ======================================================
   NAVIGATION
====================================================== */
function openSection(section) {
  deliverySection.classList.add(
    'hidden'
  )
  zonesSection.classList.add(
    'hidden'
  )
  couriersSection.classList.add(
    'hidden'
  )
  section.classList.remove(
    'hidden'
  )
}
document
.getElementById(
  'menu-deliveries'
)
?.addEventListener(
  'click',
  () => {
    openSection(
      deliverySection
    )
})
document
.getElementById(
  'menu-zones'
)
?.addEventListener(
  'click',
  () => {
    openSection(
      zonesSection
    )
    loadZones()
})
document
.getElementById(
  'menu-couriers'
)
?.addEventListener(
  'click',
  () => {
    openSection(
      couriersSection
    )
    loadCouriers()
})
/* ======================================================
   MODALS
====================================================== */
function openModal(modal) {
  modal.classList.remove(
    'hidden'
  )
  modal.classList.add(
    'flex'
  )
}
function closeModal(modal) {
  modal.classList.add(
    'hidden'
  )
}
/* ======================================================
   AUTO CLOSE MODAL
====================================================== */
window.addEventListener(
  'click',
  (e) => {
  if(
    e.target === deliveryModal
  ) {
    closeModal(
      deliveryModal
    )
  }
  if(
    e.target === courierModal
  ) {
    closeModal(
      courierModal
    )
  }
  if(
    e.target === zoneModal
  ) {
    closeModal(
      zoneModal
    )
  }
  if(
    e.target === detailModal
  ) {
    closeModal(
      detailModal
    )
  }
  if(
    e.target === qrModal
  ) {
    closeModal(
      qrModal
    )
  }
})
/* ======================================================
   BUTTON MODAL
====================================================== */
document
.getElementById(
  'btn-new-delivery'
)
?.addEventListener(
  'click',
  async () => {
    openModal(
      deliveryModal
    )
    await loadKecamatan()
})
document
.getElementById(
  'btn-add-courier'
)
?.addEventListener(
  'click',
  () => {
    openModal(
      courierModal
    )
})
document
.getElementById(
  'btn-add-zone'
)
?.addEventListener(
  'click',
  () => {
    openModal(
      zoneModal
    )
})
/* ======================================================
   CLOSE BUTTONS
====================================================== */
document
.querySelectorAll(
  '.close-modal'
)
.forEach((btn) => {
  btn.addEventListener(
    'click',
    () => {
      closeModal(
        deliveryModal
      )
      closeModal(
        courierModal
      )
      closeModal(
        zoneModal
      )
      closeModal(
        detailModal
      )
      closeModal(
        qrModal
      )
  })
})
/* ======================================================
   LOAD DELIVERIES
====================================================== */
async function loadDeliveries() {
  const from =
    (currentPage - 1)
    * limit
  const to =
    from + limit - 1
  let query = supabase
  .from('deliveries')
  .select('*')
  .order(
    'created_at',
    {
      ascending: false
    }
  )
  .range(from, to)
  // SEARCH
  if(searchInput?.value) {
    query = query.ilike(
      'patient_name',
      `%${searchInput.value}%`
    )
  }
  // FILTER DATE
  if(startDate?.value) {
    query = query.gte(
      'created_at',
      startDate.value
    )
  }
  if(endDate?.value) {
    query = query.lte(
      'created_at',
      endDate.value + 'T23:59:59'
    )
  }
  const {
    data,
    error
  } = await query
  if(error) {
    console.log(error)
    return
  }
  renderDeliveries(
    data || []
  )
}
/* ======================================================
   RENDER DELIVERIES
====================================================== */
function renderDeliveries(data) {
  if(!deliveryTable) return
  deliveryTable.innerHTML = ''
  if(data.length === 0) {
    deliveryTable.innerHTML = `
      <tr>
        <td
          colspan="6"
          class="text-center py-10 text-slate-400"
        >
          Tidak ada data
        </td>
      </tr>
    `
    return
  }
  data.forEach((item) => {
    let badge = `
      <span class="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs">
        Pending
      </span>
    `
    if(item.status === 'on_delivery') {
      badge = `
        <span class="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs">
          Diantar
        </span>
      `
    }
    if(item.status === 'completed') {
      badge = `
        <span class="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs">
          Selesai
        </span>
      `
    }
    deliveryTable.innerHTML += `
      <tr class="border-b hover:bg-slate-50">
        <td class="px-6 py-5">
          <p class="font-semibold">
            ${item.patient_name}
          </p>
          <p class="text-sm text-slate-500 mt-1">
            ${item.patient_phone || '-'}
          </p>
        </td>
        <td class="px-6 py-5">
          <p class="font-medium">
            ${item.kelurahan}
          </p>
          <p class="text-sm text-slate-500 mt-1">
            ${item.address || '-'}
          </p>
        </td>
        <td class="px-6 py-5">
          ${item.courier_name || '-'}
        </td>
        <td class="px-6 py-5">
          ${badge}
        </td>
        <td class="px-6 py-5">
          Rp ${parseInt(
            item.ongkir || 0
          ).toLocaleString()}
        </td>
        <td class="px-6 py-5">
          <div class="flex gap-2">
            <button
              onclick="showQR('${item.qr_token}')"
              class="bg-slate-100 px-3 py-2 rounded-xl text-sm"
            >
              QR
            </button>
            ${
              isSuperAdmin
              ?
              `
                <button
                  onclick="editDelivery('${item.id}')"
                  class="bg-blue-100 text-blue-700 px-3 py-2 rounded-xl text-sm"
                >
                  Edit
                </button>
                <button
                  onclick="deleteDelivery('${item.id}')"
                  class="bg-red-100 text-red-700 px-3 py-2 rounded-xl text-sm"
                >
                  Hapus
                </button>
              `
              : ''
            }
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
  if(!courierTable) return
  const {
    data,
    error
  } = await supabase
  .from('couriers')
  .select('*')
  .order(
    'nama_kurir'
  )
  if(error) {
    console.log(error)
    return
  }
  courierTable.innerHTML = ''
  ;(data || []).forEach((item) => {
    let statusBadge = `
      <span class="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs">
        Offline
      </span>
    `
    if(item.is_online) {
      statusBadge = `
        <span class="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs">
          Online
        </span>
      `
    }
    courierTable.innerHTML += `
      <tr class="border-b hover:bg-slate-50">
        <td class="px-6 py-5 font-semibold">
          ${item.nama_kurir}
        </td>
        <td class="px-6 py-5">
          ${item.email || '-'}
        </td>
        <td class="px-6 py-5">
          ${statusBadge}
        </td>
        <td class="px-6 py-5">
          <div class="flex gap-2">
            <button
              onclick="toggleCourier('${item.id}', ${item.is_online})"
              class="bg-blue-100 text-blue-700 px-3 py-2 rounded-xl text-sm"
            >
              Toggle
            </button>
            ${
              isSuperAdmin
              ?
              `
              <button
                onclick="deleteCourier('${item.id}')"
                class="bg-red-100 text-red-700 px-3 py-2 rounded-xl text-sm"
              >
                Hapus
              </button>
              `
              : ''
            }
          </div>
        </td>
      </tr>
    `
  })
}
/* ======================================================
   LOAD ZONES
====================================================== */
async function loadZones() {
  if(!zonesTable) return
  const {
    data,
    error
  } = await supabase
  .from('delivery_zones')
  .select('*')
  .order(
    'kecamatan'
  )
  if(error) {
    console.log(error)
    return
  }
  zonesTable.innerHTML = ''
  ;(data || []).forEach((item) => {
    zonesTable.innerHTML += `
      <tr class="border-b hover:bg-slate-50">
        <td class="px-6 py-5">
          ${item.kecamatan}
        </td>
        <td class="px-6 py-5">
          ${item.kelurahan}
        </td>
        <td class="px-6 py-5 font-semibold text-green-700">
          Rp ${parseInt(
            item.ongkir
          ).toLocaleString()}
        </td>
        <td class="px-6 py-5">
          ${
            isSuperAdmin
            ?
            `
            <button
              onclick="deleteZone('${item.id}')"
              class="bg-red-100 text-red-700 px-3 py-2 rounded-xl text-sm"
            >
              Hapus
            </button>
            `
            : '-'
          }
        </td>
      </tr>
    `
  })
}
/* ======================================================
   LOAD KECAMATAN
====================================================== */
async function loadKecamatan() {
  const {
    data
  } = await supabase
  .from('delivery_zones')
  .select('kecamatan')
  const unique =
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
  unique.forEach((item) => {
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
  const {
    data
  } = await supabase
  .from('delivery_zones')
  .select('*')
  .eq(
    'kecamatan',
    kecamatan
  )
  kelurahanSelect.innerHTML = `
    <option value="">
      Pilih Kelurahan
    </option>
  `
  data.forEach((item) => {
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
kecamatanSelect?.addEventListener(
  'change',
  () => {
    loadKelurahan(
      kecamatanSelect.value
    )
})
kelurahanSelect?.addEventListener(
  'change',
  () => {
    const selected =
      kelurahanSelect.options[
        kelurahanSelect.selectedIndex
      ]
    selectedOngkir =
      selected.dataset.ongkir
    ongkirDisplay.innerText =
      `Rp ${parseInt(
        selectedOngkir
      ).toLocaleString()}`
})
/* ======================================================
   AUTO ASSIGN COURIER
====================================================== */
async function getAvailableCourier() {
  const {
    data
  } = await supabase
  .from('couriers')
  .select('*')
  .eq(
    'is_online',
    true
  )
  .order(
    'last_online_at',
    {
      ascending: true
    }
  )
  .limit(1)
  if(!data || data.length === 0)
  return null
  return data[0]
}
/* ======================================================
   CREATE DELIVERY
====================================================== */
deliveryForm?.addEventListener(
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
  const address =
    document.getElementById(
      'address'
    ).value
  const kelurahan =
    kelurahanSelect.value
  const qrToken =
    crypto.randomUUID()
  const courier =
    await getAvailableCourier()
  const courierName =
    courier?.nama_kurir ||
    'Belum Ada Kurir'
  const {
    error
  } = await supabase
  .from('deliveries')
  .insert([
    {
      patient_name:
        patientName,
      patient_phone:
        patientPhone,
      address,
      kelurahan,
      courier_id:
        courier?.id || null,
      courier_name:
        courierName,
      qr_token:
        qrToken,
      ongkir:
        selectedOngkir,
      status:
        courier
        ? 'on_delivery'
        : 'pending'
    }
  ])
  if(error) {
    alert(error.message)
    return
  }
  closeModal(
    deliveryModal
  )
  deliveryForm.reset()
  showQR(qrToken)
  loadDeliveries()
})
/* ======================================================
   CREATE COURIER
====================================================== */
courierForm?.addEventListener(
  'submit',
  async (e) => {
  e.preventDefault()
  const nama =
    document.getElementById(
      'courier-name'
    ).value
  const email =
    document.getElementById(
      'courier-email'
    ).value
  const password =
    document.getElementById(
      'courier-password'
    ).value
  const {
    error
  } = await supabase
  .from('couriers')
  .insert([
    {
      nama_kurir:
        nama,
      email,
      password,
      role:
        'courier'
    }
  ])
  if(error) {
    alert(error.message)
    return
  }
  courierForm.reset()
  closeModal(
    courierModal
  )
  loadCouriers()
})
/* ======================================================
   CREATE ZONE
====================================================== */
zoneForm?.addEventListener(
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
  await supabase
  .from('delivery_zones')
  .insert([
    {
      kecamatan,
      kelurahan,
      ongkir
    }
  ])
  zoneForm.reset()
  closeModal(
    zoneModal
  )
  loadZones()
})
/* ======================================================
   SHOW QR
====================================================== */
window.showQR = (token) => {
  openModal(
    qrModal
  )
  const qrBox =
    document.getElementById(
      'qrcode'
    )
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
   EDIT DELIVERY
====================================================== */
window.editDelivery =
async (id) => {
  const newStatus =
    prompt(
      'pending / on_delivery / completed'
    )
  if(!newStatus) return
  await supabase
  .from('deliveries')
  .update({
    status:
      newStatus
  })
  .eq('id', id)
  loadDeliveries()
}
/* ======================================================
   DELETE DELIVERY
====================================================== */
window.deleteDelivery =
async (id) => {
  const yes =
    confirm(
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
   DELETE COURIER
====================================================== */
window.deleteCourier =
async (id) => {
  const yes =
    confirm(
      'Hapus kurir?'
    )
  if(!yes) return
  await supabase
  .from('couriers')
  .delete()
  .eq('id', id)
  loadCouriers()
}
/* ======================================================
   DELETE ZONE
====================================================== */
window.deleteZone =
async (id) => {
  const yes =
    confirm(
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
   TOGGLE COURIER
====================================================== */
window.toggleCourier =
async (id, current) => {
  await supabase
  .from('couriers')
  .update({
    is_online:
      !current,
    last_online_at:
      new Date().toISOString()
  })
  .eq('id', id)
  loadCouriers()
}
/* ======================================================
   FILTER
====================================================== */
searchInput?.addEventListener(
  'input',
  () => {
    currentPage = 1
    loadDeliveries()
})
startDate?.addEventListener(
  'change',
  () => {
    loadDeliveries()
})
endDate?.addEventListener(
  'change',
  () => {
    loadDeliveries()
})
/* ======================================================
   PAGINATION
====================================================== */
document
.getElementById(
  'next-page'
)
?.addEventListener(
  'click',
  () => {
    currentPage++
    loadDeliveries()
})
document
.getElementById(
  'prev-page'
)
?.addEventListener(
  'click',
  () => {
    if(currentPage > 1) {
      currentPage--
      loadDeliveries()
    }
})
/* ======================================================
   LOGOUT
====================================================== */
document
.getElementById(
  'logout-btn'
)
?.addEventListener(
  'click',
  () => {
  localStorage.removeItem(
    'sobatkita_admin'
  )
  window.location.href =
    './login-admin.html'
})
/* ======================================================
   INITIAL
====================================================== */
loadDeliveries()
