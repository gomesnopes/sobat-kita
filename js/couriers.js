import { supabase }
from './supabase.js'
/* ======================================================
   ELEMENT
====================================================== */
const courierTable =
document.querySelector(
  '#couriers-section tbody'
)
const courierModal =
document.getElementById(
  'courier-modal'
)
const btnAddCourier =
document.getElementById(
  'btn-add-courier'
)
const closeCourierModal =
document.getElementById(
  'close-courier-modal'
)
const courierForm =
document.getElementById(
  'courier-form'
)
/* ======================================================
   OPEN MODAL
====================================================== */
btnAddCourier?.addEventListener(
  'click',
  () => {
  courierModal
  .classList.remove(
    'hidden'
  )
  courierModal
  .classList.add(
    'flex'
  )
})
/* ======================================================
   CLOSE MODAL
====================================================== */
closeCourierModal?.addEventListener(
  'click',
  () => {
  courierModal
  .classList.remove(
    'flex'
  )
  courierModal
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
  if(e.target === courierModal) {
    courierModal
    .classList.remove(
      'flex'
    )
    courierModal
    .classList.add(
      'hidden'
    )
  }
})
/* ======================================================
   LOAD COURIERS
====================================================== */
async function loadCouriers() {
  const {
    data
  } = await supabase
  .from('couriers')
  .select('*')
  .order(
    'created_at',
    {
      ascending: false
    }
  )
  courierTable.innerHTML = ''
  data?.forEach((item) => {
    let badge = `
      <span
        class="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs"
      >
        Offline
      </span>
    `
    if(item.is_online) {
      badge = `
        <span
          class="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs"
        >
          Online
        </span>
      `
    }
    courierTable.innerHTML += `
      <tr class="border-b">
        <td class="px-6 py-5">
          ${item.nama}
        </td>
        <td class="px-6 py-5">
          ${item.username}
        </td>
        <td class="px-6 py-5">
          ${badge}
        </td>
        <td class="px-6 py-5">
          <div class="flex gap-2">
            <button
              onclick="toggleCourier('${item.id}', ${item.is_online})"
              class="bg-slate-100 px-4 py-2 rounded-xl text-sm"
            >
              Toggle
            </button>
            <button
              onclick="editCourier('${item.id}')"
              class="bg-blue-100 text-blue-700 px-4 py-2 rounded-xl text-sm"
            >
              Edit
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
   CREATE
====================================================== */
courierForm?.addEventListener(
  'submit',
  async (e) => {
  e.preventDefault()
  const nama =
    document.getElementById(
      'courier-name'
    ).value
  const username =
    document.getElementById(
      'courier-username'
    ).value
  const no_hp =
    document.getElementById(
      'courier-phone'
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
      username,
      no_hp,
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
  courierForm.reset()
  courierModal
  .classList.remove(
    'flex'
  )
  courierModal
  .classList.add(
    'hidden'
  )
  loadCouriers()
})
/* ======================================================
   TOGGLE
====================================================== */
window.toggleCourier =
async (
  id,
  current
) => {
  await supabase
  .from('couriers')
  .update({
    is_online:
      !current
  })
  .eq('id', id)
  loadCouriers()
}
/* ======================================================
   EDIT
====================================================== */
window.editCourier =
async (id) => {
  const {
    data
  } = await supabase
  .from('couriers')
  .select('*')
  .eq('id', id)
  .single()
  if(!data) return
  const nama =
    prompt(
      'Nama',
      data.nama
    )
  if(!nama) return
  const username =
    prompt(
      'Username',
      data.username
    )
  const no_hp =
    prompt(
      'No HP',
      data.no_hp
    )
  await supabase
  .from('couriers')
  .update({
    nama,
    username,
    no_hp
  })
  .eq('id', id)
  alert(
    'Kurir berhasil diupdate'
  )
  loadCouriers()
}
/* ======================================================
   DELETE
====================================================== */
window.deleteCourier =
async (id) => {
  const yes =
    confirm(
      'Hapus kurir ini?'
    )
  if(!yes) return
  await supabase
  .from('couriers')
  .delete()
  .eq('id', id)
  loadCouriers()
}
/* ======================================================
   INITIAL
====================================================== */
loadCouriers()
