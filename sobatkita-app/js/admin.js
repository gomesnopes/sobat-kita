import { supabase } from './supabase-config.js';

document.addEventListener('DOMContentLoaded', () => {
    initAdmin();
    listenToRealtimeChanges();
});

function initAdmin() {
    // Menambahkan elemen Modal Form & tempat QR Code ke dalam HTML secara otomatis
    const modalHTML = `
        <div id="dispatchModal" class="fixed inset-0 bg-black/50 z-[100] hidden flex items-center justify-center p-4">
            <div class="bg-white rounded-xl p-6 max-w-md w-full shadow-xl text-slate-900">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-xl font-bold text-emerald-700">Form Pengiriman Obat Baru</h3>
                    <button id="closeModalBtn" class="material-symbols-outlined text-slate-500 hover:text-red-600">close</button>
                </div>
                <form id="dispatchForm" class="space-y-3">
                    <div>
                        <label class="block text-xs font-semibold text-slate-600 mb-1">No. Resep</label>
                        <input type="text" id="no_resep" required class="w-full rounded-lg border-slate-300 focus:ring-emerald-600 focus:border-emerald-600">
                    </div>
                    <div>
                        <label class="block text-xs font-semibold text-slate-600 mb-1">Nama Pasien / Penerima</label>
                        <input type="text" id="nama_pasien" required class="w-full rounded-lg border-slate-300 focus:ring-emerald-600 focus:border-emerald-600">
                    </div>
                    <div>
                        <label class="block text-xs font-semibold text-slate-600 mb-1">Nomor WhatsApp Pasien (Contoh: 6281234xxx)</label>
                        <input type="text" id="no_whatsapp" placeholder="628xxxxxxxx" required class="w-full rounded-lg border-slate-300 focus:ring-emerald-600 focus:border-emerald-600">
                    </div>
                    <div>
                        <label class="block text-xs font-semibold text-slate-600 mb-1">Alamat Lengkap Rumah</label>
                        <textarea id="alamat" rows="3" required class="w-full rounded-lg border-slate-300 focus:ring-emerald-600 focus:border-emerald-600"></textarea>
                    </div>
                    <button type="submit" class="w-full bg-emerald-700 text-white py-2 rounded-lg font-bold hover:bg-emerald-800 transition-colors">Simpan & Buat QR Code</button>
                </form>

                <div id="qrContainer" class="hidden mt-4 flex flex-col items-center p-4 bg-slate-50 rounded-lg border-2 border-dashed border-emerald-600">
                    <p class="text-xs font-bold text-emerald-700 mb-2">Scan QR Code ini lewat HP Kurir Ojek</p>
                    <div id="qrcode"></div>
                    <p id="qrOrderNumber" class="text-xs text-slate-500 mt-2 font-mono"></p>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Menghubungkan tombol "New Dispatch" bawaan dari template HTML Anda
    const newDispatchBtns = document.querySelectorAll('button');
    newDispatchBtns.forEach(btn => {
        if(btn.innerText.includes('New Dispatch')) {
            btn.addEventListener('click', () => {
                document.getElementById('dispatchModal').classList.remove('hidden');
                document.getElementById('dispatchForm').classList.remove('hidden');
                document.getElementById('qrContainer').classList.add('hidden');
                document.getElementById('dispatchForm').reset();
            });
        }
    });

    document.getElementById('closeModalBtn').addEventListener('click', () => {
        document.getElementById('dispatchModal').classList.add('hidden');
        renderTableOrders();
    });

    document.getElementById('dispatchForm').addEventListener('submit', handleFormSubmit);
    renderTableOrders();
}

async function handleFormSubmit(e) {
    e.preventDefault();
    
   const no_resep = document.getElementById('no_resep').value;
    const nama_pasien = document.getElementById('nama_pasien').value;
    const no_whatsapp = document.getElementById('no_whatsapp').value;
    const alamat = document.getElementById('alamat').value;

    // Simpan data ke dalam tabel 'deliveries' di Supabase
    const { data, error } = await supabase
        .from('deliveries')
        .insert([{ 
            order_number: no_resep, 
            patient_name: nama_pasien, 
            patient_phone: no_whatsapp, 
            dropoff_address: alamat, 
            status: 'Pending' 
        }])
        .select();

    if (error) {
        alert('Gagal menyimpan ke database: ' + error.message);
        return;
    }

    const orderBaru = data[0];
    console.log(`[WhatsApp] Mengirim pesan ke ${no_whatsapp}: Resep #${no_resep} sedang diproses.`);

    // Sembunyikan form, tampilkan kotak QR Code
    document.getElementById('dispatchForm').classList.add('hidden');
    document.getElementById('qrContainer').classList.remove('hidden');
    document.getElementById('qrOrderNumber').innerText = `ID: ${orderBaru.id}`;

    // Generate QR Code berisi link tujuan ke hp kurir
    document.getElementById('qrcode').innerHTML = "";
    const urlKurir = `${window.location.origin}/kurir-detail.html?id=${orderBaru.id}`;
    new QRCode(document.getElementById('qrcode'), {
        text: urlKurir,
        width: 180,
        height: 180
    });
}

