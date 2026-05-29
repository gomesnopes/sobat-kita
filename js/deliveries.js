import { supabase }
from './supabase.js'
/* ======================================================
   ELEMENT
====================================================== */
const deliveryModal =
document.getElementById(
  'delivery-modal'
)
const qrModal =
document.getElementById(
  'qr-modal'
)
const btnNewDelivery =
document.getElementById(
  'btn-new-delivery'
)
const closeDeliveryModal =
document.getElementById(
  'close-delivery-modal'
)
const closeQrModal =
document.getElementById(
  'close-qr-modal'
)
const deliveryForm =
document.getElementById(
  'delivery-form'
)
const deliveryTable =
document.querySelector(
  '#deliveries-section tbody'
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
/* ======================================================
   OPEN MODAL
====================================================== */
btnNewDelivery?.addEventListener(
  'click',
  () => {
  deliveryModal
  .classList.remove(
    'hidden'
  )
  deliveryModal
  .classList.add(
    'flex'
  )
})
/* ======================================================
   CLOSE DELIVERY MODAL
====================================================== */
closeDeliveryModal?.addEventListener(
  'click',
  () => {
  deliveryModal
  .classList.remove(
    'flex'
  )
  deliveryModal
  .classList.add(
    'hidden'
  )
})
/* ======================================================
   CLOSE QR MODAL
====================================================== */
closeQrModal?.addEventListener(
  'click',
  () => {
  qrModal
  .classList.remove(
    'flex'
  )
  qrModal
  .classList.add(
    'hidden'
  )
})
/* ======================================================
   CLICK OUTSIDE
====================================================== */
window.addEventListener(
  'click',
  (e) => {
  if(e.target === deliveryModal) {
    deliveryModal
    .classList.remove(
      'flex'
    )
    deliveryModal
    .classList.add(
      'hidden'
    )
  }
  if(e.target === qrModal) {
    qrModal
    .classList.remove(
      'flex'
    )
    qrModal
    .classList.add(
      'hidden'
    )
  }
})
/* ======================================================
   LOAD KELURAHAN
====================================================== */
kecamatanSelect?.addEventListener(
  'change',
  async () => {
  const kecamatan =
    kecamatanSelect.value
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
  data?.forEach((item) => {
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
/* ======================================================
   ONGKIR
====================================================== */
kelurahanSelect?.addEventListener(
  'change',
  () => {
  const selected =
    kelurahanSelect.options[
      kelurahanSelect.selectedIndex
    ]
  const ongkir =
    selected.dataset.ongkir || 0
  ongkirDisplay.innerText =
    `Rp ${parseInt(
      ongkir
    ).toLocaleString()}`
})
/* ======================================================
   LOAD DELIVERIES
====================================================== */
async function loadDeliveries() {
  const {
    data
  } = await supabase
  .from('deliveries')
  .select('*')
  .order(
    'created_at',
    {
      ascending: false
    }
  )
  deliveryTable.innerHTML = ''
  data?.forEach((item) => {
    let badge = `
      <span
        class="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs"
      >
        Pending
      </span>
    `
    if(item.status === 'on_delivery') {
      badge = `
        <span
          class="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs"
        >
          Diantar
        </span>
      `
    }
    if(item.status === 'completed') {
      badge = `
        <span
          class="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs"
        >
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
            ${item.patient_phone}
          </p>
        </td>
        <td class="px-6 py-5">
          <p>
            ${item.kelurahan}
          </p>
          <p class="text-sm text-slate-500 mt-1">
            ${item.address}
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
              onclick="showQR('${item.id}')"
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
            <button
              onclick="deleteDelivery('${item.id}')"
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
   CREATE DELIVERY
====================================================== */
deliveryForm?.addEventListener(
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
  const kecamatan =
    kecamatanSelect.value
  const kelurahan =
    kelurahanSelect.value
  const address =
    document.getElementById(
      'patient-address'
    ).value
  const selected =
    kelurahanSelect.options[
      kelurahanSelect.selectedIndex
    ]
  const ongkir =
    selected.dataset.ongkir || 0
  // RANDOM TOKEN
  const qr_token =
    crypto.randomUUID()
  // AUTO COURIER
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

// INSERT

const {
  data: inserted,
  error
} = await supabase

.from('deliveries')

.insert([
  {
    patient_name,
    patient_phone,
    kecamatan,
    kelurahan,
    address,
    ongkir,
    qr_token,
    courier_id:
  courier?.id || null,

courier_name:
  courier?.nama || null
       
  }
])

.select()

.single()

if(error) {
  alert(error.message)
  return
}

deliveryForm.reset()

deliveryModal
.classList.remove(
  'flex'
)

deliveryModal
.classList.add(
  'hidden'
)

loadDeliveries()

if(inserted) {

  showQR(
    inserted.id
  )
}

})

/* ======================================================
   DELETE
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
   EDIT MODAL ELEMENT
====================================================== */
const editDeliveryModal =
document.getElementById(
  'edit-delivery-modal'
)
const closeEditDeliveryModal =
document.getElementById(
  'close-edit-delivery-modal'
)
const editDeliveryForm =
document.getElementById(
  'edit-delivery-form'
)
/* ======================================================
   CLOSE EDIT MODAL
====================================================== */
closeEditDeliveryModal
?.addEventListener(
  'click',
  () => {
  editDeliveryModal
  .classList.remove(
    'flex'
  )
  editDeliveryModal
  .classList.add(
    'hidden'
  )
})
/* ======================================================
   OPEN EDIT
====================================================== */
window.editDelivery =
async (id) => {
  const {
    data
  } = await supabase
  .from('deliveries')
  .select('*')
  .eq('id', id)
  .single()
  if(!data) return
  document.getElementById(
    'edit-delivery-id'
  ).value = data.id
  document.getElementById(
    'edit-patient-name'
  ).value = data.patient_name
  document.getElementById(
    'edit-patient-phone'
  ).value = data.patient_phone
  document.getElementById(
    'edit-address'
  ).value = data.address
  document.getElementById(
    'edit-status'
  ).value = data.status
  document.getElementById(
    'edit-ongkir'
  ).value = data.ongkir
  editDeliveryModal
  .classList.remove(
    'hidden'
  )
  editDeliveryModal
  .classList.add(
    'flex'
  )
}
/* ======================================================
   UPDATE DELIVERY
====================================================== */
editDeliveryForm
?.addEventListener(
  'submit',
  async (e) => {
  e.preventDefault()
  const id =
    document.getElementById(
      'edit-delivery-id'
    ).value
  const patient_name =
    document.getElementById(
      'edit-patient-name'
    ).value
  const patient_phone =
    document.getElementById(
      'edit-patient-phone'
    ).value
  const address =
    document.getElementById(
      'edit-address'
    ).value
  const status =
    document.getElementById(
      'edit-status'
    ).value
  const ongkir =
    document.getElementById(
      'edit-ongkir'
    ).value
  const {
    error
  } = await supabase
  .from('deliveries')
  .update({
    patient_name,
    patient_phone,
    address,
    status,
    ongkir
  })
  .eq('id', id)
  if(error) {
    alert(error.message)
    return
  }
  alert(
    'Pengantaran berhasil diupdate'
  )
  editDeliveryModal
  .classList.remove(
    'flex'
  )
  editDeliveryModal
  .classList.add(
    'hidden'
  )
  loadDeliveries()
})
/* ======================================================
   QR DETAIL
====================================================== */
window.showQR =
async (id) => {
  const {
    data
  } = await supabase
  .from('deliveries')
  .select('*')
  .eq('id', id)
  .single()
  if(!data) return
  qrModal
  .classList.remove(
    'hidden'
  )
  qrModal
  .classList.add(
    'flex'
  )
  // DETAIL
  document.getElementById(
    'qr-detail'
  ).innerHTML = `
    <div>
      <b>Pasien:</b>
      ${data.patient_name}
    </div>
    <div>
      <b>No HP:</b>
      ${data.patient_phone}
    </div>
    <div>
      <b>Kecamatan:</b>
      ${data.kecamatan}
    </div>
    <div>
      <b>Kelurahan:</b>
      ${data.kelurahan}
    </div>
    <div>
      <b>Alamat:</b>
      ${data.address}
    </div>
    <div>
      <b>Kurir:</b>
      ${data.courier_name || '-'}
    </div>
    <div>
      <b>Status:</b>
      ${data.status}
    </div>
    <div>
      <b>Ongkir:</b>
      Rp ${parseInt(
        data.ongkir || 0
      ).toLocaleString()}
    </div>
  `
 
/* ======================================================
   QR CODE
====================================================== */

document.getElementById(
  'qrcode'
).innerHTML = ''

const trackingUrl =
`${window.location.origin}${
  window.location.pathname.includes('/sobat-kita')
    ? '/sobat-kita'
    : ''
}/tracking.html?token=${data.qr_token}`

new QRCode(
  document.getElementById(
    'qrcode'
  ),
  {
    text: trackingUrl,
    width: 220,
    height: 220
  }
)

}




/* ======================================================
   PRINT
====================================================== */
document
.getElementById(
  'print-qr'
)
?.addEventListener(
  'click',
  () => {
  window.print()
})
/* ======================================================
   INITIAL
====================================================== */
loadDeliveries()
