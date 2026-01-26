document.addEventListener("DOMContentLoaded", renderProduk);

/* =======================
   SIMPAN PRODUK
======================= */
function simpanProduk() {
  const produk = getProduk();

  const id = document.getElementById("produkId").value;
  const barcode = document.getElementById("barcodeProduk").value.trim();
  const nama = document.getElementById("namaProduk").value.trim();
  const modal = Number(document.getElementById("modalProduk").value);
  const harga_jual = Number(document.getElementById("hargaProduk").value);
  const stok = Number(document.getElementById("stokProduk").value);

  // Validasi Dasar
  if (!nama || modal <= 0 || harga_jual <= 0 || stok < 0) {
    alert("Lengkapi data dengan benar");
    return;
  }

  // --- TAMBAHAN: Validasi Barcode Ganda ---
  if (barcode !== "") {
    const isDuplicate = produk.some(p => p.barcode === barcode && p.id != id);
    if (isDuplicate) {
      alert("⚠️ Barcode sudah digunakan oleh produk lain!");
      return;
    }
  }

  if (id) {
    // Edit Produk
    const index = produk.findIndex(p => p.id == id);
    if (index === -1) return;

    produk[index] = {
      ...produk[index],
      barcode: barcode, 
      nama,
      modal,
      harga_jual,
      stok
    };
  } else {
    // Tambah Produk Baru
    produk.push({
      id: Date.now(),
      barcode: barcode,
      nama,
      modal,
      harga_jual,
      stok
    });
  }

  saveProduk(produk);
  resetForm();
  renderProduk();
}

/* =======================
   EDIT PRODUK
======================= */
function editProduk(id) {
  const produk = getProduk();
  const p = produk.find(item => item.id === id);
  if (!p) return;

  // Mengisi form dengan data yang ada
  document.getElementById("produkId").value = p.id;
  document.getElementById("barcodeProduk").value = p.barcode || "";
  document.getElementById("namaProduk").value = p.nama;
  document.getElementById("modalProduk").value = p.modal;
  document.getElementById("hargaProduk").value = p.harga_jual;
  document.getElementById("stokProduk").value = p.stok;
}

/* =======================
   HAPUS PRODUK
======================= */
function hapusProduk(id) {
  if (!confirm("Hapus produk ini?")) return;

  let produk = getProduk();
  produk = produk.filter(p => p.id !== id);

  saveProduk(produk);
  renderProduk();
}

/* =======================
   RESET FORM
======================= */
function resetForm() {
  document.getElementById("produkId").value = "";
  document.getElementById("barcodeProduk").value = "";
  document.getElementById("namaProduk").value = "";
  document.getElementById("modalProduk").value = "";
  document.getElementById("hargaProduk").value = "";
  document.getElementById("stokProduk").value = "";
}

