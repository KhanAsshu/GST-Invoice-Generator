// =======================================
// STEP 4 - ADVANCED ITEM CALCULATION
// =======================================

let items = [];
let editIndex = -1;

function changeTaxType() {
    const taxType = document.getElementById("taxType").value;
    const cgstBox = document.getElementById("cgstBox");
    const sgstBox = document.getElementById("sgstBox");
    const igstBox = document.getElementById("igstBox");
    const cgstSummary = document.getElementById("cgstSummaryRow");
    const sgstSummary = document.getElementById("sgstSummaryRow");
    const igstSummary = document.getElementById("igstSummaryRow");

    if (taxType === "inter") {
        if (cgstBox) cgstBox.style.display = "none";
        if (sgstBox) sgstBox.style.display = "none";
        if (igstBox) igstBox.style.display = "block";

        if (cgstSummary) cgstSummary.style.display = "none";
        if (sgstSummary) sgstSummary.style.display = "none";
        if (igstSummary) igstSummary.style.display = "flex";
    } else {
        if (cgstBox) cgstBox.style.display = "block";
        if (sgstBox) sgstBox.style.display = "block";
        if (igstBox) igstBox.style.display = "none";

        if (cgstSummary) cgstSummary.style.display = "flex";
        if (sgstSummary) sgstSummary.style.display = "flex";
        if (igstSummary) igstSummary.style.display = "none";
    }

    if (items.length > 0) {
        const defaultCgst = Number(document.getElementById("cgst").value);
        const defaultSgst = Number(document.getElementById("sgst").value);
        const defaultIgst = Number(document.getElementById("igst").value);

        items.forEach(item => {
            item.taxType = taxType;
            if (taxType === "intra") {
                item.cgstRate = item.cgstRate > 0 ? item.cgstRate : defaultCgst;
                item.sgstRate = item.sgstRate > 0 ? item.sgstRate : defaultSgst;
                item.igstRate = 0;
            } else {
                item.igstRate = defaultIgst;
                item.cgstRate = 0;
                item.sgstRate = 0;
            }
            item.cgstAmount = item.taxable * item.cgstRate / 100;
            item.sgstAmount = item.taxable * item.sgstRate / 100;
            item.igstAmount = item.taxable * item.igstRate / 100;
            item.total = item.taxable + item.cgstAmount + item.sgstAmount + item.igstAmount;
        });

        displayItems();
    }
}

function addItem() {
    const product = document.getElementById("product").value.trim();
    const hsn = document.getElementById("hsn").value.trim();
    const qty = Number(document.getElementById("qty").value);
    const uom = document.getElementById("uom").value;
    const rate = Number(document.getElementById("rate").value);
    const discountRate = Number(document.getElementById("discount").value);
    const taxType = document.getElementById("taxType").value;

    let cgstRate = 0;
    let sgstRate = 0;
    let igstRate = 0;

    if (taxType === "intra") {
        cgstRate = Number(document.getElementById("cgst").value);
        sgstRate = Number(document.getElementById("sgst").value);
    } else {
        igstRate = Number(document.getElementById("igst").value);
    }

    if (product === "" || qty <= 0 || rate < 0) {
        alert("Please enter valid Product, Quantity and Rate.");
        return;
    }

    if (discountRate < 0 || discountRate > 100) {
        alert("Discount must be between 0 and 100.");
        return;
    }

    const grossAmount = qty * rate;
    const discountAmount = grossAmount * discountRate / 100;
    const taxable = grossAmount - discountAmount;
    const cgstAmount = taxable * cgstRate / 100;
    const sgstAmount = taxable * sgstRate / 100;
    const igstAmount = taxable * igstRate / 100;
    const total = taxable + cgstAmount + sgstAmount + igstAmount;

    const item = {
        product,
        hsn,
        qty,
        uom,
        rate,
        grossAmount,
        discountRate,
        discountAmount,
        taxable,
        cgstRate,
        cgstAmount,
        sgstRate,
        sgstAmount,
        taxType,
        igstRate,
        igstAmount,
        total
    };

    if (editIndex >= 0) {
        items[editIndex] = item;
        editIndex = -1;
        document.getElementById("itemSubmitButton").innerText = "+ Add Item";
        document.getElementById("cancelEditButton").style.display = "none";
    } else {
        items.push(item);
    }

    displayItems();
    clearInputs();
}

