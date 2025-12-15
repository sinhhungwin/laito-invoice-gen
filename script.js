document.addEventListener("DOMContentLoaded", () => {
  // ====== DOM ELEMENTS ======
  const dtInput = document.getElementById("datetime");
  const addItemBtn = document.getElementById("add-item-btn");
  const updatePreviewBtn = document.getElementById("update-preview-btn");
  const generatePdfBtn = document.getElementById("generate-pdf-btn");
  const itemsBody = document.getElementById("items-body");
  const previewDiv = document.getElementById("invoice-preview");

  // ====== SET DEFAULT DATETIME ======
  setDefaultDateTime();

  function setDefaultDateTime() {
    const now = new Date();
    // Chỉnh timezone cho đúng để không lệch giờ
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    dtInput.value = now.toISOString().slice(0, 16);
  }

  // ====== ADD ITEM ROW ======
  addItemBtn.addEventListener("click", () => {
    const tr = document.createElement("tr");
    tr.className = "item-row";
    tr.innerHTML = `
      <td><input type="text" class="item-desc" /></td>
      <td><input type="text" class="item-price" /></td>
    `;
    itemsBody.appendChild(tr);
  });

  // ====== BUILD PREVIEW ======
  function buildPreview() {
    const name = getValue("customer-name");
    const phone = getValue("phone");
    const address = getValue("address");
    const prescription = getValue("prescription");
    const discount = getValue("discount");
    const total = getValue("total");
    const note = getValue("note");
    const datetimeRaw = dtInput.value;

    const dt = datetimeRaw ? new Date(datetimeRaw) : new Date();
    const dtStr = dt.toLocaleString("en-GB"); // DD/MM/YYYY, HH:MM

    // Items
    const itemRows = document.querySelectorAll(".item-row");
    const items = [];
    itemRows.forEach((row) => {
      const desc = row.querySelector(".item-desc").value.trim();
      const price = row.querySelector(".item-price").value.trim();
      if (desc || price) {
        items.push({ desc, price });
      }
    });

    let itemsHtml = "";
    if (items.length) {
      itemsHtml += `
        <table class="inv-items-table">
          <thead>
            <tr>
              <th>Description</th>
              <th style="width: 30%;">Price</th>
            </tr>
          </thead>
          <tbody>
      `;
      items.forEach((it) => {
        itemsHtml += `
          <tr>
            <td>${escapeHtml(it.desc)}</td>
            <td class="inv-right">${escapeHtml(it.price)}</td>
          </tr>
        `;
      });

      if (discount) {
        itemsHtml += `
          <tr>
            <td class="inv-right"><strong>Discount</strong></td>
            <td class="inv-right"><strong>${escapeHtml(discount)}</strong></td>
          </tr>
        `;
      }

      if (total) {
        itemsHtml += `
          <tr>
            <td class="inv-right"><strong>Total</strong></td>
            <td class="inv-right"><strong>${escapeHtml(total)}</strong></td>
          </tr>
        `;
      }

      itemsHtml += "</tbody></table>";
    } else {
      itemsHtml = "<div>No items.</div>";
    }

    const prescriptionBlock = prescription
      ? `
        <div>
          <div class="inv-section-title">Spectacles prescription</div>
          <div class="inv-note">${escapeHtml(prescription).replace(/\n/g, "<br>")}</div>
        </div>
      `
      : "";

    const noteBlock = note
      ? `
        <div class="inv-note">
          <span class="inv-label">Note:</span><br />
          ${escapeHtml(note).replace(/\n/g, "<br>")}
        </div>
      `
      : "";

    const phoneLine = phone
      ? `<div><span class="inv-label">Phone:</span> ${escapeHtml(phone)}</div>`
      : "";

    const addressLine = address
      ? `<div><span class="inv-label">Address:</span> ${escapeHtml(address)}</div>`
      : "";

    previewDiv.innerHTML = `
      <div class="inv-header">
        <h1>Laito Optical</h1>
        <div class="sub">Spectacles Order / Receipt</div>
      </div>

      <div class="inv-section-title">Customer information</div>
      <div class="inv-grid">
        <div><span class="inv-label">Name:</span> ${escapeHtml(name)}</div>
        <div><span class="inv-label">Date &amp; time:</span> ${escapeHtml(dtStr)}</div>
        ${phoneLine}
        ${addressLine}
      </div>

      ${prescriptionBlock}

      <div class="inv-section-title" style="margin-top:10px;">Order details</div>
      ${itemsHtml}

      ${noteBlock}

      <div class="inv-footer">
        <div><strong>Pickup:</strong></div>
        <div>We are at: 23C Hàng Hành, Hoàn Kiếm, Hà Nội</div>
        <div>WhatsApp: +84 969 054 529 / +84 355 328 282 / +84 373 686 845</div>
        <div>Open daily: 10:00 – 18:30</div>
      </div>
    `;
  }

    //   <div class="inv-bottom-date">
    //     <span>Hà Nội, ......./......./........</span>
    //   </div>
  // Helper: lấy value, tránh undefined
  function getValue(id) {
    const el = document.getElementById(id);
    return el ? el.value.trim() : "";
  }

  // Escape HTML để tránh lỗi khi khách gõ ký tự lạ
  function escapeHtml(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  // ====== EVENTS ======
  updatePreviewBtn.addEventListener("click", buildPreview);

  // build preview lần đầu
  buildPreview();

  generatePdfBtn.addEventListener("click", () => {
    buildPreview(); // cập nhật preview trước khi xuất

    if (typeof html2pdf === "undefined") {
      alert("PDF library (html2pdf) chưa load. Kiểm tra lại kết nối internet hoặc link CDN.");
      return;
    }

    const name = getValue("customer-name")
      .replace(/\s+/g, "_")
      || "invoice";
    const element = previewDiv;

    const opt = {
      margin: 10,
      filename: `Laito_Receipt_${name}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
    };

    html2pdf().set(opt).from(element).save();
  });
});