/* =======================
   RENDER TABEL (Update: Tambah Barcode)
======================= */
function renderProduk() {
  const tbody = document.getElementById("produkTable");
  if (!tbody) return;

  const produk = getProduk();
  const keyword = document.getElementById("searchProduk")?.value.toLowerCase() || "";
  const filter = document.getElementById("filterStok")?.value || "all";

  tbody.innerHTML = "";

  const hasil = produk.filter(p => {
    const cocokNama = p.nama.toLowerCase().includes(keyword);
    const cocokBarcode = (p.barcode || "").toLowerCase().includes(keyword);

    let cocokStok = true;
    if (filter === "tersedia") cocokStok = p.stok > 0;
    if (filter === "habis") cocokStok = p.stok === 0;
    if (filter === "menipis") cocokStok = p.stok > 0 && p.stok <= 5;

    return (cocokNama || cocokBarcode) && cocokStok;
  });

  if (hasil.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center">Produk tidak ditemukan</td></tr>`;
    return;
  }

  hasil.forEach(p => {
    const tr = document.createElement("tr");

    let badge = p.stok === 0 ? "❌ Habis" : (p.stok <= 5 ? "⚠️ Menipis" : "✅ Aman");

    // Sekarang menggunakan 6 kolom (td)
    tr.innerHTML = `
      <td><img src="${p.foto || 'https://via.placeholder.com/50'}" style="width:50px; height:50px; object-fit:cover; border-radius:5px;"></td>
      <td><code style="background: #eee; padding: 2px 5px; border-radius: 4px;">${p.barcode || '-'}</code></td>
      <td><strong>${p.nama}</strong></td>
      <td>Rp ${p.modal.toLocaleString("id-ID")}</td>
      <td>Rp ${p.harga_jual.toLocaleString("id-ID")}</td>
      <td>${p.stok} <br><small>${badge}</small></td>
      <td>
        <button onclick="editProduk(${p.id})">Edit</button>
        <button onclick="hapusProduk(${p.id})">Hapus</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}
/* =======================
   FUNGSI BARCODE SCANNER
======================= */
let html5QrCode;

function mulaiScan() {
    if (!html5QrCode) {
        html5QrCode = new Html5Qrcode("reader");
    }
    
    const config = { 
        fps: 20, 
        qrbox: { width: 280, height: 180 },
        aspectRatio: 1.0
    };

    html5QrCode.start(
        { facingMode: "environment" }, 
        config, 
        (barcodeText) => {
          playCarHorn(); 
            if (navigator.vibrate) navigator.vibrate(100); // Getar HP
            if (navigator.vibrate) navigator.vibrate(100);
            stopScan();

            document.getElementById("barcodeProduk").value = barcodeText;

            const produk = getProduk();
            const pTerdaftar = produk.find(p => p.barcode === barcodeText);

            if (pTerdaftar) {
                alert("Produk ditemukan: " + pTerdaftar.nama + ". Mengalihkan ke mode Edit.");
                isiFormProduk(pTerdaftar);
            } else {
                alert("Barang Baru terdeteksi!");
                // Simpan barcode, bersihkan field lain
                const currentBarcode = barcodeText;
                resetForm();
                document.getElementById("barcodeProduk").value = currentBarcode;
                document.getElementById("namaProduk").focus();
            }
        }
    ).catch(err => {
        alert("Gagal akses kamera: " + err);
    });
}

function stopScan() {
    if (html5QrCode) {
        html5QrCode.stop().catch(err => console.error("Error stopping scanner", err));
    }
}

// Fungsi pembantu untuk memindahkan data ke form
function isiFormProduk(p) {
    document.getElementById("produkId").value = p.id;
    document.getElementById("barcodeProduk").value = p.barcode || "";
    document.getElementById("namaProduk").value = p.nama;
    document.getElementById("modalProduk").value = p.modal;
    document.getElementById("hargaProduk").value = p.harga_jual;
    document.getElementById("stokProduk").value = p.stok;
}













/* =======================
   FUNGSI BUNYI Car Horn
======================= */
function playCarHorn() {
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        
        // Kita gunakan dua sumber suara agar suaranya "tebal" dan berisik
        const osc1 = audioCtx.createOscillator();
        const osc2 = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        osc1.connect(gainNode);
        osc2.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        // Tipe 'sawtooth' memberikan efek kasar khas klakson
        osc1.type = "sawtooth";
        osc2.type = "sawtooth";

        // Frekuensi klakson mobil biasanya di sekitar 400Hz - 500Hz
        // Kita buat sedikit berbeda (detuned) agar terdengar natural/sumbang
        osc1.frequency.setValueAtTime(400, audioCtx.currentTime); 
        osc2.frequency.setValueAtTime(410, audioCtx.currentTime); 

        // Volume klakson biasanya konstan lalu mati mendadak
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
        
        // Durasi panjang (1.5 detik)
        const duration = 1.5;

        // Efek sedikit memudar di akhir agar tidak pecah di speaker
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);

        osc1.start();
        osc2.start();
        
        osc1.stop(audioCtx.currentTime + duration);
        osc2.stop(audioCtx.currentTime + duration);

    } catch (e) {
        console.log("Audio tidak dapat diputar");
    }
}


















// Di dalam simpanProduk()
/* Variabel global untuk menampung gambar sementara */
let fotoBase64 = ""; 

// Fungsi untuk menangkap upload gambar & pratinjau
function previewImage(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function() {
        const output = document.getElementById('imgPreview');
        output.src = reader.result;
        output.style.display = 'block';
        fotoBase64 = reader.result; // Hasil string base64
    };
    reader.readAsDataURL(file);
}

function simpanProduk() {
    const produk = getProduk() || []; // Proteksi jika data kosong

    // Ambil elemen secara aman
    const elId = document.getElementById("produkId");
    const elBarcode = document.getElementById("barcodeProduk");
    const elNama = document.getElementById("namaProduk");
    const elModal = document.getElementById("modalProduk");
    const elHarga = document.getElementById("hargaProduk");
    const elStok = document.getElementById("stokProduk");

    // Pastikan elemen ada sebelum mengambil .value (Cegah Error baris ini)
    if (!elNama || !elModal) {
        console.error("Elemen form tidak ditemukan di HTML");
        return;
    }

    const id = elId.value; 
    const barcode = elBarcode ? elBarcode.value.trim() : "";
    const nama = elNama.value.trim();
    const modal = Number(elModal.value);
    const harga_jual = Number(elHarga.value);
    const stok = Number(elStok.value);

    // Validasi input
    if (!nama || modal <= 0 || harga_jual <= 0) {
        alert("Lengkapi data produk dengan benar!");
        return;
    }

    // Validasi Barcode Ganda
    if (barcode !== "") {
        const isDuplicate = produk.some(p => p.barcode === barcode && p.id != id);
        if (isDuplicate) {
            alert("⚠️ Barcode ini sudah terdaftar pada produk lain!");
            return;
        }
    }

    if (id) {
        // --- PROSES EDIT ---
        const index = produk.findIndex(p => p.id == id);
        if (index !== -1) {
            produk[index] = {
                ...produk[index],
                barcode: barcode,
                nama: nama,
                modal: modal,
                harga_jual: harga_jual,
                stok: stok,
                // Gunakan foto baru jika ada, jika tidak gunakan foto lama
                foto: fotoBase64 || produk[index].foto || "" 
            };
        }
    } else {
        // --- PROSES TAMBAH BARU ---
        produk.push({
            id: Date.now(),
            barcode: barcode,
            nama: nama,
            modal: modal,
            harga_jual: harga_jual,
            stok: stok,
            foto: fotoBase64 || "" // Placeholder kosong jika tidak ada foto
        });
    }

    saveProduk(produk);
    resetForm();
    renderProduk();
    
    // Reset status foto setelah simpan
    fotoBase64 = "";
    if(document.getElementById('imgPreview')) document.getElementById('imgPreview').style.display = 'none';
    
    alert("Produk berhasil disimpan!");

}

