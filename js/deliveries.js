import { supabase }
from './supabase.js'
/* ======================================================
   ELEMENT
====================================================== */
const deliveryTable =
document.querySelector(
  '#deliveries-section tbody'
)
const deliveryModal =
document.getElementById(
  'delivery-modal'
)
const btnAddDelivery =
document.getElementById(
  'btn-add-delivery'
)
const closeDeliveryModal =
document.getElementById(
  'close-delivery-modal'
)
const deliveryForm =
document.getElementById(
  'delivery-form'
)
const qrModal =
document.getElementById(
  'qr-modal'
)
const closeQrModal =
document.getElementById(
  'close-qr-modal'
)
/* ======================================================
   OPEN DELIVERY MODAL
====================================================== */
btnAddDelivery?.addEventListener(
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
closeDeliveryModal
?.addEventListener(
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
closeQrModal
?.addEventListener(
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
    console.error(error)
    return
  }
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
            ${item.patient_name || '-'}
          </p>
          <p class="text-sm text-slate-500 mt-1">
            ${item.patient_phone || '-'}
          </p>
        </td>
        <td class="px-6 py-5">
          <p>
            ${item.kelurahan || '-'}
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
deliveryForm
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
  const kecamatan =
    document.getElementById(
      'kecamatan'
    ).value
  const kelurahan =
    document.getElementById(
      'kelurahan'
    ).value
  const address =
    document.getElementById(
      'address'
    ).value
  const ongkir =
    document.getElementById(
      'ongkir'
    ).value
  /* ======================================================
     FIND COURIER
  ====================================================== */
  const {
    data: couriers
  } = await supabase
  .from('couriers')
  .select('*')
  .eq(
    'is_online',
    true
  )
  .limit(1)
  let courier_name = '-'
  if(couriers?.length) {
    courier_name =
      couriers[0].nama
  }
  /* ======================================================
     QR TOKEN
  ====================================================== */
  const qr_token =
    crypto.randomUUID()
  /* ======================================================
     INSERT
  ====================================================== */
  const {
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
      courier_name,
      status: 'pending',
      qr_token
    }
  ])
  if(error) {
    alert(error.message)
    return
  }
  /* ======================================================
     RESET
  ====================================================== */
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
  /* ======================================================
     OPEN QR
  ====================================================== */
  const {
    data: latest
  } = await supabase
  .from('deliveries')
  .select('*')
  .eq(
    'qr_token',
    qr_token
  )
  .single()
  if(latest) {
    showQR(
      latest.id
    )
  }
})
/* ======================================================
   SHOW QR
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
  /* ======================================================
     OPEN MODAL
  ====================================================== */
  qrModal
  .classList.remove(
    'hidden'
  )
  qrModal
  .classList.add(
    'flex'
  )
  /* ======================================================
     DETAIL
  ====================================================== */
  document.getElementById(
    'qr-detail'
  ).innerHTML = `
    <div class="text-center mb-6">
      <img
        src="./assets/icon-192.png"
        class="w-20 h-20 mx-auto mb-3"
      >
      <h2 class="text-2xl font-bold">
        SOBAT KITA
      </h2>
      <p class="text-slate-500 text-sm mt-1">
        Detail Pengantaran
      </p>
    </div>
    <div class="space-y-3 text-sm">
      <div>
        <b>Pasien:</b>
        ${data.patient_name || '-'}
      </div>
      <div>
        <b>No HP:</b>
        ${data.patient_phone || '-'}
      </div>
      <div>
        <b>Kecamatan:</b>
        ${data.kecamatan || '-'}
      </div>
      <div>
        <b>Kelurahan:</b>
        ${data.kelurahan || '-'}
      </div>
      <div>
        <b>Alamat:</b>
        ${data.address || '-'}
      </div>
      <div>
        <b>Kurir:</b>
        ${data.courier_name || '-'}
      </div>
      <div>
        <b>Status:</b>
        ${data.status || '-'}
      </div>
      <div>
        <b>Ongkir:</b>
        Rp ${parseInt(
          data.ongkir || 0
        ).toLocaleString()}
      </div>
    </div>
  `
  /* ======================================================
     QR CODE
  ====================================================== */
  document.getElementById(
    'qr-code'
  ).innerHTML = ''
  new QRCode(
    document.getElementById(
      'qr-code'
    ),
    {
      text:
      `${window.location.origin}/tracking.html?token=${data.qr_token}`,
      width: 220,
      height: 220
    }
  )
}
/* ======================================================
   DELETE
====================================================== */
window.deleteDelivery =
async (id) => {
  const yes =
    confirm(
      'Hapus pengantaran ini?'
    )
  if(!yes) return
  await supabase
  .from('deliveries')
  .delete()
  .eq('id', id)
  loadDeliveries()
}
/* ======================================================
   EDIT DELIVERY
====================================================== */
window.editDelivery =
async (id) => {
  alert(
    'Edit delivery sementara aktif di versi sebelumnya 😄'
  )
}
/* ======================================================
   INITIAL
====================================================== */
loadDeliveries()