// Mengambil data dari Supabase dan memasukkannya ke tabel HTML Anda
async function renderTableOrders() {
    const { data: listDeliveries } = await supabase
        .from('deliveries')
        .select('*')
        .order('created_at', { ascending: false });

    const tbody = document.querySelector('tbody');
    if (!tbody) return;

    tbody.innerHTML = "";
    listDeliveries.forEach(order => {
        let statusBadge = `<span class="bg-slate-200 text-slate-800 px-2 py-1 rounded-full text-xs">${order.status}</span>`;
        if(order.status === 'In Transit') statusBadge = `<span class="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">Diantar</span>`;
        if(order.status === 'Completed') statusBadge = `<span class="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Selesai</span>`;

        const tr = `
            <tr class="hover:bg-slate-50 border-b border-slate-200 text-sm">
                <td class="px-4 py-3 font-medium">#${order.no_resep}</td>
                <td class="px-4 py-3">${order.nama_pasien}</td>
                <td class="px-4 py-3 text-slate-500">${order.alamat}</td>
                <td class="px-4 py-3">${statusBadge}</td>
                <td class="px-4 py-3 text-right font-bold text-emerald-700">${order.courier_name || '-'}</td>
            </tr>
        `;
        tbody.insertAdjacentHTML('beforeend', tr);
    });
}

// Sistem Notifikasi Live Realtime di Dashboard Admin
function listenToRealtimeChanges() {
    supabase
        .channel('schema-db-changes')
        .on('postgres_changes', { event: '*', filter: 'table=eq.deliveries' }, (payload) => {
            renderTableOrders();
            if (payload.eventType === 'UPDATE') {
                showToastNotification(`Status obat pasien ${payload.new.nama_pasien} berubah menjadi: ${payload.new.status}`);
            }
        })
        .subscribe();
}

function showToastNotification(message) {
    const toast = document.createElement('div');
    toast.className = "fixed bottom-5 right-5 bg-emerald-700 text-white px-6 py-4 rounded-xl shadow-2xl z-[200] font-bold animate-bounce flex items-center gap-2";
    toast.innerHTML = `<span class="material-symbols-outlined">notifications</span> <span>${message}</span>`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 4500);
}import { supabase } from './supabase-config.js';

document.addEventListener('DOMContentLoaded', () => {
    initAdmin();
    listenToRealtimeChanges();
});

