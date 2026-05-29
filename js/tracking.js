
import { supabase }
from './supabase.js'

const content =
document.getElementById(
  'tracking-content'
)

const params =
new URLSearchParams(
  window.location.search
)

const token =
params.get('token')

const courierId =
localStorage.getItem(
  'courier_id'
)

async function loadTracking() {

  if(!token) {

    content.innerHTML = `
      <div class="text-center text-red-500">
        Token tidak ditemukan
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

    content.innerHTML = `
      <div class="text-center text-red-500">
        Data tidak ditemukan
      </div>
    `

    return
  }

  let badge = `
    <span
      class="bg-yellow-100 text-yellow-700 px-4 py-2 rounded-full text-sm"
    >
      Pending
    </span>
  `

  let progress = 33

  if(
    data.status ===
    'on_delivery'
  ) {

    badge = `
      <span
        class="bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm"
      >
        Sedang Diantar
      </span>
    `

    progress = 66
  }

  if(
    data.status ===
    'completed'
  ) {

    badge = `
      <span
        class="bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm"
      >
        Selesai
      </span>
    `

    progress = 100
  }

  let actionButton = ''

  if(
    courierId &&
    data.status ===
    'pending'
  ) {

    actionButton = `
      <button
        id="btn-pickup"
        class="w-full bg-blue-600 text-white py-4 rounded-2xl mt-8 font-semibold"
      >
        Ambil Obat
      </button>
    `
  }

  if(
    courierId &&
    data.status ===
    'on_delivery'
  ) {

    actionButton = `
      <button
        id="btn-complete"
        class="w-full bg-green-700 text-white py-4 rounded-2xl mt-8 font-semibold"
      >
        Selesaikan Pengantaran
      </button>
    `
  }

  content.innerHTML = `

    <div class="text-center">

      ${badge}

    </div>

    <div
      class="w-full bg-slate-200 rounded-full h-3 mt-6 overflow-hidden"
    >

      <div
        class="bg-green-600 h-full"
        style="width:${progress}%"
      ></div>

    </div>

    <div
      class="space-y-4 mt-8"
    >

      <div>
        <b>Nama Pasien</b>
        <p>
          ${data.patient_name || '-'}
        </p>
      </div>

      <div>
        <b>No HP</b>
        <p>
          ${data.patient_phone || '-'}
        </p>
      </div>

      <div>
        <b>Kurir</b>
        <p>
          ${data.courier_name || '-'}
        </p>
      </div>

      <div>
        <b>Kecamatan</b>
        <p>
          ${data.kecamatan || '-'}
        </p>
      </div>

      <div>
        <b>Kelurahan</b>
        <p>
          ${data.kelurahan || '-'}
        </p>
      </div>

      <div>
        <b>Alamat</b>
        <p>
          ${data.address || '-'}
        </p>
      </div>

      <div>
        <b>Ongkir</b>
        <p class="font-semibold text-green-700">
          Rp ${parseInt(
            data.ongkir || 0
          ).toLocaleString()}
        </p>
      </div>

      <div>
        <b>Status</b>
        <p>
          ${data.status}
        </p>
      </div>

    </div>

    ${actionButton}
  `

  const pickupBtn =
  document.getElementById(
    'btn-pickup'
  )

  const completeBtn =
  document.getElementById(
    'btn-complete'
  )

  pickupBtn?.addEventListener(
    'click',
    async () => {

      const yes =
      confirm(
        'Ambil obat sekarang?'
      )

      if(!yes) return

      const {
        error
      } = await supabase

      .from('deliveries')

      .update({
        status:
        'on_delivery'
      })

      .eq(
        'id',
        data.id
      )

      if(error) {
        alert(
          error.message
        )
        return
      }

      location.reload()
    }
  )

  completeBtn?.addEventListener(
    'click',
    async () => {

      const yes =
      confirm(
        'Selesaikan pengantaran?'
      )

      if(!yes) return

      const {
        error
      } = await supabase

      .from('deliveries')

      .update({
        status:
        'completed'
      })

      .eq(
        'id',
        data.id
      )

      if(error) {
        alert(
          error.message
        )
        return
      }

      location.reload()
    }
  )
}

loadTracking()
```
