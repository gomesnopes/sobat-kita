<!-- ===================================================== -->
<!-- DELIVERY MODAL -->
<!-- ===================================================== -->
<div
  id="delivery-modal"
  class="fixed inset-0 bg-black/50 hidden items-center justify-center z-50 p-5"
>
  <div
    class="bg-white rounded-3xl w-full max-w-2xl p-8 relative"
  >
    <!-- CLOSE -->
    <button
      id="close-delivery-modal"
      class="absolute top-5 right-5 text-2xl"
    >
      ✕
    </button>
    <!-- TITLE -->
    <h2 class="text-2xl font-bold mb-6">
      Pengantaran Baru
    </h2>
    <!-- FORM -->
    <form
      id="delivery-form"
      class="space-y-5"
    >
      <!-- PATIENT -->
      <input
        type="text"
        id="patient-name"
        placeholder="Nama Pasien"
        required
        class="w-full bg-slate-100 rounded-2xl px-5 py-4 outline-none"
      >
      <!-- PHONE -->
      <input
        type="text"
        id="patient-phone"
        placeholder="No WhatsApp"
        required
        class="w-full bg-slate-100 rounded-2xl px-5 py-4 outline-none"
      >
      <!-- KECAMATAN -->
      <select
        id="kecamatan"
        required
        class="w-full bg-slate-100 rounded-2xl px-5 py-4 outline-none"
      >
        <option value="">
          Pilih Kecamatan
        </option>
        <option value="Ternate Selatan">
          Ternate Selatan
        </option>
        <option value="Ternate Tengah">
          Ternate Tengah
        </option>
        <option value="Ternate Utara">
          Ternate Utara
        </option>
        <option value="Pulau Ternate">
          Pulau Ternate
        </option>
        <option value="Ternate Barat">
          Ternate Barat
        </option>
      </select>
      <!-- KELURAHAN -->
      <select
        id="kelurahan"
        required
        class="w-full bg-slate-100 rounded-2xl px-5 py-4 outline-none"
      >
        <option value="">
          Pilih Kelurahan
        </option>
      </select>
      <!-- ADDRESS -->
      <textarea
        id="patient-address"
        rows="3"
        placeholder="Alamat Lengkap"
        required
        class="w-full bg-slate-100 rounded-2xl px-5 py-4 outline-none"
      ></textarea>
      <!-- ONGKIR -->
      <div
        class="bg-green-50 rounded-2xl p-5"
      >
        <p class="text-slate-500 text-sm">
          Ongkir
        </p>
        <h3
          id="ongkir-display"
          class="text-3xl font-bold text-green-700 mt-2"
        >
          Rp 0
        </h3>
      </div>
      <!-- SUBMIT -->
      <button
        type="submit"
        class="w-full bg-green-700 hover:bg-green-800 transition text-white py-4 rounded-2xl font-semibold"
      >
        Simpan Pengantaran
      </button>
    </form>
  </div>
</div>
<!-- ===================================================== -->
<!-- QR DETAIL MODAL -->
<!-- ===================================================== -->
<div
  id="qr-modal"
  class="fixed inset-0 bg-black/50 hidden items-center justify-center z-50 p-5"
>
  <div
    class="bg-white rounded-3xl w-full max-w-lg p-8 relative"
  >
    <!-- CLOSE -->
    <button
      id="close-qr-modal"
      class="absolute top-5 right-5 text-2xl"
    >
      ✕
    </button>
    <!-- TITLE -->
    <h2 class="text-2xl font-bold mb-6">
      Detail Pengantaran
    </h2>
    <!-- DETAIL -->
    <div
      id="qr-detail"
      class="space-y-3 text-sm"
    ></div>
    <!-- QR -->
    <div
      id="qrcode"
      class="flex justify-center mt-6"
    ></div>
    <!-- PRINT -->
    <button
      id="print-qr"
      class="w-full mt-6 bg-slate-900 text-white py-4 rounded-2xl font-semibold"
    >
      Print
    </button>
  </div>
</div>
