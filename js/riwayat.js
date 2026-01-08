document.addEventListener("DOMContentLoaded", renderRiwayat);

/* =======================
   RENDER RIWAYAT
======================= */
function renderRiwayat() {
  const tbody = document.getElementById("riwayatTable");
  if (!tbody) return;

  const transaksi = getTransaksi();
  tbody.innerHTML = "";

  if (!transaksi || transaksi.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="4" style="text-align:center">
          Belum ada transaksi
        </td>
      </tr>
    `;
    return;
  }

  transaksi.forEach(t => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${t.tanggal || "-"}</td>
      <td>Rp ${(t.total || 0).toLocaleString("id-ID")}</td>
      <td>Rp ${(t.totalLaba || 0).toLocaleString("id-ID")}</td>
  <td>
    <button onclick="lihatDetail(${t.id})">Detail</button>
    <button onclick="cetakStrukRiwayat(${t.id})">🖨 Cetak</button>
    <button onclick="hapusTransaksi(${t.id})" style="color:red">🗑 Hapus</button>

  </td>

    `;

    tbody.appendChild(tr);
  });
}

/* =======================
   DETAIL TRANSAKSI
======================= */
function lihatDetail(id) {
  const transaksi = getTransaksi();
  const t = transaksi.find(x => x.id === id);

  if (!t) {
    alert("Transaksi tidak ditemukan");
    return;
  }

  let info = `🧾 DETAIL TRANSAKSI\n\n`;
  info += `Tanggal: ${t.tanggal || "-"}\n\n`;

  if (Array.isArray(t.items) && t.items.length > 0) {
    t.items.forEach(i => {
      const harga = Number(i.harga || 0);
      const subtotal = Number(i.subtotal || 0);

      info += `• ${i.nama}\n`;
      info += `  ${i.qty} x Rp ${harga.toLocaleString("id-ID")}\n`;
      info += `  Subtotal: Rp ${subtotal.toLocaleString("id-ID")}\n\n`;
    });
  } else {
    info += "(Tidak ada detail item)\n\n";
  }

  const total = Number(t.total || 0);
  const laba = Number(t.totalLaba ?? t.laba ?? 0);

  info += `TOTAL: Rp ${total.toLocaleString("id-ID")}\n`;
  info += `LABA: Rp ${laba.toLocaleString("id-ID")}`;

  alert(info);
}














function cetakStrukRiwayat(id) {
  const transaksi = getTransaksi();
  const t = transaksi.find(x => x.id === id);

  if (!t) {
    alert("Transaksi tidak ditemukan");
    return;
  }

  // Gunakan fungsi cetakStruk yang SAMA
  cetakStruk({
    items: t.items,
    total: t.total,
    uang: t.uang || t.total,      // fallback aman
    kembalian: t.kembalian || 0
  });
}











function hapusTransaksi(id) {
  if (!confirm("Yakin ingin menghapus transaksi ini?\nData tidak bisa dikembalikan.")) {
    return;
  }

  let transaksi = getTransaksi();
  const sebelum = transaksi.length;

  transaksi = transaksi.filter(t => t.id !== id);

  if (transaksi.length === sebelum) {
    alert("Transaksi tidak ditemukan");
    return;
  }

  saveTransaksi(transaksi);
  renderRiwayat();

  alert("Transaksi berhasil dihapus");
}








function hapusTransaksiDanRollback(id) {
  if (!confirm("INI AKAN MENGEMBALIKAN STOK!\nYakin?")) return;

  let transaksi = getTransaksi();
  const t = transaksi.find(x => x.id === id);
  if (!t) return;

  const produk = getProduk();

  t.items.forEach(i => {
    const p = produk.find(x => x.id === i.id);
    if (p) p.stok += i.qty;
  });

  saveProduk(produk);
  saveTransaksi(transaksi.filter(x => x.id !== id));
  renderRiwayat();

  alert("Transaksi & stok berhasil dikembalikan");
}
