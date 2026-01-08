document.addEventListener("DOMContentLoaded", renderProduk);

/* =======================
   RENDER PRODUK
======================= */
/*function renderProduk() {
  const tbody = document.getElementById("produkTable");
  if (!tbody) return;

  const produk = getProduk();
  tbody.innerHTML = "";

  if (produk.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align:center">
          Belum ada produk
        </td>
      </tr>
    `;
    return;
  }

  produk.forEach(p => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${p.nama}</td>
      <td>Rp ${Number(p.modal).toLocaleString("id-ID")}</td>
      <td>Rp ${Number(p.harga_jual).toLocaleString("id-ID")}</td>
      <td>${p.stok}</td>
      <td>
        <button onclick="editProduk(${p.id})">Edit</button>
        <button onclick="hapusProduk(${p.id})">Hapus</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}*/

/* =======================
   SIMPAN PRODUK
======================= */
function simpanProduk() {
  const produk = getProduk();

  const id = document.getElementById("produkId").value;
  const nama = document.getElementById("namaProduk").value.trim();
  const modal = Number(document.getElementById("modalProduk").value);
  const harga_jual = Number(document.getElementById("hargaProduk").value);
  const stok = Number(document.getElementById("stokProduk").value);

  if (!nama || modal <= 0 || harga_jual <= 0 || stok < 0) {
    alert("Lengkapi data dengan benar");
    return;
  }

  if (id) {
    const index = produk.findIndex(p => p.id == id);
    if (index === -1) return;

    produk[index] = {
      ...produk[index],
      nama,
      modal,
      harga_jual,
      stok
    };
  } else {
    produk.push({
      id: Date.now(),
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
/*function editProduk(id) {
  const produk = getProduk();
  const p = produk.find(item => item.id === id);

  if (!p) return;

  document.getElementById("produkId").value = p.id;
  document.getElementById("namaProduk").value = p.nama;
  document.getElementById("modalProduk").value = p.modal;
  document.getElementById("hargaProduk").value = p.harga_jual;
  document.getElementById("stokProduk").value = p.stok;
}*/
function editProduk(id) {
  const produk = getProduk();
  const p = produk.find(item => item.id === id);
  if (!p) return;

  document.getElementById("produkId").value = p.id;
  document.getElementById("namaProduk").value = p.nama;
  document.getElementById("modalProduk").value = p.modal;
  document.getElementById("hargaProduk").value = p.harga_jual;
  document.getElementById("stokProduk").value = p.stok;
}


/* =======================
   HAPUS PRODUK
======================= */
/*function hapusProduk(id) {
  if (!confirm("Hapus produk ini?")) return;

  let produk = getProduk();
  produk = produk.filter(p => p.id !== id);

  saveProduk(produk);
  renderProduk();
}*/




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
  document.getElementById("namaProduk").value = "";
  document.getElementById("modalProduk").value = "";
  document.getElementById("hargaProduk").value = "";
  document.getElementById("stokProduk").value = "";
}
























function renderProduk() {
  const tbody = document.getElementById("produkTable");
  if (!tbody) return;

  const produk = getProduk();

  const keyword = document
    .getElementById("searchProduk")?.value
    .toLowerCase() || "";

  const filter = document.getElementById("filterStok")?.value || "all";

  tbody.innerHTML = "";

  const hasil = produk.filter(p => {
    const cocokNama = p.nama.toLowerCase().includes(keyword);

    let cocokStok = true;
    if (filter === "tersedia") cocokStok = p.stok > 0;
    if (filter === "habis") cocokStok = p.stok === 0;
    if (filter === "menipis") cocokStok = p.stok > 0 && p.stok <= 5;

    return cocokNama && cocokStok;
  });

  if (hasil.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align:center">
          Produk tidak ditemukan
        </td>
      </tr>
    `;
    return;
  }

  hasil.forEach(p => {
    const tr = document.createElement("tr");

    let badge = "";
    if (p.stok === 0) badge = "❌ Habis";
    else if (p.stok <= 5) badge = "⚠️ Menipis";
    else badge = "✅ Aman";

    tr.innerHTML = `
      <td>${p.nama}</td>
      <td>Rp ${p.modal.toLocaleString("id-ID")}</td>
      <td>Rp ${p.harga_jual.toLocaleString("id-ID")}</td>
      <td>${p.stok} <small>${badge}</small></td>
      <td>
        <button onclick="editProduk(${p.id})">Edit</button>
        <button onclick="hapusProduk(${p.id})">Hapus</button>
      </td>
    `;

    tbody.appendChild(tr);
  });
}


















/*document.getElementById("searchProduk").addEventListener("input", e => {
  const keyword = e.target.value.toLowerCase();
  const produk = getProduk().filter(p =>
    p.nama.toLowerCase().includes(keyword)
  );

  renderProduk(produk);
});*/

















function mulaiScan() {
  const video = document.getElementById("video");
  const input = document.getElementById("barcodeProduk");

  if (!video || !input) {
    alert("Elemen barcode tidak ditemukan");
    return;
  }

  video.style.display = "block";

  navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
    .then(s => {
      stream = s;
      video.srcObject = stream;
      video.setAttribute("playsinline", true);
      video.play();

      scanner = new BarcodeDetector({
        formats: ["code_128", "ean_13", "ean_8", "qr_code"]
      });

      scanLoop(video, input);
    })
    .catch(() => alert("Kamera tidak bisa diakses"));
}













function scanLoop(video, input) {
  if (!scanner) return;

  scanner.detect(video).then(codes => {
    if (codes.length > 0) {
      input.value = codes[0].rawValue;
      stopScan();
    } else {
      requestAnimationFrame(() => scanLoop(video, input));
    }
  });
}









function stopScan() {
  if (stream) {
    stream.getTracks().forEach(t => t.stop());
    stream = null;
  }

  const video = document.getElementById("video");
  if (video) {
    video.pause();
    video.srcObject = null;
    video.style.display = "none";
  }
}
