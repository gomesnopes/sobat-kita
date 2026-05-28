import { supabase } from './supabase.js'
/* ======================================================
   SESSION
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
const menus =
document.querySelectorAll(
  '.sidebar-menu'
)
const deliveryTable =
document.getElementById(
  'delivery-table-body'
)
const zonesTable =
document.getElementById(
  'zones-table-body'
)
const couriersTable =
document.getElementById(
  'couriers-table-body'
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
const qrModal =
document.getElementById(
  'qr-modal'
)
/* ======================================================
   ROLE
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
   SECTION
====================================================== */
function hideAllSections() {
  deliverySection.classList.add(
    'hidden'
  )
  zonesSection.classList.add(
    'hidden'
  )
  couriersSection.classList.add(
    'hidden'
  )
}
function resetMenuActive() {
  menus.forEach((menu) => {
    menu.classList.remove(
      'active'
    )
  })
}
function openSection(
  section,
  menuId
) {
  hideAllSections()
  section.classList.remove(
    'hidden'
  )
  resetMenuActive()
  document
  .getElementById(menuId)
  .classList.add(
    'active'
  )
  // SEARCH ONLY DELIVERY
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
  if(section === deliverySection) {
    searchInput.style.display =
      'block'
    startDate.style.display =
      'block'
    endDate.style.display =
      'block'
   document.getElementById(
  'analytics-section'
)
    .style.display =
      'grid'
  } else {
    searchInput.style.display =
      'none'
    startDate.style.display =
      'none'
    endDate.style.display =
      'none'
    document
    .querySelector(
      '.grid.grid-cols-1.md\\:grid-cols-2.xl\\:grid-cols-4'
    )
    .style.display =
      'none'
  }
}
/* ======================================================
   TAB CLICK
====================================================== */
document
.getElementById(
  'menu-deliveries'
)
.addEventListener(
  'click',
  () => {
  openSection(
    deliverySection,
    'menu-deliveries'
  )
  loadDeliveries()
  loadAnalytics()
})
document
.getElementById(
  'menu-zones'
)
?.addEventListener(
  'click',
  () => {
  openSection(
    zonesSection,
    'menu-zones'
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
    couriersSection,
    'menu-couriers'
  )
  loadCouriers()
})
/* ======================================================
   MODAL
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
  modal.classList.remove(
    'flex'
  )
  modal.classList.add(
    'hidden'
  )
}
/* ======================================================
   CLOSE MODAL BUTTON
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
      qrModal
    )
  })
})
/* ======================================================
   CLICK OUTSIDE
====================================================== */
window.addEventListener(
  'click',
  (e) => {
  if(e.target === deliveryModal) {
    closeModal(
      deliveryModal
    )
  }
  if(e.target === courierModal) {
    closeModal(
      courierModal
    )
  }
  if(e.target === zoneModal) {
    closeModal(
      zoneModal
    )
  }
  if(e.target === qrModal) {
    closeModal(
      qrModal
    )
  }
})
/* ======================================================
   OPEN BUTTON
====================================================== */
document
.getElementById(
  'btn-new-delivery'
)
?.addEventListener(
  'click',
  () => {
  openModal(
    deliveryModal
  )
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
   ANALYTICS
====================================================== */
async function loadAnalytics() {
  const {
    data
  } = await supabase
  .from('deliveries')
  .select('*')
  const total =
    data?.length || 0
  const onDelivery =
    data?.filter(
      item =>
      item.status ===
      'on_delivery'
    ).length || 0
  const completed =
    data?.filter(
      item =>
      item.status ===
      'completed'
    ).length || 0
  document.getElementById(
    'total-deliveries'
  ).innerText = total
  document.getElementById(
    'on-delivery-count'
  ).innerText = onDelivery
  document.getElementById(
    'completed-count'
  ).innerText = completed
  const {
    data: couriers
  } = await supabase
  .from('couriers')
  .select('*')
  const online =
    couriers?.filter(
      item =>
      item.is_online
    ).length || 0
  document.getElementById(
    'online-couriers'
  ).innerText = online
}
/* ======================================================
   LOAD DELIVERIES
====================================================== */
async function loadDeliveries() {
  let query = supabase
  .from('deliveries')
  .select('*')
  .order(
    'created_at',
    {
      ascending: false
    }
  )
  const keyword =
    document.getElementById(
      'search-input'
    ).value
  const startDate =
    document.getElementById(
      'start-date'
    ).value
  const endDate =
    document.getElementById(
      'end-date'
    ).value
  if(keyword) {
    query = query.ilike(
      'patient_name',
      `%${keyword}%`
    )
  }
  if(startDate) {
    query = query.gte(
      'created_at',
      startDate
    )
  }
  if(endDate) {
    query = query.lte(
      'created_at',
      endDate + 'T23:59:59'
    )
  }
  const {
    data
  } = await query
  deliveryTable.innerHTML = ''
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
      <tr class="border-b">
        <td class="px-6 py-5">
          <p class="font-semibold">
            ${item.patient_name}
          </p>
          <p class="text-sm text-slate-500 mt-1">
            ${item.patient_phone || '-'}
          </p>
        </td>
        <td class="px-6 py-5">
          <p>
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
        <td class="px-6 py-5 font-semibold text-green-700">
          Rp ${parseInt(
            item.ongkir || 0
          ).toLocaleString()}
        </td>
        <td class="px-6 py-5">
          <div class="flex gap-2">
            <button
              onclick="showQR('${item.qr_token}')"
              class="bg-slate-100 px-4 py-2 rounded-xl text-sm"
            >
              QR
            </button>
            <button
              onclick="editDelivery('${item.id}')"
              class="bg-blue-100 text-blue-700 px-4 py-2 rounded-xl text-sm"
            >
              Edit
            </button>
            ${
              isSuperAdmin
              ?
              `
              <button
                onclick="deleteDelivery('${item.id}')"
                class="bg-red-100 text-red-700 px-4 py-2 rounded-xl text-sm"
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
  const {
    data
  } = await supabase
  .from('couriers')
  .select('*')
  .order('nama')
  couriersTable.innerHTML = ''
  data.forEach((item) => {
    let badge = `
      <span class="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs">
        Offline
      </span>
    `
    if(item.is_online) {
      badge = `
        <span class="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs">
          Online
        </span>
      `
    }
    couriersTable.innerHTML += `
      <tr class="border-b">
        <td class="px-6 py-5 font-semibold">
          ${item.nama}
        </td>
        <td class="px-6 py-5">
          ${item.username || '-'}
        </td>
        <td class="px-6 py-5">
          ${badge}
        </td>
        <td class="px-6 py-5">
          <div class="flex gap-2">
            <button
              onclick="editCourier('${item.id}', '${item.nama}', '${item.username}', '${item.no_hp}')"
              class="bg-blue-100 text-blue-700 px-4 py-2 rounded-xl text-sm"
            >
              Edit
            </button>
            <button
              onclick="toggleCourier('${item.id}', ${item.is_online})"
              class="bg-slate-100 px-4 py-2 rounded-xl text-sm"
            >
              Toggle
            </button>
            ${
              isSuperAdmin
              ?
              `
              <button
                onclick="deleteCourier('${item.id}')"
                class="bg-red-100 text-red-700 px-4 py-2 rounded-xl text-sm"
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
  let query = supabase
  .from('delivery_zones')
  .select('*')
  .order('kecamatan')
  const filter =
    document.getElementById(
      'zone-filter'
    )?.value
  if(filter) {
    query = query.eq(
      'kecamatan',
      filter
    )
  }
  const {
    data
  } = await query
  zonesTable.innerHTML = ''
  data.forEach((item) => {
    zonesTable.innerHTML += `
      <tr class="border-b">
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
          <div class="flex gap-2">
            <button
              onclick="editZone('${item.id}', '${item.ongkir}')"
              class="bg-blue-100 text-blue-700 px-4 py-2 rounded-xl text-sm"
            >
              Edit
            </button>
            ${
              isSuperAdmin
              ?
              `
              <button
                onclick="deleteZone('${item.id}')"
                class="bg-red-100 text-red-700 px-4 py-2 rounded-xl text-sm"
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
   FILTER EVENTS
====================================================== */
document
.getElementById(
  'search-input'
)
?.addEventListener(
  'input',
  loadDeliveries
)
document
.getElementById(
  'start-date'
)
?.addEventListener(
  'change',
  loadDeliveries
)
document
.getElementById(
  'end-date'
)
?.addEventListener(
  'change',
  loadDeliveries
)
document
.getElementById(
  'zone-filter'
)
?.addEventListener(
  'change',
  loadZones
)
/* ======================================================
   CREATE COURIER
====================================================== */
document
.getElementById(
  'courier-form'
)
?.addEventListener(
  'submit',
  async (e) => {
  e.preventDefault()
  const nama =
    document.getElementById(
      'courier-name'
    ).value
  const username =
    document.getElementById(
      'courier-email'
    ).value
  const no_hp =
    document.getElementById(
      'courier-password'
    ).value
  const {
    error
  } = await supabase
  .from('couriers')
  .insert([
    {
      nama,
      username,
      no_hp,
      password: '123456',
      is_online: false
    }
  ])
  if(error) {
    alert(error.message)
    return
  }
  alert(
    'Kurir berhasil ditambahkan'
  )
  closeModal(
    courierModal
  )
  document
  .getElementById(
    'courier-form'
  )
  .reset()
  loadCouriers()
})
/* ======================================================
   EDIT COURIER
====================================================== */
window.editCourier =
async (
  id,
  nama,
  username,
  no_hp
) => {
  const newNama =
    prompt(
      'Nama',
      nama
    )
  if(!newNama) return
  const newUsername =
    prompt(
      'Username',
      username
    )
  const newNoHp =
    prompt(
      'No HP',
      no_hp
    )
  await supabase
  .from('couriers')
  .update({
    nama:
      newNama,
    username:
      newUsername,
    no_hp:
      newNoHp
  })
  .eq('id', id)
  loadCouriers()
}
/* ======================================================
   DELETE
====================================================== */
window.deleteCourier =
async (id) => {
  if(!confirm(
    'Hapus kurir?'
  )) return
  await supabase
  .from('couriers')
  .delete()
  .eq('id', id)
  loadCouriers()
}
window.deleteZone =
async (id) => {
  if(!confirm(
    'Hapus ongkir?'
  )) return
  await supabase
  .from('delivery_zones')
  .delete()
  .eq('id', id)
  loadZones()
}
window.deleteDelivery =
async (id) => {
  if(!confirm(
    'Hapus pengantaran?'
  )) return
  await supabase
  .from('deliveries')
  .delete()
  .eq('id', id)
  loadDeliveries()
  loadAnalytics()
}
/* ======================================================
   TOGGLE COURIER
====================================================== */
window.toggleCourier =
async (id, current) => {
  await supabase
  .from('couriers')
  .update({
    is_online: !current
  })
  .eq('id', id)
  loadCouriers()
  loadAnalytics()
}
/* ======================================================
   EDIT ZONE
====================================================== */
window.editZone =
async (
  id,
  ongkir
) => {
  const newOngkir =
    prompt(
      'Edit Ongkir',
      ongkir
    )
  if(!newOngkir) return
  await supabase
  .from('delivery_zones')
  .update({
    ongkir:
      newOngkir
  })
  .eq('id', id)
  loadZones()
}
/* ======================================================
   QR
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
openSection(
  deliverySection,
  'menu-deliveries'
)
loadAnalytics()
loadDeliveries()
