
import { supabase }
from './supabase.js'

const loginSection =
document.getElementById(
  'login-section'
)

const dashboardSection =
document.getElementById(
  'dashboard-section'
)

const deliveryList =
document.getElementById(
  'delivery-list'
)

const courierName =
document.getElementById(
  'courier-name'
)

const btnLogin =
document.getElementById(
  'btn-login'
)

const btnLogout =
document.getElementById(
  'btn-logout'
)

const toggleOnline =
document.getElementById(
  'toggle-online'
)

const scannerModal =
document.getElementById(
  'scanner-modal'
)

const btnOpenScanner =
document.getElementById(
  'btn-open-scanner'
)

const closeScanner =
document.getElementById(
  'close-scanner'
)

let html5QrCode


/* LOGIN */

btnLogin?.addEventListener(
  'click',
  async () => {

    const username =
    document.getElementById(
      'username'
    ).value

    const phone =
    document.getElementById(
      'phone'
    ).value

    const {
      data
    } = await supabase

    .from('couriers')

    .select('*')

    .eq(
      'username',
      username
    )

    .eq(
      'phone',
      phone
    )

    .single()

    if(!data) {

      alert(
        'Login gagal'
      )

      return
    }

    localStorage.setItem(
      'courier_id',
      data.id
    )

/* QR SCANNER */

btnOpenScanner
?.addEventListener(
  'click',
  () => {

    scannerModal
    .classList.remove(
      'hidden'
    )

    scannerModal
    .classList.add(
      'flex'
    )

    html5QrCode =
    new Html5Qrcode(
      'reader'
    )

    html5QrCode.start(

      {
        facingMode:
        'environment'
      },

      {
        fps: 10,
        qrbox: 250
      },

      (decodedText) => {

        html5QrCode.stop()

        window.location.href =
        decodedText
      }

    )
  }
)

closeScanner
?.addEventListener(
  'click',
  async () => {

    try {

      if(html5QrCode) {

        await html5QrCode.stop()
      }

    } catch(err) {

      console.log(err)
    }

    scannerModal
    .classList.remove(
      'flex'
    )

    scannerModal
    .classList.add(
      'hidden'
    )
  }
)


    loadCourier()
  }
)

/* LOAD COURIER */

async function loadCourier() {

  const courierId =
  localStorage.getItem(
    'courier_id'
  )

  if(!courierId) return

  const {
    data: courier
  } = await supabase

  .from('couriers')

  .select('*')

  .eq(
    'id',
    courierId
  )

  .single()

  if(!courier) return

  loginSection.classList.add(
    'hidden'
  )

  dashboardSection.classList.remove(
    'hidden'
  )

  courierName.innerText =
  courier.nama

  toggleOnline.innerText =
  courier.is_online
    ? 'Online'
    : 'Offline'

  loadDeliveries(
    courier.id
  )
}

/* DELIVERY */

async function loadDeliveries(
  courierId
) {

  const {
    data
  } = await supabase

  .from('deliveries')

  .select('*')

  .eq(
    'courier_id',
    courierId
  )

  .order(
    'created_at',
    {
      ascending: false
    }
  )

  deliveryList.innerHTML = ''

  data?.forEach(
    (item) => {

      deliveryList.innerHTML += `
        <div class="bg-white rounded-3xl p-5 shadow">

          <h3 class="font-bold">
            ${item.patient_name}
          </h3>

          <p class="text-sm text-slate-500 mt-2">
            ${item.address}
          </p>

          <p class="mt-2">
            Status:
            ${item.status}
          </p>

          <a
            href="./tracking.html?token=${item.qr_token}"
            class="block mt-4 bg-green-700 text-white text-center py-3 rounded-2xl"
          >
            Lihat Detail
          </a>

        </div>
      `
    }
  )
}

/* TOGGLE ONLINE */

toggleOnline?.addEventListener(
  'click',
  async () => {

    const courierId =
    localStorage.getItem(
      'courier_id'
    )

    const {
      data
    } = await supabase

    .from('couriers')

    .select('*')

    .eq(
      'id',
      courierId
    )

    .single()

    const confirmText =
    data.is_online
      ? 'Yakin offline?'
      : 'Yakin online?'

    if(
      !confirm(
        confirmText
      )
    ) return

    await supabase

    .from('couriers')

    .update({
      is_online:
      !data.is_online
    })

    .eq(
      'id',
      courierId
    )

    loadCourier()
  }
)

/* LOGOUT */

btnLogout?.addEventListener(
  'click',
  () => {

    localStorage.removeItem(
      'courier_id'
    )

    location.reload()
  }
)

loadCourier()

