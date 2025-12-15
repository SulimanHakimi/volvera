import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Contract from '@/models/Contract';
import Config from '@/models/Config';
import { verifyToken, extractTokenFromHeader } from '@/utils/jwt';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { defaultPartnershipAgreement, defaultTerminationNotice } from '@/lib/defaultAgreements';
import { readFile } from 'fs/promises';
import { join } from 'path';

const authenticate = (request) => {
    const token = extractTokenFromHeader(request.headers.get('Authorization'));
    if (!token) return null;
    try {
        return verifyToken(token);
    } catch (e) {
        return null;
    }
};

export async function GET(request, { params }) {
    console.log('--- STARTING PDF GENERATION ---');
    try {
        const decoded = authenticate(request);
        if (!decoded) {
            console.log('Auth failed');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const { searchParams } = new URL(request.url);
        const lang = searchParams.get('lang') || 'en';
        console.log(`Generating PDF. ID: ${id}, Lang: ${lang}, User: ${decoded.id}`);

        await connectDB();

        // Fetch Settings with safety check
        console.log('Fetching configs...');
        let settings = {};
        try {
            const configs = await Config.find({});
            settings = configs.reduce((acc, curr) => ({ ...acc, [curr.key]: curr.value }), {});
        } catch (err) {
            console.error('Error fetching configs:', err);
            // non-fatal
        }

        console.log('Fetching contract...');
        const contract = await Contract.findById(id).populate('user');
        if (!contract) {
            console.log('Contract not found');
            return NextResponse.json({ error: `Contract not found` }, { status: 404 });
        }

        // --- AUTH CHECK SAFEGUARD ---
        // Handle case where contract.user is null (deleted user) or population failed
        const contractUserId = contract.user ? contract.user._id.toString() : null;

        if ((!contractUserId || contractUserId !== decoded.id) && decoded.role !== 'admin') {
            console.log(`Forbidden access. Requesting User: ${decoded.id}, Contract Owner: ${contractUserId}`);
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        console.log('Evaluating PDF content type...');
        const contractType = contract.type || 'partnership';
        let bodyText = '';

        // Determine suffix safely
        let suffix = lang;
        if (lang === 'original') {
            suffix = contract.originalLanguage || 'en';
        }
        if (!suffix) suffix = 'en';

        console.log(`Contract Type: ${contractType}, Suffix: ${suffix}`);

        if (contractType === 'termination') {
            const key = `terminationNotice_${suffix}`;
            bodyText = settings[key];
            if (!bodyText) {
                console.log(`Settings key ${key} empty. Checking defaults.`);
                if (defaultTerminationNotice && defaultTerminationNotice[suffix]) {
                    bodyText = defaultTerminationNotice[suffix];
                } else {
                    bodyText = defaultTerminationNotice['en'];
                }
            }
        } else {
            const key = `partnershipAgreement_${suffix}`;
            bodyText = settings[key];
            if (!bodyText) {
                if (defaultPartnershipAgreement && defaultPartnershipAgreement[suffix]) {
                    bodyText = defaultPartnershipAgreement[suffix];
                } else {
                    bodyText = defaultPartnershipAgreement['en'];
                }
            }
        }

        if (!bodyText) {
            console.warn('Body text is empty even after fallbacks!');
            bodyText = "Error: Content not found.";
        }

        // --- PDF CREATION ---
        console.log('Creating PDF document...');
        const pdfDoc = await PDFDocument.create();
        pdfDoc.registerFontkit(fontkit);

        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

        let persianFont = null;
        let persianBoldFont = null;

        console.log('Loading extra fonts...');
        try {
            const fontBytes = await fetch('https://github.com/googlefonts/noto-fonts/raw/main/hinted/ttf/NotoSansArabic/NotoSansArabic-Regular.ttf').then(res => res.arrayBuffer());
            persianFont = await pdfDoc.embedFont(fontBytes);

            const boldFontBytes = await fetch('https://github.com/googlefonts/noto-fonts/raw/main/hinted/ttf/NotoSansArabic/NotoSansArabic-Bold.ttf').then(res => res.arrayBuffer());
            persianBoldFont = await pdfDoc.embedFont(boldFontBytes);
        } catch (e) {
            console.error('Failed to load persian font (non-fatal):', e.message);
        }

        // Colors
        const cyan = rgb(0.02, 0.71, 0.83);
        const purple = rgb(0.49, 0.23, 0.93);
        const black = rgb(0, 0, 0);
        const gray = rgb(0.3, 0.3, 0.3);
        const red = rgb(0.8, 0.2, 0.2);

        // Language setup
        const isRTL = lang === 'fa' || lang === 'ps' || (lang === 'original' && contract.originalLanguage !== 'en');

        let usedFont = font;
        let usedBoldFont = boldFont;

        if (isRTL) {
            if (persianFont && persianBoldFont) {
                usedFont = persianFont;
                usedBoldFont = persianBoldFont;
            } else {
                usedFont = font;
                usedBoldFont = boldFont;
            }
        }

        const fixText = (text) => {
            if (!text) return '';
            if (isRTL && !persianFont) {
                if (/[^\x00-\x7F]/.test(text)) {
                    return '[Text cannot be displayed: Persian/Pashto font failed to load]';
                }
            }
            return text;
        };

        // Page State
        let page = pdfDoc.addPage([595.28, 841.89]); // A4
        const { width, height } = page.getSize();
        let y = height - 50;
        const margin = 50;
        const contentWidth = width - (margin * 2);

        const checkPageBreak = (neededHeight) => {
            if (y - neededHeight < 50) {
                page = pdfDoc.addPage([595.28, 841.89]);
                y = height - 50;
            }
        };

        const drawWrappedText = (text, size, fontToUse, color = black, align = 'left', lineHeightMultiplier = 1.2) => {
            if (!text) return;
            text = text.replace(/\r/g, '');
            const safeText = fixText(text);

            let drawColor = color;
            if (safeText.startsWith('[Text cannot be displayed')) {
                drawColor = red;
            }

            const paragraphs = safeText.split('\n');

            for (const paragraph of paragraphs) {
                const words = paragraph.split(' ');
                let currentLine = words[0] || '';

                for (let i = 1; i < words.length; i++) {
                    const word = words[i];
                    let measureWidth = 0;
                    try {
                        measureWidth = fontToUse.widthOfTextAtSize(currentLine + " " + word, size);
                    } catch (e) {
                        measureWidth = 1000;
                    }

                    if (measureWidth < contentWidth) {
                        currentLine += " " + word;
                    } else {
                        drawLine(currentLine, size, fontToUse, drawColor, align, lineHeightMultiplier);
                        currentLine = word;
                    }
                }
                if (currentLine) {
                    drawLine(currentLine, size, fontToUse, drawColor, align, lineHeightMultiplier);
                }
            }
            y -= 4; // Extra paragraph spacing
        };

        const drawLine = (line, size, fontToUse, color, align, lineHeightMultiplier) => {
            const lineHeight = size * lineHeightMultiplier;
            checkPageBreak(lineHeight);

            let xPos = margin;
            try {
                if (align === 'center') {
                    const lineWidth = fontToUse.widthOfTextAtSize(line, size);
                    xPos = (width - lineWidth) / 2;
                } else if (align === 'right' || (isRTL && align !== 'center')) {
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
                    color: color,
                });
            } catch (e) {
                console.error('Error drawing line:', line, e.message);
                try {
                    page.drawText('[Render Error]', { x: xPos, y, size, font: StandardFonts.Helvetica, color: red });
                } catch (ign) { }
            }
            y -= lineHeight;
        };

        // --- DRAW SEQUENCE ---
        console.log('Drawing Header...');
        checkPageBreak(80);
        let headerTitle = contractType === 'termination' ? (isRTL ? 'درخواست فسخ قرارداد' : 'TERMINATION NOTICE') : (isRTL ? 'قرارداد پیمانکار مستقل' : 'INDEPENDENT CONTRACTOR AGREEMENT');
        let subHeader = contractType === 'termination' ? '' : (isRTL ? 'برای تولیدکنندگان محتوا' : 'For Content Creators');

        drawWrappedText(headerTitle, 18, usedBoldFont, cyan, 'center');
        if (subHeader) {
            y -= 5;
            drawWrappedText(subHeader, 12, usedFont, gray, 'center');
        }
        y -= 20;

        // Line
        page.drawLine({
            start: { x: margin, y },
            end: { x: width - margin, y },
            thickness: 1,
            color: cyan,
        });
        y -= 20;

        console.log('Drawing Parties...');
        // 2. Parties
        const partiesTitle = isRTL ? 'طرفین:' : 'BETWEEN:';
        drawWrappedText(partiesTitle, 12, usedBoldFont, black);
        y -= 5;

        // Company
        const companyLabel = isRTL ? 'شرکت:' : 'COMPANY:';
        drawWrappedText(companyLabel, 10, usedBoldFont, purple);
        drawWrappedText('VOLVERA', 11, usedBoldFont, black);
        if (settings.companyAddress) drawWrappedText(settings.companyAddress, 9, usedFont, gray);
        if (settings.companyRegistrationNumber) drawWrappedText(`Reg: ${settings.companyRegistrationNumber}`, 9, usedFont, gray);
        drawWrappedText('nor.volvera@gmail.com', 9, usedFont, gray);
        y -= 10;

        // Contractor
        const contractorLabel = isRTL ? (contractType === 'termination' ? 'از طرف پیمانکار:' : 'و پیمانکار:') : (contractType === 'termination' ? 'FROM CONTRACTOR:' : 'AND CONTRACTOR:');
        drawWrappedText(contractorLabel, 10, usedBoldFont, purple);

        let cData = contract.originalData;

        // Handle missing originalData entirely
        if (!cData) {
            cData = {
                fullName: contract.user?.name || 'Unknown',
                email: contract.user?.email || 'Unknown',
                platforms: []
            };
        } else {
            // Ensure fields exist within cData
            if (!cData.fullName) cData.fullName = contract.user?.name || 'Unknown';
            if (!cData.email) cData.email = contract.user?.email || 'Unknown';
        }

        // Use translated data if available and not 'original' lang request
        if (lang !== 'original' && contract.translatedData && contract.translatedData.fullName) {
            cData = contract.translatedData;
        }

        const fullName = cData.fullName || 'Unknown';
        const emailVal = cData.email || 'Unknown';
        const platforms = cData.platforms || [];

        drawWrappedText(fullName, 11, usedBoldFont, black);
        drawWrappedText(emailVal, 9, usedFont, gray);

        // Render Platforms
        if (platforms && platforms.length > 0) {
            y -= 5;
            const channelsLabel = isRTL ? 'کانال‌ها / صفحات:' : 'Channels / Pages:';
            drawWrappedText(channelsLabel, 9, usedBoldFont, black);

            for (const platform of platforms) {
                const pName = platform.platformName || 'Platform';
                const pLink = platform.link || '';
                if (pLink) {
                    drawWrappedText(`${pName}: ${pLink}`, 9, usedFont, purple);
                }
            }
        }
        y -= 20;

        console.log('Drawing Body...');
        // 3. Dynamic Body
        if (bodyText) {
            const lines = bodyText.replace(/\r/g, '').split('\n');
            for (let line of lines) {
                line = line.trim();
                if (!line) {
                    y -= 5;
                    continue;
                }

                if (line.startsWith('# ')) {
                    y -= 10;
                    checkPageBreak(30);
                    drawWrappedText(line.replace('# ', ''), 14, usedBoldFont, purple, 'left');
                } else if (line.startsWith('## ')) {
                    y -= 5;
                    checkPageBreak(25);
                    drawWrappedText(line.replace('## ', ''), 12, usedBoldFont, black, 'left');
                } else if (line.startsWith('### ')) {
                    checkPageBreak(20);
                    drawWrappedText(line.replace('### ', ''), 11, usedBoldFont, black, 'left');
                } else if (line.startsWith('- ') || line.startsWith('* ')) {
                    checkPageBreak(15);
                    let content = line.substring(2);
                    drawWrappedText(`• ${content}`, 10, usedFont, black, 'left');
                } else {
                    checkPageBreak(15);
                    drawWrappedText(line, 10, usedFont, black, 'left');
                }
            }
        }

        console.log('Drawing Signatures...');
        // 4. Signatures
        y -= 30;
        checkPageBreak(120);

        const sigTitle = isRTL ? 'امضاها' : 'SIGNATURES';
        drawWrappedText(sigTitle, 12, usedBoldFont, purple);
        y -= 40;

        const sigY = y;
        const leftX = margin;
        const rightX = width / 2 + 20;

        // Company Signature
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
                    const sigDims = sigImage.scale(0.25);
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
                console.error('Failed to embed company signature:', err.message);
            }
        }

        // Line for Company
        page.drawLine({ start: { x: leftX, y: sigY }, end: { x: leftX + 200, y: sigY }, thickness: 1, color: black });
        const companySigLabel = isRTL ? 'Volvera (شرکت)' : 'Volvera (Company)';
        try {
            const lbl = fixText(companySigLabel);
            if (lbl.startsWith('[Text')) {
                page.drawText('Volvera (Company)', { x: leftX, y: sigY - 15, size: 9, font: font, color: red });
            } else {
                page.drawText(lbl, { x: leftX, y: sigY - 15, size: 9, font: usedBoldFont, color: black });
            }
        } catch (e) {
            page.drawText('Volvera (Company)', { x: leftX, y: sigY - 15, size: 9, font: font, color: red });
        }

        // Line for Contractor
        page.drawLine({ start: { x: rightX, y: sigY }, end: { x: rightX + 200, y: sigY }, thickness: 1, color: black });
        const contractorSigLabel = isRTL ? 'پیمانکار' : 'Contractor';
        try {
            const lbl = fixText(contractorSigLabel);
            if (lbl.startsWith('[Text')) {
                page.drawText('Contractor', { x: rightX, y: sigY - 15, size: 9, font: font, color: red });
            } else {
                page.drawText(lbl, { x: rightX, y: sigY - 15, size: 9, font: usedBoldFont, color: black });
            }
        } catch (e) {
            page.drawText('Contractor', { x: rightX, y: sigY - 15, size: 9, font: font, color: red });
        }

        // Footer ID
        const dateStr = new Date().toLocaleDateString();
        y = 30; // Bottom margin
        page.drawText(`Contract ID: ${contract.contractNumber || id} | Generated: ${dateStr}`, { x: margin, y, size: 8, font, color: gray });

        console.log('PDF saved. Sending response.');
        const pdfBytes = await pdfDoc.save();

        return new NextResponse(pdfBytes, {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="VOLVERA_Contract_${contract.contractNumber || id.slice(-6)}_${lang}.pdf"`,
            },
        });

    } catch (error) {
        console.error('CRITICAL PDF GEN ERROR:', error);
        return NextResponse.json({ error: 'Failed to generate contract PDF: ' + error.message, stack: error.stack }, { status: 500 });
    }
}