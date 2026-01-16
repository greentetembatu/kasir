function getTransaksi() {
  return JSON.parse(localStorage.getItem("transaksi")) || [];
}

function saveTransaksi(data) {
  localStorage.setItem("transaksi", JSON.stringify(data));
}













/* ==========================================
   FUNGSI EKSPOR DATA (DOWNLOAD JSON)
   ========================================== */
function eksporData() {
    try {
        const dataProduk = localStorage.getItem("produk") || "[]";
        const dataTransaksi = localStorage.getItem("transaksi") || "[]";

        const backupData = {
            produk: JSON.parse(dataProduk),
            transaksi: JSON.parse(dataTransaksi),
            app: "POS-UMKM",
            waktu_backup: new Date().toISOString()
        };

        const dataStr = JSON.stringify(backupData);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        
        const fileName = `backup_pos_full_${new Date().toISOString().slice(0,10)}.json`;

        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', fileName);
        linkElement.click();
        
        alert("Ekspor berhasil! Simpan file ini baik-baik.");
    } catch (error) {
        alert("Gagal ekspor: " + error.message);
    }
}

/* ==========================================
   FUNGSI IMPOR DATA (REPLACE & MERGE)
   ========================================== */
function imporData(event, mode) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedData = JSON.parse(e.target.result);

            // Validasi file
            if (!importedData.produk || !importedData.transaksi) {
                throw new Error("Format file backup tidak dikenali.");
            }

            if (mode === 'REPLACE') {
                prosesReplace(importedData);
            } else if (mode === 'MERGE') {
                prosesMerge(importedData);
            }

        } catch (err) {
            alert("Gagal impor: " + err.message);
        }
        // Reset input file agar bisa pilih file yang sama lagi jika perlu
        event.target.value = '';
    };
    reader.readAsText(file);
}

// STRATEGI 1: REPLACE (Menghapus data lama, ganti total)
function prosesReplace(dataBaru) {
    const konfirmasi = confirm("PERINGATAN!\nSeluruh data di HP ini akan DIHAPUS dan diganti dengan data dari file. Lanjutkan?");
    if (konfirmasi) {
        localStorage.setItem("produk", JSON.stringify(dataBaru.produk));
        localStorage.setItem("transaksi", JSON.stringify(dataBaru.transaksi));
        alert("Data berhasil diganti total!");
        window.location.reload();
    }
}

// STRATEGI 2: MERGE (Menambah yang belum ada)
function prosesMerge(dataBaru) {
    const konfirmasi = confirm("Gabungkan data? Produk dengan Barcode/ID yang sama akan dilewati.");
    if (!konfirmasi) return;

    // 1. Merge Produk
    const produkLokal = JSON.parse(localStorage.getItem("produk") || "[]");
    let countProduk = 0;

    dataBaru.produk.forEach(pBaru => {
        // Cek apakah barcode atau ID sudah ada
        const ada = produkLokal.find(pLama => 
            (pBaru.barcode && pLama.barcode === pBaru.barcode) || 
            (pLama.id === pBaru.id)
        );

        if (!ada) {
            produkLokal.push(pBaru);
            countProduk++;
        }
    });

    // 2. Merge Transaksi (Berdasarkan ID Waktu)
    const transaksiLokal = JSON.parse(localStorage.getItem("transaksi") || "[]");
    let countTrx = 0;

    dataBaru.transaksi.forEach(tBaru => {
        const adaTrx = transaksiLokal.find(tLama => tLama.id === tBaru.id);
        if (!adaTrx) {
            transaksiLokal.push(tBaru);
            countTrx++;
        }
    });

    localStorage.setItem("produk", JSON.stringify(produkLokal));
    localStorage.setItem("transaksi", JSON.stringify(transaksiLokal));

    alert(`Berhasil menggabungkan:\n- ${countProduk} Produk baru dimasukkan\n- ${countTrx} Riwayat transaksi baru dimasukkan`);
    window.location.reload();
}