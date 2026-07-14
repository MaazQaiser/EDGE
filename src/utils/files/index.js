/**
 * Download the file in new page on client device
 */
export const openFile = (fileName, fileUrl) => {
  if (!fileUrl || !fileName) return;

  const link = document.createElement('a');
  link.download = fileName;
  link.href = fileUrl;
  link.target = '_blank';
  link.click();
};

export const downloadFile = (fileData, t) => {
  const blob = new Blob([fileData], { type: 'application/pdf' });

  // Generate a URL for the Blob object
  const url = window.URL.createObjectURL(blob);

  // Create a temporary <a> element to trigger the download
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', t('sales.contract.contractPdf'));

  // Append the <a> element to the document body
  document.body.appendChild(link);

  // Trigger the download
  link.click();

  // Cleanup: Remove the temporary <a> element and revoke the URL
  link.parentNode.removeChild(link);
  window.URL.revokeObjectURL(url);
};