function displayItems() {
    const tableBody = document.getElementById("invoiceBody");
    tableBody.innerHTML = "";

    items.forEach((item, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${item.product}</td>
            <td>${item.hsn || "-"}</td>
            <td>${item.qty}</td>
            <td>${item.uom}</td>
            <td>${item.rate.toFixed(2)}</td>
            <td>
                ${item.discountRate}%
                <br>
                <small>₹${item.discountAmount.toFixed(2)}</small>
            </td>
            <td>${item.taxable.toFixed(2)}</td>
            <td>${item.cgstRate}%</td>
            <td>${item.cgstAmount.toFixed(2)}</td>
            <td>${item.sgstRate}%</td>
            <td>${item.sgstAmount.toFixed(2)}</td>
            <td>${item.igstRate > 0 ? item.igstRate + "%" : "-"}</td>
            <td>${item.igstAmount > 0 ? item.igstAmount.toFixed(2) : "-"}</td>
            <td><strong>${item.total.toFixed(2)}</strong></td>
            <td>
                <button type="button" class="edit-btn" onclick="editItem(${index})">Edit</button>
                <button type="button" class="delete-btn" onclick="deleteItem(${index})">Delete</button>
            </td>
        `;
        tableBody.appendChild(row);
    });

    calculateTotals();
}

function calculateTotals() {
    let gross = 0;
    let discount = 0;
    let taxable = 0;
    let cgst = 0;
    let sgst = 0;
    let igst = 0;
    let exactTotal = 0;

    items.forEach(item => {
        gross += item.grossAmount;
        discount += item.discountAmount;
        taxable += item.taxable;
        cgst += item.cgstAmount;
        sgst += item.sgstAmount;
        igst += item.igstAmount;
        exactTotal += item.total;
    });

    const roundedTotal = Math.round(exactTotal);
    const roundOff = roundedTotal - exactTotal;

    document.getElementById("grossAmount").innerText = gross.toFixed(2);
    document.getElementById("totalDiscount").innerText = discount.toFixed(2);
    document.getElementById("subtotal").innerText = taxable.toFixed(2);
    document.getElementById("totalCGST").innerText = cgst.toFixed(2);
    document.getElementById("totalSGST").innerText = sgst.toFixed(2);
    document.getElementById("totalIGST").innerText = igst.toFixed(2);
    document.getElementById("beforeRoundOff").innerText = exactTotal.toFixed(2);

    let roundText;
    if (Math.abs(roundOff) < 0.005) {
        roundText = "₹ 0.00";
    } else if (roundOff > 0) {
        roundText = "+ ₹ " + roundOff.toFixed(2);
    } else {
        roundText = "- ₹ " + Math.abs(roundOff).toFixed(2);
    }

    document.getElementById("roundOff").innerText = roundText;
    document.getElementById("grandTotal").innerText = roundedTotal.toFixed(2);
    document.getElementById("amountInWords").innerText = numberToWords(roundedTotal) + " Rupees Only";
}

function editItem(index) {
    const item = items[index];

    document.getElementById("product").value = item.product;
    document.getElementById("hsn").value = item.hsn;
    document.getElementById("qty").value = item.qty;
    document.getElementById("uom").value = item.uom;
    document.getElementById("rate").value = item.rate;
    document.getElementById("discount").value = item.discountRate;

    if (item.taxType === "inter") {
        document.getElementById("igst").value = item.igstRate;
    } else {
        document.getElementById("cgst").value = item.cgstRate;
        document.getElementById("sgst").value = item.sgstRate;
    }

    editIndex = index;
    document.getElementById("itemSubmitButton").innerText = "Update Item";
    document.getElementById("cancelEditButton").style.display = "inline-block";
    document.getElementById("product").focus();
}

function cancelEdit() {
    editIndex = -1;
    clearInputs();
    document.getElementById("itemSubmitButton").innerText = "+ Add Item";
    document.getElementById("cancelEditButton").style.display = "none";
}

function deleteItem(index) {
    items.splice(index, 1);
    if (editIndex === index) {
        cancelEdit();
    } else if (editIndex > index) {
        editIndex--;
    }
    displayItems();
}

function clearInputs() {
    document.getElementById("product").value = "";
    document.getElementById("hsn").value = "";
    document.getElementById("qty").value = "";
    document.getElementById("rate").value = "";
    document.getElementById("discount").value = "0";
    document.getElementById("cgst").value = "9";
    document.getElementById("sgst").value = "9";
    document.getElementById("uom").value = "PCS";
    document.getElementById("product").focus();
}

// =================================
// STEP 3 - INVOICE INFORMATION
// =================================

window.addEventListener("DOMContentLoaded", function () {
    const today = new Date().toISOString().split("T")[0];
    document.getElementById("invoiceDate").value = today;
    generateInvoiceNumber();
});

function generateInvoiceNumber() {
    const now = new Date();
    const year = now.getFullYear();
    const randomNumber = Math.floor(1000 + Math.random() * 9000);
    document.getElementById("invoiceNumber").value = "INV-" + year + "-" + randomNumber;
}

document.getElementById("companyName").addEventListener("input", function () {
    const companyName = this.value.trim();
    document.getElementById("companyPreview").innerText = companyName || "Your Company Name";
});

function previewLogo(event) {
    const file = event.target.files[0];
    if (!file) {
        return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
        document.getElementById("logoPreview").innerHTML = `<img src="${e.target.result}" alt="Company Logo">`;
    };
    reader.readAsDataURL(file);
}

function numberToWords(number) {
    if (number === 0) {
        return "Zero";
    }

    const ones = [
        "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
        "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
        "Seventeen", "Eighteen", "Nineteen"
    ];

    const tens = [
        "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"
    ];

    function belowHundred(n) {
        if (n < 20) {
            return ones[n];
        }
        return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? " " + ones[n % 10] : "");
    }

    function belowThousand(n) {
        let words = "";
        if (n >= 100) {
            words += ones[Math.floor(n / 100)] + " Hundred";
            n %= 100;
            if (n > 0) {
                words += " ";
            }
        }
        if (n > 0) {
            words += belowHundred(n);
        }
        return words;
    }

    let words = "";

    if (number >= 10000000) {
        const crore = Math.floor(number / 10000000);
        words += numberToWords(crore) + " Crore ";
        number %= 10000000;
    }

    if (number >= 100000) {
        const lakh = Math.floor(number / 100000);
        words += belowHundred(lakh) + " Lakh ";
        number %= 100000;
    }

    if (number >= 1000) {
        const thousand = Math.floor(number / 1000);
        words += belowHundred(thousand) + " Thousand ";
        number %= 1000;
    }

    if (number > 0) {
        words += belowThousand(number);
    }

    return words.trim();
}

// ======================================
// STEP 7 - GENERATE FINAL INVOICE
// ======================================

function getValue(id) {
    const element = document.getElementById(id);
    if (!element) {
        return "";
    }
    return element.value.trim();
}

function displayValue(id, value) {
    const el = document.getElementById(id);
    if (el) {
        el.innerText = value || "-";
    }
}

function formatInvoiceDate(dateValue) {
    if (!dateValue) {
        return "-";
    }
    const parts = dateValue.split("-");
    if (parts.length !== 3) {
        return dateValue;
    }
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
}

function populateInvoicePreviewData() {
    /* COMPANY */
    displayValue("printCompanyName", getValue("companyName") || "Company Name");
    displayValue("printCompanyAddress", getValue("companyAddress"));
    displayValue("printCompanyGSTIN", getValue("companyGSTIN"));
    displayValue("printCompanyPhone", getValue("companyPhone"));
    displayValue("printCompanyEmail", getValue("companyEmail"));

    /* LOGO */
    const originalLogo = document.querySelector("#logoPreview img");
    const printLogo = document.getElementById("printLogo");
    printLogo.innerHTML = "";

    if (originalLogo && originalLogo.src) {
        const img = document.createElement("img");
        img.src = originalLogo.src;
        img.alt = "Company Logo";
        printLogo.appendChild(img);
    }

    /* INVOICE */
    displayValue("printInvoiceNumber", getValue("invoiceNumber"));
    displayValue("printInvoiceDate", formatInvoiceDate(getValue("invoiceDate")));
    displayValue("printDueDate", formatInvoiceDate(getValue("dueDate")));
    displayValue("printPlaceSupply", getValue("placeSupply"));
    displayValue("printTransportMode", getValue("transportMode"));
    displayValue("printVehicleNumber", getValue("vehicleNumber"));

    /* CUSTOMER */
    displayValue("printCustomerName", getValue("customerName"));
    displayValue("printCustomerAddress", getValue("customerAddress"));
    displayValue("printCustomerGSTIN", getValue("customerGSTIN"));
    displayValue("printCustomerPhone", getValue("customerPhone"));
    displayValue("printCustomerEmail", getValue("customerEmail"));

    /* TAX TYPE & ITEM TABLE */
    const taxType = document.getElementById("taxType").value;
    const tableHead = document.getElementById("printTableHead");
    const tableBody = document.getElementById("printTableBody");

    if (taxType === "intra") {
        tableHead.innerHTML = `
            <tr>
                <th>S.No.</th>
                <th>Description</th>
                <th>HSN/SAC</th>
                <th>Qty</th>
                <th>UOM</th>
                <th>Rate</th>
                <th>Discount</th>
                <th>Taxable Value</th>
                <th>CGST</th>
                <th>CGST Amount</th>
                <th>SGST</th>
                <th>SGST Amount</th>
                <th>Total</th>
            </tr>
        `;
    } else {
        tableHead.innerHTML = `
            <tr>
                <th>S.No.</th>
                <th>Description</th>
                <th>HSN/SAC</th>
                <th>Qty</th>
                <th>UOM</th>
                <th>Rate</th>
                <th>Discount</th>
                <th>Taxable Value</th>
                <th>IGST</th>
                <th>IGST Amount</th>
                <th>Total</th>
            </tr>
        `;
    }

    tableBody.innerHTML = "";

    items.forEach((item, index) => {
        const row = document.createElement("tr");

        if (taxType === "inter") {
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${item.product}</td>
                <td>${item.hsn || "-"}</td>
                <td>${item.qty}</td>
                <td>${item.uom}</td>
                <td>₹${item.rate.toFixed(2)}</td>
                <td>${item.discountRate}%</td>
                <td>₹${item.taxable.toFixed(2)}</td>
                <td>${item.igstRate}%</td>
                <td>₹${item.igstAmount.toFixed(2)}</td>
                <td>₹${item.total.toFixed(2)}</td>
            `;
        } else {
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${item.product}</td>
                <td>${item.hsn || "-"}</td>
                <td>${item.qty}</td>
                <td>${item.uom}</td>
                <td>₹${item.rate.toFixed(2)}</td>
                <td>${item.discountRate}%</td>
                <td>₹${item.taxable.toFixed(2)}</td>
                <td>${item.cgstRate}%</td>
                <td>₹${item.cgstAmount.toFixed(2)}</td>
                <td>${item.sgstRate}%</td>
                <td>₹${item.sgstAmount.toFixed(2)}</td>
                <td>₹${item.total.toFixed(2)}</td>
            `;
        }

        tableBody.appendChild(row);
    });

    /* TOTALS */
    displayValue("printGross", "₹" + document.getElementById("grossAmount").innerText);
    displayValue("printDiscount", "- ₹" + document.getElementById("totalDiscount").innerText);
    displayValue("printTaxable", "₹" + document.getElementById("subtotal").innerText);
    displayValue("printCGST", "₹" + document.getElementById("totalCGST").innerText);
    displayValue("printSGST", "₹" + document.getElementById("totalSGST").innerText);
    displayValue("printIGST", "₹" + document.getElementById("totalIGST").innerText);
    displayValue("printBeforeRoundOff", "₹" + document.getElementById("beforeRoundOff").innerText);
    displayValue("printRoundOff", document.getElementById("roundOff").innerText);
    displayValue("printGrandTotal", "₹" + document.getElementById("grandTotal").innerText);

    if (taxType === "inter") {
        document.getElementById("printCGSTRow").style.display = "none";
        document.getElementById("printSGSTRow").style.display = "none";
        document.getElementById("printIGSTRow").style.display = "flex";
    } else {
        document.getElementById("printCGSTRow").style.display = "flex";
        document.getElementById("printSGSTRow").style.display = "flex";
        document.getElementById("printIGSTRow").style.display = "none";
    }

    /* WORDS */
    displayValue("printAmountWords", document.getElementById("amountInWords").innerText);

    /* BANK */
    displayValue("printBankName", getValue("bankName"));
    displayValue("printAccountHolder", getValue("accountHolder"));
    displayValue("printAccountNumber", getValue("accountNumber"));
    displayValue("printIFSC", getValue("ifscCode"));
    displayValue("printBranch", getValue("bankBranch"));
    displayValue("printUPI", getValue("upiId"));

    /* PAYMENT */
    displayValue("printPaymentStatus", getValue("paymentStatus"));
    displayValue("printPaymentMode", getValue("paymentMode"));
    displayValue("printTransaction", getValue("transactionId"));

    /* TERMS */
    displayValue("printTerms", getValue("termsConditions"));
    displayValue("printNotes", getValue("invoiceNotes"));

    /* SIGNATORY */
    displayValue("printAuthorizedName", getValue("authorizedName") || "Authorised Signatory");
}

function generateInvoicePreview() {
    populateInvoicePreviewData();
    const previewArea = document.getElementById("invoicePreviewArea");
    previewArea.style.display = "block";
    previewArea.scrollIntoView({ behavior: "smooth" });
}

function closeInvoicePreview() {
    document.getElementById("invoicePreviewArea").style.display = "none";
}

// ========================================================
// DIRECT A4 PDF DOWNLOAD FROM #printInvoice (NO window.print)
// ========================================================

async function downloadInvoicePDF() {
    populateInvoicePreviewData();

    const printInvoice = document.getElementById("printInvoice");
    const downloadBtn = document.getElementById("downloadPdfBtn");

    if (!window.html2canvas || !window.jspdf) {
        alert("PDF libraries are still loading. Please check your internet connection and try again.");
        return;
    }

    const originalBtnText = downloadBtn ? downloadBtn.innerText : "Download PDF";
    if (downloadBtn) {
        downloadBtn.disabled = true;
        downloadBtn.innerText = "Generating PDF...";
    }

    // Create an offscreen staging container so #printInvoice is captured at full unclipped width
    const stagingWrapper = document.createElement("div");
    stagingWrapper.style.position = "fixed";
    stagingWrapper.style.left = "-10000px";
    stagingWrapper.style.top = "0";
    stagingWrapper.style.zIndex = "-9999";
    stagingWrapper.style.background = "#ffffff";
    stagingWrapper.style.padding = "0";
    stagingWrapper.style.margin = "0";

    const clone = printInvoice.cloneNode(true);

    const baseWidth = Math.max(printInvoice.offsetWidth || 0, printInvoice.scrollWidth || 0, 820);
    clone.style.width = baseWidth + "px";
    clone.style.minWidth = baseWidth + "px";
    clone.style.maxWidth = "none";
    clone.style.minHeight = "0";
    clone.style.height = "auto";
    clone.style.margin = "0";
    clone.style.padding = "4mm";
    clone.style.boxShadow = "none";
    clone.style.background = "#ffffff";
    clone.style.overflow = "visible";

    stagingWrapper.appendChild(clone);
    document.body.appendChild(stagingWrapper);

    try {
        const cloneTable = clone.querySelector(".print-items-table");
        const cloneTableWrapper = clone.querySelector(".print-table-wrapper");
        if (cloneTableWrapper) {
            cloneTableWrapper.style.overflow = "visible";
        }
        if (cloneTable && cloneTableWrapper && cloneTable.scrollWidth > cloneTableWrapper.clientWidth) {
            const extraWidth = cloneTable.scrollWidth - cloneTableWrapper.clientWidth + 10;
            const fullWidth = baseWidth + extraWidth;
            clone.style.width = fullWidth + "px";
            clone.style.minWidth = fullWidth + "px";
        }

        const captureWidth = Math.ceil(Math.max(clone.scrollWidth, clone.offsetWidth));
        const captureHeight = Math.ceil(Math.max(clone.scrollHeight, clone.offsetHeight));

        const canvas = await window.html2canvas(clone, {
            scale: 2.5,
            useCORS: true,
            allowTaint: true,
            backgroundColor: "#ffffff",
            width: captureWidth,
            height: captureHeight,
            windowWidth: captureWidth + 50,
            windowHeight: captureHeight + 50,
            scrollX: 0,
            scrollY: 0
        });

        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({
            orientation: "portrait",
            unit: "mm",
            format: "a4",
            compress: true
        });

        // A4 Portrait (210mm x 297mm) with 9mm PDF margins (8–10mm requirement)
        const pageWidth = 210;
        const pageHeight = 297;
        const margin = 9;
        const usableWidth = pageWidth - margin * 2;   // 192 mm
        const usableHeight = pageHeight - margin * 2; // 279 mm

        let renderWidth = usableWidth;
        let renderHeight = (canvas.height * renderWidth) / canvas.width;

        if (renderHeight <= usableHeight) {
            const imgData = canvas.toDataURL("image/png");
            pdf.addImage(imgData, "PNG", margin, margin, renderWidth, renderHeight, undefined, "FAST");
        } else if (items.length <= 12 || renderHeight <= usableHeight * 1.35) {
            const scaleFactor = usableHeight / renderHeight;
            renderWidth = renderWidth * scaleFactor;
            renderHeight = usableHeight;
            const xOffset = (pageWidth - renderWidth) / 2;
            const imgData = canvas.toDataURL("image/png");
            pdf.addImage(imgData, "PNG", xOffset, margin, renderWidth, renderHeight, undefined, "FAST");
        } else {
            const pageCanvasHeightPx = Math.floor((usableHeight * canvas.width) / usableWidth);
            let currentY = 0;
            let pageIndex = 0;

            while (currentY < canvas.height) {
                if (pageIndex > 0) {
                    pdf.addPage();
                }

                const sliceHeightPx = Math.min(pageCanvasHeightPx, canvas.height - currentY);
                const sliceCanvas = document.createElement("canvas");
                sliceCanvas.width = canvas.width;
                sliceCanvas.height = sliceHeightPx;

                const ctx = sliceCanvas.getContext("2d");
                ctx.fillStyle = "#ffffff";
                ctx.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height);
                ctx.drawImage(
                    canvas,
                    0,
                    currentY,
                    canvas.width,
                    sliceHeightPx,
                    0,
                    0,
                    canvas.width,
                    sliceHeightPx
                );

                const sliceHeightMm = (sliceHeightPx * usableWidth) / canvas.width;
                const sliceImgData = sliceCanvas.toDataURL("image/png");
                pdf.addImage(sliceImgData, "PNG", margin, margin, usableWidth, sliceHeightMm, undefined, "FAST");

                currentY += sliceHeightPx;
                pageIndex++;
            }
        }

        const invoiceNo = getValue("invoiceNumber") || "GST-Invoice";
        const safeFileName = invoiceNo.replace(/[^a-zA-Z0-9-_]/g, "_") + ".pdf";
        pdf.save(safeFileName);

    } catch (err) {
        console.error("PDF generation failed:", err);
        alert("Could not generate PDF. Please try again.");
    } finally {
        if (stagingWrapper.parentNode) {
            stagingWrapper.parentNode.removeChild(stagingWrapper);
        }
        if (downloadBtn) {
            downloadBtn.disabled = false;
            downloadBtn.innerText = originalBtnText;
        }
    }
}