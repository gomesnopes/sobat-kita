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
   ELEMENT
====================================================== */
const sections = {
  deliveries:
    document.getElementById(
      'deliveries-section'
    ),
  zones:
    document.getElementById(
      'zones-section'
    ),
  couriers:
    document.getElementById(
      'couriers-section'
    )
}
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
   TAB SWITCH
====================================================== */
function openSection(name) {
  Object.values(sections)
  .forEach((section) => {
    section.classList.add(
      'hidden'
    )
  })
  sections[name]
  .classList.remove(
    'hidden'
  )
  menus.forEach((menu) => {
    menu.classList.remove(
      'active'
    )
  })
  document
  .getElementById(
    `menu-${name}`
  )
  .classList.add(
    'active'
  )
}
document
.getElementById(
  'menu-deliveries'
)
.addEventListener(
  'click',
  () => {
    openSection(
      'deliveries'
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
      'zones'
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
      'couriers'
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
   CLOSE BUTTON
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
   CLICK OUTSIDE MODAL
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
   OPEN MODAL BUTTON
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
  // ONLINE COURIERS
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
  const {
    data,
    error
  } = await supabase
  .from('deliveries')
  .select('*')
  .order(
    'created_at',
    {
      ascending: false
    }
  )
  if(error) {
    console.log(error)
    return
  }
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
            ${
              isSuperAdmin
              ?
              `
                <button
                  onclick="editDelivery('${item.id}')"
                  class="bg-blue-100 text-blue-700 px-4 py-2 rounded-xl text-sm"
                >
                  Edit
                </button>
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
    data,
    error
  } = await supabase
  .from('couriers')
  .select('*')
  .order(
    'nama'
  )
  if(error) {
    console.log(error)
    return
  }
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
          ${item.email || '-'}
        </td>
        <td class="px-6 py-5">
          ${badge}
        </td>
        <td class="px-6 py-5">
          <div class="flex gap-2">
            <button
              onclick="toggleCourier('${item.id}', ${item.is_online})"
              class="bg-blue-100 text-blue-700 px-4 py-2 rounded-xl text-sm"
            >
              Toggle
            </button>
            <button
              onclick="deleteCourier('${item.id}')"
              class="bg-red-100 text-red-700 px-4 py-2 rounded-xl text-sm"
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
   LOAD ZONES
====================================================== */
async function loadZones() {
  const {
    data
  } = await supabase
  .from('delivery_zones')
  .select('*')
  .order(
    'kecamatan'
  )
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
              onclick="editZone('${item.id}', '${item.kecamatan}', '${item.kelurahan}', '${item.ongkir}')"
              class="bg-blue-100 text-blue-700 px-4 py-2 rounded-xl text-sm"
            >
              Edit
            </button>
            <button
              onclick="deleteZone('${item.id}')"
              class="bg-red-100 text-red-700 px-4 py-2 rounded-xl text-sm"
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
   KECAMATAN
====================================================== */
const kecamatanList = [
  'Ternate Selatan',
  'Ternate Tengah',
  'Ternate Utara',
  'Pulau Ternate',
  'Ternate Barat'
]
const kecamatanSelect =
document.getElementById(
  'kecamatan'
)
if(kecamatanSelect) {
  kecamatanSelect.innerHTML = `
    <option value="">
      Pilih Kecamatan
    </option>
  `
  kecamatanList.forEach((item) => {
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
const kelurahanSelect =
document.getElementById(
  'kelurahan'
)
const ongkirDisplay =
document.getElementById(
  'ongkir-display'
)
let selectedOngkir = 0
kecamatanSelect?.addEventListener(
  'change',
  async () => {
  const {
    data
  } = await supabase
  .from('delivery_zones')
  .select('*')
  .eq(
    'kecamatan',
    kecamatanSelect.value
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
      nama,
      email,
      password,
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
  document
  .getElementById(
    'courier-form'
  )
  .reset()
  closeModal(
    courierModal
  )
  loadCouriers()
})
/* ======================================================
   CREATE DELIVERY
====================================================== */
document
.getElementById(
  'delivery-form'
)
?.addEventListener(
  'submit',
  async (e) => {
  e.preventDefault()
  const patient_name =
    document.getElementById(
      'patient-name'
    ).value
  const patient_phone =
    document.getElementById(
      'patient-phone'
    ).value
  const kelurahan =
    kelurahanSelect.value
  const address =
    document.getElementById(
      'address'
    ).value
  const qr_token =
    crypto.randomUUID()
  const {
    data: courier
  } = await supabase
  .from('couriers')
  .select('*')
  .eq(
    'is_online',
    true
  )
  .limit(1)
  .single()
  const {
    error
  } = await supabase
  .from('deliveries')
  .insert([
    {
      patient_name,
      patient_phone,
      kelurahan,
      address,
      qr_token,
      ongkir:
        selectedOngkir,
      courier_id:
        courier?.id || null,
      courier_name:
        courier?.nama || null,
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
  alert(
    'Pengantaran berhasil dibuat'
  )
  document
  .getElementById(
    'delivery-form'
  )
  .reset()
  closeModal(
    deliveryModal
  )
  showQR(qr_token)
  loadDeliveries()
  loadAnalytics()
})
/* ======================================================
   CREATE ZONE
====================================================== */
document
.getElementById(
  'zone-form'
)
?.addEventListener(
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
  closeModal(
    zoneModal
  )
  document
  .getElementById(
    'zone-form'
  )
  .reset()
  loadZones()
})
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
   DELETE
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
window.deleteZone =
async (id) => {
  const yes =
    confirm(
      'Hapus ongkir?'
    )
  if(!yes) return
  await supabase
  .from('delivery_zones')
  .delete()
  .eq('id', id)
  loadZones()
}
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
  kecamatan,
  kelurahan,
  ongkir
) => {
  const newOngkir =
    prompt(
      `Edit ongkir ${kelurahan}`,
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
   EDIT DELIVERY
====================================================== */
window.editDelivery =
async (id) => {
  const status =
    prompt(
      'pending / on_delivery / completed'
    )
  if(!status) return
  await supabase
  .from('deliveries')
  .update({
    status
  })
  .eq('id', id)
  loadDeliveries()
  loadAnalytics()
}
/* ======================================================
   SEARCH
====================================================== */
document
.getElementById(
  'search-input'
)
?.addEventListener(
  'input',
  async (e) => {
  const keyword =
    e.target.value
  const {
    data
  } = await supabase
  .from('deliveries')
  .select('*')
  .ilike(
    'patient_name',
    `%${keyword}%`
  )
  deliveryTable.innerHTML = ''
  data.forEach((item) => {
    deliveryTable.innerHTML += `
      <tr class="border-b">
        <td class="px-6 py-5">
          ${item.patient_name}
        </td>
        <td class="px-6 py-5">
          ${item.kelurahan}
        </td>
        <td class="px-6 py-5">
          ${item.courier_name || '-'}
        </td>
        <td class="px-6 py-5">
          ${item.status}
        </td>
        <td class="px-6 py-5">
          Rp ${parseInt(
            item.ongkir || 0
          ).toLocaleString()}
        </td>
        <td class="px-6 py-5">
          -
        </td>
      </tr>
    `
  })
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
loadAnalytics()
loadDeliveries()
