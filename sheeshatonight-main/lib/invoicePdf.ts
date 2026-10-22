import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import type { TaxInvoiceData } from '@/components/TaxInvoiceModal';

/**
 * Downloads the on-screen Tax Invoice element exactly as visually rendered,
 * capturing the official logo, Arabic typography, green verification badge,
 * item breakdown, and signatory stamp in crisp, high-resolution PDF format.
 */
export async function downloadInvoiceAsPDF(
  elementId: string = 'printable-tax-invoice',
  filename: string = 'Tax-Invoice.pdf'
): Promise<void> {
  if (typeof window === 'undefined') return;

  const originalElement = document.getElementById(elementId);
  if (!originalElement) {
    window.print();
    return;
  }

  // Create an off-screen isolated container with fixed 800px width.
  // This guarantees that the PDF is ALWAYS captured in the pristine desktop layout
  // (matching the exact modal preview), even if the user clicks download from a mobile device!
  const offscreenContainer = document.createElement('div');
  offscreenContainer.style.position = 'fixed';
  offscreenContainer.style.left = '-9999px';
  offscreenContainer.style.top = '0';
  offscreenContainer.style.width = '800px';
  offscreenContainer.style.background = '#ffffff';
  offscreenContainer.style.zIndex = '-9999';
  offscreenContainer.style.visibility = 'visible';

  // Clone the invoice DOM element
  const clone = originalElement.cloneNode(true) as HTMLElement;
  clone.style.width = '800px';
  clone.style.maxWidth = '800px';
  clone.style.minWidth = '800px';
  clone.style.margin = '0';
  clone.style.padding = '36px 44px';
  clone.style.boxSizing = 'border-box';
  clone.style.background = '#ffffff';
  clone.style.borderRadius = '0';

  offscreenContainer.appendChild(clone);
  document.body.appendChild(offscreenContainer);

  try {
    // Ensure all images (like the official SheeshaTonight logo) are completely loaded
    const images = Array.from(clone.querySelectorAll('img'));
    await Promise.all(
      images.map((img) => {
        if (img.complete && img.naturalHeight !== 0) return Promise.resolve();
        return new Promise<void>((resolve) => {
          img.onload = () => resolve();
          img.onerror = () => resolve();
          // Fallback timeout in case image loading hangs
          setTimeout(() => resolve(), 600);
        });
      })
    );

    // Wait for web fonts (Inter/Outfit/Montserrat) to settle
    if (document.fonts && document.fonts.ready) {
      await document.fonts.ready;
    }
    await new Promise((r) => setTimeout(r, 120));

    // Render canvas with scale 2.5 for crisp 300+ DPI print resolution
    const canvas = await html2canvas(clone, {
      scale: 2.5,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      windowWidth: 1024,
    });

    const imgData = canvas.toDataURL('image/png', 1.0);

    // Standard A4 Dimensions in millimeters: 210 x 297
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pdfWidth = 210;
    const pdfHeight = 297;
    const margin = 10; // 10mm left and right margin
    const printWidth = pdfWidth - margin * 2; // 190mm
    const printHeight = (canvas.height * printWidth) / canvas.width;

    // Center vertically if it fits nicely on a single A4 page
    let yPos = margin;
    if (printHeight < pdfHeight - margin * 2) {
      yPos = (pdfHeight - printHeight) / 2;
    }

    pdf.addImage(imgData, 'PNG', margin, yPos, printWidth, printHeight, undefined, 'FAST');
    pdf.save(filename);
  } catch (err) {
    console.error('html2canvas PDF generation failed, falling back to window.print():', err);
    window.print();
  } finally {
    if (document.body.contains(offscreenContainer)) {
      document.body.removeChild(offscreenContainer);
    }
  }
}

/**
 * Backward-compatible helper that delegates to downloadInvoiceAsPDF
 */
export function generateInvoicePDF(data?: TaxInvoiceData): void {
  const safeNum = data?.invoiceNumber || (data?.orderNumber ? `INV-${data.orderNumber}` : 'INV');
  const filename = `Tax-Invoice-${safeNum.replace(/[^a-zA-Z0-9-_]/g, '-')}.pdf`;
  downloadInvoiceAsPDF('printable-tax-invoice', filename);
}
