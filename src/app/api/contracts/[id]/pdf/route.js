import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Contract from '@/models/Contract';
import Config from '@/models/Config'; // Import Config model
import { verifyToken, extractTokenFromHeader } from '@/utils/jwt';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { contractContent } from '@/lib/contractContent';
import { readFile } from 'fs/promises'; // Import readFile
import { join } from 'path'; // Import join

const authenticate = (request) => {
    const token = extractTokenFromHeader(request.headers.get('Authorization'));
    if (!token) return null;
    return verifyToken(token);
};

export async function GET(request, { params }) {
    try {
        const decoded = authenticate(request);
        if (!decoded) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const { searchParams } = new URL(request.url);
        const lang = searchParams.get('lang') || 'en';
        console.log('Generating PDF for Contract ID:', id, 'Lang:', lang);

        await connectDB();

        // Fetch Settings
        const configs = await Config.find({});
        const settings = configs.reduce((acc, curr) => ({ ...acc, [curr.key]: curr.value }), {});

        const contract = await Contract.findById(id).populate('user');
        if (!contract) {
            return NextResponse.json({ error: `Contract not found` }, { status: 404 });
        }

        // Ownership check
        if (contract.user._id.toString() !== decoded.id && decoded.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Create PDF
        const pdfDoc = await PDFDocument.create();
        pdfDoc.registerFontkit(fontkit);

        // Fonts
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

        let persianFont;
        let persianBoldFont;
        try {
            // Regular
            const fontBytes = await fetch('https://github.com/googlefonts/noto-fonts/raw/main/hinted/ttf/NotoSansArabic/NotoSansArabic-Regular.ttf').then(res => res.arrayBuffer());
            persianFont = await pdfDoc.embedFont(fontBytes);

            // Bold
            const boldFontBytes = await fetch('https://github.com/googlefonts/noto-fonts/raw/main/hinted/ttf/NotoSansArabic/NotoSansArabic-Bold.ttf').then(res => res.arrayBuffer());
            persianBoldFont = await pdfDoc.embedFont(boldFontBytes);
        } catch (e) {
            console.error('Failed to load persian font:', e);
            persianFont = font;
            persianBoldFont = boldFont;
        }

        // Colors
        const cyan = rgb(0.02, 0.71, 0.83);
        const purple = rgb(0.49, 0.23, 0.93);
        const black = rgb(0, 0, 0);
        const gray = rgb(0.3, 0.3, 0.3);

        // Language setup
        const isRTL = lang === 'fa' || lang === 'ps' || (lang === 'original' && contract.originalLanguage !== 'en');
        const usedFont = isRTL ? persianFont : font;
        const usedBoldFont = isRTL ? persianBoldFont : boldFont;

        // Content
        const currentLangCode = (lang === 'original') ? contract.originalLanguage : lang;
        const txt = contractContent[currentLangCode] || contractContent['en'];

        const fixText = (text) => {
            if (!text) return '';
            return text;
        };

        // Page State
        let page = pdfDoc.addPage([595.28, 841.89]); // A4
        const { width, height } = page.getSize();
        let y = height - 50;
        const margin = 50;
        const contentWidth = width - (margin * 2);

        // Helper: Add Page if needed
        const checkPageBreak = (neededHeight) => {
            if (y - neededHeight < 50) {
                page = pdfDoc.addPage([595.28, 841.89]);
                y = height - 50;
            }
        };

        // Helper: Wrap Text
        const drawWrappedText = (text, size, fontToUse, color = black, align = 'left') => {
            if (!text) return;
            text = fixText(text);
            const lines = [];
            const words = text.split(' ');
            let currentLine = words[0];

            for (let i = 1; i < words.length; i++) {
                const word = words[i];
                const width = fontToUse.widthOfTextAtSize(currentLine + " " + word, size);
                if (width < contentWidth) {
                    currentLine += " " + word;
                } else {
                    lines.push(currentLine);
                    currentLine = word;
                }
            }
            lines.push(currentLine);

            for (const line of lines) {
                checkPageBreak(size + 4);

                let xPos = margin;
                if (align === 'center') {
                    const lineWidth = fontToUse.widthOfTextAtSize(line, size);
                    xPos = (width - lineWidth) / 2;
                } else if (align === 'right' || isRTL) {
                    if (isRTL) {
                        const lineWidth = fontToUse.widthOfTextAtSize(line, size);
                        xPos = width - margin - lineWidth;
                    }
                }

                page.drawText(line, {
                    x: xPos,
                    y,
                    size,
                    font: fontToUse,
                    color,
                });
                y -= (size + 6);
            }
            y -= 4; // Extra paragraph spacing
        };

        // --- RENDER CONTENT ---

        // 1. Header
        checkPageBreak(50);
        drawWrappedText(txt.header, 20, usedBoldFont, cyan, 'center');
        y -= 10;
        drawWrappedText(txt.subHeader, 14, usedFont, gray, 'center');
        y -= 20;

        // Line
        page.drawLine({
            start: { x: margin, y },
            end: { x: width - margin, y },
            thickness: 1,
            color: cyan,
        });
        y -= 30;

        // 2. Parties
        drawWrappedText(txt.parties, 12, usedBoldFont, black);
        y -= 10;

        // Company
        drawWrappedText(txt.company.label, 11, usedBoldFont, purple);
        drawWrappedText(txt.company.name, 12, usedBoldFont, black);

        // Dynamic Company Details
        const companyDetails = [];
        if (settings.companyAddress) companyDetails.push(settings.companyAddress);
        if (settings.companyRegistrationNumber) companyDetails.push(`Reg. No: ${settings.companyRegistrationNumber}`);
        // Fallback if no settings
        const detailsToRender = companyDetails.length > 0 ? companyDetails : txt.company.details;

        detailsToRender.forEach(detail => drawWrappedText(detail, 10, usedFont, gray));
        y -= 15;

        // Contractor
        drawWrappedText(txt.contractor.label, 11, usedBoldFont, purple);

        // Use user data
        const cData = (lang === 'original') ? contract.originalData : contract.translatedData;
        const fullName = cData?.fullName || contract.originalData?.fullName || '_________________';
        const emailVal = cData?.email || contract.originalData?.email || '_________________';

        drawWrappedText(fullName, 12, usedBoldFont, black);
        drawWrappedText(emailVal, 10, usedFont, gray);
        drawWrappedText(txt.contractor.detailsLabel, 10, usedFont, gray);
        y -= 30;

        // 3. Sections
        for (const section of txt.sections) {
            checkPageBreak(50);
            // Section Title
            y -= 10;
            drawWrappedText(section.title, 12, usedBoldFont, purple);

            // Content
            for (const para of section.content) {
                checkPageBreak(20);
                drawWrappedText(para, 10, usedFont, black);
            }
        }

        // 4. Signatures
        y -= 40;
        checkPageBreak(150);

        drawWrappedText(txt.signatures.title, 14, usedBoldFont, purple);
        y -= 10;
        drawWrappedText(txt.signatures.text, 9, usedFont, gray);
        y -= 40;

        const sigY = y;

        const leftX = margin;
        const rightX = width / 2 + 20;

        if (settings.companySignatureUrl) {
            try {
                const relativePath = settings.companySignatureUrl.startsWith('/')
                    ? settings.companySignatureUrl.slice(1)
                    : settings.companySignatureUrl;

                const imagePath = join(process.cwd(), 'public', relativePath);
                const imageBytes = await readFile(imagePath);

                let sigImage;
                if (settings.companySignatureUrl.toLowerCase().endsWith('.png')) {
                    sigImage = await pdfDoc.embedPng(imageBytes);
                } else if (settings.companySignatureUrl.toLowerCase().endsWith('.jpg') || settings.companySignatureUrl.toLowerCase().endsWith('.jpeg')) {
                    sigImage = await pdfDoc.embedJpg(imageBytes);
                }

                if (sigImage) {
                    const sigDims = sigImage.scale(0.25); // Scale down
                    // Center horizontally over the line (width 200)
                    const lineLength = 200;
                    const centeredX = leftX + (lineLength - sigDims.width) / 2;

                    const overlappingY = sigY - 10;

                    page.drawImage(sigImage, {
                        x: centeredX,
                        y: overlappingY,
                        width: sigDims.width,
                        height: sigDims.height,
                    });
                }
            } catch (err) {
                console.error('Failed to embed company signature:', err);
            }
        }

        // Line for Company
        page.drawLine({ start: { x: leftX, y: sigY }, end: { x: leftX + 200, y: sigY }, thickness: 1, color: black });
        page.drawText(fixText(txt.signatures.company), { x: leftX, y: sigY - 15, size: 9, font: usedBoldFont, color: black });

        // Line for Contractor
        page.drawLine({ start: { x: rightX, y: sigY }, end: { x: rightX + 200, y: sigY }, thickness: 1, color: black });
        page.drawText(fixText(txt.signatures.contractor), { x: rightX, y: sigY - 15, size: 9, font: usedBoldFont, color: black });

        // Draw contract ID at bottom of every page? Or just this one.
        y = 30;
        page.drawText(`Contract ID: ${contract.contractNumber || id}`, { x: margin, y, size: 8, font: usedFont, color: gray });

        const pdfBytes = await pdfDoc.save();

        return new NextResponse(pdfBytes, {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="VOLVERA_Contract_${contract.contractNumber || id.slice(-6)}_${lang}.pdf"`,
            },
        });

    } catch (error) {
        console.error('PDF Generation Error:', error);
        return NextResponse.json({ error: 'Failed to generate contract PDF' }, { status: 500 });
    }
}