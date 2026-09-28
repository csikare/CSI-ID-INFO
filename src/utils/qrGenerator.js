import QRCode from 'qrcode';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

/**
 * Get the permanent URL for a member
 */
export function getMemberUrl(memberId) {
  const customDomain = import.meta.env.VITE_CUSTOM_DOMAIN;
  const baseUrl = customDomain 
    ? (customDomain.startsWith('http') ? customDomain : `https://${customDomain}`).replace(/\/$/, '')
    : (typeof window !== 'undefined' ? window.location.origin : 'https://csikare.org');
  return `${baseUrl}/member/${memberId}`;
}

/**
 * Generate high-resolution PNG data URL for a member QR code
 */
export async function generateQrPngDataUrl(memberId, options = {}) {
  const url = getMemberUrl(memberId);
  const {
    width = 1024,
    margin = 2,
    darkColor = '#090d16',
    lightColor = '#ffffff',
  } = options;

  return QRCode.toDataURL(url, {
    width,
    margin,
    color: {
      dark: darkColor,
      light: lightColor,
    },
    errorCorrectionLevel: 'H',
  });
}

/**
 * Generate SVG string for a member QR code
 */
export async function generateQrSvgString(memberId, options = {}) {
  const url = getMemberUrl(memberId);
  const {
    margin = 2,
    darkColor = '#090d16',
    lightColor = '#ffffff',
  } = options;

  return QRCode.toString(url, {
    type: 'svg',
    margin,
    color: {
      dark: darkColor,
      light: lightColor,
    },
    errorCorrectionLevel: 'H',
  });
}

/**
 * Download single member QR as PNG
 */
export async function downloadMemberQrPng(memberId) {
  const dataUrl = await generateQrPngDataUrl(memberId, { width: 1200 });
  const link = document.createElement('a');
  link.download = `${memberId}.png`;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Download single member QR as SVG
 */
export async function downloadMemberQrSvg(memberId) {
  const svgString = await generateQrSvgString(memberId);
  const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  saveAs(blob, `${memberId}.svg`);
}

/**
 * Generate printable ID card back badge canvas/dataUrl
 * Formatted with "CSI KARE", "SCAN TO VIEW PROFILE", QR code, and Member ID
 */
export async function generatePrintableBadgeDataUrl(memberId, memberName = '') {
  const qrDataUrl = await generateQrPngDataUrl(memberId, { 
    width: 800, 
    margin: 1,
    darkColor: '#580B1C',
    lightColor: '#FFFFFF'
  });
  
  const canvas = document.createElement('canvas');
  canvas.width = 1000;
  canvas.height = 1400;
  const ctx = canvas.getContext('2d');

  // Card Background: Deep CSI KARE Maroon
  ctx.fillStyle = '#4A0716';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Card Border & Soft Rose Inner Glow
  ctx.strokeStyle = '#701026';
  ctx.lineWidth = 14;
  ctx.strokeRect(30, 30, canvas.width - 60, canvas.height - 60);

  ctx.strokeStyle = 'rgba(244, 204, 213, 0.5)';
  ctx.lineWidth = 4;
  ctx.strokeRect(48, 48, canvas.width - 96, canvas.height - 96);

  // Header Title
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 54px Montserrat, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('CSI KARE', canvas.width / 2, 160);

  ctx.fillStyle = '#FCE7EB';
  ctx.font = '600 26px Montserrat, sans-serif';
  ctx.fillText('COMPUTER SOCIETY OF INDIA', canvas.width / 2, 210);

  ctx.fillStyle = '#F8D0D8';
  ctx.font = 'bold 30px Montserrat, sans-serif';
  ctx.fillText('CORE TEAM 2026–27', canvas.width / 2, 265);

  // Divider line
  ctx.strokeStyle = '#881832';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(150, 300);
  ctx.lineTo(canvas.width - 150, 300);
  ctx.stroke();

  // "SCAN TO VIEW PROFILE" Subheader
  ctx.fillStyle = '#FCE7EB';
  ctx.font = 'bold 34px Montserrat, sans-serif';
  ctx.fillText('SCAN TO VIEW PROFILE', canvas.width / 2, 375);

  // Draw QR Image in White Rounded Box
  const qrImg = new Image();
  await new Promise((resolve) => {
    qrImg.onload = resolve;
    qrImg.src = qrDataUrl;
  });

  const qrBoxSize = 560;
  const qrX = (canvas.width - qrBoxSize) / 2;
  const qrY = 430;

  // QR background plate
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.roundRect(qrX - 20, qrY - 20, qrBoxSize + 40, qrBoxSize + 40, 24);
  ctx.fill();

  ctx.drawImage(qrImg, qrX, qrY, qrBoxSize, qrBoxSize);

  // Member ID Badge Box
  ctx.fillStyle = '#2E040D';
  ctx.beginPath();
  ctx.roundRect(canvas.width / 2 - 220, 1070, 440, 80, 20);
  ctx.fill();
  ctx.strokeStyle = '#D98295';
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 42px monospace';
  ctx.fillText(memberId, canvas.width / 2, 1125);

  if (memberName) {
    ctx.fillStyle = '#F8D0D8';
    ctx.font = '600 28px Poppins, sans-serif';
    ctx.fillText(memberName.toUpperCase(), canvas.width / 2, 1200);
  }

  // Footer
  ctx.fillStyle = '#E8A5B3';
  ctx.font = '500 24px Poppins, sans-serif';
  ctx.fillText('Kalasalingam Academy of Research and Education', canvas.width / 2, 1310);

  return canvas.toDataURL('image/png');
}

/**
 * Bulk generate all 80 QR codes and download as a ZIP file
 */
export async function bulkDownload80QRCodes(members, onProgress) {
  const zip = new JSZip();
  const folder = zip.folder('CSI_KARE_CORE_TEAM_QR_CODES');

  const total = members.length;
  for (let i = 0; i < total; i++) {
    const member = members[i];
    const dataUrl = await generateQrPngDataUrl(member.memberId, { width: 1024, margin: 2 });
    // Remove data:image/png;base64,
    const base64Data = dataUrl.split(',')[1];
    folder.file(`${member.memberId}.png`, base64Data, { base64: true });

    if (onProgress) {
      onProgress(i + 1, total, member.memberId);
    }
  }

  const content = await zip.generateAsync({ type: 'blob' }, (metadata) => {
    if (onProgress && metadata.percent) {
      onProgress(total, total, `Zipping archive (${Math.round(metadata.percent)}%)...`);
    }
  });

  saveAs(content, 'CSI_KARE_80_QR_CODES.zip');
}
