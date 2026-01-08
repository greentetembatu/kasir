/* =======================
   STATE
======================= */
let keranjang = [];

/* =======================
   LOAD PRODUK
======================= */
function loadProduk() {
  const select = document.getElementById("produkSelect");
  if (!select) return;

  const produk = getProduk();
  select.innerHTML = "";

  if (produk.length === 0) {
    const opt = document.createElement("option");
    opt.textContent = "Belum ada produk";
    select.appendChild(opt);
    return;
  }

  produk.forEach(p => {
    const opt = document.createElement("option");
    opt.value = p.id;
    opt.textContent = `${p.nama} - Rp ${p.harga_jual} (Stok: ${p.stok})`;
    select.appendChild(opt);
  });
}

loadProduk();

/* =======================
   TAMBAH KE KERANJANG
======================= */
function tambahKeKeranjang() {
  const produkId = Number(document.getElementById("produkSelect").value);
  const qty = Number(document.getElementById("qty").value);

  if (!produkId || qty <= 0) {
    alert("Produk atau jumlah tidak valid");
    return;
  }

  const produk = getProduk();
  const item = produk.find(p => p.id === produkId);

  if (!item) {
    alert("Produk tidak ditemukan");
    return;
  }

  if (item.stok < qty) {
    alert("Stok tidak mencukupi");
    return;
  }

  const subtotal = item.harga_jual * qty;
  const laba = (item.harga_jual - item.modal) * qty;

  keranjang.push({
    id: item.id,
    nama: item.nama,
    qty,
    harga: item.harga_jual,
    subtotal,
    laba
  });

  renderKeranjang();
}

/* =======================
   RENDER KERANJANG
======================= */
function renderKeranjang() {
  const tbody = document.querySelector("#keranjangTable tbody");
  tbody.innerHTML = "";

  let total = 0;
  let totalLaba = 0;

  keranjang.forEach((item, index) => {
    total += item.subtotal;
    totalLaba += item.laba;

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${item.nama}</td>
      <td>
        <input type="number" min="1" value="${item.qty}"
          onchange="ubahQty(${index}, this.value)"
          style="width:60px">
      </td>
      <td>Rp ${item.subtotal.toLocaleString("id-ID")}</td>
      <td>
        <button onclick="hapusItem(${index})">❌</button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  document.getElementById("totalBelanja").innerText =
    "Rp " + total.toLocaleString("id-ID");

  document.getElementById("totalLaba").innerText =
    "Rp " + totalLaba.toLocaleString("id-ID");
}

/* =======================
   UBAH QTY
======================= */
function ubahQty(index, qtyBaru) {
  qtyBaru = Number(qtyBaru);
  if (qtyBaru <= 0) return;

  const item = keranjang[index];
  const hargaSatuan = item.subtotal / item.qty;
  const labaSatuan = item.laba / item.qty;

  item.qty = qtyBaru;
  item.subtotal = hargaSatuan * qtyBaru;
  item.laba = labaSatuan * qtyBaru;

  renderKeranjang();
}

/* =======================
   HAPUS ITEM
======================= */
function hapusItem(index) {
  if (!confirm("Hapus item dari keranjang?")) return;
  keranjang.splice(index, 1);
  renderKeranjang();
}

/* =======================
   SIMPAN TRANSAKSI
======================= */
function simpanTransaksi() {
  const transaksi = getTransaksi();

  transaksi.push({
    id: Date.now(),
    tanggal: new Date().toLocaleString("id-ID"),
    total: keranjang.reduce((s, i) => s + i.subtotal, 0),
    totalLaba: keranjang.reduce((s, i) => s + i.laba, 0),
    items: keranjang.map(i => ({
      id: i.id,
      nama: i.nama,
      qty: i.qty,
      harga: i.harga,
      subtotal: i.subtotal
    }))
  });

  saveTransaksi(transaksi);
}

/* =======================
   KURANGI STOK
======================= */
function kurangiStok() {
  const produk = getProduk();

  keranjang.forEach(item => {
    const p = produk.find(pr => pr.id === item.id);
    if (p) p.stok -= item.qty;
  });

  saveProduk(produk);
}

/* =======================
   BAYAR / SELESAI
======================= */
function bayar() {
  if (keranjang.length === 0) {
    alert("Keranjang kosong");
    return;
  }

  const total = keranjang.reduce((s, i) => s + i.subtotal, 0);

  const uang = Number(prompt(
    `Total belanja: Rp ${total.toLocaleString("id-ID")}\nMasukkan uang bayar:`
  ));

  if (!uang || uang < total) {
    alert("Uang tidak cukup");
    return;
  }

  const kembalian = uang - total;

  // Simpan & kurangi stok
  kurangiStok();
  simpanTransaksi(uang, kembalian);

  const konfirmasi = confirm(
    `Pembayaran berhasil!\n\n` +
    `Total: Rp ${total.toLocaleString("id-ID")}\n` +
    `Bayar: Rp ${uang.toLocaleString("id-ID")}\n` +
    `Kembali: Rp ${kembalian.toLocaleString("id-ID")}\n\n` +
    `Cetak struk?`
  );

  if (konfirmasi) {
    cetakStruk({
      total,
      uang,
      kembalian,
      items: keranjang
    });
  }

  keranjang = [];
  renderKeranjang();
  loadProduk();
}












function cetakStruk(data) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: [80, 200] // ukuran struk thermal
  });

  let y = 10;

  // ===== HEADER =====
  doc.setFontSize(12);
  doc.text("TOKO ANDA", 40, y, { align: "center" });
  y += 6;

  doc.setFontSize(9);
  doc.text("Jl. Contoh Alamat", 40, y, { align: "center" });
  y += 6;

  doc.text("--------------------------------", 40, y, { align: "center" });
  y += 5;

  // ===== TANGGAL =====
  doc.text(`Tanggal: ${new Date().toLocaleString("id-ID")}`, 5, y);
  y += 6;

  doc.text("--------------------------------", 40, y, { align: "center" });
  y += 5;

  // ===== ITEM =====
  data.items.forEach(item => {
    doc.text(item.nama, 5, y);
    y += 4;

    doc.text(
      `${item.qty} x ${item.harga.toLocaleString("id-ID")}`,
      5,
      y
    );

    doc.text(
      item.subtotal.toLocaleString("id-ID"),
      75,
      y,
      { align: "right" }
    );
    y += 5;
  });

  doc.text("--------------------------------", 40, y, { align: "center" });
  y += 6;

  // ===== TOTAL =====
  doc.text("TOTAL", 5, y);
  doc.text(
    data.total.toLocaleString("id-ID"),
    75,
    y,
    { align: "right" }
  );
  y += 5;

  doc.text("BAYAR", 5, y);
  doc.text(
    data.uang.toLocaleString("id-ID"),
    75,
    y,
    { align: "right" }
  );
  y += 5;

  doc.text("KEMBALI", 5, y);
  doc.text(
    data.kembalian.toLocaleString("id-ID"),
    75,
    y,
    { align: "right" }
  );
  y += 8;

  // ===== FOOTER =====
  doc.text("Terima kasih 🙏", 40, y, { align: "center" });
  y += 5;
  doc.text("Barang yang sudah dibeli", 40, y, { align: "center" });
  y += 4;
  doc.text("tidak dapat dikembalikan", 40, y, { align: "center" });

  // ===== SIMPAN =====
  doc.save(`struk-${Date.now()}.pdf`);
}
