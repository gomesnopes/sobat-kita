import { supabase }
from './supabase.js'
/* ======================================================
   GET TOKEN
====================================================== */
const params =
new URLSearchParams(
  window.location.search
)
const token =
params.get('token')
const container =
document.getElementById(
  'tracking-status'
)
/* ======================================================
   LOAD TRACKING
====================================================== */
async function loadTracking() {
  if(!token) {
    container.innerHTML = `
      <div
        class="bg-red-100 text-red-700 p-5 rounded-2xl text-center"
      >
        Token tracking tidak ditemukan
      </div>
    `
    return
  }
  const {
    data,
    error
  } = await supabase
  .from('deliveries')
  .select('*')
  .eq(
    'qr_token',
    token
  )
  .single()
  if(error || !data) {
    container.innerHTML = `
      <div
        class="bg-red-100 text-red-700 p-5 rounded-2xl text-center"
      >
        Data pengantaran tidak ditemukan
      </div>
    `
    return
  }
  /* ======================================================
     STATUS BADGE
  ====================================================== */
  let badge = `
    <div
      class="bg-slate-100 text-slate-700 px-5 py-3 rounded-2xl inline-block"
    >
      Pending
    </div>
  `
  let progress = 33
  if(data.status === 'on_delivery') {
    badge = `
      <div
        class="bg-blue-100 text-blue-700 px-5 py-3 rounded-2xl inline-block"
      >
        Sedang Diantar
      </div>
    `
    progress = 66
  }
  if(data.status === 'completed') {
    badge = `
      <div
        class="bg-green-100 text-green-700 px-5 py-3 rounded-2xl inline-block"
      >
        Selesai
      </div>
    `
    progress = 100
  }
  /* ======================================================
     RENDER
  ====================================================== */
  container.innerHTML = `
    <!-- STATUS -->
    <div class="text-center">
      ${badge}
    </div>
    <!-- PROGRESS -->
    <div class="mt-6">
      <div
        class="w-full bg-slate-200 rounded-full h-4 overflow-hidden"
      >
        <div
          class="bg-green-600 h-full"
          style="width:${progress}%"
        ></div>
      </div>
    </div>
    <!-- DETAIL -->
    <div
      class="mt-8 space-y-4 text-sm"
    >
      <div
        class="bg-slate-50 rounded-2xl p-5"
      >
        <p class="text-slate-500">
          Nama Pasien
        </p>
        <h3 class="font-semibold mt-1">
          ${data.patient_name}
        </h3>
      </div>
      <div
        class="bg-slate-50 rounded-2xl p-5"
      >
        <p class="text-slate-500">
          Kurir
        </p>
        <h3 class="font-semibold mt-1">
          ${data.courier_name || '-'}
        </h3>
      </div>
      <div
        class="bg-slate-50 rounded-2xl p-5"
      >
        <p class="text-slate-500">
          Kecamatan
        </p>
        <h3 class="font-semibold mt-1">
          ${data.kecamatan}
        </h3>
      </div>
      <div
        class="bg-slate-50 rounded-2xl p-5"
      >
        <p class="text-slate-500">
          Kelurahan
        </p>
        <h3 class="font-semibold mt-1">
          ${data.kelurahan}
        </h3>
      </div>
      <div
        class="bg-slate-50 rounded-2xl p-5"
      >
        <p class="text-slate-500">
          Alamat
        </p>
        <h3 class="font-semibold mt-1">
          ${data.address}
        </h3>
      </div>
      <div
        class="bg-slate-50 rounded-2xl p-5"
      >
        <p class="text-slate-500">
          Ongkir
        </p>
        <h3 class="font-semibold mt-1 text-green-700">
          Rp ${parseInt(
            data.ongkir || 0
          ).toLocaleString()}
        </h3>
      </div>
    </div>
  `
}
/* ======================================================
   INITIAL
====================================================== */
loadTracking()
