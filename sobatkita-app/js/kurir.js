import { supabase } from './supabase-config.js';

document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('kurir-detail.html')) {
        initKurirDetail();
    } else {
        initKurirHome();
    }
});

// Logika untuk halaman utama Kurir
function initKurirHome() {
    const scanBtnHTML = `
        <button id="floatingScanBtn" class="fixed bottom-24 right-6 w-14 h-14 bg-emerald-700 text-white rounded-full shadow-2xl z-50 flex items-center justify-center active:scale-95 transition-transform">
            <span class="material-symbols-outlined text-[28px]">qr_code_scanner</span>
        </button>
        <div id="scannerOverlay" class="fixed inset-0 bg-black/90 z-[100] hidden flex flex-col items-center justify-center p-4">
            <div class="w-full max-w-sm bg-white rounded-xl p-4">
                <div id="reader" class="w-full"></div>
                <button id="closeScannerBtn" class="w-full mt-3 bg-red-600 text-white py-2 rounded-lg font-bold">Tutup Kamera</button>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', scanBtnHTML);

    const scanBtn = document.getElementById('floatingScanBtn');
    const closeBtn = document.getElementById('closeScannerBtn');
    const overlay = document.getElementById('scannerOverlay');

    let html5QrcodeScanner;

    scanBtn.addEventListener('click', () => {
        overlay.classList.remove('hidden');
        html5QrcodeScanner = new Html5Qrcode("reader");
        html5QrcodeScanner.start(
            { facingMode: "environment" }, 
            { fps: 10, qrbox: 250 },
            (decodedText) => {
                html5QrcodeScanner.stop().then(() => {
                    overlay.classList.add('hidden');
                    window.location.href = decodedText; // Mengarahkan ke halaman detail tujuan QR
                });
            },
            (error) => { /* scanning */ }
        ).catch(err => alert("Kamera bermasalah: " + err));
    });

    closeBtn.addEventListener('click', () => {
        if(html5QrcodeScanner) {
            html5QrcodeScanner.stop().then(() => overlay.classList.add('hidden'));
        } else {
            overlay.classList.add('hidden');
        }
    });

    renderListTugasKurir();
}

async function renderListTugasKurir() {
    const { data: listTugas } = await supabase
        .from('deliveries')
        .select('*')
        .neq('status', 'Completed')
        .order('created_at', { ascending: false });

    const containerTasks = document.querySelector('main div.flex-col');
    if(!containerTasks) return;

    containerTasks.innerHTML = "";
    
    if(listTugas.length === 0) {
        containerTasks.innerHTML = `<p class="text-center text-slate-500 py-8">Belum ada orderan obat yang tersedia.</p>`;
        return;
    }

    listTugas.forEach(task => {
        const card = `
            <div class="bg-white rounded-xl shadow p-4 flex flex-col border border-slate-100">
                <div class="flex justify-between items-start mb-2">
                    <div>
                        <span class="text-xs text-slate-400 font-mono">Resep: #${task.no_resep}</span>
                        <h3 class="text-base font-semibold text-slate-800 mt-1">${task.nama_pasien}</h3>
                    </div>
                    <span class="bg-amber-100 text-amber-800 px-2 py-1 rounded-full text-xs font-bold">${task.status}</span>
                </div>
                <div class="text-xs text-slate-600 mb-3">
                    <p><b>Alamat:</b> ${task.alamat}</p>
                </div>
                <a href="kurir-detail.html?id=${task.id}" class="w-full bg-emerald-700 text-white py-2 rounded-lg text-xs font-bold text-center block">Ambil / Lihat Detail</a>
            </div>
        `;
        containerTasks.insertAdjacentHTML('beforeend', card);
    });
}

// Logika untuk halaman detail tugas Kurir setelah men-scan QR
async function initKurirDetail() {
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('id');

    if(!orderId) {
        window.location.href = "kurir-home.html";
        return;
    }

    const { data: order } = await supabase
        .from('deliveries')
        .select('*')
        .eq('id', orderId)
        .single();

    if (!order) {
        alert("Data pengiriman tidak ditemukan!");
        window.location.href = "kurir-home.html";
        return;
    }

    // Mengubah data teks di UI kurirdetail.html Anda secara dinamis
    document.querySelector('h1.font-headline-md').innerText = `#RES-${order.no_resep}`;
    
    const dropoffNode = document.querySelector('h3.font-label-md.text-on-surface').parentElement;
    if(dropoffNode) {
        dropoffNode.querySelector('h3').innerText = order.nama_pasien;
        dropoffNode.querySelector('p').innerHTML = `${order.alamat}<br><b class="text-emerald-700">WA Pasien: ${order.no_whatsapp}</b>`;
    }

    // Jika kurir baru pertama kali men-scan QR (status masih Pending), otomatis ubah jadi 'In Transit'
    if(order.status === 'Pending') {
        await supabase
            .from('deliveries')
            .update({ status: 'In Transit', courier_name: 'Mitra Ojek Lokal' })
            .eq('id', orderId);
        
        console.log(`[WhatsApp] Mengirim pesan ke pasien: Obat sedang diantar oleh kurir.`);
    }

    // Set tombol telepon langsung membuka WhatsApp Chat ke nomor pasien
    const callBtn = document.querySelector('button.border-primary');
    if(callBtn) {
        callBtn.className = "w-full h-12 flex items-center justify-center gap-2 rounded-lg bg-emerald-600 text-white font-bold text-sm mt-3";
        callBtn.innerHTML = `<span>Hubungi Chat WhatsApp Pasien</span>`;
        callBtn.addEventListener('click', () => {
            window.open(`https://wa.me/${order.no_whatsapp}`, '_blank');
        });
    }

    // Mengubah area "Swipe Slider" bawaan UI Anda menjadi tombol klik biasa agar stabil di mobile web/PWA
    const sliderContainer = document.querySelector('.swipe-track');
    if(sliderContainer) {
        sliderContainer.innerHTML = `
            <button id="completeDeliveryBtn" class="w-full h-full bg-emerald-700 text-white rounded-full font-bold text-center tracking-wide active:scale-95 transition-transform text-sm">
                KONFIRMASI: OBAT SUDAH DITERIMA PASIEN
            </button>
        `;
        document.getElementById('completeDeliveryBtn').addEventListener('click', async () => {
            const { error: updateErr } = await supabase
                .from('deliveries')
                .update({ status: 'Completed' })
                .eq('id', orderId);

            if(!updateErr) {
                console.log(`[WhatsApp] Mengirim pesan ke pasien: Obat berhasil diterima.`);
                alert("Pengiriman obat sukses diselesaikan!");
                window.location.href = "kurir-home.html";
            }
        });
    }
}import { supabase } from './supabase-config.js';

