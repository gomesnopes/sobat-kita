import { supabase }
from './supabase.js'
/* ======================================================
   ELEMENT
====================================================== */
const deliverySection =
document.getElementById(
  'deliveries-section'
)
const ongkirSection =
document.getElementById(
  'zones-section'
)
const courierSection =
document.getElementById(
  'couriers-section'
)
const menus =
document.querySelectorAll(
  '.sidebar-menu'
)
const analyticsSection =
document.getElementById(
  'analytics-section'
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
/* ======================================================
   HIDE ALL
====================================================== */
function hideAllSections() {
  deliverySection.classList.add(
    'hidden'
  )
  ongkirSection.classList.add(
    'hidden'
  )
  courierSection.classList.add(
    'hidden'
  )
}
/* ======================================================
   RESET MENU
====================================================== */
function resetMenu() {
  menus.forEach((menu) => {
    menu.classList.remove(
      'active'
    )
  })
}
/* ======================================================
   OPEN SECTION
====================================================== */
function openSection(
  section,
  menuId
) {
  hideAllSections()
  section.classList.remove(
    'hidden'
  )
  resetMenu()
  document
  .getElementById(menuId)
  .classList.add(
    'active'
  )
  // ONLY DELIVERY SHOW ANALYTICS
  if(section === deliverySection) {
    analyticsSection
    .classList.remove(
      'hidden'
    )
    searchInput
    .classList.remove(
      'hidden'
    )
    startDate
    .classList.remove(
      'hidden'
    )
    endDate
    .classList.remove(
      'hidden'
    )
  } else {
    analyticsSection
    .classList.add(
      'hidden'
    )
    searchInput
    .classList.add(
      'hidden'
    )
    startDate
    .classList.add(
      'hidden'
    )
    endDate
    .classList.add(
      'hidden'
    )
  }
}
/* ======================================================
   MENU CLICK
====================================================== */
document
.getElementById(
  'menu-deliveries'
)
?.addEventListener(
  'click',
  () => {
  openSection(
    deliverySection,
    'menu-deliveries'
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
    ongkirSection,
    'menu-zones'
  )
})
document
.getElementById(
  'menu-couriers'
)
?.addEventListener(
  'click',
  () => {
  openSection(
    courierSection,
    'menu-couriers'
  )
})
/* ======================================================
   ANALYTICS
====================================================== */
async function loadAnalytics() {
  // DELIVERIES
  const {
    data: deliveries
  } = await supabase
  .from('deliveries')
  .select('*')
  // COURIERS
  const {
    data: couriers
  } = await supabase
  .from('couriers')
  .select('*')
  // TOTAL
  const total =
    deliveries?.length || 0
  // ON DELIVERY
  const onDelivery =
    deliveries?.filter(
      item =>
      item.status ===
      'on_delivery'
    ).length || 0
  // COMPLETED
  const completed =
    deliveries?.filter(
      item =>
      item.status ===
      'completed'
    ).length || 0
  // ONLINE COURIER
  const online =
    couriers?.filter(
      item =>
      item.is_online
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
  document.getElementById(
    'online-couriers'
  ).innerText = online
}
/* ======================================================
   DATE FILTER
====================================================== */
startDate?.addEventListener(
  'change',
  () => {
    console.log(
      'Filter Start Date:',
      startDate.value
    )
})
endDate?.addEventListener(
  'change',
  () => {
    console.log(
      'Filter End Date:',
      endDate.value
    )
})
/* ======================================================
   SEARCH
====================================================== */
searchInput?.addEventListener(
  'input',
  () => {
    console.log(
      'Search:',
      searchInput.value
    )
})
/* ======================================================
   INITIAL
====================================================== */
openSection(
  deliverySection,
  'menu-deliveries'
)
loadAnalytics()
