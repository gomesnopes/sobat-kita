import { supabase }
from './supabase.js'
/* ======================================================
   ELEMENT
====================================================== */
const zonesTable =
document.querySelector(
  '#zones-section tbody'
)
const zoneModal =
document.getElementById(
  'zone-modal'
)
const btnAddZone =
document.getElementById(
  'btn-add-zone'
)
const closeZoneModal =
document.getElementById(
  'close-zone-modal'
)
const zoneForm =
document.getElementById(
  'zone-form'
)
const zoneFilter =
document.querySelector(
  '#zones-section select'
)
/* ======================================================
   OPEN MODAL
====================================================== */
btnAddZone?.addEventListener(
  'click',
  () => {
  zoneModal
  .classList.remove(
    'hidden'
  )
  zoneModal
  .classList.add(
    'flex'
  )
})
/* ======================================================
   CLOSE MODAL
====================================================== */
closeZoneModal?.addEventListener(
  'click',
  () => {
  zoneModal
  .classList.remove(
    'flex'
  )
  zoneModal
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
  if(e.target === zoneModal) {
    zoneModal
    .classList.remove(
      'flex'
    )
    zoneModal
    .classList.add(
      'hidden'
    )
  }
})
/* ======================================================
   LOAD ONGKIR
====================================================== */
async function loadZones() {
  let query = supabase
  .from('delivery_zones')
  .select('*')
  .order(
    'kecamatan',
    {
      ascending: true
    }
  )
  // FILTER
  const filter =
    zoneFilter?.value
  if(
    filter &&
    filter !==
    'Semua Kecamatan'
  ) {
    query = query.eq(
      'kecamatan',
      filter
    )
  }
  const {
    data
  } = await query
  zonesTable.innerHTML = ''
  data?.forEach((item) => {
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
            item.ongkir || 0
          ).toLocaleString()}
        </td>
        <td class="px-6 py-5">
          <div class="flex gap-2">
            <button
              onclick="editZone('${item.id}')"
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
   CREATE ONGKIR
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
  const {
    error
  } = await supabase
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
  alert(
    'Ongkir berhasil ditambahkan'
  )
  zoneForm.reset()
  zoneModal
  .classList.remove(
    'flex'
  )
  zoneModal
  .classList.add(
    'hidden'
  )
  loadZones()
})
/* ======================================================
   EDIT
====================================================== */
window.editZone =
async (id) => {
  const {
    data
  } = await supabase
  .from('delivery_zones')
  .select('*')
  .eq('id', id)
  .single()
  if(!data) return
  const newOngkir =
    prompt(
      'Edit Ongkir',
      data.ongkir
    )
  if(!newOngkir) return
  const {
    error
  } = await supabase
  .from('delivery_zones')
  .update({
    ongkir:
      newOngkir
  })
  .eq('id', id)
  if(error) {
    alert(error.message)
    return
  }
  alert(
    'Ongkir berhasil diupdate'
  )
  loadZones()
}
/* ======================================================
   DELETE
====================================================== */
window.deleteZone =
async (id) => {
  const yes =
    confirm(
      'Hapus ongkir ini?'
    )
  if(!yes) return
  const {
    error
  } = await supabase
  .from('delivery_zones')
  .delete()
  .eq('id', id)
  if(error) {
    alert(error.message)
    return
  }
  alert(
    'Ongkir berhasil dihapus'
  )
  loadZones()
}
/* ======================================================
   FILTER
====================================================== */
zoneFilter?.addEventListener(
  'change',
  () => {
  loadZones()
})
/* ======================================================
   INITIAL
====================================================== */
loadZones()
