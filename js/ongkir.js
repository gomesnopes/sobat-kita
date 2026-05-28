import { supabase }
from './supabase.js'
/* ======================================================
   ELEMENT
====================================================== */
const zonesTable =
document.querySelector(
  '#zones-section tbody'
)
/* ======================================================
   LOAD ONGKIR
====================================================== */
async function loadZones() {
  const {
    data
  } = await supabase
  .from('delivery_zones')
  .select('*')
  .order(
    'kecamatan',
    {
      ascending: true
    }
  )
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
   ADD ONGKIR MODAL
====================================================== */
const addZoneBtn =
document.getElementById(
  'btn-add-zone'
)
if(addZoneBtn) {
  addZoneBtn.addEventListener(
    'click',
    () => {
    const kecamatan =
      prompt(
        'Nama Kecamatan'
      )
    if(!kecamatan) return
    const kelurahan =
      prompt(
        'Nama Kelurahan'
      )
    if(!kelurahan) return
    const ongkir =
      prompt(
        'Nominal Ongkir'
      )
    if(!ongkir) return
    createZone(
      kecamatan,
      kelurahan,
      ongkir
    )
  })
}
/* ======================================================
   CREATE
====================================================== */
async function createZone(
  kecamatan,
  kelurahan,
  ongkir
) {
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
  loadZones()
}
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
   FILTER KECAMATAN
====================================================== */
const zoneFilter =
document.querySelector(
  '#zones-section select'
)
zoneFilter?.addEventListener(
  'change',
  async () => {
  const value =
    zoneFilter.value
  let query = supabase
  .from('delivery_zones')
  .select('*')
  if(
    value !==
    'Semua Kecamatan'
  ) {
    query = query.eq(
      'kecamatan',
      value
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
})
/* ======================================================
   INITIAL
====================================================== */
loadZones()
