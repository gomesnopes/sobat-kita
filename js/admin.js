import { supabase } from './supabase-config.js';

// ==========================================
// 1. NAVIGASI TAB & MODAL
// ==========================================
const tabs = ['orders', 'couriers', 'fees'];
tabs.forEach(tab => {
    document.getElementById(`nav-${tab}`).addEventListener('click', (e) => {
        // Reset warna tombol
        document.querySelectorAll('.nav-btn').forEach(btn => { 
            btn.classList.remove('bg-green-50', 'text-green-700'); 
            btn.classList.add('text-slate-600'); 
        });
        // Set warna tombol aktif
        e.currentTarget.classList.remove('text-slate-600'); 
        e.currentTarget.classList.add('bg-green-50', 'text-green-700');
        
        // Sembunyikan semua konten, tampilkan yang dipilih
        document.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));
        document.getElementById(`tab-${tab}`).classList.remove('hidden');
    });
});

// Tutup Modal
document.querySelectorAll('.close-modal').forEach(btn => {
    btn.addEventListener('click', () => { 
        document.getElementById('dispatchModal').classList.add('hidden'); 
        document.getElementById('actionModal').classList.add('hidden'); 
    });
});

// ==========================================
// 2. LOGIK FORM PASIEN (DINAMIS)
// ==========================================
let patientCount = 1;

const createPatientHTML = (count) => `
    <div class="patient-block p-4 border border-slate-300 rounded-lg bg-slate-50">
        <p class="font-bold text-green-700 mb-3 border-b pb-1">Pasien ${count}</p>
        <div class="grid grid-cols-2 gap-3 mb-3">
            <input type="text" name="resep[]" placeholder="No. Resep" required class="w-full rounded border px-3 py-2 text-sm">
            <input type="text" name="nama[]" placeholder="Nama Pasien" required class="w-full rounded border px-3 py-2 text-sm">
        </div>
        <input type="text" name="wa[]" placeholder="No WhatsApp (62...)" required class="w-full rounded border px-3 py-2 text-sm mb-3">
        <textarea name="alamat[]" rows="2" placeholder="Detail Patokan Alamat" required class="w-full rounded border px-3 py-2 text-sm"></textarea>
    </div>
`;

// Tombol Buka Modal Pengantaran Baru
document.getElementById('btn-new-dispatch').addEventListener('click', () => {
    patientCount = 1;
    document.getElementById('dispatchModal').classList.remove('hidden');
    document.getElementById('dispatchForm').classList.remove('hidden');
    document.getElementById('qrContainer').classList.add('hidden');
    document.getElementById('dispatchForm').reset();
    document.getElementById('patients-container').innerHTML = createPatientHTML(patientCount);
});

// Tombol Tambah Pasien
document.getElementById('btn-tambah-pasien').addEventListener('click', () => {
    patientCount++;
    const container = document.getElementById('patients-container');
    container.insertAdjacentHTML('beforeend', createPatientHTML(patientCount));
});

// ==========================================
// 3. FUNGSI LOAD DATA DARI SUPABASE
// ==========================================

async function loadFees() {
    const { data } = await supabase.from('kelurahan_fees').select('*').order('kecamatan');
    const select = document.getElementById('kelurahan_select');
    const tbody = document.getElementById('fee-table-body');
    
    select.innerHTML = "<option value=''>Pilih Kelurahan...</option>";
    tbody.innerHTML = "";

    if(data) {
        data.forEach(fee => { 
            // Isi Dropdown di Modal
            select.innerHTML += `<option value="${fee.nama_kelurahan}|${fee.tarif}">${fee.kecamatan} - ${fee.nama_kelurahan} (Rp ${fee.tarif.toLocaleString()})</option>`; 
            
            // Isi Tabel di Tab Tarif
            tbody.innerHTML += `
                <tr class="border-b hover:bg-slate-50">
                    <td class="px-4 py-3 font-medium">${fee.kecamatan}</td>
                    <td class="px-4 py-3">${fee.nama_kelurahan}</td>
                    <td class="px-4 py-3 font-bold text-green-700">Rp ${fee.tarif.toLocaleString()}</td>
                </tr>
            `;
        });
    }
}

async function loadCouriers() {
    const { data } = await supabase.from('couriers').select('*').order('nama_kurir');
    const tbody = document.getElementById('courier-table-body');
    tbody.innerHTML = "";

    if(data) {
        data.forEach(courier => {
            let statusColor = courier.status === 'Tersedia' ? 'text-green-700 bg-green-100' : 'text-amber-700 bg-amber-100';
            tbody.innerHTML += `
                <tr class="border-b hover:bg-slate-50">
                    <td class="px-4 py-3 font-bold">${courier.nama_kurir}</td>
                    <td class="px-4 py-3">${courier.kontak || '-'}</td>
                    <td class="px-4 py-3"><span class="px-2 py-1 rounded text-xs font-bold ${statusColor}">${courier.status}</span></td>
                </tr>
            `;
        });
    }
}

