import { supabase } from './supabase.js'
/* ======================================================
   ELEMENTS
====================================================== */
const sidebar =
document.getElementById(
  'sidebar'
)
const toggleSidebar =
document.getElementById(
  'toggle-sidebar'
)
if(toggleSidebar) {
  toggleSidebar.addEventListener(
    'click',
    () => {
    sidebar.classList.toggle(
      'w-20'
    )
    sidebar.classList.toggle(
      'w-72'
    )
  })
}

const deliveriesSection =
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
const tbody =
document.getElementById(
'delivery-table-body'
)
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
const deliveryModal =
document.getElementById(
'delivery-modal'
)
const deliveryForm =
document.getElementById(
'delivery-form'
)
const qrModal =
document.getElementById(
'qr-modal'
)
const qrBox =
document.getElementById(
'qrcode'
)
const detailModal =
document.getElementById(
'detail-modal'
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
const zoneModal =
document.getElementById(
'zone-modal'
)
const zoneForm =
document.getElementById(
'zone-form'
)
const courierModal =
document.getElementById(
'courier-modal'
)
const courierForm =
document.getElementById(
'courier-form'
)
let selectedOngkir = 0
let currentPage = 1
const limit = 5
/* ======================================================
   SAFE EVENT HELPER
====================================================== */
function safeClick(id, callback) {
const el =
document.getElementById(id)
if(el) {
el.addEventListener(
'click',
callback
)
}
}
/* ======================================================
   NAVIGATION
====================================================== */
safeClick(
'menu-deliveries',
() => {
deliveriesSection?.classList.remove(
'hidden'
)
zonesSection?.classList.add(
'hidden'
)
couriersSection?.classList.add(
'hidden'
)
})
safeClick(
'menu-zones',
() => {
zonesSection?.classList.remove(
'hidden'
)
deliveriesSection?.classList.add(
'hidden'
)
couriersSection?.classList.add(
'hidden'
)
loadZones()
})
safeClick(
'menu-couriers',
() => {
couriersSection?.classList.remove(
'hidden'
)
deliveriesSection?.classList.add(
'hidden'
)
zonesSection?.classList.add(
'hidden'
)
loadCouriers()
})
/* ======================================================
   LOAD DELIVERIES
====================================================== */
async function loadDeliveries() {
if(!tbody) return
const from =
(currentPage - 1) * limit
const to =
from + limit - 1
let query = supabase
.from('deliveries')
.select('*')
.order('created_at', {
ascending: false
})
.range(from, to)
if(searchInput?.value) {
query = query.ilike(
'patient_name',
`%${searchInput.value}%`
)
}
if(startDate?.value) {
query = query.gte(
'created_at',
startDate.value
)
}
if(endDate?.value) {
query = query.lte(
'created_at',
endDate.value + 'T23:59:59'
)
}
const {
data,
error
} = await query
if(error) {
console.log(error)
return
}
renderDeliveries(data || [])
}
/* ======================================================
   RENDER DELIVERIES
====================================================== */
function renderDeliveries(data) {
tbody.innerHTML = ''
if(data.length === 0) {
tbody.innerHTML = `
<tr>
<td
colspan="5"
class="text-center py-10 text-slate-400"
>
Tidak ada data
</td>
</tr>
`
return
}
data.forEach(item => {
let badge = `
<span class="px-3 py-1 rounded-full text-xs bg-slate-100">
Pending
</span>
`
if(item.status === 'on_delivery') {
badge = `
<span class="px-3 py-1 rounded-full text-xs bg-blue-100 text-blue-700">
Diantar
</span>
`
}
if(item.status === 'completed') {
badge = `
<span class="px-3 py-1 rounded-full text-xs bg-green-100 text-green-700">
Selesai
</span>
`
}
tbody.innerHTML += `
<tr class="border-b hover:bg-slate-50">
<td class="px-6 py-4">
<p class="font-semibold">
${item.patient_name}
</p>
<p class="text-sm text-slate-500">
${item.patient_phone || '-'}
</p>
</td>
<td class="px-6 py-4">
<p class="font-medium">
${item.kelurahan}
</p>
<p class="text-sm text-slate-500">
${item.address || '-'}
</p>
</td>
<td class="px-6 py-4">
${item.courier_name || '-'}
</td>
<td class="px-6 py-4">
${badge}
</td>
<td class="px-6 py-4">
<div class="flex gap-2">
<button
onclick="showQR('${item.qr_token}')"
class="bg-slate-100 px-3 py-2 rounded-lg text-sm"
>
QR
</button>
<button
onclick="editDelivery('${item.id}')"
class="bg-blue-100 text-blue-700 px-3 py-2 rounded-lg text-sm"
>
Edit
</button>
<button
onclick="deleteDelivery('${item.id}')"
class="bg-red-100 text-red-700 px-3 py-2 rounded-lg text-sm"
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
   LOAD KECAMATAN
====================================================== */
async function loadKecamatan() {
if(!kecamatanSelect) return
const { data } =
await supabase
.from('delivery_zones')
.select('kecamatan')
const uniqueKecamatan =
[...new Set(
(data || []).map(
item => item.kecamatan
)
)]
kecamatanSelect.innerHTML = `
<option value="">
Pilih Kecamatan
</option>
`
uniqueKecamatan.forEach(item => {
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
async function loadKelurahan(
kecamatan
) {
const { data } =
await supabase
.from('delivery_zones')
.select('*')
.eq('kecamatan', kecamatan)
kelurahanSelect.innerHTML = `
<option value="">
Pilih Kelurahan
</option>
`
;(data || []).forEach(item => {
kelurahanSelect.innerHTML += `
<option
value="${item.kelurahan}"
data-ongkir="${item.ongkir}"
>
${item.kelurahan}
</option>
`
})
}
/* ======================================================
   LOAD ZONES
====================================================== */
async function loadZones() {
const tbodyZone =
document.getElementById(
'zones-table-body'
)
if(!tbodyZone) return
const { data } =
await supabase
.from('delivery_zones')
.select('*')
.order('kecamatan')
tbodyZone.innerHTML = ''
;(data || []).forEach(item => {
tbodyZone.innerHTML += `
<tr class="border-b">
<td class="px-6 py-4">
${item.kecamatan}
</td>
<td class="px-6 py-4">
${item.kelurahan}
</td>
<td class="px-6 py-4 font-semibold text-green-700">
Rp ${parseInt(
item.ongkir
).toLocaleString()}
</td>
<td class="px-6 py-4">
<button
onclick="deleteZone('${item.id}')"
class="bg-red-100 text-red-700 px-3 py-2 rounded-lg text-sm"
>
Hapus
</button>
</td>
</tr>
`
})
}
/* ======================================================
   LOAD COURIERS
====================================================== */
async function loadCouriers() {
const tbodyCourier =
document.getElementById(
'couriers-table-body'
)
if(!tbodyCourier) return
const { data } =
await supabase
.from('couriers')
.select('*')
.order('nama_kurir')
tbodyCourier.innerHTML = ''
;(data || []).forEach(item => {
let statusBadge =
`
<span class="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-sm">
Offline
</span>
`
if(item.is_online) {
statusBadge =
`
<span class="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
Online
</span>
`
}
tbodyCourier.innerHTML += `
<tr class="border-b">
<td class="px-6 py-4 font-semibold">
${item.nama_kurir || '-'}
</td>
<td class="px-6 py-4">
${item.email || '-'}
</td>
<td class="px-6 py-4">
${statusBadge}
</td>
<td class="px-6 py-4">
<div class="flex gap-2">
<button
onclick="toggleCourier('${item.id}', ${item.is_online})"
class="bg-blue-100 text-blue-700 px-3 py-2 rounded-lg text-sm"
>
Toggle
</button>
<button
onclick="deleteCourier('${item.id}')"
class="bg-red-100 text-red-700 px-3 py-2 rounded-lg text-sm"
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
   DELIVERY MODAL
====================================================== */
safeClick(
'btn-new-delivery',
async () => {
deliveryModal?.classList.remove(
'hidden'
)
deliveryModal?.classList.add(
'flex'
)
await loadKecamatan()
})
safeClick(
'close-delivery-modal',
() => {
deliveryModal?.classList.add(
'hidden'
)
})
/* ======================================================
   QR MODAL
====================================================== */
safeClick(
'close-qr-modal',
() => {
qrModal?.classList.add(
'hidden'
)
})
/* ======================================================
   DETAIL MODAL
====================================================== */
safeClick(
'close-detail-modal',
() => {
detailModal?.classList.add(
'hidden'
)
})
/* ======================================================
   ZONE MODAL
====================================================== */
safeClick(
'btn-add-zone',
() => {
zoneModal?.classList.remove(
'hidden'
)
zoneModal?.classList.add(
'flex'
)
})
safeClick(
'close-zone-modal',
() => {
zoneModal?.classList.add(
'hidden'
)
})
/* ======================================================
   COURIER MODAL
====================================================== */
safeClick(
'btn-add-courier',
() => {
courierModal?.classList.remove(
'hidden'
)
courierModal?.classList.add(
'flex'
)
})
safeClick(
'close-courier-modal',
() => {
courierModal?.classList.add(
'hidden'
)
})
/* ======================================================
   KECAMATAN CHANGE
====================================================== */
if(kecamatanSelect) {
kecamatanSelect.addEventListener(
'change',
() => {
loadKelurahan(
kecamatanSelect.value
)
})
}
/* ======================================================
   KELURAHAN CHANGE
====================================================== */
if(kelurahanSelect) {
kelurahanSelect.addEventListener(
'change',
() => {
const selectedOption =
kelurahanSelect.options[
kelurahanSelect.selectedIndex
]
selectedOngkir =
selectedOption
?.dataset
?.ongkir || 0
ongkirDisplay.innerText =
`Rp ${parseInt(
selectedOngkir
).toLocaleString()}`
})
}
/* ======================================================
   GET AVAILABLE COURIER
====================================================== */
async function getAvailableCourier() {
const { data } =
await supabase
.from('couriers')
.select('*')
.eq('is_online', true)
.order(
'last_online_at',
{
ascending: true
}
)
.limit(1)
if(!data || data.length === 0)
return null
return data[0]
}
/* ======================================================
   CREATE DELIVERY
====================================================== */
if(deliveryForm) {
deliveryForm.addEventListener(
'submit',
async (e) => {
e.preventDefault()
const patientName =
document.getElementById(
'patient-name'
).value
const patientPhone =
document.getElementById(
'patient-phone'
).value
const kelurahan =
kelurahanSelect.value
const address =
document.getElementById(
'address'
).value
const qrToken =
crypto.randomUUID()
const courier =
await getAvailableCourier()
const courierName =
courier?.nama_kurir ||
'Belum Ada Kurir'
const { error } =
await supabase
.from('deliveries')
.insert([
{
patient_name:
patientName,
patient_phone:
patientPhone,
kelurahan,
address,
courier_name:
courierName,
courier_id:
courier?.id || null,
qr_token:
qrToken,
ongkir:
selectedOngkir,
status:
'pending'
}
])
if(error) {
alert(error.message)
return
}
showDetailModal({
patientName,
patientPhone,
kelurahan,
address,
courierName,
qrToken,
ongkir:
selectedOngkir
})
deliveryForm.reset()
deliveryModal?.classList.add(
'hidden'
)
loadDeliveries()
})
}
/* ======================================================
   CREATE ZONE
====================================================== */
if(zoneForm) {
zoneForm.addEventListener(
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
zoneForm.reset()
zoneModal?.classList.add(
'hidden'
)
loadZones()
})
}
/* ======================================================
   CREATE COURIER
====================================================== */
if(courierForm) {
courierForm.addEventListener(
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
await supabase
.from('couriers')
.insert([
{
nama_kurir: nama,
email,
password,
role: 'courier'
}
])
courierForm.reset()
courierModal?.classList.add(
'hidden'
)
loadCouriers()
})
}
/* ======================================================
   DETAIL MODAL
====================================================== */
function showDetailModal(data) {
detailModal?.classList.remove(
'hidden'
)
detailModal?.classList.add(
'flex'
)
document.getElementById(
'detail-content'
).innerHTML = `
<div class="space-y-4">
<div>
<p class="text-sm text-slate-500">
Pasien
</p>
<p class="font-semibold text-lg">
${data.patientName}
</p>
</div>
<div>
<p class="text-sm text-slate-500">
Kurir
</p>
<p class="font-semibold">
${data.courierName}
</p>
</div>
<div id="detail-qr"
class="flex justify-center py-4">
</div>
</div>
`
new QRCode(
document.getElementById(
'detail-qr'
),
{
text:
`${window.location.origin}/sobat-kita/tracking.html?token=${data.qrToken}`,
width: 220,
height: 220
}
)
}
/* ======================================================
   SHOW QR
====================================================== */
window.showQR = (token) => {
qrModal?.classList.remove(
'hidden'
)
qrModal?.classList.add(
'flex'
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
   DELETE DELIVERY
====================================================== */
window.deleteDelivery =
async (id) => {
const yes = confirm(
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
   DELETE ZONE
====================================================== */
window.deleteZone =
async (id) => {
const yes = confirm(
'Hapus wilayah?'
)
if(!yes) return
await supabase
.from('delivery_zones')
.delete()
.eq('id', id)
loadZones()
}
/* ======================================================
   DELETE COURIER
====================================================== */
window.deleteCourier =
async (id) => {
const yes = confirm(
'Hapus kurir?'
)
if(!yes) return
await supabase
.from('couriers')
.delete()
.eq('id', id)
loadCouriers()
}
/* ======================================================
   TOGGLE COURIER
====================================================== */
window.toggleCourier =
async (id, currentStatus) => {
await supabase
.from('couriers')
.update({
is_online: !currentStatus,
last_online_at:
new Date().toISOString()
})
.eq('id', id)
loadCouriers()
}
/* ======================================================
   EDIT DELIVERY
====================================================== */
window.editDelivery =
async (id) => {
const newStatus =
prompt(
'Update status:\n\npending\non_delivery\ncompleted'
)
if(!newStatus) return
await supabase
.from('deliveries')
.update({
status: newStatus
})
.eq('id', id)
loadDeliveries()
}
/* ======================================================
   FILTER
====================================================== */
if(searchInput) {
searchInput.addEventListener(
'input',
() => {
currentPage = 1
loadDeliveries()
})
}
if(startDate) {
startDate.addEventListener(
'change',
() => {
currentPage = 1
loadDeliveries()
})
}
if(endDate) {
endDate.addEventListener(
'change',
() => {
currentPage = 1
loadDeliveries()
})
}
/* ======================================================
   PAGINATION
====================================================== */
safeClick(
'next-page',
() => {
currentPage++
loadDeliveries()
})
safeClick(
'prev-page',
() => {
if(currentPage > 1) {
currentPage--
loadDeliveries()
}
})
/* ======================================================
   PRINT
====================================================== */
safeClick(
'print-delivery',
() => {
const printContent =
document.getElementById(
'detail-content'
).innerHTML
const newWindow =
window.open(
'',
'',
'width=800,height=600'
)
newWindow.document.write(`
<html>
<head>
<title>
Print Pengantaran
</title>
</head>
<body>
${printContent}
</body>
</html>
`)
newWindow.document.close()
newWindow.print()
})
/* ======================================================
   INITIAL
====================================================== */
loadDeliveries()
