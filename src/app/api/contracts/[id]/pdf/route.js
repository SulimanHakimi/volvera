// app/api/contracts/[id]/pdf/route.js
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Contract from '@/models/Contract';
import { verifyToken, extractTokenFromHeader } from '@/utils/jwt';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';

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
        const page = pdfDoc.addPage([595.28, 841.89]); // A4
        const { width, height } = page.getSize();

        // Register fontkit
        pdfDoc.registerFontkit(fontkit);

        // Load fonts
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

        // Load NotoSans for Persian/Pashto support
        let persianFont;
        try {
            const fontBytes = await fetch('https://github.com/googlefonts/noto-fonts/raw/main/hinted/ttf/NotoSansArabic/NotoSansArabic-Regular.ttf').then(res => res.arrayBuffer());
            persianFont = await pdfDoc.embedFont(fontBytes);
        } catch (e) {
            console.error('Failed to load persian font:', e);
            persianFont = font; // Fallback
        }

        const cyan = rgb(0.02, 0.71, 0.83); // Brand cyan #06b6d4
        const purple = rgb(0.49, 0.23, 0.93); // Brand purple #7c3aed
        const black = rgb(0, 0, 0);
        const gray = rgb(0.6, 0.64, 0.70); // Brand muted #9aa4b2

        let y = height - 80;

        const isRTL = lang === 'fa' || lang === 'ps' || (lang === 'original' && contract.originalLanguage !== 'en');
        const usedFont = isRTL ? persianFont : font;
        const usedBoldFont = isRTL ? persianFont : boldFont;

        // Content Dictionaries
        const content = {
            en: {
                header: 'VOLVERA',
                subHeader: 'Independent Contractor Agreement',
                contractId: 'Contract ID',
                parties: 'BETWEEN:',
                company: 'VOLVERA',
                companyDetails: 'Swedish Registration No. [XXXXXX-XXXX]',
                address: 'Headquartered in Sweden',
                creator: 'AND:',
                creatorLabel: 'Contractor (Creator)',
                termsHeader: 'KEY AGREEMENT TERMS:',
                terms: [
                    '1. OWNERSHIP: Creator retains 100% ownership of all channels and content.',
                    '2. REVENUE SHARE: Creator keeps 99.5% of earnings. VOLVERA fee: 0.5%.',
                    '3. CREATIVE FREEDOM: No minimum requirements. Full editorial control.',
                    '4. PAYMENT: Revenue distributed within 7 business days of payout.',
                    '5. TERMINATION: Terminate immediately anytime with no penalty.',
                    '6. NO EMPLOYMENT: Independent contractor relationship, not employment.',
                    '7. CONFIDENTIALITY: VOLVERA will not disclose earnings or personal data.',
                    '8. ACCESS: Creator retains full control. VOLVERA has limited analytics access.',
                ],
                important: 'IMPORTANT RIGHTS:',
                rights: [
                    '✓ You own your channel forever',
                    '✓ You keep 99.5% of all revenue',
                    '✓ No content quotas or requirements',
                    '✓ Terminate anytime, instantly',
                    '✓ Full creative independence',
                ],
                signatures: 'SIGNATURES',
                signCreator: 'Signature of Contractor (Creator)',
                signCompany: 'For and on behalf of VOLVERA',
                footer: 'This is a legally binding Independent Contractor Agreement',
                contact: 'Contact: contracts@volvera.com',
                fullAgreement: 'Full agreement: www.volvera.com/terms'
            },
            fa: {
                header: 'VOLVERA',
                subHeader: 'قرارداد پیمانکار مستقل',
                contractId: 'شناسه قرارداد',
                parties: 'بین:',
                company: 'وولورا',
                companyDetails: 'شماره ثبت سوئد [XXXXXX-XXXX]',
                address: 'دفتر مرکزی در سوئد',
                creator: 'و:',
                creatorLabel: 'پیمانکار (سازنده محتوا)',
                termsHeader: 'شرایط کلیدی قرارداد:',
                terms: [
                    '۱. مالکیت: سازنده ۱۰۰٪ مالکیت تمام کانال‌ها و محتوا را حفظ می‌کند.',
                    '۲. سهم درآمد: سازنده ۹۹.۵٪ درآمد را حفظ می‌کند. کارمزد وولورا: ۰.۵٪.',
                    '۳. آزادی خلاقانه: هیچ حداقلی لازم نیست. کنترل کامل سردبیری.',
                    '۴. پرداخت: درآمد ظرف ۷ روز کاری پس از پرداخت توزیع می‌شود.',
                    '۵. خاتمه: فوراً در هر زمان بدون جریمه خاتمه دهید.',
                    '۶. عدم استخدام: رابطه پیمانکار مستقل، نه استخدام.',
                    '۷. محرمانگی: وولورا درآمد یا داده‌های شخصی را فاش نمی‌کند.',
                    '۸. دسترسی: سازنده کنترل کامل دارد. وولورا دسترسی محدود به تحلیل‌ها.',
                ],
                important: 'حقوق مهم:',
                rights: [
                    '✓ شما مالک کانال خود برای همیشه هستید',
                    '✓ شما ۹۹.۵٪ تمام درآمد را حفظ می‌کنید',
                    '✓ هیچ سهمیه محتوایی وجود ندارد',
                    '✓ در هر زمان، فوراً خاتمه دهید',
                    '✓ استقلال خلاقانه کامل',
                ],
                signatures: 'امضاها',
                signCreator: 'امضای پیمانکار (سازنده محتوا)',
                signCompany: 'از طرف شرکت وولورا',
                footer: 'این یک قرارداد پیمانکار مستقل قانونی لازم‌الاجرا است',
                contact: 'تماس: contracts@volvera.com',
                fullAgreement: 'قرارداد کامل: www.volvera.com/terms'
            },
            ps: {
                header: 'VOLVERA',
                subHeader: 'د خپلواک قراردادي تړون',
                contractId: 'د قرارداد پیژندنه',
                parties: 'تر منځ:',
                company: 'وولورا',
                companyDetails: 'د سویډن د ثبت شمیره [XXXXXX-XXXX]',
                address: 'مرکزي دفتر په سویډن کې',
                creator: 'او:',
                creatorLabel: 'قراردادي (منځپانګه جوړونکی)',
                termsHeader: 'د تړون کلیدي شرایط:',
                terms: [
                    '۱. مالکیت: جوړونکی د ټولو چینلونو او منځپانګې ۱۰۰٪ مالکیت ساتي.',
                    '۲. د عایداتو برخه: جوړونکی ۹۹.۵٪ عاید ساتي. د وولورا فیس: ۰.۵٪.',
                    '۳. تخلیقي آزادي: هیڅ لږترلږه اړتیا نشته. بشپړ سمون کنترول.',
                    '۴. تادیه: عاید د تادیې وروسته په ۷ کاري ورځو کې ویشل کیږي.',
                    '۵. پای ته رسول: په هر وخت کې سمدستي پرته له جریمې پای ته ورسوئ.',
                    '۶. غیر استخدام: د خپلواک قراردادي اړیکه، نه استخدام.',
                    '۷. محرمیت: وولورا عاید یا شخصي معلومات نه څرګندوي.',
                    '۸. لاسرسی: جوړونکی بشپړ کنترول ساتي. وولورا محدود تحلیلي لاسرسی.',
                ],
                important: 'مهم حقونه:',
                rights: [
                    '✓ تاسو د تل لپاره د خپل چینل مالک یاست',
                    '✓ تاسو د ټولو عایداتو ۹۹.۵٪ ساتئ',
                    '✓ هیڅ منځپانګه کوټه نشته',
                    '✓ په هر وخت کې، سمدستي پای ته ورسوئ',
                    '✓ بشپړ تخلیقي خپلواکي',
                ],
                signatures: 'لاسلیکونه',
                signCreator: 'د قراردادي لاسلیک (منځپانګه جوړونکی)',
                signCompany: 'د وولورا له خوا',
                footer: 'دا یو قانوني لازم الاجرا خپلواک قراردادي تړون دی',
                contact: 'اړیکه: contracts@volvera.com',
                fullAgreement: 'بشپړ تړون: www.volvera.com/terms'
            }
        };

        const currentLangCode = (lang === 'original') ? contract.originalLanguage : lang;
        const txt = content[currentLangCode] || content['en'];

        // Helper to fix RTL text
        const fixText = (text) => {
            if (!text) return '';
            if (isRTL && persianFont !== font) {
                return text.split('').reverse().join('');
            }
            return text;
        };

        // === HEADER ===
        page.drawText(txt.header, { x: 50, y, size: 32, font: boldFont, color: cyan });

        page.drawText(fixText(txt.subHeader), {
            x: 50,
            y: y - 40,
            size: 18,
            font: usedBoldFont,
            color: black,
        });

        page.drawLine({
            start: { x: 50, y: y - 55 },
            end: { x: width - 50, y: y - 55 },
            thickness: 2,
            color: cyan,
        });

        y -= 85;

        // === Contract Info ===
        page.drawText(`${txt.contractId}: ${contract.contractNumber || id.slice(-8).toUpperCase()}`, {
            x: 50,
            y,
            size: 11,
            font: boldFont,
            color: black,
        });
        y -= 30;

        // === Parties ===
        page.drawText(fixText(txt.parties), { x: 50, y, size: 13, font: usedBoldFont, color: black });
        y -= 22;

        page.drawText(fixText(txt.company), { x: 70, y, size: 15, font: usedBoldFont, color: purple });
        y -= 16;
        page.drawText(fixText(txt.companyDetails), { x: 70, y, size: 8, font: usedFont, color: gray });
        y -= 14;
        page.drawText(fixText(txt.address), { x: 70, y, size: 10, font: usedFont });
        y -= 35;

        page.drawText(fixText(txt.creator), { x: 50, y, size: 13, font: usedBoldFont, color: black });
        y -= 22;

        // Use original or translated data
        const cData = (lang === 'original') ? contract.originalData : contract.translatedData;
        const fullName = cData?.fullName || contract.originalData?.fullName || '___';
        const emailVal = cData?.email || contract.originalData?.email || '___';

        page.drawText(fixText(fullName), { x: 70, y, size: 14, font: usedBoldFont, color: black });
        y -= 18;
        page.drawText(emailVal, { x: 70, y, size: 10, font: font });
        y -= 35;

        // === Terms ===
        page.drawText(fixText(txt.termsHeader), { x: 50, y, size: 13, font: usedBoldFont, color: purple });
        y -= 22;

        for (const term of txt.terms) {
            page.drawText(fixText(term), { x: 60, y, size: 8.5, font: usedFont });
            y -= 16;
        }

        y -= 15;

        // === Important Rights ===
        page.drawText(fixText(txt.important), { x: 50, y, size: 12, font: usedBoldFont, color: purple });
        y -= 20;

        for (const right of txt.rights) {
            page.drawText(fixText(right), { x: 60, y, size: 9, font: usedFont });
            y -= 16;
        }

        y -= 25;

        // === Signatures ===
        page.drawText(fixText(txt.signatures), { x: 50, y, size: 14, font: usedBoldFont, color: purple });
        y -= 35;

        // Left signature
        page.drawLine({ start: { x: 50, y }, end: { x: 260, y }, thickness: 1.5, color: black });
        page.drawText(fixText(txt.signCreator), { x: 50, y: y - 18, size: 9, font: usedFont, color: gray });

        // Right signature
        page.drawLine({ start: { x: 335, y }, end: { x: 545, y }, thickness: 1.5, color: black });
        page.drawText(fixText(txt.signCompany), { x: 335, y: y - 18, size: 9, font: usedFont, color: gray });

        // Footer
        page.drawText(fixText(txt.footer), { x: 50, y: 70, size: 9, font: usedBoldFont, color: black });
        page.drawText(fixText(txt.contact), { x: 50, y: 58, size: 8, font: usedFont, color: gray });
        page.drawText(fixText(txt.fullAgreement), { x: 50, y: 46, size: 8, font: usedFont, color: gray });

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