import { jsPDF } from 'jspdf';

/**
 * Generate PDF for contract
 */
export const generateContractPDF = async (contract, user) => {
    const doc = new jsPDF();

    // Set font
    doc.setFont('helvetica');

    // Header
    doc.setFontSize(20);
    doc.setTextColor(102, 126, 234);
    doc.text('Volvera AGREEMENT', 105, 20, { align: 'center' });

    // Contract Number
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text(`Contract No: ${contract.contractNumber}`, 105, 30, { align: 'center' });

    // Line
    doc.setDrawColor(102, 126, 234);
    doc.setLineWidth(0.5);
    doc.line(20, 35, 190, 35);

    // Content
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);

    let yPos = 50;

    // Use translated data if available, otherwise original
    const data = contract.translatedData && Object.keys(contract.translatedData).length > 0
        ? contract.translatedData
        : contract.originalData;

    // Creator Information
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Creator Information', 20, yPos);
    yPos += 10;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');

    const fields = [
        { label: 'Full Name', value: data.fullName },
        { label: 'Email', value: data.email },
        { label: 'Channel Link', value: data.channelLink },
        { label: 'Country', value: data.country },
        { label: 'Phone', value: data.phone },
    ];

    fields.forEach(field => {
        if (field.value) {
            doc.setFont('helvetica', 'bold');
            doc.text(`${field.label}:`, 20, yPos);
            doc.setFont('helvetica', 'normal');
            doc.text(field.value, 60, yPos);
            yPos += 8;
        }
    });

    // Message/Introduction
    if (data.message) {
        yPos += 5;
        doc.setFont('helvetica', 'bold');
        doc.text('Message:', 20, yPos);
        yPos += 8;
        doc.setFont('helvetica', 'normal');

        const splitMessage = doc.splitTextToSize(data.message, 170);
        doc.text(splitMessage, 20, yPos);
        yPos += splitMessage.length * 6;
    }

    // Partnership Terms
    yPos += 10;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Partnership Terms', 20, yPos);
    yPos += 10;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');

    const terms = [
        'The Creator retains 99.5% of all earnings generated through the partnership.',
        'Volvera provides platform support, resources, and promotional assistance.',
        'Both parties agree to maintain professional standards and ethical content creation.',
        'This agreement is subject to the terms and conditions outlined in the full partnership agreement.',
    ];

    terms.forEach((term, index) => {
        const splitTerm = doc.splitTextToSize(`${index + 1}. ${term}`, 170);
        doc.text(splitTerm, 20, yPos);
        yPos += splitTerm.length * 6 + 3;
    });

    // Status and Dates
    yPos += 10;
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Status: ${contract.status.toUpperCase()}`, 20, yPos);
    yPos += 6;
    doc.text(`Submitted: ${contract.submittedAt ? new Date(contract.submittedAt).toLocaleDateString() : 'N/A'}`, 20, yPos);
    if (contract.approvedAt) {
        yPos += 6;
        doc.text(`Approved: ${new Date(contract.approvedAt).toLocaleDateString()}`, 20, yPos);
    }

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('Volvera Platform - Empowering Creators Worldwide', 105, 280, { align: 'center' });
    doc.text(`Generated on ${new Date().toLocaleDateString()}`, 105, 285, { align: 'center' });

    return doc;
};

/**
 * Save PDF to file system
 */
export const savePDFToFile = (doc, filename) => {
    return doc.save(filename, { returnPromise: true });
};

/**
 * Get PDF as buffer
 */
export const getPDFBuffer = (doc) => {
    return doc.output('arraybuffer');
};
