// app/api/contract-template/route.js
import { NextResponse } from 'next/server';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { contractContent } from '@/lib/contractContent';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const lang = searchParams.get('lang') || 'en';

        console.log('Generating template PDF for language:', lang);

        // Create PDF
        const pdfDoc = await PDFDocument.create();
        pdfDoc.registerFontkit(fontkit);

        // Fonts
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

        let persianFont;
        let persianBoldFont;
        try {
            const fontBytes = await fetch('https://github.com/googlefonts/noto-fonts/raw/main/hinted/ttf/NotoSansArabic/NotoSansArabic-Regular.ttf').then(res => res.arrayBuffer());
            persianFont = await pdfDoc.embedFont(fontBytes);

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
        const isRTL = lang === 'fa' || lang === 'ps';
        const usedFont = isRTL ? persianFont : font;
        const usedBoldFont = isRTL ? persianBoldFont : boldFont;

        // Content
        const txt = contractContent[lang] || contractContent['en'];

        // Helper: Fix Text for RTL
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
            y -= 4;
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
        txt.company.details.forEach(detail => drawWrappedText(detail, 10, usedFont, gray));
        y -= 15;

        // Contractor
        drawWrappedText(txt.contractor.label, 11, usedBoldFont, purple);
        drawWrappedText('[Your Name]', 12, usedBoldFont, black);
        drawWrappedText('[Your Email]', 10, usedFont, gray);
        drawWrappedText(txt.contractor.detailsLabel, 10, usedFont, gray);
        y -= 30;

        // 3. Sections
        for (const section of txt.sections) {
            checkPageBreak(50);
            y -= 10;
            drawWrappedText(section.title, 12, usedBoldFont, purple);

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

        // Line for Company
        page.drawLine({ start: { x: leftX, y: sigY }, end: { x: leftX + 200, y: sigY }, thickness: 1, color: black });
        page.drawText(fixText(txt.signatures.company), { x: leftX, y: sigY - 15, size: 9, font: usedBoldFont, color: black });

        // Line for Contractor
        page.drawLine({ start: { x: rightX, y: sigY }, end: { x: rightX + 200, y: sigY }, thickness: 1, color: black });
        page.drawText(fixText(txt.signatures.contractor), { x: rightX, y: sigY - 15, size: 9, font: usedBoldFont, color: black });

        const pdfBytes = await pdfDoc.save();

        return new NextResponse(pdfBytes, {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="VOLVERA_Contract_Template_${lang.toUpperCase()}.pdf"`,
            },
        });

    } catch (error) {
        console.error('Template PDF Generation Error:', error);
        return NextResponse.json({ error: 'Failed to generate template PDF' }, { status: 500 });
    }
}