async function loadOrders() {
    const { data } = await supabase.from('deliveries').select('*').order('created_at', { ascending: false });
    const tbody = document.getElementById('order-table-body');
    tbody.innerHTML = "";
    
    if(data) {
        data.forEach(order => {
            let badge = `<span class="bg-slate-200 px-2 py-1 rounded text-xs font-bold">${order.status}</span>`;
            if(order.status === 'In Transit') badge = `<span class="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-bold">Diantar</span>`;
            if(order.status === 'Completed') badge = `<span class="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-bold">Selesai</span>`;

            tbody.innerHTML += `
                <tr class="border-b hover:bg-slate-50">
                    <td class="px-4 py-3"><p class="text-[10px] font-mono text-slate-400">${order.batch_id}</p></td>
                    <td class="px-4 py-3"><p class="font-bold text-green-700">${order.order_number}</p><p class="font-medium">${order.patient_name}</p></td>
                    <td class="px-4 py-3"><p class="font-bold">${order.kelurahan}</p><p class="text-xs text-slate-500">${order.dropoff_address}</p></td>
                    <td class="px-4 py-3"><div class="mb-1">${badge}</div><p class="text-xs font-bold">${order.courier_name || 'Belum Diambil'}</p></td>
                    <td class="px-4 py-3 text-right">
                        <button onclick="window.openActionModal('${order.batch_id}')" class="text-green-600 p-1 bg-slate-100 rounded hover:bg-green-200 transition">View QR</button>
                    </td>
                </tr>
            `;
        });
    }
}

// ==========================================
// 4. SUBMIT FORM (ASSIGN KURIR)
// ==========================================
document.getElementById('dispatchForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const [kelurahan, tarifStr] = document.getElementById('kelurahan_select').value.split("|");
    
    const reseps = document.querySelectorAll('input[name="resep[]"]');
    const namas = document.querySelectorAll('input[name="nama[]"]');
    const was = document.querySelectorAll('input[name="wa[]"]');
    const alamats = document.querySelectorAll('textarea[name="alamat[]"]');
    
    const batchId = 'BCH-' + Math.floor(1000 + Math.random() * 9000);
    
    // Cari kurir tersedia
    const { data: couriers } = await supabase.from('couriers').select('*').eq('status', 'Tersedia').order('last_assigned_at', { ascending: true }).limit(1);
    
    let courierId = null, courierName = null, statusPengantaran = 'Pending', infoTeks = "Menunggu Kurir Scan Manual.";

    if(couriers && couriers.length > 0) {
        courierId = couriers[0].id; 
        courierName = couriers[0].nama_kurir; 
        statusPengantaran = 'In Transit';
        infoTeks = `Rombongan ini ditugaskan ke Kurir: <b>${courierName}</b>`;
        
        // Update status kurir jadi sibuk
        await supabase.from('couriers').update({ status: 'Sibuk', last_assigned_at: new Date().toISOString() }).eq('id', courierId);
    }

    let payloadArray = [];
    for(let i = 0; i < reseps.length; i++) {
        payloadArray.push({
            batch_id: batchId,
            order_number: reseps[i].value,
            patient_name: namas[i].value,
            patient_phone: was[i].value,
            kelurahan: kelurahan,
            dropoff_address: alamats[i].value,
            tarif: parseInt(tarifStr),
            status: statusPengantaran,
            courier_id: courierId,
            courier_name: courierName
        });
    }

    const { error } = await supabase.from('deliveries').insert(payloadArray);
    if (error) return alert('Gagal menyimpan data: ' + error.message);

    // Tampilkan QR Code
    document.getElementById('dispatchForm').classList.add('hidden');
    document.getElementById('qrContainer').classList.remove('hidden');
    document.getElementById('assigned-courier-text').innerHTML = infoTeks;
    
    document.getElementById('qrcode').innerHTML = "";
    new QRCode(document.getElementById('qrcode'), { text: `${window.location.origin}/kurir-detail.html?batch=${batchId}`, width: 220, height: 220 });
    
    // Refresh tabel data
    loadOrders();
    loadCouriers();
});

// Fungsi global untuk dipanggil via atribut onclick di HTML
window.openActionModal = (batchId) => {
    document.getElementById('actionModal').classList.remove('hidden');
    const qrBox = document.getElementById('re-qr-container');
    qrBox.innerHTML = "";
    new QRCode(qrBox, { text: `${window.location.origin}/kurir-detail.html?batch=${batchId}`, width: 180, height: 180 });
};

// Inisialisasi Data saat halaman dimuat
loadFees(); 
loadOrders();
loadCouriers();