function initAdmin() {
    // Menambahkan elemen Modal Form & tempat QR Code ke dalam HTML secara otomatis
    const modalHTML = `
        <div id="dispatchModal" class="fixed inset-0 bg-black/50 z-[100] hidden flex items-center justify-center p-4">
            <div class="bg-white rounded-xl p-6 max-w-md w-full shadow-xl text-slate-900">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-xl font-bold text-emerald-700">Form Pengiriman Obat Baru</h3>
                    <button id="closeModalBtn" class="material-symbols-outlined text-slate-500 hover:text-red-600">close</button>
                </div>
                <form id="dispatchForm" class="space-y-3">
                    <div>
                        <label class="block text-xs font-semibold text-slate-600 mb-1">No. Resep</label>
                        <input type="text" id="no_resep" required class="w-full rounded-lg border-slate-300 focus:ring-emerald-600 focus:border-emerald-600">
                    </div>
                    <div>
                        <label class="block text-xs font-semibold text-slate-600 mb-1">Nama Pasien / Penerima</label>
                        <input type="text" id="nama_pasien" required class="w-full rounded-lg border-slate-300 focus:ring-emerald-600 focus:border-emerald-600">
                    </div>
                    <div>
                        <label class="block text-xs font-semibold text-slate-600 mb-1">Nomor WhatsApp Pasien (Contoh: 6281234xxx)</label>
                        <input type="text" id="no_whatsapp" placeholder="628xxxxxxxx" required class="w-full rounded-lg border-slate-300 focus:ring-emerald-600 focus:border-emerald-600">
                    </div>
                    <div>
                        <label class="block text-xs font-semibold text-slate-600 mb-1">Alamat Lengkap Rumah</label>
                        <textarea id="alamat" rows="3" required class="w-full rounded-lg border-slate-300 focus:ring-emerald-600 focus:border-emerald-600"></textarea>
                    </div>
                    <button type="submit" class="w-full bg-emerald-700 text-white py-2 rounded-lg font-bold hover:bg-emerald-800 transition-colors">Simpan & Buat QR Code</button>
                </form>

                <div id="qrContainer" class="hidden mt-4 flex flex-col items-center p-4 bg-slate-50 rounded-lg border-2 border-dashed border-emerald-600">
                    <p class="text-xs font-bold text-emerald-700 mb-2">Scan QR Code ini lewat HP Kurir Ojek</p>
                    <div id="qrcode"></div>
                    <p id="qrOrderNumber" class="text-xs text-slate-500 mt-2 font-mono"></p>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Menghubungkan tombol "New Dispatch" bawaan dari template HTML Anda
    const newDispatchBtns = document.querySelectorAll('button');
    newDispatchBtns.forEach(btn => {
        if(btn.innerText.includes('New Dispatch')) {
            btn.addEventListener('click', () => {
                document.getElementById('dispatchModal').classList.remove('hidden');
                document.getElementById('dispatchForm').classList.remove('hidden');
                document.getElementById('qrContainer').classList.add('hidden');
                document.getElementById('dispatchForm').reset();
            });
        }
    });

    document.getElementById('closeModalBtn').addEventListener('click', () => {
        document.getElementById('dispatchModal').classList.add('hidden');
        renderTableOrders();
    });

    document.getElementById('dispatchForm').addEventListener('submit', handleFormSubmit);
    renderTableOrders();
}

async function handleFormSubmit(e) {
    e.preventDefault();
    
    const no_resep = document.getElementById('no_resep').value;
    const nama_pasien = document.getElementById('nama_pasien').value;
    const no_whatsapp = document.getElementById('no_whatsapp').value;
    const alamat = document.getElementById('alamat').value;

    // Simpan data ke dalam tabel 'deliveries' di Supabase
    const { data, error } = await supabase
        .from('deliveries')
        .insert([{ no_resep, nama_pasien, no_whatsapp, alamat, status: 'Pending' }])
        .select();

    if (error) {
        alert('Gagal menyimpan ke database: ' + error.message);
        return;
    }

    const orderBaru = data[0];
    console.log(`[WhatsApp] Mengirim pesan ke ${no_whatsapp}: Resep #${no_resep} sedang diproses.`);

    // Sembunyikan form, tampilkan kotak QR Code
    document.getElementById('dispatchForm').classList.add('hidden');
    document.getElementById('qrContainer').classList.remove('hidden');
    document.getElementById('qrOrderNumber').innerText = `ID: ${orderBaru.id}`;

    // Generate QR Code berisi link tujuan ke hp kurir
    document.getElementById('qrcode').innerHTML = "";
    const urlKurir = `${window.location.origin}/kurir-detail.html?id=${orderBaru.id}`;
    new QRCode(document.getElementById('qrcode'), {
        text: urlKurir,
        width: 180,
        height: 180
    });
}

// Mengambil data dari Supabase dan memasukkannya ke tabel HTML Anda
async function renderTableOrders() {
    const { data: listDeliveries } = await supabase
        .from('deliveries')
        .select('*')
        .order('created_at', { ascending: false });

    const tbody = document.querySelector('tbody');
    if (!tbody) return;

    tbody.innerHTML = "";
    listDeliveries.forEach(order => {
        let statusBadge = `<span class="bg-slate-200 text-slate-800 px-2 py-1 rounded-full text-xs">${order.status}</span>`;
        if(order.status === 'In Transit') statusBadge = `<span class="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">Diantar</span>`;
        if(order.status === 'Completed') statusBadge = `<span class="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Selesai</span>`;

        const tr = `
            <tr class="hover:bg-slate-50 border-b border-slate-200 text-sm">
                <td class="px-4 py-3 font-medium">#${order.order_number}</td>
                <td class="px-4 py-3">${order.patient_name}</td>
                <td class="px-4 py-3 text-slate-500">${order.dropoff_address}</td>
                <td class="px-4 py-3">${statusBadge}</td>
                <td class="px-4 py-3 text-right font-bold text-emerald-700">-</td>
            </tr>
        `;
        tbody.insertAdjacentHTML('beforeend', tr);
    });
}

// Sistem Notifikasi Live Realtime di Dashboard Admin
function listenToRealtimeChanges() {
    supabase
        .channel('schema-db-changes')
        .on('postgres_changes', { event: '*', filter: 'table=eq.deliveries' }, (payload) => {
            renderTableOrders();
            if (payload.eventType === 'UPDATE') {
                showToastNotification(`Status obat pasien ${payload.new.nama_pasien} berubah menjadi: ${payload.new.status}`);
            }
        })
        .subscribe();
}

function showToastNotification(message) {
    const toast = document.createElement('div');
    toast.className = "fixed bottom-5 right-5 bg-emerald-700 text-white px-6 py-4 rounded-xl shadow-2xl z-[200] font-bold animate-bounce flex items-center gap-2";
    toast.innerHTML = `<span class="material-symbols-outlined">notifications</span> <span>${message}</span>`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 4500);
}
