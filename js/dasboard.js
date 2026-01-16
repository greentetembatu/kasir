document.addEventListener("DOMContentLoaded", renderDashboard);

function renderDashboard() {
  const elProduk = document.getElementById("totalProduk");
  if (!elProduk) return; // ⛔ bukan dashboard

  const produk = getProduk();
  const transaksi = getTransaksi();

  let omzet = 0;
  let laba = 0;

  transaksi.forEach(t => {
    omzet += Number(t.total || 0);
    laba += Number(t.totalLaba || 0);
  });

  elProduk.innerText = produk.length;
  document.getElementById("totalTransaksi").innerText = transaksi.length;
  document.getElementById("totalOmzet").innerText = formatRupiah(omzet);
  document.getElementById("totalLaba").innerText = formatRupiah(laba);
}

function formatRupiah(n) {
  return "Rp " + n.toLocaleString("id-ID");
}