document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('kurir-detail.html')) {
        initKurirDetail();
    } else {
        initKurirHome();
    }
});

// Logika untuk halaman utama Kurir
function initKurirHome() {
    const scanBtnHTML = `
        <button id="floatingScanBtn" class="fixed bottom-24 right-6 w-14 h-14 bg-emerald-700 text-white rounded-full shadow-2xl z-50 flex items-center justify-center active:scale-95 transition-transform">
            <span class="material-symbols-outlined text-[28px]">qr_code_scanner</span>
        </button>
        <div id="scannerOverlay" class="fixed inset-0 bg-black/90 z-[100] hidden flex flex-col items-center justify-center p-4">
            <div class="w-full max-w-sm bg-white rounded-xl p-4">
                <div id="reader" class="w-full"></div>
                <button id="closeScannerBtn" class="w-full mt-3 bg-red-600 text-white py-2 rounded-lg font-bold">Tutup Kamera</button>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', scanBtnHTML);

    const scanBtn = document.getElementById('floatingScanBtn');
    const closeBtn = document.getElementById('closeScannerBtn');
    const overlay = document.getElementById('scannerOverlay');

    let html5QrcodeScanner;

    scanBtn.addEventListener('click', () => {
        overlay.classList.remove('hidden');
        html5QrcodeScanner = new Html5Qrcode("reader");
        html5QrcodeScanner.start(
            { facingMode: "environment" }, 
            { fps: 10, qrbox: 250 },
            (decodedText) => {
                html5QrcodeScanner.stop().then(() => {
                    overlay.classList.add('hidden');
                    window.location.href = decodedText; // Mengarahkan ke halaman detail tujuan QR
                });
            },
            (error) => { /* scanning */ }
        ).catch(err => alert("Kamera bermasalah: " + err));
    });

    closeBtn.addEventListener('click', () => {
        if(html5QrcodeScanner) {
            html5QrcodeScanner.stop().then(() => overlay.classList.add('hidden'));
        } else {
            overlay.classList.add('hidden');
        }
    });

    renderListTugasKurir();
}

async function renderListTugasKurir() {
    const { data: listTugas } = await supabase
        .from('deliveries')
        .select('*')
        .neq('status', 'Completed')
        .order('created_at', { ascending: false });

    const containerTasks = document.querySelector('main div.flex-col');
    if(!containerTasks) return;

    containerTasks.innerHTML = "";
    
    if(listTugas.length === 0) {
        containerTasks.innerHTML = `<p class="text-center text-slate-500 py-8">Belum ada orderan obat yang tersedia.</p>`;
        return;
    }

    listTugas.forEach(task => {
        const card = `
            <div class="bg-white rounded-xl shadow p-4 flex flex-col border border-slate-100">
                <div class="flex justify-between items-start mb-2">
                    <div>
                        <span class="text-xs text-slate-400 font-mono">Resep: #${task.no_resep}</span>
                        <h3 class="text-base font-semibold text-slate-800 mt-1">${task.nama_pasien}</h3>
                    </div>
                    <span class="bg-amber-100 text-amber-800 px-2 py-1 rounded-full text-xs font-bold">${task.status}</span>
                </div>
                <div class="text-xs text-slate-600 mb-3">
                    <p><b>Alamat:</b> ${task.alamat}</p>
                </div>
                <a href="kurir-detail.html?id=${task.id}" class="w-full bg-emerald-700 text-white py-2 rounded-lg text-xs font-bold text-center block">Ambil / Lihat Detail</a>
            </div>
        `;
        containerTasks.insertAdjacentHTML('beforeend', card);
    });
}

// Logika untuk halaman detail tugas Kurir setelah men-scan QR
async function initKurirDetail() {
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('id');

    if(!orderId) {
        window.location.href = "kurir-home.html";
        return;
    }

    const { data: order } = await supabase
        .from('deliveries')
        .select('*')
        .eq('id', orderId)
        .single();

    if (!order) {
        alert("Data pengiriman tidak ditemukan!");
        window.location.href = "kurir-home.html";
        return;
    }

    // Mengubah data teks di UI kurirdetail.html Anda secara dinamis
    document.querySelector('h1.font-headline-md').innerText = `#RES-${order.no_resep}`;
    
    const dropoffNode = document.querySelector('h3.font-label-md.text-on-surface').parentElement;
    if(dropoffNode) {
        dropoffNode.querySelector('h3').innerText = order.nama_pasien;
        dropoffNode.querySelector('p').innerHTML = `${order.alamat}<br><b class="text-emerald-700">WA Pasien: ${order.no_whatsapp}</b>`;
    }

    // Jika kurir baru pertama kali men-scan QR (status masih Pending), otomatis ubah jadi 'In Transit'
    if(order.status === 'Pending') {
        await supabase
            .from('deliveries')
            .update({ status: 'In Transit', courier_name: 'Mitra Ojek Lokal' })
            .eq('id', orderId);
        
        console.log(`[WhatsApp] Mengirim pesan ke pasien: Obat sedang diantar oleh kurir.`);
    }

    // Set tombol telepon langsung membuka WhatsApp Chat ke nomor pasien
    const callBtn = document.querySelector('button.border-primary');
    if(callBtn) {
        callBtn.className = "w-full h-12 flex items-center justify-center gap-2 rounded-lg bg-emerald-600 text-white font-bold text-sm mt-3";
        callBtn.innerHTML = `<span>Hubungi Chat WhatsApp Pasien</span>`;
        callBtn.addEventListener('click', () => {
            window.open(`https://wa.me/${order.no_whatsapp}`, '_blank');
        });
    }

    // Mengubah area "Swipe Slider" bawaan UI Anda menjadi tombol klik biasa agar stabil di mobile web/PWA
    const sliderContainer = document.querySelector('.swipe-track');
    if(sliderContainer) {
        sliderContainer.innerHTML = `
            <button id="completeDeliveryBtn" class="w-full h-full bg-emerald-700 text-white rounded-full font-bold text-center tracking-wide active:scale-95 transition-transform text-sm">
                KONFIRMASI: OBAT SUDAH DITERIMA PASIEN
            </button>
        `;
        document.getElementById('completeDeliveryBtn').addEventListener('click', async () => {
            const { error: updateErr } = await supabase
                .from('deliveries')
                .update({ status: 'Completed' })
                .eq('id', orderId);

            if(!updateErr) {
                console.log(`[WhatsApp] Mengirim pesan ke pasien: Obat berhasil diterima.`);
                alert("Pengiriman obat sukses diselesaikan!");
                window.location.href = "kurir-home.html";
            }
        });
    }
}
